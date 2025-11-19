import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const payload = verifyAuth(req);

    return successResponse(res, {
      user: {
        userId: payload.userId,
        username: payload.username,
        isAdmin: payload.isAdmin
      }
    });
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error.message : 'Authentication failed', 401);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders
)(handler);
