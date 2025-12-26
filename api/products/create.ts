import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Product, Category, RawMaterial, Config, type IRawMaterial, type IConfig } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { createProductSchema } from '../schemas/product.js';

// Calculate product cost based on ingredients
async function calculateProductCost(
  ingredients: Array<{ rawMaterialId: string; quantity: number }>
): Promise<number> {
  // Get all raw materials
  const rawMaterialDocs = await RawMaterial.find({ isActive: true }).lean<IRawMaterial[]>();
  const priceMap: Record<string, number> = {};

  for (const rm of rawMaterialDocs) {
    priceMap[String(rm._id)] = rm.price;
    priceMap[rm.slug] = rm.price;
  }

  let costoProd = 0;
  for (const ingredient of ingredients) {
    const price = priceMap[ingredient.rawMaterialId] || 0;
    costoProd += ingredient.quantity * price;
  }

  return costoProd;
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const payload = verifyAuth(req);
    if (!payload.isAdmin) {
      return errorResponse(res, 'Unauthorized - Admin access required', 403);
    }

    const validation = createProductSchema.safeParse(req.body);
    if (!validation.success) {
      return errorResponse(res, validation.error.issues[0]?.message || "Datos inválidos", 400);
    }

    await connectDB();

    const data = validation.data;

    // Verify category exists
    const category = await Category.findById(data.category);
    if (!category) {
      return errorResponse(res, 'Categoría no encontrada', 404);
    }

    // Check for duplicate slug
    const existingProduct = await Product.findOne({ slug: data.slug });
    if (existingProduct) {
      return errorResponse(res, 'Ya existe un producto con ese slug', 400);
    }

    // Validate included items if combo with linked products
    if (data.pricingType === 'fixed' && data.includedItems?.length) {
      for (const item of data.includedItems) {
        const linkedProduct = await Product.findById(item.productId);
        if (!linkedProduct) {
          return errorResponse(res, `Producto incluido no encontrado: ${item.productId}`, 400);
        }
      }
    }

    // Calculate prices
    let costoProd = 0;
    let precioSugerido = 0;
    let precioVenta = 0;

    if (data.pricingType === 'ingredient-based') {
      // Calculate cost from ingredients
      costoProd = await calculateProductCost(data.ingredients);
      costoProd = Math.round(costoProd);

      // Get markup from config
      const config = await Config.findOne().lean<IConfig>();
      const markup = config?.markup || 2.5;

      // Calculate suggested price
      precioSugerido = Math.round(costoProd * markup);

      // Use custom price if provided, otherwise use suggested price
      precioVenta = data.precioVenta !== undefined ? Math.round(data.precioVenta) : precioSugerido;
    } else {
      // Fixed pricing
      precioVenta = data.fixedPrice;
      precioSugerido = data.fixedPrice;
      costoProd = 0; // No ingredient cost for fixed price products
    }

    // Create product with calculated prices
    const product = await Product.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      category: data.category,
      pricingType: data.pricingType,
      ingredients: data.pricingType === 'ingredient-based' ? data.ingredients : undefined,
      fixedPrice: data.pricingType === 'fixed' ? data.fixedPrice : undefined,
      servings: data.pricingType === 'fixed' ? data.servings : undefined,
      comboDescription: data.pricingType === 'fixed' ? data.comboDescription : undefined,
      includedItems: data.pricingType === 'fixed' ? data.includedItems : undefined,
      costoProd,
      precioSugerido,
      precioVenta,
      imageUrl: data.imageUrl || undefined,
      isActive: data.isActive ?? true,
      isAvailable: data.isAvailable ?? true,
      displayOrder: data.displayOrder ?? 0,
      tags: data.tags || []
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('includedItems.productId', 'name slug')
      .lean();

    return successResponse(res, { product: populatedProduct }, 'Producto creado exitosamente', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse(res, 'Unauthorized', 401);
    }
    console.error('Error creating product:', error);
    return errorResponse(res, 'Error al crear el producto', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 30, windowMs: 60 * 1000 })
)(handler);
