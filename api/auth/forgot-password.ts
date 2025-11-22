import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomBytes } from 'crypto';
import connectDB from '../lib/mongodb.js';
import { User } from '../lib/models.js';
import { sendPasswordResetEmail } from '../lib/email.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit, withValidation, type ValidationHandler } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas/auth.js';

const handler: ValidationHandler<ForgotPasswordInput> = async (req: VercelRequest, res: VercelResponse, validatedData: ForgotPasswordInput) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    await connectDB();

    const { email } = validatedData;

    // Find user by email (case-insensitive)
    const emailLower = email.toLowerCase();
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${emailLower}$`, 'i') }
    });

    // Don't reveal if email exists (security best practice)
    if (!user) {
      return successResponse(res, null, 'Si existe una cuenta con ese correo electrónico, se ha enviado un enlace para restablecer la contraseña.');
    }

    // Generate reset token (32 random bytes)
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = resetTokenExpiry;
    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email!, user.name || 'Usuario', resetToken);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Don't fail the request if email fails - user can retry
    }

    return successResponse(res, null, 'If an account with that email exists, a password reset link has been sent.');
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
};

const validatedHandler = withValidation(forgotPasswordSchema)(handler);

// Apply middleware: CORS, Security Headers, Rate Limiting (3 attempts per 5 minutes)
export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ windowMs: 5 * 60 * 1000, maxRequests: 3 })
)(validatedHandler);
