import { z } from "zod";

export const DifficultyLevel = z.enum(["easy", "medium", "hard"]);

export const MethodStepSchema = z.object({
  heading: z.string().min(1),
  description: z.string().min(1),
});

export const CreateRecipeSchema = z.object({
  title: z.string().min(1),
  approxTimeToCook: z.number().positive(),
  difficultyLevel: DifficultyLevel,
  ingredients: z.array(z.string().min(1)).min(1),
  method: z.array(MethodStepSchema).min(1),
  calories: z.number().positive(),
  tags: z.array(z.string().min(1)),
});

export const UpdateRecipeSchema = CreateRecipeSchema.partial();

export type CreateRecipeDto = z.infer<typeof CreateRecipeSchema>;
export type UpdateRecipeDto = z.infer<typeof UpdateRecipeSchema>;

export const MoodSchema = z.enum(["cozy", "highEnergy", "light"]);
export type Mood = z.infer<typeof MoodSchema>;

export const GenerateRecipeSchema = z.object({
  currentMood: MoodSchema,
  ingredients: z.array(z.string().min(1)).min(1),
  dietaryPreferences: z.string().min(1),
});
export type GenerateRecipeDto = z.infer<typeof GenerateRecipeSchema>;
