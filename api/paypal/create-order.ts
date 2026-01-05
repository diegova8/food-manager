import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const USD_TO_CRC_RATE = parseFloat(process.env.USD_TO_CRC_RATE || '505');

const PAYPAL_API_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Schema for order data
const createPayPalOrderSchema = z.object({
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
    const errorText = await response.text();
    let errorDetails;
    try {
      errorDetails = JSON.parse(errorText);
    } catch {
      errorDetails = errorText;
    }
    console.error('PayPal auth error:', {
      status: response.status,
      mode: PAYPAL_MODE,
      url: PAYPAL_API_URL,
      error: errorDetails
    });
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
    const validation = createPayPalOrderSchema.safeParse(req.body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Datos inválidos';
      return errorResponse(res, errorMessage, 400);
    }

    const orderData = validation.data;

    // Convert CRC to USD
    const totalUsd = Math.round((orderData.total / USD_TO_CRC_RATE) * 100) / 100;

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create PayPal order
    const paypalOrderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: totalUsd.toFixed(2)
        },
        description: `Orden Ceviche Manager - ${orderData.items.length} producto(s)`
      }],
      application_context: {
        brand_name: 'Ceviche Manager',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.APP_URL || process.env.VERCEL_URL || 'https://ceviche-manager.vercel.app'}/checkout`,
        cancel_url: `${process.env.APP_URL || process.env.VERCEL_URL || 'https://ceviche-manager.vercel.app'}/checkout`
      }
    };

    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paypalOrderPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = errorText;
      }
      console.error('PayPal create order error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails,
        payload: paypalOrderPayload
      });
      return errorResponse(res, 'Error al crear orden de PayPal', 500);
    }

    const paypalOrder = await response.json();

    // Return in the format expected by PayPal SDK: { id: "ORDER_ID" }
    return successResponse(res, {
      id: paypalOrder.id, // PayPal SDK expects 'id', not 'paypalOrderId'
      paypalOrderId: paypalOrder.id, // Keep for backward compatibility
      totalUsd,
      orderData // Return order data to be used in capture
    });

  } catch (error) {
    console.error('Create PayPal order error:', error);
    return errorResponse(res, error instanceof Error ? error.message : 'Error al procesar el pago', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 10, windowMs: 60 * 1000 })
)(handler);
