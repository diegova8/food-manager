import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Product, Category, Config } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
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

  if (product.ingredients) {
    for (const ingredient of product.ingredients) {
      const price = rawMaterials[ingredient.rawMaterialId] || 0;
      costoProd += ingredient.quantity * price;
    }
  }

  if (product.olores) {
    costoProd += product.olores * (rawMaterials.olores || 0);
  }

  if (product.mezclaJugo) {
    const juiceCostPerLiter =
      500 * (rawMaterials.jugoLimon || 0) +
      500 * (rawMaterials.jugoNaranja || 0) +
      33 * (rawMaterials.sal || 0) +
      33 * (rawMaterials.azucar || 0);
    costoProd += (product.mezclaJugo / 1000) * juiceCostPerLiter;
  }

  costoProd += rawMaterials.envase || 0;

  return { costoProd, precioVenta: costoProd * markup };
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const payload = verifyAuth(req);
    if (!payload.isAdmin) {
      return errorResponse(res, 'Unauthorized - Admin access required', 403);
    }

    await connectDB();

    const {
      category,
      pricingType,
      isActive,
      search,
      page = '1',
      limit = '50',
      sortBy = 'displayOrder',
      sortOrder = 'asc'
    } = req.query;

    // Build filter
    const filter: Record<string, unknown> = {};

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        filter.category = cat._id;
      }
    }

    if (pricingType) {
      filter.pricingType = pricingType;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('includedItems.productId', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter)
    ]);

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
        precioVenta = customPrices[product.slug] || prices.precioVenta;
      } else {
        precioVenta = product.fixedPrice || 0;
      }

      return {
        ...product,
        costoProd: Math.round(costoProd),
        precioVenta: Math.round(precioVenta)
      };
    });

    // Get all categories for filtering
    const categories = await Category.find()
      .sort({ displayOrder: 1 })
      .lean();

    return successResponse(res, {
      products: productsWithPrices,
      categories,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse(res, 'Unauthorized', 401);
    }
    console.error('Error fetching products:', error);
    return errorResponse(res, 'Error al obtener los productos', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 60, windowMs: 60 * 1000 })
)(handler);
