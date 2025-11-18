import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = verifyAuth(req);

    return res.status(200).json({
      success: true,
      user: {
        userId: payload.userId,
        username: payload.username
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
}
