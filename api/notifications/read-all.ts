import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Notification } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  // PATCH - Mark all notifications as read (admin only)
  if (req.method === 'PATCH') {
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }

      await connectDB();

      const result = await Notification.updateMany(
        { isRead: false },
        { isRead: true }
      );

      return successResponse(res, {
        modifiedCount: result.modifiedCount
      }, 'Todas las notificaciones marcadas como leídas');
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        return errorResponse(res, 'Unauthorized', 401);
      }
      console.error('Error marking all notifications as read:', err);
      return errorResponse(res, 'Error al marcar las notificaciones', 500);
    }
  }

  return errorResponse(res, 'Method not allowed', 405);
}

export default compose(
  withCORS,
  withSecurityHeaders
)(handler);
