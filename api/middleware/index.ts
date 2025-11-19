/**
 * Middleware barrel export
 *
 * Convenience file to import all middleware from one place
 */

export { withCORS } from './cors.js';
export { withRateLimit, type RateLimitConfig } from './rateLimit.js';
export { withSecurityHeaders } from './securityHeaders.js';
export { withValidation } from './validation.js';

/**
 * Compose multiple middleware functions
 *
 * Usage:
 *   export default compose(
 *     withCORS,
 *     withSecurityHeaders,
 *     withRateLimit({ windowMs: 60000, maxRequests: 10 })
 *   )(handler);
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void | VercelResponse> | void | VercelResponse;
type Middleware = (handler: Handler) => Handler;

export function compose(...middlewares: Middleware[]) {
  return (handler: Handler): Handler => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}
