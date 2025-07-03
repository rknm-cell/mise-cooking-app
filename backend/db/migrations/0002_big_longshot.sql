CREATE TABLE "recipe" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar NOT NULL,
	"total_time" varchar NOT NULL,
	"servings" integer NOT NULL,
	"ingredients" varchar[] NOT NULL,
	"instructions" varchar[] NOT NULL,
	"storage" varchar NOT NULL,
	"nutrition" varchar[] NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Recipe" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "Recipe" CASCADE;--> statement-breakpoint
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_recipe_id_Recipe_id_fk";
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_recipe_id_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipe"("id") ON DELETE cascade ON UPDATE no action;