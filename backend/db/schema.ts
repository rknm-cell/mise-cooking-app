// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { mysqlTableCreator } from "drizzle-orm/mysql-core";
import { relations, type InferSelectModel } from "drizzle-orm";
import {
  integer,
  text,
  pgTable,
  timestamp,
  varchar,
  boolean,
  foreignKey,
  serial,
  primaryKey,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = mysqlTableCreator((name) => `RecipeApp_${name}`);

export const recipe = pgTable("Recipe", {
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

export const userRecipes = relations(user, ({ many }) => ({
  recipes: many(recipe),
  bookmarks: many(bookmark),
}));

export const bookmark = pgTable(
  "bookmarks",
  {
    userId: varchar("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipeId: varchar("recipe_id")
      .notNull()
      .references(() => recipe.id, { onDelete: "cascade" }),
    bookmarkedAt: timestamp("bookmarked_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.recipeId] })],
);

export type Bookmark = z.infer<typeof bookmark>

export const bookmarksRelations = relations(bookmark,({one}) => ({
  user: one(user, {
    fields: [bookmark.userId],
    references: [user.id],
  }),
  recipe: one(recipe, {
    fields: [bookmark.recipeId],
    references: [recipe.id]
  })
}))


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

export const schema = { user, session, account, verification };
