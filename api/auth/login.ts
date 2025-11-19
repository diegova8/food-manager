import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { User } from '../lib/models.js';
import { comparePassword, generateToken } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    await connectDB();

    const { username, password } = req.body;

    // Validar inputs
    if (!username || !password) {
      return errorResponse(res, 'Username and password are required', 400);
    }

    // Buscar usuario por username o email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Verificar password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Verificar email (solo para usuarios no admin con email)
    if (user.email && !user.isAdmin && !user.emailVerified) {
      return errorResponse(
        res,
        'Please verify your email before logging in. Check your inbox for the verification link.',
        403
      );
    }

    // Generar token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      isAdmin: user.isAdmin
    });

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin
        }
      },
      'Login successful'
    );
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
}

// Apply middleware: CORS, Security Headers, and Rate Limiting (5 attempts per 15 minutes)
export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 })
)(handler);
