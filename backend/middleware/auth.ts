import { NextFunction, Request, Response } from 'express';
import { auth } from '../lib/auth.js';

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for session cookie first
    const sessionToken = req.cookies?.session_token;
    
    if (sessionToken) {
      // For now, if session token exists, consider user authenticated
      // In production, you'd validate this token against a session store
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });
      
      if (session) {
        (req as any).user = session.user;
        next();
        return;
      }
    }
    
    // Fallback to better-auth session
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
