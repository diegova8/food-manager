import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Product, Category } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

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

    const [rawProducts, totalCount] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('includedItems.productId', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Ensure all products have valid price fields (for backwards compatibility)
    const products = rawProducts.map(product => ({
      ...product,
      costoProd: product.costoProd ?? 0,
      precioSugerido: product.precioSugerido ?? product.precioVenta ?? 0,
      precioVenta: product.precioVenta ?? product.fixedPrice ?? 0
    }));

    // Get all categories for filtering
    const categories = await Category.find()
      .sort({ displayOrder: 1 })
      .lean();

    return successResponse(res, {
      products,
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
