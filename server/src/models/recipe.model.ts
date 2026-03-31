import { api } from "../../convex/_generated/api.js";
import { Id } from "../../convex/_generated/dataModel.js";
import type { PaginationOptions } from "convex/server";
import { convexClient } from "../config/convex.js";
import { CreateRecipeDto, UpdateRecipeDto } from "../types/recipe.types.js";

export const recipeModel = {
  findAll: (paginationOpts: PaginationOptions) =>
    convexClient.query(api.recipe.getAllRecipes, { paginationOpts }),

  findById: (id: Id<"recipe">) =>
    convexClient.query(api.recipe.getRecipeById, { id }),

  create: (data: CreateRecipeDto) =>
    convexClient.mutation(api.recipe.createRecipe, data),

  update: (id: Id<"recipe">, data: UpdateRecipeDto) =>
    convexClient.mutation(api.recipe.updateRecipe, { id, ...data }),

  remove: (id: Id<"recipe">) =>
    convexClient.mutation(api.recipe.deleteRecipe, { id }),
};
