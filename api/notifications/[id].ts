import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import connectDB from '../lib/mongodb.js';
import { Notification } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  const rawId = req.query.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!id || typeof id !== 'string') {
    return errorResponse(res, 'Notification ID is required', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return errorResponse(res, 'Invalid notification ID format', 400);
  }

  // PATCH - Mark notification as read (admin only)
  if (req.method === 'PATCH') {
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }

      await connectDB();

      const notification = await Notification.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
      ).lean();

      if (!notification) {
        return errorResponse(res, 'Notificación no encontrada', 404);
      }

      return successResponse(res, { notification }, 'Notificación marcada como leída');
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        return errorResponse(res, 'Unauthorized', 401);
      }
      console.error('Error updating notification:', err);
      return errorResponse(res, 'Error al actualizar la notificación', 500);
    }
  }

  // DELETE - Delete notification (admin only)
  if (req.method === 'DELETE') {
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }

      await connectDB();

      const notification = await Notification.findByIdAndDelete(id);

      if (!notification) {
        return errorResponse(res, 'Notificación no encontrada', 404);
      }

      return successResponse(res, { deleted: true }, 'Notificación eliminada');
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        return errorResponse(res, 'Unauthorized', 401);
      }
      console.error('Error deleting notification:', err);
      return errorResponse(res, 'Error al eliminar la notificación', 500);
    }
  }

  return errorResponse(res, 'Method not allowed', 405);
}

export default compose(
  withCORS,
  withSecurityHeaders
)(handler);
