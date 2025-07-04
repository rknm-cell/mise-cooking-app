import cookieParser from 'cookie-parser';
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
import { auth } from './lib/auth.js';
import cookingChatRoutes from './routes/cooking-chat.js';
import shoppingRoutes from './routes/shopping.js';
import timerRoutes from './routes/timer.js';

import { generateRecipe } from './utils/recipe.js';

config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:8082', 
      'http://localhost:8080',
      'http://192.168.1.165:8081', 
      'http://192.168.1.165:8080',
      'exp://192.168.1.165:8081',
      // Production origins
      'https://mise-cooking-app-production.up.railway.app',
      'https://expo.dev',
      'https://expo.io'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(cookieParser());
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

// Better Auth routes - this should come before other routes
app.use('/auth', auth.handler);

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
    const { prompt, conversationHistory } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate recipe using AI with conversation context
    const recipe = await generateRecipe(prompt, conversationHistory);
    
    if (!recipe) {
      return res.status(500).json({ error: 'Failed to generate recipe' });
    }

    // Return recipe without saving to database - let user decide
    console.log('Recipe generated successfully, waiting for user to save');
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

// Save generated recipe to database (user-initiated)
app.post('/api/recipes/save', async (req: Request, res: Response) => {
  try {
    const recipeData = req.body;
    
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database URL not configured' });
    }

    // Validate required recipe fields
    if (!recipeData.id || !recipeData.name || !recipeData.description) {
      return res.status(400).json({ error: 'Missing required recipe fields' });
    }

    const result = await db.insert(schema.recipe).values({
      ...recipeData,
      createdAt: new Date(),
    });
    
    console.log('Recipe saved to database by user:', recipeData.name);
    res.json({ success: true, recipe: recipeData, message: 'Recipe saved successfully!' });
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
    environment: process.env.NODE_ENV || 'development',
    cors: 'Configured',
    timestamp: new Date().toISOString()
  });
});

// Simple test endpoint (no database required)
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});






// Custom authentication endpoints with session management
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Use better-auth to create user
    const result = await auth.api.signUpEmail({
      body: { name, email, password },
    });

    // Create a simple session token
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Set session cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ 
      message: "Signed up successfully",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      }
    });
  } catch (error) {
    console.error('Error in signup:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
    res.status(400).json({ error: errorMessage });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Use better-auth to sign in
    const result = await auth.api.signInEmail({
      body: { email, password },
    });

    // Create a simple session token
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Set session cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ 
      message: "Signed in successfully",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to authenticate';
    res.status(401).json({ error: errorMessage });
  }
});

// Get current user - Updated to use Better Auth session
app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });
    
    if (!session) {
      return res.status(401).json({ error: 'No valid session found' });
    }

    // Get the user data from the database
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, session.user.id),
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
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(401).json({ error: 'Invalid session' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', async (req: Request, res: Response) => {
  try {
    await auth.api.signOut({
      headers: req.headers as any,
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Shopping list routes
app.use('/api/shopping', shoppingRoutes);

// Timer routes
app.use('/api/timer', timerRoutes);

// Cooking chat routes
app.use('/api', cookingChatRoutes);

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
