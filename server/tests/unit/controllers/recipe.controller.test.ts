import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../../../src/utils/ApiError.js";
import {
  makeGenerateRequest,
  makeRecipe,
  makeStoredRecipe,
} from "../../helpers/factories.js";

// vi.mock calls are hoisted above imports by Vitest

vi.mock("../../../src/services/recipe.service.js", () => ({
  recipeService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("../../../src/config/inngest.js", () => ({
  inngest: {
    send: vi.fn().mockResolvedValue({ ids: ["mock-event-id-1"] }),
    createFunction: vi.fn().mockReturnValue({}),
  },
}));

// Dynamic imports after mocks are registered
const { recipeController } = await import(
  "../../../src/controllers/recipe.controller.js"
);
const { recipeService } = await import(
  "../../../src/services/recipe.service.js"
);
const { inngest } = await import("../../../src/config/inngest.js");

const mockService = vi.mocked(recipeService);
const mockInngest = vi.mocked(inngest);

function makeMocks(overrides: Partial<Request> = {}) {
  const req = { params: {}, query: {}, body: {}, ...overrides } as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe("recipeController", () => {
  const stored = makeStoredRecipe();
  const pagedResult = { page: [stored], isDone: true, continueCursor: "" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockInngest.send.mockResolvedValue({ ids: ["mock-event-id-1"] });
  });

  // ── getAll ───────────────────────────────────────────────────────────────
  describe("getAll", () => {
    it("responds with paginated result", async () => {
      mockService.getAll.mockResolvedValue(pagedResult as never);
      const { req, res, next } = makeMocks();
      await recipeController.getAll(req, res, next);
      expect(res.json).toHaveBeenCalledWith(pagedResult);
      expect(next).not.toHaveBeenCalled();
    });

    it("passes numItems and cursor query params to service", async () => {
      mockService.getAll.mockResolvedValue(pagedResult as never);
      const { req, res, next } = makeMocks({
        query: { numItems: "5", cursor: "some-cursor" } as never,
      });
      await recipeController.getAll(req, res, next);
      expect(mockService.getAll).toHaveBeenCalledWith({
        numItems: 5,
        cursor: "some-cursor",
      });
    });

    it("calls next with error when service throws", async () => {
      const err = new Error("Convex unavailable");
      mockService.getAll.mockRejectedValue(err as never);
      const { req, res, next } = makeMocks();
      await recipeController.getAll(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // ── getById ──────────────────────────────────────────────────────────────
  describe("getById", () => {
    it("responds with recipe when found", async () => {
      mockService.getById.mockResolvedValue(stored as never);
      const { req, res, next } = makeMocks({ params: { id: stored._id } as never });
      await recipeController.getById(req, res, next);
      expect(res.json).toHaveBeenCalledWith(stored);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next with ApiError 404 when not found", async () => {
      const err = new ApiError(404, "Recipe not found");
      mockService.getById.mockRejectedValue(err as never);
      const { req, res, next } = makeMocks({ params: { id: "bad-id" } as never });
      await recipeController.getById(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── create ───────────────────────────────────────────────────────────────
  describe("create", () => {
    it("responds 201 with created recipe for valid body", async () => {
      mockService.create.mockResolvedValue(stored as never);
      const { req, res, next } = makeMocks({ body: makeRecipe() });
      await recipeController.create(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(stored);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next with ZodError for invalid body", async () => {
      const { req, res, next } = makeMocks({ body: { title: "" } });
      await recipeController.create(req, res, next);
      expect(next).toHaveBeenCalledOnce();
      const forwarded = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(forwarded).toBeInstanceOf(ZodError);
    });
  });

  // ── update ───────────────────────────────────────────────────────────────
  describe("update", () => {
    it("responds with updated recipe", async () => {
      const updated = { ...stored, title: "Updated Dal" };
      mockService.update.mockResolvedValue(updated as never);
      const { req, res, next } = makeMocks({
        params: { id: stored._id } as never,
        body: { title: "Updated Dal" },
      });
      await recipeController.update(req, res, next);
      expect(res.json).toHaveBeenCalledWith(updated);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next with ApiError 404 when not found", async () => {
      const err = new ApiError(404, "Recipe not found");
      mockService.update.mockRejectedValue(err as never);
      const { req, res, next } = makeMocks({
        params: { id: "bad-id" } as never,
        body: { title: "New Title" },
      });
      await recipeController.update(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────
  describe("remove", () => {
    it("responds with deletion message", async () => {
      mockService.remove.mockResolvedValue(undefined as never);
      const { req, res, next } = makeMocks({ params: { id: stored._id } as never });
      await recipeController.remove(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ message: "Recipe deleted" });
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next with ApiError 404 when not found", async () => {
      const err = new ApiError(404, "Recipe not found");
      mockService.remove.mockRejectedValue(err as never);
      const { req, res, next } = makeMocks({ params: { id: "bad-id" } as never });
      await recipeController.remove(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── generate ─────────────────────────────────────────────────────────────
  describe("generate", () => {
    it("responds 202 with eventIds for valid payload", async () => {
      const { req, res, next } = makeMocks({ body: makeGenerateRequest() });
      await recipeController.generate(req, res, next);
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        message: "Recipe generation started",
        eventIds: ["mock-event-id-1"],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next with ZodError for invalid mood value", async () => {
      const { req, res, next } = makeMocks({
        body: { currentMood: "angry", ingredients: ["rice"], dietaryPreferences: "none" },
      });
      await recipeController.generate(req, res, next);
      expect(next).toHaveBeenCalledOnce();
      const forwarded = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(forwarded).toBeInstanceOf(ZodError);
    });
  });
});
