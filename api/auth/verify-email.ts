import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { User, EmailVerification } from '../lib/models.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit, withValidation, type ValidationHandler } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { verifyEmailSchema, type VerifyEmailInput } from '../schemas/auth.js';

const handler: ValidationHandler<VerifyEmailInput> = async (req: VercelRequest, res: VercelResponse, validatedData: VerifyEmailInput) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    await connectDB();

    const { token } = validatedData;

    // Find verification record
    const verification = await EmailVerification.findOne({ token });

    if (!verification) {
      return errorResponse(res, 'Invalid or expired verification token', 400);
    }

    // Check if token has expired
    if (new Date() > verification.expiresAt) {
      await EmailVerification.deleteOne({ token });
      return errorResponse(res, 'Verification token has expired', 400);
    }

    // Find and update user
    const user = await User.findOne({ email: verification.email });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (user.emailVerified) {
      // Already verified, clean up token
      await EmailVerification.deleteOne({ token });
      return successResponse(res, null, 'Email already verified');
    }

    // Mark email as verified
    user.emailVerified = true;
    await user.save();

    // Delete verification token
    await EmailVerification.deleteOne({ token });

    return successResponse(res, null, 'Email verified successfully! You can now log in.');
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
};

const validatedHandler = withValidation(verifyEmailSchema)(handler);

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 10, windowMs: 60 * 60 * 1000 }) // 10 attempts per hour
)(validatedHandler);
