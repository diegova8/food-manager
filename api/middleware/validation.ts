/**
 * Validation middleware using Zod
 *
 * Validates request body against a Zod schema and sanitizes string inputs
 */

import { z } from 'zod';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import validator from 'validator';
import { errorResponse } from '../lib/responses.js';
import type { Handler, ValidationHandler } from './index.js';

/**
 * Sanitize an object by escaping HTML in all string values
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return validator.escape(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
}

/**
 * Validation middleware factory
 *
 * @param schema - Zod schema to validate against
 * @returns Middleware function that validates and sanitizes request body
 */
export function withValidation<T>(schema: z.ZodSchema<T>) {
  return (handler: ValidationHandler<T>): Handler => {
    return async (req: VercelRequest, res: VercelResponse) => {
      try {
        // Validate request body against schema
        const validatedData = schema.parse(req.body);

        // Sanitize string fields to prevent XSS
        const sanitized = sanitizeObject(validatedData);

        // Call handler with validated and sanitized data
        return handler(req, res, sanitized as T);
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Return detailed validation errors
          return errorResponse(
            res,
            {
              error: 'Validation failed',
              details: error.issues.map((err: z.ZodIssue) => ({
                field: err.path.join('.'),
                message: err.message
              }))
            } as any,
            422
          );
        }
        // Re-throw non-validation errors
        throw error;
      }
    };
  };
}
