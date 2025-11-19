/**
 * Middleware barrel export
 *
 * Convenience file to import all middleware from one place
 */

export { withCORS } from './cors.js';
export { withRateLimit, type RateLimitConfig } from './rateLimit.js';
export { withSecurityHeaders } from './securityHeaders.js';

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
export function compose(...middlewares: any[]) {
  return (handler: any) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}
