/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { openai } from "@ai-sdk/openai";
import { generateObject} from "ai";
import { nanoid } from "nanoid";
import { saveRecipe } from "~/server/db/queries";
import { z } from "zod";



export async function POST(req: Request) {
  try {
    const {prompt}: {prompt: string} = await req.json();
    console.log("prompt: ", prompt)
    
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      system: `You are a professional chef and recipe assistant. When providing recipes, always follow this list: 
                 1. Name
                 2. Description
                 3. Time (prep + cooking)
                 4. Servings
                 5. Ingredients (with precise measurements)
                   - List all ingredients with their quantities
                   - Include any optional ingredients or substitutions
                 6. Instructions
                   - Separate each step
                   - Include specific temperatures, times, and techniques
                   - Add helpful tips or notes where relevant
                 7. Storage (if applicable) as storage
                 8. Nutrition
                 Keep your responses clear, precise, and easy to follow. Include helpful cooking tips and explain any technical terms. If asked about a specific cuisine or dietary requirement, adapt the recipe accordingly.
                 `,
      prompt,
      schema: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        totalTime: z.string(),
        servings: z.number(),
        ingredients: z.array(z.string()),
        instructions: z.array(z.string()),
        storage: z.string(),
        nutrition: z.array(z.string())
      }),
    });
    
    const recipe = result.object;
    recipe.id = nanoid();
    const {id, name, description, totalTime, servings, ingredients, instructions, storage, nutrition } = recipe;
    
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

    return result.toJsonResponse();
  } catch (error) {
    console.error("Error in POST /api/chat:", error);
    return new Response(JSON.stringify({ error: "Failed to generate recipe" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
