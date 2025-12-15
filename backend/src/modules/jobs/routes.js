import { getJobs, createJob } from "./controller.js";
import { authGuard } from "../../config/supabaseAuth.js";
import { roleGuard } from "../../config/roleGuard.js";

export async function jobsRoutes(fastify) {
  // Public: list jobs (semua bisa akses)
  fastify.get("/jobs", getJobs);

  // Protected: create job (admin only)
  fastify.post(
    "/jobs",
    {
      preHandler: [authGuard(), roleGuard(["admin"])],
    },
    createJob
  );
}
