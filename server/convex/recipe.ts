import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";

export const getAllRecipes = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("recipe").paginate(args.paginationOpts);
  },
});

export const getRecipeById = query({
  args: { id: v.id("recipe") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const createRecipe = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("recipe", args);
    return await ctx.db.get(id);
  },
});

export const updateRecipe = mutation({
  args: {
    id: v.id("recipe"),
    title: v.optional(v.string()),
    approxTimeToCook: v.optional(v.number()),
    difficultyLevel: v.optional(
      v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    ),
    ingredients: v.optional(v.array(v.string())),
    method: v.optional(
      v.array(
        v.object({
          heading: v.string(),
          description: v.string(),
        }),
      ),
    ),
    calories: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
    return await ctx.db.get(id);
  },
});

export const deleteRecipe = mutation({
  args: { id: v.id("recipe") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
