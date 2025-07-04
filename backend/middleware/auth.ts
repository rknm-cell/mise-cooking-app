import { NextFunction, Request, Response } from 'express';
import { auth } from '../lib/auth.js';

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });
    
    if (!session) {
      return res.status(401).json({ error: 'No valid session found' });
    }

    // Add user to request object
    (req as any).user = session.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid session' });
  }
};

export { verifyToken };
