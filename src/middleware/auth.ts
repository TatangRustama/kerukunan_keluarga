import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface DecodedUser {
  uid: string;
  email: string;
  name?: string;
}

export interface AuthRequest extends Request {
  user?: DecodedUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET) as DecodedUser;
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
};
