import { NonRetriableError, InngestFunction } from "inngest";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { inngest } from "../config/inngest.js";
import { buildRecipePrompt } from "../prompts/recipe.prompt.js";
import { CreateRecipeSchema } from "../types/recipe.types.js";
import { convexClient } from "../config/convex.js";
import { api } from "../../convex/_generated/api.js";
import type { Mood } from "../types/recipe.types.js";

export const GENERATE_RECIPE_EVENT = "recipe/generate.requested" as const;

export const generateRecipeFunction: InngestFunction.Like = inngest.createFunction(
  { id: "generate-recipe", retries: 2, triggers: [{ event: GENERATE_RECIPE_EVENT }] },
  async ({ event, step }) => {
    const { currentMood, ingredients, dietaryPreferences } = event.data as {
      currentMood: Mood;
      ingredients: string[];
      dietaryPreferences: string;
    };

    const aiText = await step.run("call-anthropic-ai", async () => {
      const prompt = buildRecipePrompt(currentMood, ingredients, dietaryPreferences);
      const { text } = await generateText({
        model: anthropic("claude-haiku-4-5-20251001"),
        prompt,
      });
      return text;
    });

    const recipeData = await step.run("parse-ai-response", async () => {
      // Prompt explicitly asks for raw JSON, but strip fences defensively
      const cleaned = aiText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        throw new NonRetriableError(
          `AI returned non-JSON: ${cleaned.slice(0, 200)}`
        );
      }
      return CreateRecipeSchema.parse(parsed);
    });

    const savedRecipe = await step.run("save-to-convex", async () => {
      return convexClient.mutation(api.recipe.createRecipe, recipeData);
    });

    return savedRecipe;
  }
);
