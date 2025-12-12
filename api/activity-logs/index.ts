import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { ActivityLog } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Verify admin access
    const payload = verifyAuth(req);
    if (!payload.isAdmin) {
      return errorResponse(res, 'Unauthorized - Admin access required', 403);
    }

    await connectDB();

    // Parse query parameters
    const {
      page = '1',
      limit = '50',
      action,
      entityType,
      userId,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: Record<string, unknown> = {};

    if (action) {
      filter.action = action;
    }

    if (entityType) {
      filter.entityType = entityType;
    }

    if (userId) {
      filter.user = userId;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        (filter.createdAt as Record<string, Date>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        (filter.createdAt as Record<string, Date>).$lte = new Date(endDate as string);
      }
    }

    // Fetch logs with pagination
    const [logs, totalCount] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'username firstName lastName email')
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);

    return successResponse(res, {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return errorResponse(res, 'Unauthorized', 401);
    }
    console.error('Error fetching activity logs:', err);
    return errorResponse(res, 'Error al obtener los registros de actividad', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders
)(handler);
