import { ConvexHttpClient } from "convex/browser";
import { env } from "./env.js";

export const convexClient = new ConvexHttpClient(env.CONVEX_URL);
