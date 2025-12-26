import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Product, Category } from '../lib/models.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

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

    const rawProducts = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('includedItems.productId', 'name slug')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Ensure all products have valid price fields (for backwards compatibility)
    const products = rawProducts.map(product => ({
      ...product,
      costoProd: product.costoProd ?? 0,
      precioSugerido: product.precioSugerido ?? product.precioVenta ?? 0,
      precioVenta: product.precioVenta ?? product.fixedPrice ?? 0
    }));

    // Get categories for grouping
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean();

    return successResponse(res, {
      products,
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
