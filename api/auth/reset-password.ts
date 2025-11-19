import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { User } from '../lib/models.js';
import { hashPassword } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withValidation, type ValidationHandler } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { resetPasswordSchema, type ResetPasswordInput } from '../schemas/auth.js';

const handler: ValidationHandler<ResetPasswordInput> = async (req: VercelRequest, res: VercelResponse, validatedData: ResetPasswordInput) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    await connectDB();

    const { token, password } = validatedData;

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() } // Token not expired
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired reset token', 400);
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    return successResponse(res, null, 'Password reset successful. You can now log in with your new password.');
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
};

const validatedHandler = withValidation(resetPasswordSchema)(handler);

// Apply middleware: CORS, Security Headers
export default compose(
  withCORS,
  withSecurityHeaders
)(validatedHandler);
