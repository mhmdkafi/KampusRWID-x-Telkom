import { PgJobsRepository } from "./repository.pg.js";
import { makeListJobs } from "./listjobs.js";
import { supabase } from "../../config/supabase.js";

const jobsRepo = new PgJobsRepository();
const listJobs = makeListJobs({ jobsRepo });

export const getJobs = async (request, reply) => {
  const { user_id, limit = 10, offset = 0 } = request.query;

  const parsedLimit = parseInt(limit, 10) || 10;
  const parsedOffset = parseInt(offset, 10) || 0;

  const jobs = await listJobs({ limit: parsedLimit, offset: parsedOffset });

  if (user_id) {
    try {
      // OPTIMASI: Batch check saved jobs
      const savedJobIds = new Set();

      // Get all saved job IDs for user in one query
      const { data: savedJobs } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", user_id);

      if (savedJobs) {
        savedJobs.forEach((item) => savedJobIds.add(item.job_id));
      }

      // Flag jobs based on saved set
      const flagged = jobs.map((job) => ({
        ...job,
        is_saved: savedJobIds.has(job.id),
      }));

      return { jobs: flagged };
    } catch (err) {
      // Jangan blokir daftar jobs; log saja
      request.log.warn({ err }, "isSaved check failed");
      return { jobs };
    }
  }

  return { jobs };
};

export const getJobById = async (request, reply) => {
  const { id } = request.params;
  const job = await jobsRepo.findById(id);

  if (!job) {
    return reply.code(404).send({ error: "Job not found" });
  }

  return { job };
};

export const createJob = async (request, reply) => {
  const {
    title,
    company,
    location,
    skills,
    description,
    salary,
    job_type,
    image_url,
    requirements,
    responsibilities,
    application_url,
  } = request.body || {};

  if (!title || !company) {
    return reply.code(400).send({
      error: "Title dan company wajib diisi",
    });
  }

  const job = {
    title,
    company,
    location: location || null,
    skills: Array.isArray(skills) ? skills : [],
    description: description || null,
    salary: salary || null,
    job_type: job_type || "Full-time",
    image_url: image_url || null,
    requirements: Array.isArray(requirements) ? requirements : [],
    responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
    application_url: application_url || null,
  };

  await jobsRepo.bulkInsert([job]);

  return {
    message: "Job berhasil ditambahkan",
    job,
  };
};

export const updateJob = async (request, reply) => {
  const { id } = request.params;
  const jobData = request.body;

  const updatedJob = await jobsRepo.update(id, jobData);

  if (!updatedJob) {
    return reply.code(404).send({ error: "Job not found" });
  }

  return {
    message: "Job berhasil diupdate",
    job: updatedJob,
  };
};

export const deleteJob = async (request, reply) => {
  const { id } = request.params;
  await jobsRepo.delete(id);

  return {
    message: "Job berhasil dihapus",
  };
};

// Saved Jobs Controllers
export const saveJob = async (request, reply) => {
  const { job_id } = request.body;
  const userId = request.user?.sub || request.user?.id;

  if (!job_id) {
    return reply.code(400).send({ error: "job_id required" });
  }

  const saved = await jobsRepo.saveJob(userId, job_id);

  return {
    message: "Job saved successfully",
    saved,
  };
};

export const unsaveJob = async (request, reply) => {
  const { job_id } = request.params;
  const userId = request.user?.sub || request.user?.id;

  console.log("🗑️ Unsave job request:", {
    job_id,
    userId,
    hasUser: !!request.user,
  });

  if (!userId) {
    console.error("❌ No userId found in request.user");
    return reply.code(401).send({ error: "Unauthorized" });
  }

  try {
    await jobsRepo.unsaveJob(userId, job_id);
    console.log("✅ Job unsaved successfully:", { job_id, userId });

    return {
      message: "Job unsaved successfully",
    };
  } catch (error) {
    console.error("❌ Unsave job error:", error);
    return reply.code(500).send({
      error: "Failed to unsave job",
      message: error.message,
    });
  }
};

export const getSavedJobs = async (request, reply) => {
  const userId = request.user?.sub || request.user?.id;
  const jobs = await jobsRepo.getSavedJobs(userId);

  return { jobs };
};

export const seedJobs = async (request) => {
  const { jobs } = request.body || {};

  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return { error: "jobs array kosong" };
  }

  await jobsRepo.bulkInsert(jobs);
  return { message: `${jobs.length} jobs inserted` };
};

// Ganti endpoint count tanpa authentication requirement
export const getJobsCount = async (request, reply) => {
  try {
    const { count, error } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    return { count: count || 0 };
  } catch (error) {
    request.log.error({ error }, "Failed to get jobs count");
    return reply.code(500).send({ error: "Failed to get jobs count" });
  }
};
