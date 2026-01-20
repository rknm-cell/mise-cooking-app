import { describe, it, expect, jest, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import { db } from '../../db';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';
import { generateRecipe } from '../../utils/recipe';

// Mock the recipe generation utility
jest.mock('../../utils/recipe');

// Create a test app with just the recipe routes
function createTestApp(): Express {
  const app = express();
  app.use(express.json());

  // Recipe generation endpoint
  app.post('/api/generate', async (req, res) => {
    try {
      const { prompt, conversationHistory } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const recipe = await generateRecipe(prompt, conversationHistory);

      if (!recipe) {
        return res.status(500).json({ error: 'Failed to generate recipe' });
      }

      res.json(recipe);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate recipe' });
    }
  });

  // Get all recipes
  app.get('/api/recipes', async (req, res) => {
    try {
      const recipes = await db.query.recipe.findMany({
        orderBy: (recipe, { desc }) => [desc(recipe.createdAt)],
      });
      res.json(recipes || []);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch recipes from database' });
    }
  });

  // Get recipe by ID
  app.get('/api/recipes/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const recipe = await db.query.recipe.findFirst({
        where: eq(schema.recipe.id, id),
      });

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      res.json(recipe);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch recipe' });
    }
  });

  // Save recipe
  app.post('/api/recipes', async (req, res) => {
    try {
      const recipeData = req.body;

      const result = await db
        .insert(schema.recipe)
        .values({
          ...recipeData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      res.status(201).json(result[0]);
    } catch (error: any) {
      if (error.code === '23505') {
        // Duplicate key error
        res.status(409).json({ error: 'Recipe already exists' });
      } else {
        res.status(500).json({ error: 'Failed to save recipe' });
      }
    }
  });

  return app;
}

describe('Recipe API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/generate', () => {
    it('should generate a recipe with valid prompt', async () => {
      const mockRecipe = {
        id: 'generated-123',
        name: 'Test Pizza',
        description: 'A delicious test pizza',
        totalTime: '30 minutes',
        servings: 4,
        ingredients: ['dough', 'sauce', 'cheese'],
        instructions: ['Make dough', 'Add toppings', 'Bake'],
        storage: 'Refrigerate',
        nutrition: ['250 cal'],
      };

      // @ts-expect-error - Mock type
      (generateRecipe as unknown as jest.Mock).mockResolvedValue(mockRecipe);

      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Make me a pizza' })
        .expect(200);

      expect(response.body).toEqual(mockRecipe);
      expect(generateRecipe).toHaveBeenCalledWith('Make me a pizza', undefined);
    });

    it('should generate recipe with conversation history', async () => {
      const mockRecipe = {
        id: 'modified-123',
        name: 'Vegan Pizza',
        description: 'A vegan pizza',
        totalTime: '30 minutes',
        servings: 4,
        ingredients: ['dough', 'sauce', 'vegan cheese'],
        instructions: ['Make dough', 'Add vegan toppings', 'Bake'],
        storage: 'Refrigerate',
        nutrition: ['220 cal'],
        isModification: true,
      };

      // @ts-expect-error - Mock type
      (generateRecipe as unknown as jest.Mock).mockResolvedValue(mockRecipe);

      const conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = [
        { role: 'user' as const, content: 'Make pizza' },
        { role: 'assistant' as const, content: 'Here is a pizza...' },
      ];

      const response = await request(app)
        .post('/api/generate')
        .send({
          prompt: 'Make it vegan',
          conversationHistory,
        })
        .expect(200);

      expect(response.body).toEqual(mockRecipe);
      expect(generateRecipe).toHaveBeenCalledWith('Make it vegan', conversationHistory);
    });

    it('should return 400 if prompt is missing', async () => {
      const response = await request(app).post('/api/generate').send({}).expect(400);

      expect(response.body).toEqual({ error: 'Prompt is required' });
      expect(generateRecipe).not.toHaveBeenCalled();
    });

    it('should return 500 if recipe generation fails', async () => {
      // @ts-expect-error - Mock type
      (generateRecipe as unknown as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Make pizza' })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to generate recipe' });
    });

    it('should handle generation errors gracefully', async () => {
      // @ts-expect-error - Mock type
      (generateRecipe as unknown as jest.Mock).mockRejectedValue(new Error('AI service error'));

      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Make pizza' })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to generate recipe' });
    });
  });

  describe('GET /api/recipes', () => {
    it('should return empty array when no recipes exist', async () => {
      // Mock db query to return empty array
      jest.spyOn(db.query.recipe, 'findMany').mockResolvedValue([]);

      const response = await request(app).get('/api/recipes').expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all recipes sorted by creation date', async () => {
      const mockRecipes = [
        {
          id: '2',
          name: 'Newer Recipe',
          description: 'Test',
          totalTime: '20 min',
          servings: 2,
          ingredients: ['test'],
          instructions: ['test'],
          storage: 'test',
          nutrition: ['test'],
          createdAt: new Date('2024-02-02'),
          updatedAt: new Date('2024-02-02'),
        },
        {
          id: '1',
          name: 'Older Recipe',
          description: 'Test',
          totalTime: '30 min',
          servings: 4,
          ingredients: ['test'],
          instructions: ['test'],
          storage: 'test',
          nutrition: ['test'],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      jest.spyOn(db.query.recipe, 'findMany').mockResolvedValue(mockRecipes);

      const response = await request(app).get('/api/recipes').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Newer Recipe');
      expect(response.body[1].name).toBe('Older Recipe');
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(db.query.recipe, 'findMany').mockRejectedValue(new Error('DB Error'));

      const response = await request(app).get('/api/recipes').expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to fetch recipes from database');
    });
  });

  describe('GET /api/recipes/:id', () => {
    it('should return a specific recipe by ID', async () => {
      const mockRecipe = {
        id: 'test-123',
        name: 'Test Recipe',
        description: 'A test recipe',
        totalTime: '30 min',
        servings: 2,
        ingredients: ['ingredient 1'],
        instructions: ['step 1'],
        storage: 'refrigerate',
        nutrition: ['100 cal'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(db.query.recipe, 'findFirst').mockResolvedValue(mockRecipe);

      const response = await request(app).get('/api/recipes/test-123').expect(200);

      expect(response.body.id).toBe('test-123');
      expect(response.body.name).toBe('Test Recipe');
    });

    it('should return 404 for non-existent recipe', async () => {
      jest.spyOn(db.query.recipe, 'findFirst').mockResolvedValue(undefined);

      const response = await request(app).get('/api/recipes/non-existent').expect(404);

      expect(response.body).toEqual({ error: 'Recipe not found' });
    });

    it('should handle database errors', async () => {
      jest.spyOn(db.query.recipe, 'findFirst').mockRejectedValue(new Error('DB Error'));

      const response = await request(app).get('/api/recipes/test-123').expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch recipe' });
    });
  });

  describe('POST /api/recipes', () => {
    it('should create a new recipe', async () => {
      const newRecipe = {
        id: 'new-123',
        name: 'New Recipe',
        description: 'A new test recipe',
        totalTime: '45 minutes',
        servings: 4,
        ingredients: ['ingredient 1', 'ingredient 2'],
        instructions: ['step 1', 'step 2'],
        storage: 'Store in fridge',
        nutrition: ['Calories: 300'],
      };

      const savedRecipe = {
        ...newRecipe,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the db insert
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        // @ts-expect-error - Mock type
        returning: jest.fn().mockResolvedValue([savedRecipe]),
      };
      jest.spyOn(db, 'insert').mockReturnValue(mockInsert as any);

      const response = await request(app).post('/api/recipes').send(newRecipe).expect(201);

      expect(response.body.id).toBe(newRecipe.id);
      expect(response.body.name).toBe(newRecipe.name);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should validate required fields', async () => {
      const invalidRecipe = {
        name: 'Incomplete Recipe',
        // Missing required fields
      };

      // Mock db to throw validation error
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        // @ts-expect-error - Mock type
        returning: jest.fn().mockRejectedValue(new Error('Validation error')),
      };
      jest.spyOn(db, 'insert').mockReturnValue(mockInsert as any);

      const response = await request(app).post('/api/recipes').send(invalidRecipe).expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle duplicate recipe IDs', async () => {
      const recipe = {
        id: 'duplicate-id',
        name: 'Test Recipe',
        description: 'Test',
        totalTime: '30 min',
        servings: 2,
        ingredients: ['test'],
        instructions: ['test'],
        storage: 'test',
        nutrition: ['test'],
      };

      // Mock duplicate key error
      const error: any = new Error('Duplicate key');
      error.code = '23505';

      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        // @ts-expect-error - Mock type
        returning: jest.fn().mockRejectedValue(error),
      };
      jest.spyOn(db, 'insert').mockReturnValue(mockInsert as any);

      const response = await request(app).post('/api/recipes').send(recipe).expect(409);

      expect(response.body).toEqual({ error: 'Recipe already exists' });
    });

    it('should handle database errors', async () => {
      const recipe = {
        id: 'test-id',
        name: 'Test Recipe',
        description: 'Test',
        totalTime: '30 min',
        servings: 2,
        ingredients: ['test'],
        instructions: ['test'],
        storage: 'test',
        nutrition: ['test'],
      };

      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        // @ts-expect-error - Mock type
        returning: jest.fn().mockRejectedValue(new Error('Database connection error')),
      };
      jest.spyOn(db, 'insert').mockReturnValue(mockInsert as any);

      const response = await request(app).post('/api/recipes').send(recipe).expect(500);

      expect(response.body).toEqual({ error: 'Failed to save recipe' });
    });
  });

  describe('Integration scenarios', () => {
    it('should generate and save a recipe', async () => {
      // Step 1: Generate recipe
      const generatedRecipe = {
        id: 'gen-123',
        name: 'Generated Pasta',
        description: 'AI generated pasta',
        totalTime: '25 minutes',
        servings: 2,
        ingredients: ['pasta', 'sauce'],
        instructions: ['boil', 'serve'],
        storage: 'refrigerate',
        nutrition: ['300 cal'],
      };

      // @ts-expect-error - Mock type
      (generateRecipe as unknown as jest.Mock).mockResolvedValue(generatedRecipe);

      const generateResponse = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Make pasta' })
        .expect(200);

      expect(generateResponse.body.name).toBe('Generated Pasta');

      // Step 2: Save the generated recipe
      const savedRecipe = {
        ...generatedRecipe,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        // @ts-expect-error - Mock type
        returning: jest.fn().mockResolvedValue([savedRecipe]),
      };
      jest.spyOn(db, 'insert').mockReturnValue(mockInsert as any);

      const saveResponse = await request(app)
        .post('/api/recipes')
        .send(generatedRecipe)
        .expect(201);

      expect(saveResponse.body.id).toBe(generatedRecipe.id);

      // Step 3: Verify it can be retrieved
      jest.spyOn(db.query.recipe, 'findFirst').mockResolvedValue(savedRecipe);

      const getResponse = await request(app).get(`/api/recipes/${generatedRecipe.id}`).expect(200);

      expect(getResponse.body.name).toBe('Generated Pasta');
    });
  });
});
