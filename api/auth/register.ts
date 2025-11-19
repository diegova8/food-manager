import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomBytes } from 'crypto';
import connectDB from '../lib/mongodb.js';
import { User, EmailVerification } from '../lib/models.js';
import { hashPassword } from '../lib/auth.js';
import { sendVerificationEmail } from '../lib/email.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { email, password, name, phone, address, birthday, dietaryPreferences } = req.body;

    // Validate required fields
    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        error: 'Email, password, name, and phone are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength (min 8 characters)
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username: email }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'A user with this email already exists'
      });
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

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 3, windowMs: 60 * 60 * 1000 }) // 3 registrations per hour
)(handler);
