/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { nanoid } from "nanoid";
import { z } from "zod";
import { saveRecipe } from "../db/queries";

// Enhanced recipe generation with conversation context
export async function generateRecipe(
  prompt: string, 
  conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>
) {
  try {
    console.log("Generating recipe for prompt: ", prompt);
    console.log("Conversation history length: ", conversationHistory?.length || 0);
    
    // Build context-aware prompt
    let contextPrompt = prompt;
    if (conversationHistory && conversationHistory.length > 0) {
      // Create a summary of the conversation for context
      const conversationSummary = conversationHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .slice(-4) // Keep last 4 messages to avoid token limits
        .join('\n');
      
      contextPrompt = `Previous conversation context:\n${conversationSummary}\n\nCurrent request: ${prompt}`;
    }
    
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      system: `You are a professional chef and recipe assistant. When providing recipes, always follow this structured format and consider the conversation context.

If the user is asking for modifications to a previous recipe, adapt the recipe accordingly while maintaining the structured format.

Recipe structure requirements:
1. Name - Clear, descriptive recipe name
2. Description - Brief overview of the dish
3. Time - Total prep + cooking time
4. Servings - Number of servings
5. Ingredients - List with precise measurements
6. Instructions - Step-by-step cooking instructions
7. Storage - How to store leftovers
8. Nutrition - Key nutritional information

Keep responses clear, precise, and easy to follow. Include helpful cooking tips and explain any technical terms. If asked about a specific cuisine or dietary requirement, adapt the recipe accordingly.

If the user is modifying a previous recipe, note what changes were made in the description.`,
      prompt: contextPrompt,
      schema: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        totalTime: z.string(),
        servings: z.number(),
        ingredients: z.array(z.string()),
        instructions: z.array(z.string()),
        storage: z.string(),
        nutrition: z.array(z.string()),
        conversationContext: z.string().optional(), // Track why changes were made
        isModification: z.boolean().optional() // Flag if this is a modification
      }),
    });
    
    const recipe = result.object;
    recipe.id = nanoid();
    
    // Add conversation context if this is a modification
    if (conversationHistory && conversationHistory.length > 0) {
      recipe.isModification = true;
      recipe.conversationContext = `Based on conversation: ${conversationHistory
        .filter(msg => msg.role === 'user')
        .slice(-2)
        .map(msg => msg.content)
        .join('; ')}`;
    }
    
    const {id, name, description, totalTime, servings, ingredients, instructions, storage, nutrition, conversationContext, isModification } = recipe;
    
    // Save to database and handle the response
    const saveResult = await saveRecipe({
      id: id,
      name: name,
      description: description,
      totalTime: totalTime,
      servings: servings,
      ingredients: ingredients,
      instructions: instructions,
      storage: storage,
      nutrition: nutrition,
    });
    
    console.log("saveResult: ", saveResult);
    console.log("recipe: ", recipe.name);
    if (isModification) {
      console.log("Modification context: ", conversationContext);
    }

    return recipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    return null;
  }
}

// Keep the original POST function for compatibility if needed
export async function POST(req: Request) {
  try {
    const {prompt, conversationHistory}: {prompt: string, conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>} = await req.json();
    console.log("prompt: ", prompt);
    console.log("conversationHistory: ", conversationHistory);
    
    const recipe = await generateRecipe(prompt, conversationHistory);
    
    if (!recipe) {
      return new Response(JSON.stringify({ error: "Failed to generate recipe" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(recipe), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/chat:", error);
    return new Response(JSON.stringify({ error: "Failed to generate recipe" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
