import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recipe: defineTable({
    title: v.string(),
    approxTimeToCook: v.number(),
    difficultyLevel: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
    ),
    ingredients: v.array(v.string()),
    method: v.array(
      v.object({
        heading: v.string(),
        description: v.string(),
      }),
    ),
    calories: v.number(),
    tags: v.array(v.string()),
  }).index("by_difficulty", ["difficultyLevel"]),
});
