import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { User, EmailVerification } from '../lib/models.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find verification record
    const verification = await EmailVerification.findOne({ token });

    if (!verification) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Check if token has expired
    if (new Date() > verification.expiresAt) {
      await EmailVerification.deleteOne({ token });
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    // Find and update user
    const user = await User.findOne({ email: verification.email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      // Already verified, clean up token
      await EmailVerification.deleteOne({ token });
      return res.status(200).json({
        success: true,
        message: 'Email already verified'
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    await user.save();

    // Delete verification token
    await EmailVerification.deleteOne({ token });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 10, windowMs: 60 * 60 * 1000 }) // 10 attempts per hour
)(handler);
