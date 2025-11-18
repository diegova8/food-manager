import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@mail.cevichedemitata.app';

interface SendEmailRequest {
  email: string;
  subject: string;
  html: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email, subject, html } = req.body as SendEmailRequest;

    // Validate required fields
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email is required and must be a valid string'
      });
    }

    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Subject is required and must be a valid string'
      });
    }

    if (!html || typeof html !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'HTML body is required and must be a valid string'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Send email using Resend
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: subject,
      html: html
    });

    // Check if email was sent successfully
    if (!result.data) {
      throw new Error('Failed to send email');
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: {
        id: result.data.id
      }
    });

  } catch (error) {
    console.error('Error sending email:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to send email';

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}
