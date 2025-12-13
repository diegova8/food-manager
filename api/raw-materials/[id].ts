import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { RawMaterial, Product } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { updateRawMaterialSchema } from '../schemas/product.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return errorResponse(res, 'Raw material ID is required', 400);
  }

  await connectDB();

  // GET - Get single raw material (admin only)
  if (req.method === 'GET') {
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }

      const rawMaterial = await RawMaterial.findById(id).lean();

      if (!rawMaterial) {
        return errorResponse(res, 'Materia prima no encontrada', 404);
      }

      return successResponse(res, { rawMaterial });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return errorResponse(res, 'Unauthorized', 401);
      }
      console.error('Error fetching raw material:', error);
      return errorResponse(res, 'Error al obtener la materia prima', 500);
    }
  }

  // PUT - Update raw material (admin only)
  if (req.method === 'PUT') {
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }

      const validation = updateRawMaterialSchema.safeParse(req.body);
      if (!validation.success) {
        return errorResponse(res, validation.error.errors[0].message, 400);
      }

      const updateData = validation.data;

      // Check for duplicate slug if updating slug
      if (updateData.slug) {
        const existingMaterial = await RawMaterial.findOne({
          slug: updateData.slug,
          _id: { $ne: id }
        });
        if (existingMaterial) {
          return errorResponse(res, 'Ya existe una materia prima con ese slug', 400);
        }
      }

      const rawMaterial = await RawMaterial.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).lean();

      if (!rawMaterial) {
        return errorResponse(res, 'Materia prima no encontrada', 404);
      }

      return successResponse(res, { rawMaterial }, 'Materia prima actualizada exitosamente');
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return errorResponse(res, 'Unauthorized', 401);
      }
      console.error('Error updating raw material:', error);
      return errorResponse(res, 'Error al actualizar la materia prima', 500);
    }
  }

  // DELETE - Delete raw material (admin only)
  if (req.method === 'DELETE') {
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }

      // Get the raw material to find its slug
      const materialToDelete = await RawMaterial.findById(id);
      if (!materialToDelete) {
        return errorResponse(res, 'Materia prima no encontrada', 404);
      }

      // Check if any product uses this raw material
      const usedInProduct = await Product.findOne({
        'ingredients.rawMaterialId': materialToDelete.slug
      });

      if (usedInProduct) {
        return errorResponse(
          res,
          `No se puede eliminar porque está siendo usada en el producto "${usedInProduct.name}"`,
          400
        );
      }

      await RawMaterial.findByIdAndDelete(id);

      return successResponse(res, { deleted: true }, 'Materia prima eliminada exitosamente');
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return errorResponse(res, 'Unauthorized', 401);
      }
      console.error('Error deleting raw material:', error);
      return errorResponse(res, 'Error al eliminar la materia prima', 500);
    }
  }

  return errorResponse(res, 'Method not allowed', 405);
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 30, windowMs: 60 * 1000 })
)(handler);
