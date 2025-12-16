import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { env } from "./config/env.js";
import { httpErrorHandler } from "./core/httpErrorHandler.js";

import { healthRoutes } from "./modules/health/routes.js";
import { authRoutes } from "./modules/auth/routes.js";
import jobsRoutes from "./modules/jobs/routes.js";
import { cvRoutes } from "./modules/cv/routes.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.setErrorHandler(httpErrorHandler);
  app.register(cors, { origin: env.FRONTEND_ORIGIN, credentials: true });
  app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

  app.register(healthRoutes);
  app.register(jobsRoutes, { prefix: "/api" });
  app.register(cvRoutes, { prefix: "/api" });
  app.register(authRoutes, { prefix: "/api" });

  return app;
}
