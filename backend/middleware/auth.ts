import { eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Find the session in the database using the token
    const session = await db.query.session.findFirst({
      where: eq(schema.session.token, token),
    });
    
    if (!session || !session.userId) {
      return res.status(401).json({ error: 'Token is not valid' });
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Token has expired' });
    }

    // Get the user data from the database
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, session.userId),
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export { verifyToken };
