import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { User } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Verify admin authentication
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }
    } catch {
      return errorResponse(res, 'Unauthorized', 401);
    }

    await connectDB();

    // Get query parameters
    const {
      search = '',
      emailVerified,
      isAdmin,
      limit = '20',
      offset = '0',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    interface UserQuery {
      $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
      emailVerified?: boolean;
      isAdmin?: boolean;
    }
    const query: UserQuery = {};

    // Search filter (by name, email, or phone)
    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = search.trim();
      query.$or = [
        { firstName: { $regex: searchRegex, $options: 'i' } },
        { lastName: { $regex: searchRegex, $options: 'i' } },
        { email: { $regex: searchRegex, $options: 'i' } },
        { phone: { $regex: searchRegex, $options: 'i' } },
        { username: { $regex: searchRegex, $options: 'i' } }
      ];
    }

    // Email verified filter
    if (emailVerified !== undefined && emailVerified !== '') {
      query.emailVerified = emailVerified === 'true';
    }

    // Admin filter
    if (isAdmin !== undefined && isAdmin !== '') {
      query.isAdmin = isAdmin === 'true';
    }

    // Sort configuration
    const sortField = typeof sortBy === 'string' ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort: { [key: string]: 1 | -1 } = { [sortField]: sortDirection };

    // Fetch users (excluding password)
    const users = await User.find(query)
      .select('-password -passwordResetToken -passwordResetExpiry')
      .sort(sort)
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .lean();

    // Get total count for pagination
    const totalCount = await User.countDocuments(query);

    return successResponse(res, {
      users,
      totalCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders
)(handler);
