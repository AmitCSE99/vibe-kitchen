import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { serve } from "inngest/express";
import { router } from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { inngest } from "./config/inngest.js";
import { functions as inngestFunctions } from "./inngest/index.js";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: "http://localhost:3000" }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  app.use(
    "/api/inngest",
    serve({ client: inngest, functions: inngestFunctions })
  );

  app.use("/api", router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
