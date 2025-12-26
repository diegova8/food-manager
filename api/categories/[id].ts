import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Category, Product } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { updateCategorySchema } from '../schemas/product.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return errorResponse(res, 'Category ID is required', 400);
  }

  await connectDB();

  // GET - Get single category
  if (req.method === 'GET') {
    try {
      const category = await Category.findById(id).lean();
      if (!category) {
        return errorResponse(res, 'Categoría no encontrada', 404);
      }
      return successResponse(res, { category });
    } catch (error) {
      console.error('Error fetching category:', error);
      return errorResponse(res, 'Error al obtener la categoría', 500);
    }
  }

  // PUT - Update category (admin only)
  if (req.method === 'PUT') {
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }

      const validation = updateCategorySchema.safeParse(req.body);
      if (!validation.success) {
        return errorResponse(res, validation.error.issues[0]?.message || "Datos inválidos", 400);
      }

      const updateData = validation.data;

      // Check for duplicate slug if updating slug
      if (updateData.slug) {
        const existingCategory = await Category.findOne({
          slug: updateData.slug,
          _id: { $ne: id }
        });
        if (existingCategory) {
          return errorResponse(res, 'Ya existe una categoría con ese slug', 400);
        }
      }

      const category = await Category.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).lean();

      if (!category) {
        return errorResponse(res, 'Categoría no encontrada', 404);
      }

      return successResponse(res, { category }, 'Categoría actualizada exitosamente');
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return errorResponse(res, 'Unauthorized', 401);
      }
      console.error('Error updating category:', error);
      return errorResponse(res, 'Error al actualizar la categoría', 500);
    }
  }

  // DELETE - Delete category (admin only)
  if (req.method === 'DELETE') {
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }

      // Check if category has products
      const productCount = await Product.countDocuments({ category: id });
      if (productCount > 0) {
        return errorResponse(
          res,
          `No se puede eliminar la categoría porque tiene ${productCount} producto(s) asociado(s)`,
          400
        );
      }

      const category = await Category.findByIdAndDelete(id);
      if (!category) {
        return errorResponse(res, 'Categoría no encontrada', 404);
      }

      return successResponse(res, { deleted: true }, 'Categoría eliminada exitosamente');
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return errorResponse(res, 'Unauthorized', 401);
      }
      console.error('Error deleting category:', error);
      return errorResponse(res, 'Error al eliminar la categoría', 500);
    }
  }

  return errorResponse(res, 'Method not allowed', 405);
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 30, windowMs: 60 * 1000 })
)(handler);
