import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Order } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Verify user authentication
    let userId: string;
    let isAdmin: boolean;
    try {
      const payload = verifyAuth(req);
      userId = payload.userId;
      isAdmin = payload.isAdmin || false;
    } catch (error) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    await connectDB();

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return errorResponse(res, 'Order ID is required', 400);
    }

    // Fetch order
    const order = await Order.findById(id)
      .populate('user', 'firstName lastName email phone')
      .lean();

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Check if user owns this order or is admin
    const orderUserId = order.user?._id?.toString() || order.user?.toString();
    if (!isAdmin && orderUserId !== userId) {
      return errorResponse(res, 'Unauthorized - You can only view your own orders', 403);
    }

    return successResponse(res, { order });
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders
)(handler);
