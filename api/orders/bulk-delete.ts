import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Order } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { ActivityLogger } from '../lib/activityLogger.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Verify admin authentication
    const payload = verifyAuth(req);
    if (!payload.isAdmin) {
      return errorResponse(res, 'Unauthorized - Admin access required', 403);
    }

    await connectDB();

    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return errorResponse(res, 'orderIds must be a non-empty array', 400);
    }

    if (orderIds.length > 50) {
      return errorResponse(res, 'Cannot delete more than 50 orders at once', 400);
    }

    // Delete orders
    const result = await Order.deleteMany({ _id: { $in: orderIds } });

    // Log activity (non-blocking)
    ActivityLogger.ordersBulkDeleted(payload.userId, result.deletedCount || 0, req);

    return successResponse(res, {
      deletedCount: result.deletedCount,
      orderIds
    }, `${result.deletedCount} orders deleted successfully`);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse(res, 'Unauthorized', 401);
    }
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 10, windowMs: 60 * 1000 })
)(handler);
