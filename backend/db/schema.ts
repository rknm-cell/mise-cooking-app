// Drizzle ORM Schema for Mise Cooking App

import { relations, type InferSelectModel } from "drizzle-orm";
import {
    boolean,
    integer,
    pgTable,
    primaryKey,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

// ============================================================================
// RECIPE TABLES
// ============================================================================

export const recipe = pgTable("recipe", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  description: varchar("description").notNull(),
  totalTime: varchar("total_time").notNull(),
  servings: integer("servings").notNull(),
  ingredients: varchar("ingredients").array().notNull(),
  instructions: varchar("instructions").array().notNull(),
  storage: varchar("storage").notNull(),
  nutrition: varchar("nutrition").array().notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type Recipe = InferSelectModel<typeof recipe>;

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

export type RecipeSchema = z.infer<typeof recipeObject>;

// ============================================================================
// USER TABLES
// ============================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// ============================================================================
// BOOKMARK TABLES
// ============================================================================

export const bookmark = pgTable(
  "bookmarks",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipe.id, { onDelete: "cascade" }),
    bookmarkedAt: timestamp("bookmarked_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.recipeId] })],
);

export type Bookmark = z.infer<typeof bookmark>;

// ============================================================================
// AUTHENTICATION TABLES
// ============================================================================

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

// ============================================================================
// SHOPPING LIST TABLES
// ============================================================================

export const shoppingList = pgTable("shopping_lists", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const shoppingListItem = pgTable("shopping_list_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  listId: text("list_id")
    .notNull()
    .references(() => shoppingList.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit"),
  category: text("category"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type ShoppingList = InferSelectModel<typeof shoppingList>;
export type ShoppingListItem = InferSelectModel<typeof shoppingListItem>;

// ============================================================================
// RELATIONS
// ============================================================================

export const userRecipes = relations(user, ({ many }) => ({
  recipes: many(recipe),
  bookmarks: many(bookmark),
}));

export const bookmarksRelations = relations(bookmark, ({ one }) => ({
  user: one(user, {
    fields: [bookmark.userId],
    references: [user.id],
  }),
  recipe: one(recipe, {
    fields: [bookmark.recipeId],
    references: [recipe.id],
  }),
}));

// ============================================================================
// EXPORTS
// ============================================================================

export const schema = { user, session, account, verification, recipe, bookmark, shoppingList, shoppingListItem };
