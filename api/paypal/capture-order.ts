import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import connectDB from '../lib/mongodb.js';
import { Order, Notification } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { sendOrderConfirmation, sendNewOrderNotification } from '../lib/email.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const USD_TO_CRC_RATE = parseFloat(process.env.USD_TO_CRC_RATE || '505');

const PAYPAL_API_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Schema for capture request
const capturePayPalOrderSchema = z.object({
  paypalOrderId: z.string().min(1),
  orderData: z.object({
    items: z.array(
      z.object({
        cevicheType: z.string().min(1),
        quantity: z.number().min(1).max(100),
        price: z.number().positive()
      })
    ).min(1).max(100),
    total: z.number().positive(),
    personalInfo: z.object({
      name: z.string().min(2).max(100),
      phone: z.string().min(8),
      email: z.string().email().optional().or(z.literal(''))
    }),
    deliveryMethod: z.enum(['pickup', 'uber-flash']),
    scheduledDate: z.string().min(1),
    notes: z.string().max(500).optional()
  })
});

async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with PayPal');
  }

  const data = await response.json();
  return data.access_token;
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Validate request body
    const validation = capturePayPalOrderSchema.safeParse(req.body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Datos inválidos';
      return errorResponse(res, errorMessage, 400);
    }

    const { paypalOrderId, orderData } = validation.data;

    await connectDB();

    // Check if order with this PayPal ID already exists (idempotency)
    const existingOrder = await Order.findOne({ paypalOrderId });
    if (existingOrder) {
      return successResponse(res, {
        orderId: existingOrder._id.toString(),
        status: existingOrder.status
      }, 'Orden ya procesada');
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Capture the PayPal order
    const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!captureResponse.ok) {
      const error = await captureResponse.text();
      console.error('PayPal capture error:', error);
      return errorResponse(res, 'Error al capturar el pago', 500);
    }

    const captureResult = await captureResponse.json();

    // Verify payment was completed
    if (captureResult.status !== 'COMPLETED') {
      return errorResponse(res, 'El pago no fue completado', 400);
    }

    // Extract transaction details
    const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    const transactionId = capture?.id;
    const capturedAmount = parseFloat(capture?.amount?.value || '0');

    // Calculate expected USD amount
    const expectedUsd = Math.round((orderData.total / USD_TO_CRC_RATE) * 100) / 100;

    // Verify amount (allow small rounding differences)
    if (Math.abs(capturedAmount - expectedUsd) > 0.02) {
      console.error('Amount mismatch:', { capturedAmount, expectedUsd });
      return errorResponse(res, 'El monto del pago no coincide', 400);
    }

    // Check if user is authenticated
    let userId = null;
    try {
      const payload = verifyAuth(req);
      userId = payload.userId;
    } catch {
      // User is not authenticated, that's ok for guest orders
    }

    // Create order in database
    const order = await Order.create({
      user: userId,
      guestInfo: userId ? null : {
        name: orderData.personalInfo.name,
        phone: orderData.personalInfo.phone,
        email: orderData.personalInfo.email || undefined
      },
      items: orderData.items,
      total: orderData.total,
      totalUsd: capturedAmount,
      deliveryMethod: orderData.deliveryMethod,
      scheduledDate: new Date(orderData.scheduledDate),
      paymentMethod: 'paypal',
      paypalOrderId,
      paypalTransactionId: transactionId,
      notes: orderData.notes,
      status: 'confirmed' // PayPal orders are auto-confirmed since payment is verified
    });

    // Create notification for admins
    try {
      await Notification.create({
        type: 'new_order',
        entityId: order._id.toString(),
        title: 'Nueva orden (PayPal)',
        message: `${orderData.personalInfo.name} pagó $${capturedAmount.toFixed(2)} USD con PayPal`,
        isRead: false
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    // Send confirmation emails
    try {
      const deliveryMethodText = orderData.deliveryMethod === 'pickup' ? 'Recoger en tienda' : 'Uber Flash';

      // Send to customer if email provided
      if (orderData.personalInfo.email) {
        await sendOrderConfirmation(orderData.personalInfo.email, {
          orderId: order._id.toString(),
          customerName: orderData.personalInfo.name,
          items: orderData.items,
          total: orderData.total,
          deliveryMethod: deliveryMethodText,
          scheduledDate: orderData.scheduledDate,
          notes: orderData.notes
        });
      }

      // Send to admin
      await sendNewOrderNotification({
        orderId: order._id.toString(),
        customerName: orderData.personalInfo.name,
        customerPhone: orderData.personalInfo.phone,
        customerEmail: orderData.personalInfo.email,
        items: orderData.items,
        total: orderData.total,
        deliveryMethod: deliveryMethodText,
        scheduledDate: orderData.scheduledDate,
        notes: orderData.notes,
        paymentProofUrl: `PayPal - Transaction ID: ${transactionId}`
      });
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
    }

    return successResponse(res, {
      orderId: order._id.toString(),
      status: order.status,
      transactionId
    }, 'Pago procesado exitosamente');

  } catch (error) {
    console.error('Capture PayPal order error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Error al procesar el pago', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 10, windowMs: 60 * 1000 })
)(handler);
