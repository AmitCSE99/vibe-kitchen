import type { PaginationOptions } from "convex/server";
import { Id } from "../../convex/_generated/dataModel.js";
import { recipeModel } from "../models/recipe.model.js";
import { CreateRecipeDto, UpdateRecipeDto } from "../types/recipe.types.js";
import { ApiError } from "../utils/ApiError.js";

export interface GetAllOptions {
  numItems?: number;
  cursor?: string | null;
}

export const recipeService = {
  getAll: (opts: GetAllOptions = {}) => {
    const paginationOpts: PaginationOptions = {
      numItems: opts.numItems ?? 20,
      cursor: opts.cursor ?? null,
    };
    return recipeModel.findAll(paginationOpts);
  },

  getById: async (id: Id<"recipe">) => {
    const recipe = await recipeModel.findById(id);
    if (!recipe) throw new ApiError(404, "Recipe not found");
    return recipe;
  },

  create: (data: CreateRecipeDto) => recipeModel.create(data),

  update: async (id: Id<"recipe">, data: UpdateRecipeDto) => {
    const existing = await recipeModel.findById(id);
    if (!existing) throw new ApiError(404, "Recipe not found");
    return recipeModel.update(id, data);
  },

  remove: async (id: Id<"recipe">) => {
    const existing = await recipeModel.findById(id);
    if (!existing) throw new ApiError(404, "Recipe not found");
    await recipeModel.remove(id);
  },
};
