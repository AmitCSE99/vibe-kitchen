import { NextFunction, Request, Response } from "express";
import { Id } from "../../convex/_generated/dataModel.js";
import { recipeService } from "../services/recipe.service.js";
import {
  CreateRecipeSchema,
  GenerateRecipeSchema,
  UpdateRecipeSchema,
} from "../types/recipe.types.js";
import { inngest } from "../config/inngest.js";
import { GENERATE_RECIPE_EVENT } from "../inngest/generateRecipe.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const recipeController = {
  getAll: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const numItems = req.query.numItems
      ? parseInt(req.query.numItems as string, 10) || undefined
      : undefined;
    const cursor =
      typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    const result = await recipeService.getAll({ numItems, cursor });
    res.json(result);
  }),

  getById: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const recipe = await recipeService.getById(req.params.id as Id<"recipe">);
    res.json(recipe);
  }),

  create: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = CreateRecipeSchema.parse(req.body);
    const recipe = await recipeService.create(data);
    res.status(201).json(recipe);
  }),

  update: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = UpdateRecipeSchema.parse(req.body);
    const recipe = await recipeService.update(
      req.params.id as Id<"recipe">,
      data,
    );
    res.json(recipe);
  }),

  remove: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await recipeService.remove(req.params.id as Id<"recipe">);
    res.json({ message: "Recipe deleted" });
  }),

  generate: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = GenerateRecipeSchema.parse(req.body);
    const { ids } = await inngest.send({ name: GENERATE_RECIPE_EVENT, data });
    res.status(202).json({ message: "Recipe generation started", eventIds: ids });
  }),
};
