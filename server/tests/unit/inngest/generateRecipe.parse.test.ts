import { describe, it, expect } from "vitest";
import { parseRecipesFromAIText } from "../../../src/inngest/generateRecipe.js";

const validRecipe = {
  title: "Dal Tadka",
  approxTimeToCook: 30,
  difficultyLevel: "easy",
  ingredients: ["1 cup yellow dal", "2 tbsp ghee"],
  method: [{ heading: "Cook dal", description: "Pressure cook dal with water for 3 whistles." }],
  calories: 250,
  tags: ["cozy", "vegan", "North Indian", "lunch"],
};

const validPayload = JSON.stringify([
  validRecipe,
  { ...validRecipe, title: "Poha" },
  { ...validRecipe, title: "Rajma" },
  { ...validRecipe, title: "Idli" },
]);

describe("parseRecipesFromAIText", () => {
  it("parses a clean JSON array of 4 recipes", () => {
    const result = parseRecipesFromAIText(validPayload);
    expect(result).toHaveLength(4);
    expect(result[0].title).toBe("Dal Tadka");
  });

  it("strips leading markdown json fence before parsing", () => {
    const result = parseRecipesFromAIText("```json\n" + validPayload + "\n```");
    expect(result).toHaveLength(4);
  });

  it("strips leading plain triple-backtick fence before parsing", () => {
    const result = parseRecipesFromAIText("```\n" + validPayload + "\n```");
    expect(result).toHaveLength(4);
  });

  it("throws on non-JSON text", () => {
    expect(() => parseRecipesFromAIText("Sure! Here are your recipes:")).toThrow(
      "AI returned non-JSON"
    );
  });

  it("throws when array has fewer than 4 recipes", () => {
    const short = JSON.stringify([validRecipe, validRecipe, validRecipe]);
    expect(() => parseRecipesFromAIText(short)).toThrow();
  });

  it("throws when array has more than 4 recipes", () => {
    const long = JSON.stringify([
      validRecipe,
      { ...validRecipe, title: "Poha" },
      { ...validRecipe, title: "Rajma" },
      { ...validRecipe, title: "Idli" },
      { ...validRecipe, title: "Dosa" },
    ]);
    expect(() => parseRecipesFromAIText(long)).toThrow();
  });

  it("throws when a recipe is missing required fields", () => {
    const broken = JSON.stringify([
      { title: "Dal Tadka" },
      { ...validRecipe, title: "Poha" },
      { ...validRecipe, title: "Rajma" },
      { ...validRecipe, title: "Idli" },
    ]);
    expect(() => parseRecipesFromAIText(broken)).toThrow();
  });

  it("throws when difficultyLevel is an invalid value", () => {
    const bad = JSON.stringify([
      { ...validRecipe, difficultyLevel: "extreme" },
      { ...validRecipe, title: "Poha" },
      { ...validRecipe, title: "Rajma" },
      { ...validRecipe, title: "Idli" },
    ]);
    expect(() => parseRecipesFromAIText(bad)).toThrow();
  });

  it("throws when calories is not a positive number", () => {
    const bad = JSON.stringify([
      { ...validRecipe, calories: -50 },
      { ...validRecipe, title: "Poha" },
      { ...validRecipe, title: "Rajma" },
      { ...validRecipe, title: "Idli" },
    ]);
    expect(() => parseRecipesFromAIText(bad)).toThrow();
  });
});
