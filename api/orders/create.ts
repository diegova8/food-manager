import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Order, User } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { sendOrderConfirmation, sendNewOrderNotification } from '../lib/email.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit, withValidation, type ValidationHandler } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { createOrderSchema, type CreateOrderInput } from '../schemas/order.js';

const handler: ValidationHandler<CreateOrderInput> = async (req: VercelRequest, res: VercelResponse, validatedData: CreateOrderInput) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    await connectDB();

    const { items, total, personalInfo, deliveryMethod, scheduledDate, notes, paymentProof } = validatedData;

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
      scheduledDate: new Date(scheduledDate),
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

    return successResponse(
      res,
      {
        orderId: order._id.toString(),
        status: order.status
      },
      'Order created successfully',
      201
    );
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
};

const validatedHandler = withValidation(createOrderSchema)(handler);

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 5, windowMs: 60 * 60 * 1000 }) // 5 orders per hour
)(validatedHandler);
