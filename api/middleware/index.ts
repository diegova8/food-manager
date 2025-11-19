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

export type Handler<T = void> = T extends void
  ? (req: VercelRequest, res: VercelResponse) => Promise<void | VercelResponse> | void | VercelResponse
  : (req: VercelRequest, res: VercelResponse, validatedData: T) => Promise<void | VercelResponse> | void | VercelResponse;

export type Middleware = (handler: Handler<any>) => Handler<any>;

export function compose(...middlewares: Middleware[]): (handler: Handler<any>) => Handler<any> {
  return (handler: Handler<any>): Handler<any> => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}
