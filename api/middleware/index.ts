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

// Base handler type for regular endpoints (2 params)
export type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void | VercelResponse> | void | VercelResponse;

// Validation handler type for endpoints with validated data (3 params)
export type ValidationHandler<T> = (req: VercelRequest, res: VercelResponse, validatedData: T) => Promise<void | VercelResponse> | void | VercelResponse;

// Middleware accepts and returns a handler
export type Middleware = (handler: Handler) => Handler;

// Validation middleware accepts ValidationHandler and returns Handler
export type ValidationMiddleware<T> = (handler: ValidationHandler<T>) => Handler;

export function compose(...middlewares: Middleware[]): (handler: Handler) => Handler {
  return (handler: Handler): Handler => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}
