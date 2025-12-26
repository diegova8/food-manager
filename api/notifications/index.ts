import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Notification } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  // GET - List all notifications (admin only)
  if (req.method === 'GET') {
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }

      await connectDB();

      const { unreadOnly } = req.query;

      const filter: Record<string, unknown> = {};
      if (unreadOnly === 'true') {
        filter.isRead = false;
      }

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      const unreadCount = await Notification.countDocuments({ isRead: false });

      return successResponse(res, { notifications, unreadCount });
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        return errorResponse(res, 'Unauthorized', 401);
      }
      console.error('Error fetching notifications:', err);
      return errorResponse(res, 'Error al obtener las notificaciones', 500);
    }
  }

  return errorResponse(res, 'Method not allowed', 405);
}

export default compose(
  withCORS,
  withSecurityHeaders
)(handler);
