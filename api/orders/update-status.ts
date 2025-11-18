import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Order } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow PUT
  if (req.method !== 'PUT') {
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

    const { orderId, status } = req.body;

    // Validate inputs
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    if (!status || !['pending', 'confirmed', 'ready', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Find and update order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
