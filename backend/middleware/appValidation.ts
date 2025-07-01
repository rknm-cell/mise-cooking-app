import { NextFunction, Request, Response } from 'express';

const ALLOWED_USER_AGENTS = [
  'Expo/2.33.13 CFNetwork/3826.500.131 Darwin/24.5.0', // Your current Expo version
  /^Expo\/.*/, // Any Expo version
  /^MiseCooking\/.*/, // Your app when built
];

export const validateAppUserAgent = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'];
  
  if (!userAgent) {
    return res.status(400).json({ 
      error: 'User-Agent header required' 
    });
  }
  
  const isAllowed = ALLOWED_USER_AGENTS.some(allowed => {
    if (typeof allowed === 'string') {
      return userAgent === allowed;
    }
    if (allowed instanceof RegExp) {
      return allowed.test(userAgent);
    }
    return false;
  });
  
  if (!isAllowed) {
    console.log(`Blocked request with User-Agent: ${userAgent}`);
    return res.status(403).json({ 
      error: 'Forbidden - Invalid application' 
    });
  }
  
  next();
}; 