import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { User } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { ActivityLogger } from '../lib/activityLogger.js';

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

    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return errorResponse(res, 'userIds must be a non-empty array', 400);
    }

    if (userIds.length > 50) {
      return errorResponse(res, 'Cannot delete more than 50 users at once', 400);
    }

    // Don't allow deleting the current admin user
    if (userIds.includes(payload.userId)) {
      return errorResponse(res, 'Cannot delete your own account', 400);
    }

    // Delete users
    const result = await User.deleteMany({ _id: { $in: userIds } });

    // Log activity (non-blocking)
    ActivityLogger.usersBulkDeleted(payload.userId, result.deletedCount || 0, req);

    return successResponse(res, {
      deletedCount: result.deletedCount,
      userIds
    }, `${result.deletedCount} users deleted successfully`);
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
