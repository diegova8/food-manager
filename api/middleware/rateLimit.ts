import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Handler } from './index.js';

/**
 * Rate limiting middleware to prevent brute force attacks
 *
 * Limits the number of requests from a single IP within a time window
 *
 * ⚠️ IMPORTANT SERVERLESS LIMITATION:
 * This implementation uses in-memory storage which does NOT work effectively
 * in Vercel's serverless environment. Each serverless function instance has
 * its own memory, so rate limits are NOT shared across instances.
 *
 * For production-grade rate limiting in serverless:
 * - Use Redis (Upstash recommended for Vercel): https://upstash.com/
 * - Or use Vercel's built-in Edge Config + KV
 *
 * Current implementation provides basic protection for MVP but can be bypassed
 * by distributing requests across multiple serverless instances.
 */

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests allowed in the window
}

// In-memory store for request counts (NOT shared across serverless instances)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function withRateLimit(config: RateLimitConfig) {
  return (handler: Handler) => {
    return async (req: VercelRequest, res: VercelResponse) => {
      // Get client IP
      const forwardedFor = req.headers['x-forwarded-for'];
      const realIp = req.headers['x-real-ip'];
      const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) ||
                 (Array.isArray(realIp) ? realIp[0] : realIp) ||
                 'unknown';

      const key = `${ip}:${req.url}`;
      const now = Date.now();

      // Get or create rate limit record
      const record = requestCounts.get(key);

      if (record && now < record.resetTime) {
        // Within the time window
        if (record.count >= config.maxRequests) {
          // Rate limit exceeded
          const retryAfter = Math.ceil((record.resetTime - now) / 1000);
          res.setHeader('Retry-After', retryAfter.toString());
          res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
          res.setHeader('X-RateLimit-Remaining', '0');
          res.setHeader('X-RateLimit-Reset', record.resetTime.toString());

          return res.status(429).json({
            success: false,
            error: 'Too many requests. Please try again later.',
            retryAfter: retryAfter
          });
        }

        // Increment count
        record.count++;
        res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', (config.maxRequests - record.count).toString());
        res.setHeader('X-RateLimit-Reset', record.resetTime.toString());
      } else {
        // Create new record
        requestCounts.set(key, {
          count: 1,
          resetTime: now + config.windowMs
        });

        res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', (config.maxRequests - 1).toString());
        res.setHeader('X-RateLimit-Reset', (now + config.windowMs).toString());
      }

      // Call the actual handler
      return handler(req, res);
    };
  };
}
