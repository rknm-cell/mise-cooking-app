import { NextFunction, Request, Response } from 'express';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn('⚠️  API_KEY environment variable not set. API authentication disabled.');
}

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  // Skip validation if API_KEY is not set (for development)
  if (!API_KEY) {
    return next();
  }
  
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  
  if (!apiKey || apiKey !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ 
      error: 'Unauthorized - Invalid API key' 
    });
  }
  
  next();
}; 