import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Order } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

interface PopulatedUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface OrderWithPopulatedUser {
  _id: string;
  user?: PopulatedUser | string;
  guestInfo?: {
    name: string;
    phone: string;
    email?: string;
  };
  items: Array<{
    cevicheType: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryMethod: 'pickup' | 'uber-flash';
  scheduledDate: Date;
  paymentProof?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

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
      return errorResponse(res, `Unauthorized: ${error}`, 401);
    }

    await connectDB();

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return errorResponse(res, 'Order ID is required', 400);
    }

    // Fetch order
    const order = await Order.findById(id)
      .populate('user', 'firstName lastName email phone')
      .lean() as OrderWithPopulatedUser | null;

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Check if user owns this order or is admin
    // After populate with lean(), user can be an object with _id or just an ObjectId
    let orderUserId: string | undefined;
    if (order.user) {
      if (typeof order.user === 'object' && order.user._id) {
        orderUserId = order.user._id.toString();
      } else {
        orderUserId = (order.user as string).toString();
      }
    }

    // Non-admin users can only view their own orders
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
