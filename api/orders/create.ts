import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Order, User } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { sendOrderConfirmation, sendNewOrderNotification } from '../lib/email.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { items, total, personalInfo, deliveryMethod, notes, paymentProof } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    if (!total || typeof total !== 'number') {
      return res.status(400).json({ error: 'Total is required' });
    }

    if (!personalInfo || !personalInfo.name || !personalInfo.phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    if (!deliveryMethod || !['pickup', 'uber-flash'].includes(deliveryMethod)) {
      return res.status(400).json({ error: 'Invalid delivery method' });
    }

    // Check if user is authenticated
    let userId = null;
    try {
      const payload = verifyAuth(req);
      userId = payload.userId;
    } catch (error) {
      // User is not authenticated, that's ok for guest orders
    }

    // Create order
    const order = await Order.create({
      user: userId,
      guestInfo: userId ? null : {
        name: personalInfo.name,
        phone: personalInfo.phone,
        email: personalInfo.email
      },
      items,
      total,
      deliveryMethod,
      paymentProof,
      notes,
      status: 'pending'
    });

    // Send confirmation emails
    try {
      // Send to customer if email provided
      if (personalInfo.email) {
        await sendOrderConfirmation(personalInfo.email, {
          orderId: order._id.toString(),
          items,
          total,
          deliveryMethod: deliveryMethod === 'pickup' ? 'Recoger en tienda' : 'Uber Flash'
        });
      }

      // Send to admin
      await sendNewOrderNotification({
        orderId: order._id.toString(),
        customerName: personalInfo.name,
        customerPhone: personalInfo.phone,
        items,
        total,
        deliveryMethod: deliveryMethod === 'pickup' ? 'Recoger en tienda' : 'Uber Flash',
        notes
      });
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the order if email fails
    }

    return res.status(201).json({
      success: true,
      orderId: order._id,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 5, windowMs: 60 * 60 * 1000 }) // 5 orders per hour
)(handler);
