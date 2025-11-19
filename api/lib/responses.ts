/**
 * API Response Helpers
 *
 * Standardized helper functions for sending API responses
 */

import type { VercelResponse } from '@vercel/node';
import type { ApiResponse } from '../types/responses.js';
import { randomBytes } from 'crypto';

/**
 * Send a successful response
 */
export function successResponse<T>(
  res: VercelResponse,
  data: T,
  message?: string,
  status: number = 200
) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  return res.status(status).json(response);
}

/**
 * Send an error response
 *
 * For 5xx errors, hides the actual error message and provides an error ID for debugging
 */
export function errorResponse(
  res: VercelResponse,
  error: string | Error,
  status: number = 500
) {
  const errorId = randomBytes(8).toString('hex');
  const errorMessage = error instanceof Error ? error.message : error;

  // Log full error server-side
  console.error(`[${errorId}] API Error:`, error);

  const response: ApiResponse = {
    success: false,
    error: status >= 500 ? 'Internal server error' : errorMessage,
    errorId: status >= 500 ? errorId : undefined
  };

  return res.status(status).json(response);
}
