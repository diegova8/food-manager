import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Category } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { createCategorySchema } from '../schemas/product.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();

  // GET - List all categories (public)
  if (req.method === 'GET') {
    try {
      const { includeInactive } = req.query;

      const filter: Record<string, unknown> = {};
      if (includeInactive !== 'true') {
        filter.isActive = true;
      }

      const categories = await Category.find(filter)
        .sort({ displayOrder: 1, name: 1 })
        .lean();

      return successResponse(res, { categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return errorResponse(res, 'Error al obtener las categorías', 500);
    }
  }

  // POST - Create category (admin only)
  if (req.method === 'POST') {
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }

      const validation = createCategorySchema.safeParse(req.body);
      if (!validation.success) {
        return errorResponse(res, validation.error.issues[0]?.message || "Datos inválidos", 400);
      }

      const { name, slug, description, displayOrder, isActive } = validation.data;

      // Check for duplicate slug
      const existingCategory = await Category.findOne({ slug });
      if (existingCategory) {
        return errorResponse(res, 'Ya existe una categoría con ese slug', 400);
      }

      const category = await Category.create({
        name,
        slug,
        description,
        displayOrder: displayOrder ?? 0,
        isActive: isActive ?? true
      });

      return successResponse(res, { category }, 'Categoría creada exitosamente', 201);
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return errorResponse(res, 'Unauthorized', 401);
      }
      console.error('Error creating category:', error);
      return errorResponse(res, 'Error al crear la categoría', 500);
    }
  }

  return errorResponse(res, 'Method not allowed', 405);
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 60, windowMs: 60 * 1000 })
)(handler);
