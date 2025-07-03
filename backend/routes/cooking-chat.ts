import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import express, { Request, Response } from 'express';
import { z } from "zod";

const router = express.Router();

// Schema for chat request
const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  recipeId: z.string().optional(),
  recipeName: z.string().optional(),
  recipeDescription: z.string().optional(),
  currentStep: z.number().optional(),
  totalSteps: z.number().optional(),
  currentStepDescription: z.string().optional(),
  completedSteps: z.array(z.number()).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })).optional()
});

// Schema for chat response
const chatResponseSchema = z.object({
  response: z.string(),
  suggestions: z.array(z.string()).optional(),
  quickActions: z.array(z.string()).optional(),
  context: z.string().optional()
});

// POST /api/cooking-chat - Main chat endpoint
router.post('/cooking-chat', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validatedData = chatRequestSchema.parse(req.body);
    const {
      message,
      recipeId,
      recipeName,
      recipeDescription,
      currentStep,
      totalSteps,
      currentStepDescription,
      completedSteps = [],
      conversationHistory = []
    } = validatedData;

    // Build context-aware system prompt
    const systemPrompt = buildSystemPrompt({
      recipeName,
      recipeDescription,
      currentStep,
      totalSteps,
      currentStepDescription,
      completedSteps,
    });

    // Build conversation context
    const conversationContext = buildConversationContext(conversationHistory, message);

    // Generate AI response
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: conversationContext,
      maxTokens: 300,
      temperature: 0.3, // Lower temperature for more consistent, factual responses
    });

    // Parse and structure the response
    const response = await parseAIResponse(result.text);

    res.json(response);
  } catch (error) {
    console.error('Error in cooking chat:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/cooking-chat/suggestions - Get contextual suggestions
router.post('/cooking-chat/suggestions', async (req: Request, res: Response) => {
  try {
    const { currentStep, currentStepDescription, userExperienceLevel = "intermediate" } = req.body;

    if (!currentStepDescription) {
      return res.status(400).json({ error: 'Current step description is required' });
    }

    const systemPrompt = `You are a helpful cooking assistant. Based on the current cooking step, provide 3-4 helpful suggestions or tips that would be relevant to someone at this point in the recipe. Keep suggestions short, actionable, and appropriate for the user's experience level.

Current step: ${currentStepDescription}
User experience level: ${userExperienceLevel}

Provide suggestions in a simple array format, one per line.`;

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: "Generate helpful cooking suggestions for this step:",
      maxTokens: 200,
      temperature: 0.4,
    });

    const suggestions = result.text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim());

    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// POST /api/cooking-chat/substitutions - Get ingredient substitutions
router.post('/cooking-chat/substitutions', async (req: Request, res: Response) => {
  try {
    const { ingredient, recipeContext } = req.body;

    if (!ingredient) {
      return res.status(400).json({ error: 'Ingredient is required' });
    }

    const systemPrompt = `You are a cooking expert. Provide 3-4 suitable substitutes for the given ingredient, considering the recipe context. For each substitute, include:
                            1. The substitute ingredient
                            2. How much to use (ratio or measurement)
                            3. Any adjustments needed in cooking method

                            Format your response as a simple list with clear measurements.`;

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: `Ingredient: ${ingredient}\nRecipe context: ${recipeContext || 'General cooking'}`,
      maxTokens: 250,
      temperature: 0.3,
    });

    const substitutions = result.text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim());

    res.json({ substitutions });
  } catch (error) {
    console.error('Error generating substitutions:', error);
    res.status(500).json({ error: 'Failed to generate substitutions' });
  }
});

// Helper function to build system prompt
function buildSystemPrompt(context: {
  recipeName?: string;
  recipeDescription?: string;
  currentStep?: number;
  totalSteps?: number;
  currentStepDescription?: string;
  completedSteps: number[];
}) {
  const {
    recipeName,
    recipeDescription,
    currentStep,
    totalSteps,
    currentStepDescription,
    completedSteps,
  } = context;

  let prompt = `You are Mise, an intelligent cooking assistant helping someone cook a recipe. `;

  if (recipeName) {
    prompt += `\nRecipe: ${recipeName}`;
  }

  if (recipeDescription) {
    prompt += `\nDescription: ${recipeDescription}`;
  }

  if (currentStep && totalSteps) {
    prompt += `\nCurrent progress: Step ${currentStep} of ${totalSteps}`;
  }

  if (currentStepDescription) {
    prompt += `\nCurrent step: ${currentStepDescription}`;
  }

  if (completedSteps.length > 0) {
    prompt += `\nCompleted steps: ${completedSteps.join(', ')}`;
  }


  prompt += `\n\nProvide helpful, concise cooking advice. Keep responses under 150 words. Be encouraging and practical. If the user is having trouble, offer specific solutions. If they're asking about timing, give clear visual or tactile cues.`;

  return prompt;
}

// Helper function to build conversation context
function buildConversationContext(history: Array<{role: string, content: string}>, currentMessage: string) {
  if (history.length === 0) {
    return currentMessage;
  }

  // Keep last 5 exchanges for context
  const recentHistory = history.slice(-10);
  const context = recentHistory
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  return `${context}\n\nUser: ${currentMessage}`;
}

// Helper function to parse AI response
async function parseAIResponse(text: string) {
  // Extract quick actions (common patterns)
  const quickActions = [
    "What's next?",
    "How long?",
    "Substitute?",
    "Help!",
    "Technique"
  ];

  // Simple response parsing
  const response = {
    response: text.trim(),
    suggestions: [],
    quickActions,
    context: "cooking_assistance"
  };

  return response;
}

export default router; 