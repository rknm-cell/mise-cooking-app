import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import express, { Request, Response } from 'express';
import { z } from "zod";

const router = express.Router();

// --- Timer Tool Function Schema for AI ---
const setTimerSchema = z.object({
  duration: z.number().describe("Duration of the timer in seconds"),
  description: z.string().describe("What the timer is for"),
});

// --- Chat Request/Response Schemas ---
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

const chatResponseSchema = z.object({
  response: z.string(),
  suggestions: z.array(z.string()).optional(),
  quickActions: z.array(z.string()).optional(),
  context: z.string().optional(),
  timerAction: z.object({
    action: z.enum(["create", "start", "stop"]),
    duration: z.number().optional(),
    description: z.string().optional(),
    stage: z.string().optional(),
  }).optional(),
});

// --- Main Chat Endpoint with Tool Calling ---
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

    // System prompt with tool description
    const systemPrompt = `You are Mise, an intelligent cooking assistant. If the user asks for a timer, call the setTimer function with the correct duration in seconds and a short description. You can understand time expressions like '5 minutes', 'an hour', 'hour and a half', 'half an hour', '90 minutes', '2 hours', '1.5 hours', etc.`;

    // Conversation context
    const conversationContext = buildConversationContext(conversationHistory, message);

    // --- AI Tool Calling ---
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: setTimerSchema,
      system: systemPrompt,
      prompt: conversationContext,
      maxTokens: 200,
      temperature: 0.2,
    });

    if (result.object && result.object.duration && result.object.description) {
      // AI called the setTimer tool
      const timerResponse = await createTimer({
        duration: result.object.duration,
        description: result.object.description,
        stage: `Step ${currentStep || 1}`,
        recipeId,
        stepNumber: currentStep,
      });
      return res.json({
        response: `I've set a timer for ${result.object.description} (${Math.floor(result.object.duration / 60)}:${(result.object.duration % 60).toString().padStart(2, '0')}). The timer will appear in your cooking session.`,
        timerAction: {
          action: "create",
          duration: result.object.duration,
          description: result.object.description,
          stage: `Step ${currentStep || 1}`,
        },
      });
    } else {
      // Fallback to regular AI response
      const fallback = await generateText({
        model: openai("gpt-4o-mini"),
        system: systemPrompt,
        prompt: conversationContext,
        maxTokens: 300,
        temperature: 0.3,
      });
      return res.json({
        response: fallback.text.trim(),
        suggestions: [],
        quickActions: ["What's next?","How long?","Substitute?","Help!","Technique"],
        context: "cooking_assistance"
      });
    }
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

// Helper function to create timer via API
async function createTimer(timerData: {
  duration: number;
  description: string;
  stage: string;
  recipeId?: string;
  stepNumber?: number;
}) {
  try {
    const response = await fetch(`http://localhost:8080/api/timer/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timerData),
    });

    if (!response.ok) {
      throw new Error('Failed to create timer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating timer:', error);
    throw error;
  }
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

export default router; 