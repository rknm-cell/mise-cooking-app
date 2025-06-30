import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Recipe } from "~/server/db/schema";
import {motion} from "motion/react"
import { api } from "~/trpc/react";

export const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  const { id, name, nutrition, description } = recipe;
  const utils = api.useUtils();

  const handleMouseEnter = () => {
    // Prefetch the recipe data when hovering over the card
    utils.recipe.getRecipe.prefetch(id);
  };

  return (
    <Link href={`/recipes/${id}`} prefetch={true}>
      <motion.div layoutId={`recipe-card-${id}`} onMouseEnter={handleMouseEnter}>
        <Card className="h-full cursor-pointer transition-shadow hover:shadow-sm">
          <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
            <CardDescription>{nutrition.join(", ")}</CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    </Link>
  );
};
