import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomBytes } from 'crypto';
import connectDB from '../lib/mongodb.js';
import { User, EmailVerification } from '../lib/models.js';
import { hashPassword } from '../lib/auth.js';
import { sendVerificationEmail } from '../lib/email.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit, withValidation, type ValidationHandler } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { registerSchema, type RegisterInput } from '../schemas/auth.js';

const handler: ValidationHandler<RegisterInput> = async (req: VercelRequest, res: VercelResponse, validatedData: RegisterInput) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    await connectDB();

    const { email, password, name, phone, address, birthday, dietaryPreferences } = validatedData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username: email }]
    });

    if (existingUser) {
      return errorResponse(res, 'A user with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      username: email, // Use email as username for customer accounts
      email,
      password: hashedPassword,
      name,
      phone,
      address,
      birthday: birthday ? new Date(birthday) : undefined,
      dietaryPreferences,
      emailVerified: false,
      isAdmin: false
    });

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

    // Save verification token
    await EmailVerification.create({
      email,
      token: verificationToken,
      expiresAt
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail registration if email fails, user can request new verification
    }

    return successResponse(
      res,
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name
        }
      },
      'Registration successful. Please check your email to verify your account.',
      201
    );
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
};

const validatedHandler = withValidation(registerSchema)(handler);

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 3, windowMs: 60 * 60 * 1000 }) // 3 registrations per hour
)(validatedHandler);
