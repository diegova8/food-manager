import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Order } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit, withValidation, type ValidationHandler } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { deleteOrderSchema, type DeleteOrderInput } from '../schemas/order.js';

const handler: ValidationHandler<DeleteOrderInput> = async (req: VercelRequest, res: VercelResponse, validatedData: DeleteOrderInput) => {
  // Only allow DELETE
  if (req.method !== 'DELETE') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Verify admin authentication
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }
    } catch (error) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    await connectDB();

    const { orderId } = validatedData;

    // Find and delete order
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    return successResponse(res, { orderId }, 'Order deleted successfully');
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
};

const validatedHandler = withValidation(deleteOrderSchema)(handler);

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 30, windowMs: 60 * 1000 }) // 30 per minute
)(validatedHandler);
