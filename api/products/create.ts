import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Product, Category } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { createProductSchema } from '../schemas/product.js';

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
      return errorResponse(res, validation.error.errors[0].message, 400);
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

    // Create product
    const product = await Product.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      category: data.category,
      pricingType: data.pricingType,
      ingredients: data.pricingType === 'ingredient-based' ? data.ingredients : undefined,
      olores: data.pricingType === 'ingredient-based' ? data.olores : undefined,
      mezclaJugo: data.pricingType === 'ingredient-based' ? data.mezclaJugo : undefined,
      fixedPrice: data.pricingType === 'fixed' ? data.fixedPrice : undefined,
      servings: data.pricingType === 'fixed' ? data.servings : undefined,
      comboDescription: data.pricingType === 'fixed' ? data.comboDescription : undefined,
      includedItems: data.pricingType === 'fixed' ? data.includedItems : undefined,
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
