import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { SupportTicket } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Verify admin authentication
    const payload = verifyAuth(req);
    if (!payload.isAdmin) {
      return errorResponse(res, 'Unauthorized - Admin access required', 403);
    }

    await connectDB();

    const { ticketIds } = req.body;

    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return errorResponse(res, 'ticketIds must be a non-empty array', 400);
    }

    if (ticketIds.length > 50) {
      return errorResponse(res, 'Cannot delete more than 50 tickets at once', 400);
    }

    // Delete tickets
    const result = await SupportTicket.deleteMany({ _id: { $in: ticketIds } });

    return successResponse(res, {
      deletedCount: result.deletedCount,
      ticketIds
    }, `${result.deletedCount} tickets deleted successfully`);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse(res, 'Unauthorized', 401);
    }
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 10, windowMs: 60 * 1000 })
)(handler);
