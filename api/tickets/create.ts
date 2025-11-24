import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { SupportTicket, User } from '../lib/models.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { sendTicketConfirmation, sendTicketNotificationToSupport } from '../lib/email.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  username: string;
  isAdmin: boolean;
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    await connectDB();

    const { type, title, description, images, email, name } = req.body;

    // Validate required fields
    if (!type || !title || !description) {
      return errorResponse(res, 'Type, title, and description are required', 400);
    }

    if (!['suggestion', 'bug'].includes(type)) {
      return errorResponse(res, 'Type must be "suggestion" or "bug"', 400);
    }

    // Check if user is authenticated
    let userId: string | undefined;
    let userEmail: string | undefined;
    let userName: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        const user = await User.findById(decoded.userId);
        if (user) {
          userId = user._id.toString();
          userEmail = user.email;
          userName = user.firstName || user.username;
        }
      } catch {
        // Token invalid, continue as guest
      }
    }

    // For guests, require email and name
    if (!userId) {
      if (!email || !name) {
        return errorResponse(res, 'Email and name are required for guests', 400);
      }
      userEmail = email;
      userName = name;
    }

    // Validate image URLs (already uploaded via client upload)
    const imageUrls: string[] = [];
    if (images && Array.isArray(images)) {
      for (let i = 0; i < Math.min(images.length, 5); i++) {
        const imageUrl = images[i];
        // Only accept valid Vercel Blob URLs
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes('.blob.vercel-storage.com/')) {
          imageUrls.push(imageUrl);
        }
      }
    }

    // Create ticket
    const ticket = new SupportTicket({
      user: userId,
      guestEmail: !userId ? userEmail : undefined,
      guestName: !userId ? userName : undefined,
      type,
      title,
      description,
      images: imageUrls,
      status: 'open'
    });

    await ticket.save();

    // Send confirmation email to user
    if (userEmail) {
      try {
        await sendTicketConfirmation(userEmail, {
          ticketId: ticket._id.toString(),
          name: userName || 'Usuario',
          type,
          title
        });
      } catch (emailError) {
        console.error('Error sending ticket confirmation:', emailError);
      }
    }

    // Send notification to support
    try {
      await sendTicketNotificationToSupport({
        ticketId: ticket._id.toString(),
        name: userName || 'Usuario',
        email: userEmail || 'No proporcionado',
        type,
        title,
        description,
        images: imageUrls
      });
    } catch (emailError) {
      console.error('Error sending support notification:', emailError);
    }

    return successResponse(res, {
      ticketId: ticket._id.toString(),
      type: ticket.type,
      title: ticket.title,
      status: ticket.status
    }, 'Ticket created successfully', 201);

  } catch (error) {
    console.error('Create ticket error:', error);
    return errorResponse(res, error instanceof Error ? error : 'Failed to create ticket', 500);
  }
}

// Apply middleware with rate limiting (5 tickets per hour)
export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 5 })
)(handler);
