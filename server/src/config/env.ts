import { z } from "zod";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  CONVEX_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
