import { NonRetriableError, InngestFunction } from "inngest";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { inngest } from "../config/inngest.js";
import { buildRecipePrompt } from "../prompts/recipe.prompt.js";
import { CreateRecipesArraySchema, GenerateRecipeSchema } from "../types/recipe.types.js";
import { convexClient } from "../config/convex.js";
import { api } from "../../convex/_generated/api.js";

export const GENERATE_RECIPE_EVENT = "recipe/generate.requested" as const;

export function parseRecipesFromAIText(text: string) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI returned non-JSON: ${cleaned.slice(0, 200)}`);
  }
  return CreateRecipesArraySchema.parse(parsed);
}

export const generateRecipeFunction: InngestFunction.Like = inngest.createFunction(
  { id: "generate-recipe", retries: 2, triggers: [{ event: GENERATE_RECIPE_EVENT }] },
  async ({ event, step }) => {
    const parsed = GenerateRecipeSchema.safeParse(event.data);
    if (!parsed.success) {
      throw new NonRetriableError(`Invalid event data: ${parsed.error.message}`);
    }
    const { currentMood, ingredients, dietaryPreferences } = parsed.data;

    const aiText = await step.run("call-anthropic-ai", async () => {
      const prompt = buildRecipePrompt(currentMood, ingredients, dietaryPreferences);
      const { text } = await generateText({
        model: anthropic("claude-haiku-4-5-20251001"),
        prompt,
        abortSignal: AbortSignal.timeout(60_000),
      });
      return text;
    });

    const recipesData = await step.run("parse-ai-response", async () => {
      try {
        return parseRecipesFromAIText(aiText);
      } catch (err) {
        throw new NonRetriableError((err as Error).message);
      }
    });

    const savedRecipes = await step.run("save-to-convex", async () => {
      return Promise.all(
        recipesData.map((recipe) =>
          convexClient.mutation(api.recipe.createRecipe, recipe)
        )
      );
    });

    return savedRecipes;
  }
);
