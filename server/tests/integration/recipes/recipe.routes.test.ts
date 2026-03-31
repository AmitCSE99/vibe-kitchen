import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { makeRecipe, makeStoredRecipe, makeGenerateRequest } from "../../helpers/factories.js";

// vi.mock calls are hoisted above imports by Vitest — they intercept module
// resolution before createApp() loads any of these dependencies.

vi.mock("../../../src/config/convex.js", () => ({
  convexClient: {
    query: vi.fn(),
    mutation: vi.fn(),
  },
}));

vi.mock("../../../src/config/inngest.js", () => ({
  inngest: {
    send: vi.fn().mockResolvedValue({ ids: ["mock-event-id-1"] }),
    // createFunction is called at module load time in generateRecipe.ts
    createFunction: vi.fn().mockReturnValue({}),
  },
}));

// serve() in app.ts will fail with a mock inngest client — replace it with a pass-through
vi.mock("inngest/express", () => ({
  serve: vi.fn().mockReturnValue(
    (_req: unknown, _res: unknown, next: () => void) => next()
  ),
}));

vi.mock("../../../src/inngest/index.js", () => ({ functions: [] }));

// Import app AFTER vi.mock registrations
import { createApp } from "../../../src/app.js";
import { convexClient } from "../../../src/config/convex.js";
import { inngest } from "../../../src/config/inngest.js";

const mockConvex = vi.mocked(convexClient);
const mockInngest = vi.mocked(inngest);
const app = createApp();

describe("Recipe Routes — Integration", () => {
  const storedRecipe = makeStoredRecipe();

  beforeEach(() => {
    vi.clearAllMocks();
    // Restore inngest.send mock after clearAllMocks resets it
    mockInngest.send.mockResolvedValue({ ids: ["mock-event-id-1"] });
  });

  // ── GET /api/health ──────────────────────────────────────────────────────────

  describe("GET /api/health", () => {
    it("returns 200 with status ok", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: "ok" });
    });
  });

  // ── GET /api/recipes ─────────────────────────────────────────────────────────

  describe("GET /api/recipes", () => {
    it("returns 200 with paginated result", async () => {
      const pagedResult = { page: [storedRecipe], isDone: true, continueCursor: "" };
      mockConvex.query.mockResolvedValue(pagedResult as never);
      const res = await request(app).get("/api/recipes");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ page: [storedRecipe], isDone: true });
    });

    it("returns 500 when Convex throws", async () => {
      mockConvex.query.mockRejectedValue(new Error("Convex unavailable") as never);
      const res = await request(app).get("/api/recipes");
      expect(res.status).toBe(500);
    });
  });

  // ── GET /api/recipes/:id ─────────────────────────────────────────────────────

  describe("GET /api/recipes/:id", () => {
    it("returns 200 with recipe when found", async () => {
      mockConvex.query.mockResolvedValue(storedRecipe as never);
      const res = await request(app).get("/api/recipes/mock-convex-id-123");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ title: storedRecipe.title });
    });

    it("returns 404 when recipe not found", async () => {
      mockConvex.query.mockResolvedValue(null as never);
      const res = await request(app).get("/api/recipes/nonexistent-id");
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ message: "Recipe not found" });
    });
  });

  // ── POST /api/recipes ────────────────────────────────────────────────────────

  describe("POST /api/recipes", () => {
    it("returns 201 with created recipe for valid body", async () => {
      mockConvex.mutation.mockResolvedValue(storedRecipe as never);
      const res = await request(app)
        .post("/api/recipes")
        .send(makeRecipe());
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ title: storedRecipe.title });
    });

    it("returns 400 for invalid body (empty title)", async () => {
      const res = await request(app)
        .post("/api/recipes")
        .send({ title: "" });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ message: "Validation failed" });
    });

    it("returns 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/recipes")
        .send({ title: "Dal" });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ message: "Validation failed" });
    });
  });

  // ── PATCH /api/recipes/:id ───────────────────────────────────────────────────

  describe("PATCH /api/recipes/:id", () => {
    it("returns 200 with updated recipe for valid partial body", async () => {
      mockConvex.query.mockResolvedValue(storedRecipe as never);
      const updated = { ...storedRecipe, title: "Updated Dal" };
      mockConvex.mutation.mockResolvedValue(updated as never);
      const res = await request(app)
        .patch("/api/recipes/mock-convex-id-123")
        .send({ title: "Updated Dal" });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ title: "Updated Dal" });
    });

    it("returns 404 when recipe not found", async () => {
      mockConvex.query.mockResolvedValue(null as never);
      const res = await request(app)
        .patch("/api/recipes/nonexistent-id")
        .send({ title: "Updated Dal" });
      expect(res.status).toBe(404);
    });
  });

  // ── DELETE /api/recipes/:id ──────────────────────────────────────────────────

  describe("DELETE /api/recipes/:id", () => {
    it("returns 200 with message for existing recipe", async () => {
      mockConvex.query.mockResolvedValue(storedRecipe as never);
      mockConvex.mutation.mockResolvedValue(undefined as never);
      const res = await request(app).delete("/api/recipes/mock-convex-id-123");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ message: "Recipe deleted" });
    });

    it("returns 404 for nonexistent recipe", async () => {
      mockConvex.query.mockResolvedValue(null as never);
      const res = await request(app).delete("/api/recipes/nonexistent-id");
      expect(res.status).toBe(404);
    });
  });

  // ── POST /api/recipes/generate ───────────────────────────────────────────────

  describe("POST /api/recipes/generate", () => {
    it("returns 202 with eventIds when payload is valid", async () => {
      const res = await request(app)
        .post("/api/recipes/generate")
        .send(makeGenerateRequest());
      expect(res.status).toBe(202);
      expect(res.body).toMatchObject({
        message: "Recipe generation started",
        eventIds: ["mock-event-id-1"],
      });
    });

    it("returns 400 for invalid mood value", async () => {
      const res = await request(app)
        .post("/api/recipes/generate")
        .send({ currentMood: "angry", ingredients: ["rice"], dietaryPreferences: "none" });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ message: "Validation failed" });
    });

    it("returns 400 when ingredients array is empty", async () => {
      const res = await request(app)
        .post("/api/recipes/generate")
        .send({ currentMood: "cozy", ingredients: [], dietaryPreferences: "vegan" });
      expect(res.status).toBe(400);
    });
  });

  // ── notFound middleware ──────────────────────────────────────────────────────

  describe("notFound middleware", () => {
    it("returns 404 for unknown routes", async () => {
      const res = await request(app).get("/api/does-not-exist");
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ message: "Route not found" });
    });
  });
});
