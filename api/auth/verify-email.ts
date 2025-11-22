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
      return errorResponse(res, 'Token de verificación inválido o expirado', 400);
    }

    // Check if token has expired
    if (new Date() > verification.expiresAt) {
      await EmailVerification.deleteOne({ token });
      return errorResponse(res, 'El token de verificación ha expirado', 400);
    }

    // Find and update user (case-insensitive)
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${verification.email}$`, 'i') }
    });

    if (!user) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    if (user.emailVerified) {
      // Already verified, clean up token
      await EmailVerification.deleteOne({ token });
      return successResponse(res, null, 'El correo electrónico ya ha sido verificado');
    }

    // Mark email as verified
    user.emailVerified = true;
    await user.save();

    // Delete verification token
    await EmailVerification.deleteOne({ token });

    return successResponse(res, null, '¡Correo electrónico verificado exitosamente! Ya puedes iniciar sesión.');
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
