import cors from 'cors';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { db } from './db/index.js';
import { getBookmarks, removeBookmark, saveBookmark } from './db/queries.js';
import * as schema from './db/schema.js';
import { signIn, signUp } from './models/users.js';

import { generateRecipe } from './utils/recipe.js';

config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8082', 'http://192.168.1.165:8081', 'exp://192.168.1.165:8081'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Handle preflight requests
app.options('*', cors());

// API key endpoint (for frontend to get the key)
app.get('/api/config', (req: Request, res: Response) => {
  res.json({ 
    apiKey: process.env.API_KEY || null,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Recipe generation endpoint
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate recipe using AI
    const recipe = await generateRecipe(prompt);
    
    if (!recipe) {
      return res.status(500).json({ error: 'Failed to generate recipe' });
    }

    // Try to save to Supabase database
    try {
      await db.insert(schema.recipe).values({
        ...recipe,
        createdAt: new Date(),
      });
      console.log('Recipe saved to Supabase database');
    } catch (dbError) {
      console.warn('Supabase database not available, recipe not saved:', dbError);
      // Continue without saving to database
    }

    res.json(recipe);
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

// Get all recipes from Supabase
app.get('/api/recipes', async (req: Request, res: Response) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database URL not configured' });
    }

    const recipes = await db.query.recipe.findMany({
      orderBy: (recipe, { desc }) => [desc(recipe.createdAt)]
    });
    
    console.log(`Fetched ${recipes?.length || 0} recipes from Supabase`);
    res.json(recipes || []);
  } catch (error) {
    console.error('Error fetching recipes from Supabase:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recipes from database',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get recipe by ID from Supabase
app.get('/api/recipes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database URL not configured' });
    }

    const recipe = await db.query.recipe.findFirst({
      where: eq(schema.recipe.id, id),
    });
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe from Supabase:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Save recipe to Supabase
app.post('/api/recipes', async (req: Request, res: Response) => {
  try {
    const recipeData = req.body;
    
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database URL not configured' });
    }

    const result = await db.insert(schema.recipe).values({
      ...recipeData,
      createdAt: new Date(),
    });
    
    res.json({ success: true, recipe: recipeData });
  } catch (error) {
    console.error('Error saving recipe to Supabase:', error);
    res.status(500).json({ error: 'Failed to save recipe' });
  }
});

// Get bookmarks for user from Supabase
app.get('/api/bookmarks/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database URL not configured' });
    }

    const bookmarks = await getBookmarks(userId);
    res.json(bookmarks || []);
  } catch (error) {
    console.error('Error fetching bookmarks from Supabase:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// Save bookmark to Supabase
app.post('/api/bookmarks', async (req: Request, res: Response) => {
  try {
    const { userId, recipeId } = req.body;
    
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database URL not configured' });
    }

    const result = await saveBookmark(userId, recipeId);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: result.message || 'Failed to save bookmark' });
    }
  } catch (error) {
    console.error('Error saving bookmark to Supabase:', error);
    res.status(500).json({ error: 'Failed to save bookmark' });
  }
});

// Remove bookmark from Supabase
app.delete('/api/bookmarks', async (req: Request, res: Response) => {
  try {
    const { userId, recipeId } = req.body;
    
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database URL not configured' });
    }

    const result = await removeBookmark(userId, recipeId);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: result.message || 'Failed to remove bookmark' });
    }
  } catch (error) {
    console.error('Error removing bookmark from Supabase:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'Mise Cooking API is running',
    database: process.env.DATABASE_URL ? 'Configured' : 'Not configured',
    timestamp: new Date().toISOString()
  });
});


// Auth endpoints
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const result = await signUp(name, email, password);
    
    if (result.success) {
      // Return user data and token
      res.status(201).json({ 
        message: result.message,
        user: result.user,
        token: result.token
      });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await signIn(email, password);
    
    if (result.success) {
      // Return user data and token
      res.json({ 
        message: result.message,
        user: result.user,
        token: result.token
      });
    } else {
      res.status(401).json({ error: result.message });
    }
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
});

// Get current user
app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Find the session in the database using the token
    const session = await db.query.session.findFirst({
      where: eq(schema.session.token, token),
    });
    
    if (session && session.userId) {
      // Get the user data from the database
      const user = await db.query.user.findFirst({
        where: eq(schema.user.id, session.userId),
      });
      
      if (user) {
        res.json({
          id: user.id,
          name: user.name,
          email: user.email,
        });
      } else {
        res.status(401).json({ error: 'User not found in database' });
      }
    } else {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mise Cooking API server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Supabase configured' : 'No database configured'}`);
});

export default app;
