"server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "./index";
import * as schema from "./schema";

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
    return recipes as schema.Recipe[] || [];
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

export async function saveBookmark(userId: string, recipeId: string): Promise<{ success: boolean; message?: string }> {
  try {
    await db.insert(schema.bookmark).values({userId, recipeId});
    return { success: true };
  } catch (error) {
    console.error(`Error saving bookmark: `, error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function removeBookmark(userId: string, recipeId: string): Promise<{ success: boolean; message?: string }> {
  try {
    await db.delete(schema.bookmark).where(
      and(
        eq(schema.bookmark.userId, userId),
        eq(schema.bookmark.recipeId, recipeId)
      )
    );
    return { success: true };
  } catch (error) {
    console.error(`Error removing bookmark: `, error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Shopping List Queries
export async function getShoppingLists(userId: string): Promise<schema.ShoppingList[]> {
  try {
    const lists = await db.select().from(schema.shoppingList).where(eq(schema.shoppingList.userId, userId));
    return lists || [];
  } catch (error) {
    console.error(`Error fetching shopping lists: `, error);
    return [];
  }
}

export async function createShoppingList(userId: string, name: string): Promise<{ success: boolean; list?: schema.ShoppingList; message?: string }> {
  try {
    const newList = await db.insert(schema.shoppingList).values({
      userId,
      name,
    }).returning();
    return { success: true, list: newList[0] };
  } catch (error) {
    console.error(`Error creating shopping list: `, error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteShoppingList(listId: string): Promise<{ success: boolean; message?: string }> {
  try {
    await db.delete(schema.shoppingList).where(eq(schema.shoppingList.id, listId));
    return { success: true };
  } catch (error) {
    console.error(`Error deleting shopping list: `, error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getShoppingListItems(listId: string): Promise<schema.ShoppingListItem[]> {
  try {
    const items = await db.select().from(schema.shoppingListItem).where(eq(schema.shoppingListItem.listId, listId));
    return items || [];
  } catch (error) {
    console.error(`Error fetching shopping list items: `, error);
    return [];
  }
}

export async function getAllShoppingListItems(userId: string): Promise<schema.ShoppingListItem[]> {
  try {
    // First get all shopping lists for the user
    const lists = await getShoppingLists(userId);
    const listIds = lists.map(list => list.id);
    
    if (listIds.length === 0) {
      return [];
    }
    
    // Then get all items from all lists
    const items = await db.select()
      .from(schema.shoppingListItem)
      .where(inArray(schema.shoppingListItem.listId, listIds));
    
    return items || [];
  } catch (error) {
    console.error(`Error fetching all shopping list items: `, error);
    return [];
  }
}

export async function addShoppingListItem(
  listId: string, 
  name: string, 
  quantity: string, 
  unit?: string, 
  category?: string
): Promise<{ success: boolean; item?: schema.ShoppingListItem; message?: string }> {
  try {
    const newItem = await db.insert(schema.shoppingListItem).values({
      listId,
      name,
      quantity,
      unit,
      category,
    }).returning();
    return { success: true, item: newItem[0] };
  } catch (error) {
    console.error(`Error adding shopping list item: `, error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateShoppingListItem(
  itemId: string, 
  updates: {
    name?: string;
    quantity?: string;
    unit?: string;
    category?: string;
    isCompleted?: boolean;
  }
): Promise<{ success: boolean; message?: string }> {
  try {
    await db.update(schema.shoppingListItem)
      .set(updates)
      .where(eq(schema.shoppingListItem.id, itemId));
    return { success: true };
  } catch (error) {
    console.error(`Error updating shopping list item: `, error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteShoppingListItem(itemId: string): Promise<{ success: boolean; message?: string }> {
  try {
    await db.delete(schema.shoppingListItem).where(eq(schema.shoppingListItem.id, itemId));
    return { success: true };
  } catch (error) {
    console.error(`Error deleting shopping list item: `, error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function generateShoppingListFromRecipe(recipeId: string, userId: string, listName?: string): Promise<{ success: boolean; list?: schema.ShoppingList; message?: string }> {
  try {
    // Get recipe ingredients
    const recipe = await db.query.recipe.findFirst({
      where: eq(schema.recipe.id, recipeId),
    });

    if (!recipe) {
      return { success: false, message: 'Recipe not found' };
    }

    // Create shopping list
    const listNameFinal = listName || `Shopping for ${recipe.name}`;
    const listResult = await createShoppingList(userId, listNameFinal);
    
    if (!listResult.success || !listResult.list) {
      return { success: false, message: 'Failed to create shopping list' };
    }

    // Add ingredients to shopping list
    for (const ingredient of recipe.ingredients) {
      await addShoppingListItem(listResult.list!.id, ingredient, '1', undefined, 'Ingredients');
    }

    return { success: true, list: listResult.list };
  } catch (error) {
    console.error(`Error generating shopping list from recipe: `, error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// User Queries
export async function getUserById(userId: string): Promise<typeof schema.user.$inferSelect | null> {
  try {
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });
    return user ?? null;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
}

export async function isBookmarked(userId: string, recipeId: string): Promise<boolean> {
  try {
    const bookmark = await db.query.bookmark.findFirst({
      where: (bookmark) => 
        and(
          eq(bookmark.userId, userId),
          eq(bookmark.recipeId, recipeId)
        )
    });
    return !!bookmark;
  } catch (error) {
    console.error(`Error checking bookmark status: `, error);
    return false;
  }
}


