import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { RawMaterial } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { createRawMaterialSchema } from '../schemas/product.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();

  // GET - List all raw materials (admin only)
  if (req.method === 'GET') {
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }

      const { includeInactive } = req.query;

      const filter: Record<string, unknown> = {};
      if (includeInactive !== 'true') {
        filter.isActive = true;
      }

      const rawMaterials = await RawMaterial.find(filter)
        .sort({ displayOrder: 1, name: 1 })
        .lean();

      return successResponse(res, { rawMaterials });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return errorResponse(res, 'Unauthorized', 401);
      }
      console.error('Error fetching raw materials:', error);
      return errorResponse(res, 'Error al obtener las materias primas', 500);
    }
  }

  // POST - Create raw material (admin only)
  if (req.method === 'POST') {
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }

      const validation = createRawMaterialSchema.safeParse(req.body);
      if (!validation.success) {
        return errorResponse(res, validation.error.errors[0].message, 400);
      }

      const data = validation.data;

      // Check for duplicate slug
      const existingMaterial = await RawMaterial.findOne({ slug: data.slug });
      if (existingMaterial) {
        return errorResponse(res, 'Ya existe una materia prima con ese slug', 400);
      }

      const rawMaterial = await RawMaterial.create({
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        imageUrl: data.imageUrl || undefined,
        price: data.price,
        unit: data.unit,
        description: data.description,
        isActive: data.isActive ?? true,
        displayOrder: data.displayOrder ?? 0
      });

      return successResponse(res, { rawMaterial }, 'Materia prima creada exitosamente', 201);
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return errorResponse(res, 'Unauthorized', 401);
      }
      console.error('Error creating raw material:', error);
      return errorResponse(res, 'Error al crear la materia prima', 500);
    }
  }

  return errorResponse(res, 'Method not allowed', 405);
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 60, windowMs: 60 * 1000 })
)(handler);
