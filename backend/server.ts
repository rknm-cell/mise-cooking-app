import cors from 'cors';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { db } from './db/index.js';
import * as schema from './db/schema.js';

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

// Recipe generation endpoint
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Mock recipe generation (replace with actual AI integration)
    const mockRecipe = {
      id: `recipe_${Date.now()}`,
      name: `Generated Recipe from: ${prompt}`,
      description: `A delicious recipe created based on your request: ${prompt}`,
      totalTime: '30 minutes',
      servings: 4,
      ingredients: [
        '2 cups of main ingredient',
        '1 tablespoon of seasoning',
        '1/2 cup of liquid',
        'Salt and pepper to taste'
      ],
      instructions: [
        'Prepare your ingredients as listed above',
        'Heat a large pan over medium heat',
        'Add your main ingredients and cook for 5-7 minutes',
        'Season with salt, pepper, and your favorite herbs',
        'Serve hot and enjoy!'
      ],
      storage: 'Store in an airtight container in the refrigerator for up to 3 days',
      nutrition: [
        'Calories: 250 per serving',
        'Protein: 15g',
        'Carbohydrates: 30g',
        'Fat: 8g'
      ],
      createdAt: new Date()
    };

    // Try to save to Supabase database
    try {
      await db.insert(schema.recipe).values(mockRecipe);
      console.log('Recipe saved to Supabase database');
    } catch (dbError) {
      console.warn('Supabase database not available, recipe not saved:', dbError);
      // Continue without saving to database
    }

    res.json(mockRecipe);
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

    const bookmarks = await db.select().from(schema.bookmark).where(eq(schema.bookmark.userId, userId));
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

    const result = await db.insert(schema.bookmark).values({
      userId,
      recipeId,
      bookmarkedAt: new Date(),
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving bookmark to Supabase:', error);
    res.status(500).json({ error: 'Failed to save bookmark' });
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
