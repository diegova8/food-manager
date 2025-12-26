import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomBytes } from 'crypto';
import connectDB from '../lib/mongodb.js';
import { User, EmailVerification, Notification } from '../lib/models.js';
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

    const { email, password, firstName, lastName, phone, address, birthday, dietaryPreferences, marketingConsent } = validatedData;

    // Normalize email to lowercase and escape special regex chars
    const emailLower = email.toLowerCase();
    const escapedEmail = emailLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } },
        { username: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } }
      ]
    });

    if (existingUser) {
      return errorResponse(res, 'Ya existe un usuario con este correo electrónico', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Sanitize string fields
    const sanitizeString = (str?: string) => str?.trim().replace(/\s+/g, ' ') || undefined;
    const sanitizeName = (str?: string) => {
      const cleaned = sanitizeString(str);
      if (!cleaned) return undefined;
      // Capitalize first letter of each word
      return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const sanitizedFirstName = sanitizeName(firstName);
    const sanitizedLastName = sanitizeName(lastName);
    const sanitizedPhone = sanitizeString(phone);
    const sanitizedAddress = sanitizeString(address);

    // Create user with lowercase email
    const user = await User.create({
      username: emailLower, // Use email as username for customer accounts
      email: emailLower,
      password: hashedPassword,
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      phone: sanitizedPhone,
      address: sanitizedAddress,
      birthday: birthday ? new Date(birthday) : undefined,
      dietaryPreferences,
      marketingConsent: marketingConsent || false,
      emailVerified: false,
      isAdmin: false
    });

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

    // Save verification token
    await EmailVerification.create({
      email: emailLower,
      token: verificationToken,
      expiresAt
    });

    // Send verification email
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Usuario';
    try {
      await sendVerificationEmail(emailLower, fullName, verificationToken);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail registration if email fails, user can request new verification
    }

    // Create notification for admins
    try {
      await Notification.create({
        type: 'new_user',
        entityId: user._id.toString(),
        title: 'Nuevo usuario registrado',
        message: `${fullName} (${emailLower}) se registró en la plataforma`,
        isRead: false
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail registration if notification fails
    }

    return successResponse(
      res,
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      },
      'Registro exitoso. Por favor revisa tu correo electrónico para verificar tu cuenta.',
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
