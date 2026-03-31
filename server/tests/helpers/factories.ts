import type { CreateRecipeDto, GenerateRecipeDto } from "../../src/types/recipe.types.js";

export function makeRecipe(overrides: Partial<CreateRecipeDto> = {}): CreateRecipeDto {
  return {
    title: "Test Masala Dal",
    approxTimeToCook: 30,
    difficultyLevel: "easy",
    ingredients: ["1 cup red lentils", "1 tsp turmeric", "1 tbsp ghee"],
    method: [
      {
        heading: "Cook lentils",
        description: "Pressure cook lentils with turmeric for 3 whistles.",
      },
    ],
    calories: 250,
    tags: ["cozy", "vegan", "dal"],
    ...overrides,
  };
}

export function makeStoredRecipe(overrides: Partial<CreateRecipeDto> = {}) {
  return {
    _id: "mock-convex-id-123",
    _creationTime: 1700000000000,
    ...makeRecipe(overrides),
  };
}

export function makeGenerateRequest(overrides: Partial<GenerateRecipeDto> = {}): GenerateRecipeDto {
  return {
    currentMood: "cozy",
    ingredients: ["lentils", "rice"],
    dietaryPreferences: "vegan",
    ...overrides,
  };
}
