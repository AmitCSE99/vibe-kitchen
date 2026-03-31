import { Router } from "express";
import { recipeController } from "../controllers/recipe.controller.js";

export const recipeRouter = Router();

recipeRouter.get("/", recipeController.getAll);
recipeRouter.get("/:id", recipeController.getById);
recipeRouter.post("/", recipeController.create);
recipeRouter.post("/generate", recipeController.generate);
recipeRouter.patch("/:id", recipeController.update);
recipeRouter.delete("/:id", recipeController.remove);
