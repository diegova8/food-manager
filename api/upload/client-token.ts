import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { errorResponse } from '../lib/responses.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const body = req.body as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req as unknown as Request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate file extension
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
        const ext = pathname.toLowerCase().substring(pathname.lastIndexOf('.'));

        if (!validExtensions.includes(ext)) {
          throw new Error('Invalid file type. Only images (PNG, JPG, GIF, WEBP, HEIC) are allowed');
        }

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/heic',
            'image/heif',
          ],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
          tokenPayload: JSON.stringify({
            uploadedAt: Date.now(),
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Optional: Log or process completed uploads
        console.log('Upload completed:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Upload token error:', error);
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Failed to generate upload token',
      400
    );
  }
}

// Apply middleware: CORS, Security Headers, and Rate Limiting (10 uploads per hour)
export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 10 })
)(handler);
