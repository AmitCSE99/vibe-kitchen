import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { ConvexError } from "convex/values";
import { ApiError } from "../../../src/utils/ApiError.js";
import { errorHandler } from "../../../src/middlewares/errorHandler.js";

function makeMocks() {
  const req = {} as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe("errorHandler middleware", () => {
  let req: Request, res: Response, next: NextFunction;

  beforeEach(() => {
    ({ req, res, next } = makeMocks());
  });

  it("returns 400 with 'Validation failed' for ZodError", () => {
    let zodErr!: ZodError;
    try {
      z.object({ name: z.string().min(1) }).parse({ name: "" });
    } catch (e) {
      zodErr = e as ZodError;
    }
    errorHandler(zodErr, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Validation failed", statusCode: 400 })
    );
  });

  it("returns ApiError's statusCode and message", () => {
    const err = new ApiError(404, "Recipe not found");
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Recipe not found", statusCode: 404 });
  });

  it("returns 400 with ConvexError data as message", () => {
    const err = new ConvexError("Duplicate recipe title");
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 })
    );
  });

  it("returns 500 for unknown errors", () => {
    const err = new Error("Something exploded");
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error", statusCode: 500 });
  });
});
