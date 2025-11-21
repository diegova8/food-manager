import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const { filename, data } = req.body;

    // Validate input
    if (!filename || !data) {
      return errorResponse(res, 'Missing filename or data', 400);
    }

    // Validate file type (must be an image)
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (!validExtensions.includes(ext)) {
      return errorResponse(res, 'Invalid file type. Only images are allowed', 400);
    }

    // Convert base64 to buffer
    let buffer: Buffer;
    try {
      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    } catch (error) {
      return errorResponse(res, `Invalid base64 data: ${error} `, 400);
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (buffer.length > maxSize) {
      return errorResponse(res, 'File size exceeds 10MB limit', 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `payment-proof-${timestamp}${ext}`;

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, buffer, {
      access: 'public',
      contentType: `image/${ext.substring(1)}`,
    });

    return successResponse(res, { url: blob.url }, 'Image uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse(res, error instanceof Error ? error : 'Failed to upload image', 500);
  }
}

// Apply middleware: CORS, Security Headers, and Rate Limiting (10 uploads per hour)
export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 10 })
)(handler);
