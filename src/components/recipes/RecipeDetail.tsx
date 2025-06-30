import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { motion } from "motion/react";

interface RecipeDetails {
  id: string;
  name: string;
  description: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  storage: string;
  nutrition: string[];
  totalTime: string;
}

const RecipeDetail = ({ recipe }: { recipe: RecipeDetails }) => {
  const {
    id,
    name,
    description,
    servings,
    ingredients,
    instructions,
    storage,
    nutrition,
    totalTime,
  } = recipe;
  console.log(nutrition);
  function handleInstructions(instructions: string[]) {
    return instructions.map((instruction, index) => {
      return (
        <div key={index}>
          {index + 1}. {instruction}
        </div>
      );
    });
  }
  function handleNutrition(nutrients: string[]) {
    return nutrients.map((nutrient, index) => {
      return <p key={index}> {nutrient} </p>;
    });
  }
  function handleIngredients(ingredients: string[]) {
    return ingredients.map((ingredient, index) => {
      return <p key={index}> {ingredient} </p>;
    });
  }
  return (
    <motion.div layoutId={`recipe-card-${id}`}>
      <Card className="flex w-full sm:m-4 lg:w-3/4">
        <CardHeader className="">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">
            {name}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {description}
          </CardDescription>
          <CardDescription className="h-30 text-sm sm:text-base">
            {handleNutrition(nutrition)}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2 text-sm sm:text-base">
            <p>
              <strong>Time:</strong> {totalTime}
            </p>
            <p>
              <strong>Servings:</strong> {servings}
            </p>
          </div>
        </CardContent>
        <CardContent>{handleIngredients(ingredients)}</CardContent>
        <CardContent>{handleInstructions(instructions)}</CardContent>
        <CardFooter>
          <p>{storage}</p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
export default RecipeDetail;
