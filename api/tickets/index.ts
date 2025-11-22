import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../lib/mongodb.js';
import { SupportTicket, User } from '../lib/models.js';
import { compose, withCORS, withSecurityHeaders } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  username: string;
  isAdmin: boolean;
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const token = authHeader.substring(7);
    let decoded: JWTPayload;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return errorResponse(res, 'Invalid token', 401);
    }

    await connectDB();

    // Check if user is admin
    const user = await User.findById(decoded.userId);
    if (!user || !user.isAdmin) {
      return errorResponse(res, 'Admin access required', 403);
    }

    // Get query parameters
    const { status, type, page = '1', limit = '20' } = req.query;

    // Build query
    const query: Record<string, unknown> = {};
    if (status && typeof status === 'string') {
      query.status = status;
    }
    if (type && typeof type === 'string') {
      query.type = type;
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    // Fetch tickets with pagination
    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .populate('user', 'username email firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      SupportTicket.countDocuments(query)
    ]);

    // Transform tickets for response
    const ticketsData = tickets.map(ticket => ({
      id: ticket._id.toString(),
      type: ticket.type,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      images: ticket.images,
      user: ticket.user ? {
        id: (ticket.user as unknown as { _id: string })._id?.toString(),
        username: (ticket.user as unknown as { username: string }).username,
        email: (ticket.user as unknown as { email: string }).email,
        firstName: (ticket.user as unknown as { firstName: string }).firstName,
        lastName: (ticket.user as unknown as { lastName: string }).lastName,
      } : null,
      guestEmail: ticket.guestEmail,
      guestName: ticket.guestName,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt
    }));

    return successResponse(res, {
      tickets: ticketsData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('List tickets error:', error);
    return errorResponse(res, error instanceof Error ? error : 'Failed to fetch tickets', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders
)(handler);
