import { pgTable, serial, text, varchar, timestamp, boolean, integer, json, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
  password: text('password'),
  preferences: json('preferences').$type<{
    cuisine: string[];
    dietaryRestrictions: string[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
  }>(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}));

// Recipes table
export const recipes = pgTable('recipes', {
  id: varchar('id').primaryKey().notNull(),
  name: varchar('name').notNull(),
  description: varchar('description').notNull(),
  totalTime: varchar('total_time').notNull(),
  servings: integer('servings').notNull(),
  ingredients: varchar('ingredients').array().notNull(),
  instructions: varchar('instructions').array().notNull(),
  storage: varchar('storage').notNull(),
  nutrition: varchar('nutrition').array().notNull(),
  image: text('image'),
  tags: json('tags').$type<string[]>(),
  isPublic: boolean('is_public').default(true),
  userId: text('user_id').references(() => users.id),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  cuisineIdx: index('cuisine_idx').on(table.cuisine),
}));

// User favorites/bookmarks table
export const bookmarks = pgTable('bookmarks', {
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  recipeId: varchar('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  bookmarkedAt: timestamp('bookmarked_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.recipeId] })]);

// Generated recipes table (for AI-generated recipes)
export const generatedRecipes = pgTable('generated_recipes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  inputIngredients: json('input_ingredients').$type<string[]>().notNull(),
  requestedCuisine: varchar('requested_cuisine', { length: 100 }),
  dietaryRestrictions: json('dietary_restrictions').$type<string[]>(),
  generatedRecipe: json('generated_recipe').$type<{
    name: string;
    description: string;
    totalTime: string;
    servings: number;
    ingredients: string[];
    instructions: string[];
    storage: string;
    nutrition: string[];
  }>().notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index('generated_recipes_user_id_idx').on(table.userId),
}));

// Sessions table
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
  bookmarks: many(bookmarks),
  generatedRecipes: many(generatedRecipes),
  sessions: many(sessions),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  user: one(users, {
    fields: [recipes.userId],
    references: [users.id],
  }),
  bookmarks: many(bookmarks),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [bookmarks.recipeId],
    references: [recipes.id],
  }),
}));

export const generatedRecipesRelations = relations(generatedRecipes, ({ one }) => ({
  user: one(users, {
    fields: [generatedRecipes.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const recipeObject = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  totalTime: z.string(),
  servings: z.number(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  storage: z.string(),
  nutrition: z.array(z.string()),
});

export const userObject = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().optional(),
  password: z.string().optional(),
  preferences: z.object({
    cuisine: z.array(z.string()),
    dietaryRestrictions: z.array(z.string()),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  }).optional(),
});

export const bookmarkObject = z.object({
  userId: z.string(),
  recipeId: z.string(),
  bookmarkedAt: z.date(),
});

// Type exports
export type Recipe = z.infer<typeof recipeObject>;
export type User = z.infer<typeof userObject>;
export type Bookmark = z.infer<typeof bookmarkObject>;

export const schema = { users, recipes, bookmarks, generatedRecipes, sessions }; 