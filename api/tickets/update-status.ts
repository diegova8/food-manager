import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { SupportTicket, User } from '../lib/models.js';
import { compose, withCORS, withSecurityHeaders } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { ActivityLogger } from '../lib/activityLogger.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  username: string;
  isAdmin: boolean;
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
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

    const { ticketId, status } = req.body;

    if (!ticketId || !status) {
      return errorResponse(res, 'Ticket ID and status are required', 400);
    }

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status', 400);
    }

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return errorResponse(res, 'Ticket not found', 404);
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.updatedAt = new Date();
    await ticket.save();

    // Log activity (non-blocking)
    ActivityLogger.ticketStatusChanged(decoded.userId, ticketId, oldStatus, status, req);

    return successResponse(res, {
      id: ticket._id.toString(),
      status: ticket.status,
      updatedAt: ticket.updatedAt
    }, 'Ticket status updated');

  } catch (error) {
    console.error('Update ticket status error:', error);
    return errorResponse(res, error instanceof Error ? error : 'Failed to update ticket', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders
)(handler);
