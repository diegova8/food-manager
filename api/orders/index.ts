import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Order } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders } from '../middleware/index.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin authentication
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return res.status(403).json({ error: 'Unauthorized - Admin access required' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    // Get query parameters for filtering
    const { status, limit = '50', offset = '0' } = req.query;

    // Build query
    const query: any = {};
    if (status && typeof status === 'string') {
      query.status = status;
    }

    // Fetch orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .populate('user', 'name email phone')
      .lean();

    // Get total count for pagination
    const totalCount = await Order.countDocuments(query);

    return res.status(200).json({
      success: true,
      orders,
      totalCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('List orders error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default compose(
  withCORS,
  withSecurityHeaders
)(handler);
