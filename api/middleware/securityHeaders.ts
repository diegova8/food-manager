import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Handler } from './index.js';

/**
 * Security headers middleware to protect against common web vulnerabilities
 *
 * Adds headers to prevent:
 * - XSS attacks
 * - Clickjacking
 * - MIME type sniffing
 * - And more
 */

export function withSecurityHeaders(handler: Handler) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking attacks
    res.setHeader('X-Frame-Options', 'DENY');

    // Enable XSS filter in browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Force HTTPS connections (only in production)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Control referrer information
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    // Note: Adjust this based on your actual needs
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-* should be removed in production
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.resend.com",
      "frame-ancestors 'none'"
    ].join('; ');

    res.setHeader('Content-Security-Policy', csp);

    // Permissions Policy (formerly Feature Policy)
    const permissions = [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=(self)'
    ].join(', ');

    res.setHeader('Permissions-Policy', permissions);

    // Call the actual handler
    return handler(req, res);
  };
}
