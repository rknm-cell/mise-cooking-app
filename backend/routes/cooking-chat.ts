import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import express, { Request, Response } from 'express';
import { z } from "zod";

const router = express.Router();

// --- Tool Function Schemas for AI ---
const setTimerSchema = z.object({
  duration: z.number().describe("Duration of the timer in seconds"),
  description: z.string().describe("What the timer is for"),
});

const moveToStepSchema = z.object({
  action: z.enum(["next", "previous", "specific"]).describe("Navigation action"),
  stepNumber: z.number().optional().describe("Specific step number (only for 'specific' action)"),
  reason: z.string().describe("Why this navigation is happening"),
});

const modifyRecipeSchema = z.object({
  modificationType: z.enum(["ingredient", "time", "temperature", "technique", "quantity"]).describe("Type of modification"),
  target: z.string().describe("What is being modified (ingredient name, step number, etc.)"),
  newValue: z.string().describe("The new value or instruction"),
  reason: z.string().describe("Why this modification is needed"),
});

const getPrepWorkSchema = z.object({
  prepType: z.enum(["ingredients", "equipment", "timing", "techniques"]).describe("Type of prep work needed"),
  focus: z.string().describe("Specific focus area for prep work"),
});

const getTimingSuggestionsSchema = z.object({
  timingType: z.enum(["step", "overall", "parallel", "resting"]).describe("Type of timing guidance needed"),
  context: z.string().describe("Current cooking context"),
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
  })).optional(),
  // Voice-specific fields
  isVoiceCommand: z.boolean().optional(),
  wakePhrase: z.string().optional(),
});

const chatResponseSchema = z.object({
  response: z.string(),
  suggestions: z.array(z.string()).optional(),
  quickActions: z.array(z.string()).optional(),
  context: z.string().optional(),
  // Tool action responses
  timerAction: z.object({
    action: z.enum(["create", "start", "stop"]),
    duration: z.number().optional(),
    description: z.string().optional(),
    stage: z.string().optional(),
  }).optional(),
  navigationAction: z.object({
    action: z.enum(["next", "previous", "specific"]),
    stepNumber: z.number().optional(),
    reason: z.string(),
  }).optional(),
  modificationAction: z.object({
    type: z.enum(["ingredient", "time", "temperature", "technique", "quantity"]),
    target: z.string(),
    newValue: z.string(),
    reason: z.string(),
  }).optional(),
  prepWorkAction: z.object({
    type: z.enum(["ingredients", "equipment", "timing", "techniques"]),
    focus: z.string(),
    suggestions: z.array(z.string()),
  }).optional(),
  timingAction: z.object({
    type: z.enum(["step", "overall", "parallel", "resting"]),
    context: z.string(),
    suggestions: z.array(z.string()),
  }).optional(),
});

// --- Main Chat Endpoint with Comprehensive Tool Calling ---
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
      conversationHistory = [],
      isVoiceCommand = false,
      wakePhrase
    } = validatedData;

    // Enhanced system prompt with all tool descriptions
    const systemPrompt = `You are Mise, an intelligent cooking assistant with voice-first capabilities. You can perform the following actions:

1. TIMER MANAGEMENT: If the user asks for a timer, call the setTimer function with duration in seconds and description. Understand time expressions like '5 minutes', 'an hour', 'hour and a half', 'half an hour', '90 minutes', '2 hours', '1.5 hours', etc.

2. STEP NAVIGATION: If the user wants to move to the next step, previous step, or a specific step, call the moveToStep function. This includes commands like "next step", "go back", "move to step 3", etc.

3. RECIPE MODIFICATION: If the user wants to modify the recipe (ingredients, times, temperatures, techniques), call the modifyRecipe function. This includes substitutions, time adjustments, temperature changes, etc.

4. PREP WORK GUIDANCE: If the user asks about preparation work, call the getPrepWork function. This includes ingredient prep, equipment setup, timing prep, technique prep, etc.

5. TIMING SUGGESTIONS: If the user asks about timing or scheduling, call the getTimingSuggestions function. This includes step timing, overall timing, parallel cooking, resting times, etc.

For voice commands, respond with "Yes, chef" before executing the action. Be concise but helpful.`;

    // Conversation context
    const conversationContext = buildConversationContext(conversationHistory, message);

    // Determine which tool to call based on the message content
    const messageLower = message.toLowerCase();
    
    // Timer detection
    if (messageLower.includes('timer') || messageLower.includes('set timer') || 
        messageLower.includes('cook for') || messageLower.includes('boil for') || 
        messageLower.includes('simmer for') || messageLower.includes('bake for') ||
        /\d+\s*(minute|hour|second)/.test(messageLower)) {
      
      const result = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: setTimerSchema,
        system: systemPrompt,
        prompt: conversationContext,
        maxTokens: 200,
        temperature: 0.2,
      });

      if (result.object && result.object.duration && result.object.description) {
        const timerResponse = await createTimer({
          duration: result.object.duration,
          description: result.object.description,
          stage: `Step ${currentStep || 1}`,
          recipeId,
          stepNumber: currentStep,
        });

        const response = isVoiceCommand 
          ? `Yes, chef. I've started a timer for ${result.object.description} (${Math.floor(result.object.duration / 60)}:${(result.object.duration % 60).toString().padStart(2, '0')}).`
          : `I've started a timer for ${result.object.description} (${Math.floor(result.object.duration / 60)}:${(result.object.duration % 60).toString().padStart(2, '0')}). The timer is now running in your cooking session.`;

        return res.json({
          response,
          timerAction: {
            action: "create",
            duration: result.object.duration,
            description: result.object.description,
            stage: `Step ${currentStep || 1}`,
          },
        });
      }
    }

    // Step navigation detection
    if (messageLower.includes('next step') || messageLower.includes('move to next') ||
        messageLower.includes('previous step') || messageLower.includes('go back') ||
        messageLower.includes('step') && /\d+/.test(messageLower)) {
      
      const result = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: moveToStepSchema,
        system: systemPrompt,
        prompt: conversationContext,
        maxTokens: 200,
        temperature: 0.2,
      });

      if (result.object) {
        const response = isVoiceCommand 
          ? `Yes, chef. ${result.object.reason}`
          : result.object.reason;

        return res.json({
          response,
          navigationAction: {
            action: result.object.action,
            stepNumber: result.object.stepNumber,
            reason: result.object.reason,
          },
        });
      }
    }

    // Recipe modification detection
    if (messageLower.includes('substitute') || messageLower.includes('replace') ||
        messageLower.includes('change') || messageLower.includes('modify') ||
        messageLower.includes('instead of') || messageLower.includes('alternative')) {
      
      const result = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: modifyRecipeSchema,
        system: systemPrompt,
        prompt: conversationContext,
        maxTokens: 300,
        temperature: 0.3,
      });

      if (result.object) {
        const response = isVoiceCommand 
          ? `Yes, chef. ${result.object.reason}`
          : result.object.reason;

        return res.json({
          response,
          modificationAction: {
            type: result.object.modificationType,
            target: result.object.target,
            newValue: result.object.newValue,
            reason: result.object.reason,
          },
        });
      }
    }

    // Prep work detection
    if (messageLower.includes('prep') || messageLower.includes('prepare') ||
        messageLower.includes('setup') || messageLower.includes('get ready') ||
        messageLower.includes('what do i need')) {
      
      const result = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: getPrepWorkSchema,
        system: systemPrompt,
        prompt: conversationContext,
        maxTokens: 200,
        temperature: 0.3,
      });

      if (result.object) {
        // Generate prep work suggestions
        const prepSuggestions = await generatePrepWorkSuggestions(
          result.object.prepType,
          result.object.focus,
          currentStepDescription,
          recipeName
        );

        const response = isVoiceCommand 
          ? `Yes, chef. Here's what you need to prepare: ${prepSuggestions.join(', ')}`
          : `Here's what you need to prepare: ${prepSuggestions.join(', ')}`;

        return res.json({
          response,
          prepWorkAction: {
            type: result.object.prepType,
            focus: result.object.focus,
            suggestions: prepSuggestions,
          },
        });
      }
    }

    // Timing suggestions detection
    if (messageLower.includes('how long') || messageLower.includes('timing') ||
        messageLower.includes('when') || messageLower.includes('schedule') ||
        messageLower.includes('time management')) {
      
      const result = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: getTimingSuggestionsSchema,
        system: systemPrompt,
        prompt: conversationContext,
        maxTokens: 200,
        temperature: 0.3,
      });

      if (result.object) {
        // Generate timing suggestions
        const timingSuggestions = await generateTimingSuggestions(
          result.object.timingType,
          result.object.context,
          currentStep,
          totalSteps
        );

        const response = isVoiceCommand 
          ? `Yes, chef. Here's the timing: ${timingSuggestions.join(', ')}`
          : `Here's the timing guidance: ${timingSuggestions.join(', ')}`;

        return res.json({
          response,
          timingAction: {
            type: result.object.timingType,
            context: result.object.context,
            suggestions: timingSuggestions,
          },
        });
      }
    }

    // Fallback to regular AI response
    const fallback = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: conversationContext,
      maxTokens: 300,
      temperature: 0.3,
    });

    const response = isVoiceCommand 
      ? `Yes, chef. ${fallback.text.trim()}`
      : fallback.text.trim();

    return res.json({
      response,
      suggestions: [],
      quickActions: ["What's next?","How long?","Substitute?","Help!","Technique"],
      context: "cooking_assistance"
    });
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

// Helper function to generate prep work suggestions
async function generatePrepWorkSuggestions(
  prepType: string,
  focus: string,
  currentStepDescription?: string,
  recipeName?: string
): Promise<string[]> {
  try {
    const systemPrompt = `You are a cooking expert. Based on the prep type and focus, provide 3-4 specific, actionable prep work suggestions. Keep them concise and practical.

Prep type: ${prepType}
Focus: ${focus}
Current step: ${currentStepDescription || 'Not specified'}
Recipe: ${recipeName || 'Not specified'}

Provide suggestions as a simple list, one per line.`;

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: "Generate prep work suggestions:",
      maxTokens: 200,
      temperature: 0.3,
    });

    return result.text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
  } catch (error) {
    console.error('Error generating prep work suggestions:', error);
    return ['Gather all ingredients', 'Prepare cooking equipment', 'Read through the recipe'];
  }
}

// Helper function to generate timing suggestions
async function generateTimingSuggestions(
  timingType: string,
  context: string,
  currentStep?: number,
  totalSteps?: number
): Promise<string[]> {
  try {
    const systemPrompt = `You are a cooking expert. Based on the timing type and context, provide 3-4 specific timing suggestions. Keep them concise and practical.

Timing type: ${timingType}
Context: ${context}
Current step: ${currentStep || 'Not specified'}
Total steps: ${totalSteps || 'Not specified'}

Provide suggestions as a simple list, one per line.`;

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: "Generate timing suggestions:",
      maxTokens: 200,
      temperature: 0.3,
    });

    return result.text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
  } catch (error) {
    console.error('Error generating timing suggestions:', error);
    return ['Start prep work early', 'Monitor cooking times closely', 'Allow for resting periods'];
  }
}

export default router; 