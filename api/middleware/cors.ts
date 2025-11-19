import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Handler } from './index.js';

/**
 * CORS middleware to control which origins can access the API
 *
 * Prevents unauthorized cross-origin requests
 */

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://cevichedemitata.app',
  'https://cevichedemitata.vercel.app',
  'https://food-manager.vercel.app',
  'https://ceviche-manager.vercel.app'
];

export function withCORS(handler: Handler<any>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const origin = req.headers.origin;

    // Check if origin is allowed
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Set allowed methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    // Set allowed headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Set max age for preflight cache
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Call the actual handler
    return handler(req, res);
  };
}
