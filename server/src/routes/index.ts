import { Router } from "express";
import { recipeRouter } from "./recipe.routes.js";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/recipes", recipeRouter);
