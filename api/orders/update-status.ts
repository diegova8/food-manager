import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Order } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit, withValidation, type ValidationHandler } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { updateOrderStatusSchema, type UpdateOrderStatusInput } from '../schemas/order.js';
import { ActivityLogger } from '../lib/activityLogger.js';

const handler: ValidationHandler<UpdateOrderStatusInput> = async (req: VercelRequest, res: VercelResponse, validatedData: UpdateOrderStatusInput) => {
  // Only allow PUT
  if (req.method !== 'PUT') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Verify admin authentication
    let adminId: string;
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }
      adminId = payload.userId;
    } catch (error) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    await connectDB();

    const { orderId, status } = validatedData;

    // Find and update order
    const order = await Order.findById(orderId);

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    const oldStatus = order.status;
    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    // Log activity (non-blocking)
    ActivityLogger.orderStatusChanged(adminId, orderId, oldStatus, status, req);

    return successResponse(res, { order }, 'Order status updated successfully');
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
};

const validatedHandler = withValidation(updateOrderStatusSchema)(handler);

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 30, windowMs: 60 * 1000 }) // 30 per minute
)(validatedHandler);
