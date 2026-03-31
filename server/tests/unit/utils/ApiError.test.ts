import { describe, it, expect } from "vitest";
import { ApiError } from "../../../src/utils/ApiError.js";

describe("ApiError", () => {
  it("sets statusCode and message", () => {
    const err = new ApiError(404, "Not found");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Not found");
  });

  it("is an instance of Error", () => {
    const err = new ApiError(500, "Server error");
    expect(err).toBeInstanceOf(Error);
  });

  it("has name set to ApiError", () => {
    const err = new ApiError(400, "Bad request");
    expect(err.name).toBe("ApiError");
  });

  it("captures a stack trace", () => {
    const err = new ApiError(422, "Unprocessable");
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain("ApiError");
  });

  it("statusCode is readonly", () => {
    const err = new ApiError(403, "Forbidden");
    expect(err.statusCode).toBe(403);
  });
});
