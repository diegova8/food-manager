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

    // Get query parameters for filtering
    const { status, limit = '50', offset = '0' } = req.query;

    // Build query
    interface OrderQuery {
      status?: string;
    }
    const query: OrderQuery = {};
    if (status && typeof status === 'string') {
      query.status = status;
    }

    // Fetch orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .populate('user', 'firstName lastName email phone')
      .lean();

    // Get total count for pagination
    const totalCount = await Order.countDocuments(query);

    // Get total amount of ALL orders (ignoring filters)
    const totalAmountResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    return successResponse(res, {
      orders,
      totalCount,
      totalAmount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders
)(handler);
