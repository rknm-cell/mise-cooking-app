"server-only";
import { db } from "./index";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

export async function saveRecipe({
  id,
  name,
  description,
  totalTime,
  servings,
  ingredients,
  instructions,
  storage,
  nutrition,
}: {
  id: string;
  name: string;
  description: string;
  totalTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  storage: string;
  nutrition: string[];
}) {
  try {
    return await db.insert(schema.recipe).values({
      id,
      name,
      description,
      totalTime,
      servings,
      ingredients,
      instructions,
      storage,
      nutrition,
      createdAt: new Date(),
    });
  } catch (error) {
    const e = error as Error;
    console.error("Error saving recipe:", e);
    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
}

export async function getRecipeById(id: string): Promise<schema.Recipe | null> {
  try {
    const recipeDetail = await db.query.recipe.findFirst({
      where: eq(schema.recipe.id, id),
    });
    return recipeDetail ?? null;
  } catch (error) {
    console.error(`Error fetching recipe ${id}`, error);
    return null;
  }
}

export async function getAllRecipes(): Promise<schema.Recipe[]> {
  try {
    const recipes = await db.query.recipe.findMany();
    return recipes || [];
  } catch (error) {
    console.error(`Error fetching recipes: `, error);
    return [];
  }
}

export async function getBookmarks(userId: string): Promise<schema.Bookmark[] | null> {
  try {
    const bookmarks = await db.select().from(schema.bookmark).where(eq(schema.bookmark.userId, userId));
    return bookmarks || [];
  } catch (error) {
    console.error(`Error fetching bookmarks: `, error);
    return [];
  }
}

export async function saveBookmark(userId: string, recipeId: string): Promise<schema.Bookmark>{
  try{
    return await db.insert(schema.bookmark).values({userId, recipeId});
  } catch (error) {
    console.error(`Error saving bookmark: `, error)
    return null;
  }
}
