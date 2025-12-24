import { supabaseAuth } from "../../config/supabaseAuth.js";
import { requireRole } from "../../config/roleGuard.js";
import {
  getJobs,
  getJobsCount,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  saveJob,
  unsaveJob,
  getSavedJobs,
  seedJobs,
} from "./controller.js";

export default async function jobsRoutes(fastify) {
  // PENTING: /jobs/count HARUS SEBELUM /jobs/:id
  // Karena Express/Fastify match dari atas ke bawah
  fastify.get("/jobs/count", getJobsCount);

  // List all jobs (with pagination)
  fastify.get("/jobs", getJobs);

  // Public routes - GET by ID harus SETELAH /jobs/count
  fastify.get("/jobs/:id", getJobById);

  // Protected routes - Save/Unsave jobs
  fastify.post("/jobs/save", {
    preHandler: [supabaseAuth],
    handler: saveJob,
  });

  fastify.delete("/jobs/save/:job_id", {
    preHandler: [supabaseAuth],
    handler: unsaveJob,
  });

  fastify.get("/jobs/saved/all", {
    preHandler: [supabaseAuth],
    handler: getSavedJobs,
  });

  // Admin only routes
  fastify.post("/jobs", {
    preHandler: [supabaseAuth, requireRole("admin")],
    handler: createJob,
  });

  fastify.put("/jobs/:id", {
    preHandler: [supabaseAuth, requireRole("admin")],
    handler: updateJob,
  });

  fastify.delete("/jobs/:id", {
    preHandler: [supabaseAuth, requireRole("admin")],
    handler: deleteJob,
  });

  fastify.post("/jobs/seed", {
    preHandler: [supabaseAuth, requireRole("admin")],
    handler: seedJobs,
  });
}
