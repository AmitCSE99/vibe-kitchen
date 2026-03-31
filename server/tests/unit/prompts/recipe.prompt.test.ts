import { describe, it, expect } from "vitest";
import { buildRecipePrompt } from "../../../src/prompts/recipe.prompt.js";

describe("buildRecipePrompt", () => {
  it("includes the mood in the output", () => {
    const prompt = buildRecipePrompt("cozy", ["lentils", "rice"], "vegan");
    expect(prompt).toContain("cozy");
  });

  it("includes all ingredients in the output", () => {
    const prompt = buildRecipePrompt("light", ["cucumber", "tomato"], "none");
    expect(prompt).toContain("cucumber");
    expect(prompt).toContain("tomato");
  });

  it("includes the dietary preference in the output", () => {
    const prompt = buildRecipePrompt("highEnergy", ["eggs"], "keto");
    expect(prompt).toContain("keto");
  });

  it("applies known dietary rule for vegan", () => {
    const prompt = buildRecipePrompt("light", ["cucumber"], "vegan");
    expect(prompt).toContain("No dairy");
  });

  it("applies known dietary rule for jain", () => {
    const prompt = buildRecipePrompt("cozy", ["lentils"], "jain");
    expect(prompt).toContain("No onion");
  });

  it("applies known dietary rule for keto", () => {
    const prompt = buildRecipePrompt("highEnergy", ["paneer"], "keto");
    expect(prompt).toContain("Low-carb");
  });

  it("applies known dietary rule for gluten-free", () => {
    const prompt = buildRecipePrompt("light", ["rice"], "gluten-free");
    expect(prompt).toContain("No wheat");
  });

  it("uses fallback rule with quoted preference for unknown dietary type", () => {
    const prompt = buildRecipePrompt("highEnergy", ["eggs"], "paleo");
    expect(prompt).toContain('"paleo"');
  });

  it("returns a non-empty string with substantial content", () => {
    const prompt = buildRecipePrompt("cozy", ["dal"], "none");
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("includes mood guideline text for cozy", () => {
    const prompt = buildRecipePrompt("cozy", ["rice"], "none");
    expect(prompt).toContain("khichdi");
  });

  it("includes mood guideline text for highEnergy", () => {
    const prompt = buildRecipePrompt("highEnergy", ["paneer"], "none");
    expect(prompt).toContain("Protein-rich");
  });

  it("includes mood guideline text for light", () => {
    const prompt = buildRecipePrompt("light", ["cucumber"], "none");
    expect(prompt).toContain("low-calorie");
  });
});
