import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Product, Category, Config } from '../lib/models.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

// Helper to calculate price for ingredient-based products
function calculateProductPrice(
  product: {
    ingredients?: { rawMaterialId: string; quantity: number }[];
    olores?: number;
    mezclaJugo?: number;
  },
  rawMaterials: Record<string, number>,
  markup: number
): { costoProd: number; precioVenta: number } {
  let costoProd = 0;

  // Calculate ingredient costs
  if (product.ingredients) {
    for (const ingredient of product.ingredients) {
      const price = rawMaterials[ingredient.rawMaterialId] || 0;
      costoProd += ingredient.quantity * price;
    }
  }

  // Add olores cost
  if (product.olores) {
    costoProd += product.olores * (rawMaterials.olores || 0);
  }

  // Add juice mixture cost
  if (product.mezclaJugo) {
    const juiceCostPerLiter =
      500 * (rawMaterials.jugoLimon || 0) +
      500 * (rawMaterials.jugoNaranja || 0) +
      33 * (rawMaterials.sal || 0) +
      33 * (rawMaterials.azucar || 0);
    costoProd += (product.mezclaJugo / 1000) * juiceCostPerLiter;
  }

  // Add container cost
  costoProd += rawMaterials.envase || 0;

  const precioVenta = costoProd * markup;

  return { costoProd, precioVenta };
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    await connectDB();

    const { category, includeInactive } = req.query;

    // Build filter for active, available products only (public menu)
    const filter: Record<string, unknown> = {};

    if (includeInactive !== 'true') {
      filter.isActive = true;
      filter.isAvailable = true;
    }

    if (category) {
      // Find category by slug
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        filter.category = cat._id;
      }
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('includedItems.productId', 'name slug')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Get config for price calculation
    const config = await Config.findOne().lean();
    const rawMaterials = config?.rawMaterials || {};
    const markup = config?.markup || 2.5;
    const customPrices = config?.customPrices || {};

    // Calculate prices for each product
    const productsWithPrices = products.map((product) => {
      let costoProd = 0;
      let precioVenta = 0;

      if (product.pricingType === 'ingredient-based') {
        const prices = calculateProductPrice(product, rawMaterials, markup);
        costoProd = prices.costoProd;
        // Check for custom price override
        precioVenta = customPrices[product.slug] || prices.precioVenta;
      } else {
        // Fixed pricing
        precioVenta = product.fixedPrice || 0;
      }

      return {
        ...product,
        costoProd: Math.round(costoProd),
        precioVenta: Math.round(precioVenta)
      };
    });

    // Get categories for grouping
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean();

    return successResponse(res, {
      products: productsWithPrices,
      categories
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return errorResponse(res, 'Error al obtener los productos', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 60, windowMs: 60 * 1000 })
)(handler);
