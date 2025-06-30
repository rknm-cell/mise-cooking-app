"use client";

import { useEffect, useState } from "react";
import RecipeDetail from "~/app/components/recipes/RecipeDetail";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Progress } from "~/components/ui/progress";
import { recipe, type RecipeSchema } from "~/server/db/schema";

export default function RecipeGenerator() {
  const [generation, setGeneration] = useState<RecipeSchema | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [progress, setProgress] = useState(0);
  const totalDuration = 10000;
  const updateInterval = 100;

  useEffect(() => {
    const increment = (100 / totalDuration) * updateInterval;
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return newProgress;
      });
    }, updateInterval);
  }, [isLoading]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setGeneration(undefined)
      setIsLoading(true);
      setProgress(0);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: input,
        }),
      });

      const recipeData: RecipeSchema = await response.json();
      setGeneration(recipeData);
      console.log("recipedata: ", recipeData);
      setIsLoading(false);
    } catch (error) {
      const e = error as Error;
      return {
        success: false,
        message: e.message || "An unknown error occurred.",
      };
    }
  }

  return (
    <>
      <div className="flex h-[100px] w-full max-w-2xl flex-col rounded-xl bg-[#428a93] p-4">
        <div className="mb-4 flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              value={input}
              onChange={handleChange}
              placeholder="What do you want to make?"
              className="flex-1 rounded-lg bg-zinc-500 px-4 py-2 text-white focus:outline-none focus:ring-0"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-lg bg-[#fcf45a]/70 px-4 py-2 font-semibold text-black hover:bg-[#fcf45a] disabled:opacity-50"
            >
              Send
            </Button>
          </form>
        </div>
        {isLoading && !generation ? (
          <Progress value={progress} className="w-[100%]" />
        ) : (
          <> </>
        )}
        {/* <Progress value={progress} className="w-[100%]"/> */}
      </div>
      {generation && <RecipeDetail recipe={generation} />}
    </>
  );
}
