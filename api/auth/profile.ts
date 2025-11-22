import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { User } from '../lib/models.js';
import { verifyAuth, generateToken } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();

    // Verify authentication
    let authPayload;
    try {
      authPayload = verifyAuth(req);
    } catch {
      return errorResponse(res, 'Unauthorized', 401);
    }

    // GET - Get user profile
    if (req.method === 'GET') {
      const user = await User.findById(authPayload.userId).select('-password -passwordResetToken -passwordResetExpiry');

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      return successResponse(res, {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        birthday: user.birthday,
        dietaryPreferences: user.dietaryPreferences,
        isAdmin: user.isAdmin,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      });
    }

    // PUT - Update user profile
    if (req.method === 'PUT') {
      const { name, phone, address, birthday, dietaryPreferences } = req.body;

      // Validate inputs (basic validation)
      if (name && typeof name !== 'string') {
        return errorResponse(res, 'Invalid name', 400);
      }
      if (phone && typeof phone !== 'string') {
        return errorResponse(res, 'Invalid phone', 400);
      }
      if (address && typeof address !== 'string') {
        return errorResponse(res, 'Invalid address', 400);
      }
      if (dietaryPreferences && typeof dietaryPreferences !== 'string') {
        return errorResponse(res, 'Invalid dietary preferences', 400);
      }

      // Find and update user
      const user = await User.findById(authPayload.userId);

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // Update fields if provided
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
      if (birthday !== undefined) user.birthday = birthday ? new Date(birthday) : undefined;
      if (dietaryPreferences !== undefined) user.dietaryPreferences = dietaryPreferences;

      await user.save();

      // Generate new token with updated info
      const token = generateToken({
        userId: user._id.toString(),
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        birthday: user.birthday?.toISOString().split('T')[0],
        dietaryPreferences: user.dietaryPreferences,
        isAdmin: user.isAdmin
      });

      return successResponse(res, {
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          birthday: user.birthday,
          dietaryPreferences: user.dietaryPreferences,
          isAdmin: user.isAdmin
        }
      }, 'Profile updated successfully');
    }

    return errorResponse(res, 'Method not allowed', 405);
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 20, windowMs: 60 * 1000 })
)(handler);
