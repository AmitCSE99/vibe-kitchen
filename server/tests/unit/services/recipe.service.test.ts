import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "../../../src/utils/ApiError.js";
import { makeStoredRecipe, makeRecipe } from "../../helpers/factories.js";

vi.mock("../../../src/models/recipe.model.js", () => ({
  recipeModel: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

// Import after vi.mock (hoisting ensures correct order)
const { recipeService } = await import("../../../src/services/recipe.service.js");
const { recipeModel } = await import("../../../src/models/recipe.model.js");

const mockModel = vi.mocked(recipeModel);

describe("recipeService", () => {
  const stored = makeStoredRecipe();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("delegates to recipeModel.findAll and returns results", async () => {
      mockModel.findAll.mockResolvedValue([stored] as never);
      const result = await recipeService.getAll();
      expect(mockModel.findAll).toHaveBeenCalledOnce();
      expect(result).toEqual([stored]);
    });
  });

  describe("getById", () => {
    it("returns recipe when found", async () => {
      mockModel.findById.mockResolvedValue(stored as never);
      const result = await recipeService.getById(stored._id as never);
      expect(result).toEqual(stored);
    });

    it("throws ApiError 404 when recipe not found", async () => {
      mockModel.findById.mockResolvedValue(null as never);
      await expect(
        recipeService.getById("nonexistent-id" as never)
      ).rejects.toThrow(new ApiError(404, "Recipe not found"));
    });
  });

  describe("create", () => {
    it("delegates to recipeModel.create and returns created recipe", async () => {
      mockModel.create.mockResolvedValue(stored as never);
      const dto = makeRecipe();
      const result = await recipeService.create(dto);
      expect(mockModel.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(stored);
    });
  });

  describe("update", () => {
    it("throws ApiError 404 when recipe not found", async () => {
      mockModel.findById.mockResolvedValue(null as never);
      await expect(
        recipeService.update("nonexistent-id" as never, { title: "New Title" })
      ).rejects.toThrow(new ApiError(404, "Recipe not found"));
    });

    it("calls model.update and returns updated recipe when recipe exists", async () => {
      mockModel.findById.mockResolvedValue(stored as never);
      const updated = { ...stored, title: "Updated Dal" };
      mockModel.update.mockResolvedValue(updated as never);
      const result = await recipeService.update(stored._id as never, { title: "Updated Dal" });
      expect(mockModel.update).toHaveBeenCalledWith(stored._id, { title: "Updated Dal" });
      expect(result).toMatchObject({ title: "Updated Dal" });
    });
  });

  describe("remove", () => {
    it("throws ApiError 404 when recipe not found", async () => {
      mockModel.findById.mockResolvedValue(null as never);
      await expect(
        recipeService.remove("nonexistent-id" as never)
      ).rejects.toThrow(new ApiError(404, "Recipe not found"));
    });

    it("calls model.remove when recipe exists", async () => {
      mockModel.findById.mockResolvedValue(stored as never);
      mockModel.remove.mockResolvedValue(undefined as never);
      await recipeService.remove(stored._id as never);
      expect(mockModel.remove).toHaveBeenCalledWith(stored._id);
    });
  });
});
