// Satisfies env.ts's top-level envSchema.parse(process.env) before any module loads.
// setupFiles run inside the Vitest worker before each test file is imported,
// so these values are available when env.ts executes its parse() call.
process.env["NODE_ENV"] = "test";
process.env["CONVEX_URL"] = "https://test.convex.cloud";
process.env["ANTHROPIC_API_KEY"] = "test-anthropic-key";
process.env["PORT"] = "3001";
