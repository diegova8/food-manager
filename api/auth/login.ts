import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { User } from '../lib/models.js';
import { comparePassword, generateToken } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit, withValidation, type ValidationHandler } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { loginSchema, type LoginInput } from '../schemas/auth.js';

const handler: ValidationHandler<LoginInput> = async (req: VercelRequest, res: VercelResponse, validatedData: LoginInput) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    await connectDB();

    const { username, password } = validatedData;

    // Buscar usuario por username o email (case-insensitive)
    const usernameLower = username.toLowerCase();
    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${usernameLower}$`, 'i') } },
        { email: { $regex: new RegExp(`^${usernameLower}$`, 'i') } }
      ]
    });

    if (!user) {
      return errorResponse(res, 'Credenciales inválidas', 401);
    }

    // Verificar password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return errorResponse(res, 'Credenciales inválidas', 401);
    }

    // Verificar email (solo para usuarios no admin con email)
    if (user.email && !user.isAdmin && !user.emailVerified) {
      return errorResponse(
        res,
        'Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.',
        403
      );
    }

    // Generar token with full profile info
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      birthday: user.birthday?.toISOString().split('T')[0],
      dietaryPreferences: user.dietaryPreferences,
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
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          birthday: user.birthday,
          dietaryPreferences: user.dietaryPreferences,
          isAdmin: user.isAdmin
        }
      },
      'Inicio de sesión exitoso'
    );
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
};

const validatedHandler = withValidation(loginSchema)(handler);

// Apply middleware: CORS, Security Headers, Rate Limiting
export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 })
)(validatedHandler);
