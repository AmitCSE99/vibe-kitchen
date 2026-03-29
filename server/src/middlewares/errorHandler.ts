import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { ZodError } from "zod";
import { ConvexError } from "convex/values";
import { ApiError } from "../utils/ApiError.js";

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      statusCode: 400,
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  if (err instanceof ConvexError) {
    res.status(400).json({
      message: String(err.data),
      statusCode: 400,
    });
    return;
  }

  res.status(500).json({
    message: "Internal Server Error",
    statusCode: 500,
  });
};
