import type { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Wraps an async Express route handler and forwards any rejection to next().
 * Prevents unhandled promise rejections in Express 4; documents intent in Express 5.
 *
 * Returns the inner Promise so it can be awaited in unit tests.
 * Express itself ignores return values from middleware.
 */
export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next) as unknown as void;
}
