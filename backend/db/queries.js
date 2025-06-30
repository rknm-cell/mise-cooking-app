import { eq } from 'drizzle-orm';
import { db } from './index.js';
import * as schema from './schema.js';

// Recipe queries
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
  cuisine,
  difficulty,
  image,
  tags,
  isPublic,
  userId,
}) {
  try {
    return await db.insert(schema.recipes).values({
      id,
      name,
      description,
      totalTime,
      servings,
      ingredients,
      instructions,
      storage,
      nutrition,
      cuisine,
      difficulty,
      image,
      tags,
      isPublic,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving recipe:', error);
    return {
      success: false,
      message: error.message || 'An unknown error occurred.',
    };
  }
}

export async function getRecipeById(id) {
  try {
    const recipeDetail = await db.query.recipes.findFirst({
      where: eq(schema.recipes.id, id),
    });
    return recipeDetail ?? null;
  } catch (error) {
    console.error(`Error fetching recipe ${id}`, error);
    return null;
  }
}

export async function getAllRecipes() {
  try {
    const recipes = await db.query.recipes.findMany();
    return recipes || [];
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}

export async function getRecipesByUser(userId) {
  try {
    const recipes = await db.query.recipes.findMany({
      where: eq(schema.recipes.userId, userId),
    });
    return recipes || [];
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    return [];
  }
}

// User queries
export async function createUser({ id, name, email, password, image, preferences }) {
  try {
    return await db.insert(schema.users).values({
      id,
      name,
      email,
      password,
      image,
      preferences,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      message: error.message || 'An unknown error occurred.',
    };
  }
}

export async function getUserById(id) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
    return user ?? null;
  } catch (error) {
    console.error(`Error fetching user ${id}`, error);
    return null;
  }
}

export async function getUserByEmail(email) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
    return user ?? null;
  } catch (error) {
    console.error(`Error fetching user by email ${email}`, error);
    return null;
  }
}

// Bookmark queries
export async function getBookmarks(userId) {
  try {
    const bookmarks = await db.select().from(schema.bookmarks).where(eq(schema.bookmarks.userId, userId));
    return bookmarks || [];
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
}

export async function saveBookmark(userId, recipeId) {
  try {
    return await db.insert(schema.bookmarks).values({
      userId,
      recipeId,
      bookmarkedAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving bookmark:', error);
    return null;
  }
}

export async function removeBookmark(userId, recipeId) {
  try {
    return await db.delete(schema.bookmarks).where(
      eq(schema.bookmarks.userId, userId) && eq(schema.bookmarks.recipeId, recipeId)
    );
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return null;
  }
}

// Generated recipes queries
export async function saveGeneratedRecipe({
  userId,
  inputIngredients,
  requestedCuisine,
  dietaryRestrictions,
  generatedRecipe,
}) {
  try {
    return await db.insert(schema.generatedRecipes).values({
      userId,
      inputIngredients,
      requestedCuisine,
      dietaryRestrictions,
      generatedRecipe,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving generated recipe:', error);
    return {
      success: false,
      message: error.message || 'An unknown error occurred.',
    };
  }
}

export async function getGeneratedRecipesByUser(userId) {
  try {
    const generatedRecipes = await db.query.generatedRecipes.findMany({
      where: eq(schema.generatedRecipes.userId, userId),
    });
    return generatedRecipes || [];
  } catch (error) {
    console.error('Error fetching generated recipes:', error);
    return [];
  }
}

// Session queries
export async function createSession({
  id,
  expiresAt,
  token,
  ipAddress,
  userAgent,
  userId,
}) {
  try {
    return await db.insert(schema.sessions).values({
      id,
      expiresAt,
      token,
      ipAddress,
      userAgent,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

export async function getSessionByToken(token) {
  try {
    const session = await db.query.sessions.findFirst({
      where: eq(schema.sessions.token, token),
    });
    return session ?? null;
  } catch (error) {
    console.error('Error fetching session by token:', error);
    return null;
  }
}

export async function deleteSession(id) {
  try {
    return await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
  } catch (error) {
    console.error('Error deleting session:', error);
    return null;
  }
} 