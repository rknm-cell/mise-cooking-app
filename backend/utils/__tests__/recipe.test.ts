import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { generateRecipe } from '../recipe';
import { generateObject } from 'ai';

// Mock the AI SDK
jest.mock('ai', () => ({
  generateObject: jest.fn(),
}));

jest.mock('@ai-sdk/openai', () => ({
  openai: jest.fn(() => 'mocked-model'),
}));

// Mock nanoid to return predictable IDs
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-nanoid-123'),
}));

describe('Recipe Generation Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateRecipe', () => {
    it('should generate a recipe with valid prompt', async () => {
      const mockRecipe = {
        object: {
          id: 'original-id',
          name: 'Classic Margherita Pizza',
          description: 'A traditional Italian pizza with fresh mozzarella and basil',
          totalTime: '45 minutes',
          servings: 4,
          ingredients: ['Pizza dough', 'Tomato sauce', 'Fresh mozzarella', 'Fresh basil', 'Olive oil'],
          instructions: ['Roll dough to 12-inch circle', 'Spread sauce evenly', 'Add torn mozzarella', 'Bake at 500°F for 10-12 minutes', 'Top with fresh basil'],
          storage: 'Store in airtight container in refrigerator for up to 3 days',
          nutrition: ['Calories: 250 per slice', 'Protein: 12g', 'Carbohydrates: 30g', 'Fat: 10g'],
        },
      };

      // @ts-expect-error - Mock type
      (generateObject as unknown as jest.Mock).mockResolvedValue(mockRecipe);

      const result = await generateRecipe('I want to make pizza');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Classic Margherita Pizza');
      expect(result?.ingredients).toHaveLength(5);
      expect(result?.isModification).toBeUndefined();
      expect(result?.id).toBe('test-nanoid-123'); // Should have new ID from nanoid
      expect(generateObject).toHaveBeenCalledTimes(1);
    });

    it('should include system prompt for Michelin-starred chef', async () => {
      const mockRecipe = {
        object: {
          id: 'test-id',
          name: 'Test Recipe',
          description: 'Test',
          totalTime: '30 min',
          servings: 2,
          ingredients: ['Test'],
          instructions: ['Test'],
          storage: 'Test',
          nutrition: ['Test'],
        },
      };

      // @ts-expect-error - Mock type
      (generateObject as unknown as jest.Mock).mockResolvedValue(mockRecipe);

      await generateRecipe('Test prompt');

      const callArgs = (generateObject as unknown as jest.Mock).mock.calls[0][0] as Record<string, unknown>;
      expect(callArgs.system).toContain('Michelin-starred professional chef');
      expect(callArgs.system).toContain('structured format');
    });

    it('should handle conversation history for modifications', async () => {
      const mockRecipe = {
        object: {
          id: 'modified-id',
          name: 'Vegan Margherita Pizza',
          description: 'Modified to be vegan with cashew mozzarella',
          totalTime: '45 minutes',
          servings: 4,
          ingredients: ['Pizza dough', 'Tomato sauce', 'Cashew mozzarella', 'Fresh basil'],
          instructions: ['Roll dough', 'Add sauce', 'Add vegan cheese', 'Bake at 500°F'],
          storage: 'Store in refrigerator for up to 3 days',
          nutrition: ['Calories: 220', 'Protein: 8g'],
        },
      };

      // @ts-expect-error - Mock type
      (generateObject as unknown as jest.Mock).mockResolvedValue(mockRecipe);

      const conversationHistory = [
        { role: 'user' as const, content: 'I want to make pizza' },
        { role: 'assistant' as const, content: 'Here is a pizza recipe...' },
        { role: 'user' as const, content: 'Make it vegan' },
      ];

      const result = await generateRecipe('Make it vegan', conversationHistory);

      expect(result?.isModification).toBe(true);
      expect(result?.conversationContext).toContain('Make it vegan');

      // Verify the prompt includes conversation context
      const callArgs = (generateObject as unknown as jest.Mock).mock.calls[0][0] as Record<string, unknown>;
      expect(callArgs.prompt).toContain('Previous conversation context');
      expect(callArgs.prompt).toContain('Current request: Make it vegan');
    });

    it('should limit conversation history to last 4 messages', async () => {
      const mockRecipe = {
        object: {
          id: 'test-id',
          name: 'Test Recipe',
          description: 'Test',
          totalTime: '30 min',
          servings: 2,
          ingredients: ['Test'],
          instructions: ['Test'],
          storage: 'Test',
          nutrition: ['Test'],
        },
      };

      // @ts-expect-error - Mock type
      (generateObject as unknown as jest.Mock).mockResolvedValue(mockRecipe);

      // Create 10 messages (should only use last 4)
      const longHistory = Array.from({ length: 10 }, (_, i) => ({
        role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
        content: `Message ${i}`,
      }));

      await generateRecipe('Make a recipe', longHistory);

      const callArgs = (generateObject as unknown as jest.Mock).mock.calls[0][0] as Record<string, unknown>;
      const promptLines = (callArgs.prompt as string).split('\n');

      // Count message lines in the context
      const contextMessages = promptLines.filter((line: string) =>
        line.startsWith('user:') || line.startsWith('assistant:')
      );

      // Should only have 4 messages (slice(-4) in the implementation)
      expect(contextMessages.length).toBeLessThanOrEqual(4);
    });

    it('should extract user messages for conversation context', async () => {
      const mockRecipe = {
        object: {
          id: 'test-id',
          name: 'Modified Recipe',
          description: 'Test',
          totalTime: '30 min',
          servings: 2,
          ingredients: ['Test'],
          instructions: ['Test'],
          storage: 'Test',
          nutrition: ['Test'],
        },
      };

      // @ts-expect-error - Mock type
      (generateObject as unknown as jest.Mock).mockResolvedValue(mockRecipe);

      const conversationHistory = [
        { role: 'user' as const, content: 'First request' },
        { role: 'assistant' as const, content: 'First response' },
        { role: 'user' as const, content: 'Second request' },
        { role: 'assistant' as const, content: 'Second response' },
        { role: 'user' as const, content: 'Third request' },
      ];

      const result = await generateRecipe('Final request', conversationHistory);

      // Should only include last 2 user messages in context
      expect(result?.conversationContext).toContain('Second request');
      expect(result?.conversationContext).toContain('Third request');
      expect(result?.conversationContext).not.toContain('First request');
    });

    it('should return null on API error', async () => {
      // @ts-expect-error - Mock type
      (generateObject as unknown as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await generateRecipe('Test prompt');

      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      // @ts-expect-error - Mock type
      (generateObject as unknown as jest.Mock).mockRejectedValue(new Error('Network connection failed'));

      const result = await generateRecipe('Make pasta');

      expect(result).toBeNull();
    });

    it('should replace original ID with generated ID from nanoid', async () => {
      const mockRecipe = {
        object: {
          id: 'original-id',
          name: 'Test Recipe',
          description: 'Test',
          totalTime: '30 min',
          servings: 2,
          ingredients: ['Test'],
          instructions: ['Test'],
          storage: 'Test',
          nutrition: ['Test'],
        },
      };

      // @ts-expect-error - Mock type
      (generateObject as unknown as jest.Mock).mockResolvedValue(mockRecipe);

      const result = await generateRecipe('Recipe 1');

      // The ID should be replaced by nanoid, not the original from AI
      expect(result?.id).toBe('test-nanoid-123');
      expect(result?.id).not.toBe('original-id');
    });

    it('should pass correct schema to generateObject', async () => {
      const mockRecipe = {
        object: {
          id: 'test',
          name: 'Test',
          description: 'Test',
          totalTime: '30 min',
          servings: 2,
          ingredients: ['Test'],
          instructions: ['Test'],
          storage: 'Test',
          nutrition: ['Test'],
        },
      };

      // @ts-expect-error - Mock type
      (generateObject as unknown as jest.Mock).mockResolvedValue(mockRecipe);

      await generateRecipe('Test');

      const callArgs = (generateObject as unknown as jest.Mock).mock.calls[0][0] as Record<string, unknown>;
      expect(callArgs.schema).toBeDefined();
      expect((callArgs.schema as Record<string, unknown>)._def).toBeDefined(); // Zod schema has _def property
    });

    it('should handle empty conversation history', async () => {
      const mockRecipe = {
        object: {
          id: 'test-id',
          name: 'Test Recipe',
          description: 'Test',
          totalTime: '30 min',
          servings: 2,
          ingredients: ['Test'],
          instructions: ['Test'],
          storage: 'Test',
          nutrition: ['Test'],
        },
      };

      // @ts-expect-error - Mock type
      (generateObject as unknown as jest.Mock).mockResolvedValue(mockRecipe);

      const result = await generateRecipe('Test prompt', []);

      // Empty array should not trigger modification flag
      expect(result?.isModification).toBeUndefined();
      expect(result?.conversationContext).toBeUndefined();
    });
  });
});
