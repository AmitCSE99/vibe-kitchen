import { InngestFunction } from "inngest";
import { generateRecipeFunction } from "./generateRecipe.js";

export const functions: InngestFunction.Like[] = [generateRecipeFunction];
