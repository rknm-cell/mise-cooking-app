-- Rename Recipe table to lowercase to match naming convention
ALTER TABLE "Recipe" RENAME TO "recipe";
--> statement-breakpoint
-- Update foreign key constraint name to match new table name
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_recipe_id_Recipe_id_fk";
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_recipe_id_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipe"("id") ON DELETE cascade ON UPDATE no action; 