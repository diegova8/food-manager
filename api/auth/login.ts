import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb';
import { User } from '../lib/models';
import { comparePassword, generateToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { username, password } = req.body;

    // Validar inputs
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Buscar usuario
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verificar password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generar token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
