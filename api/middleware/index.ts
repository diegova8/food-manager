/**
 * Middleware barrel export
 *
 * Convenience file to import all middleware from one place
 */

export { withCORS } from './cors';
export { withRateLimit, type RateLimitConfig } from './rateLimit';
export { withSecurityHeaders } from './securityHeaders';

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
export function compose(...middlewares: Function[]) {
  return (handler: Function) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}
