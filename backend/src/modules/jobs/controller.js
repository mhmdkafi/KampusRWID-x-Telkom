import { PgJobsRepository } from "./repository.pg.js";
import { makeListJobs } from "./listjobs.js";

const jobsRepo = new PgJobsRepository();
const listJobs = makeListJobs({ jobsRepo });

export const getJobs = async (request, reply) => {
  const { user_id } = request.query;
  const jobs = await listJobs();

  // If user_id provided, check which jobs are saved
  if (user_id) {
    const jobsWithSaveStatus = await Promise.all(
      jobs.map(async (job) => ({
        ...job,
        is_saved: await jobsRepo.isSaved(user_id, job.id),
      }))
    );
    return { jobs: jobsWithSaveStatus };
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
    benefits,
    experience_required,
    job_type,
    image_url,
    requirements,
    responsibilities,
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
    benefits: Array.isArray(benefits) ? benefits : [],
    experience_required: experience_required || null,
    job_type: job_type || "Full-time",
    image_url: image_url || null,
    requirements: Array.isArray(requirements) ? requirements : [],
    responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
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
  const userId = request.user.id; // From auth middleware

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
  const userId = request.user.id;

  await jobsRepo.unsaveJob(userId, job_id);

  return {
    message: "Job unsaved successfully",
  };
};

export const getSavedJobs = async (request, reply) => {
  const userId = request.user.id;
  const jobs = await jobsRepo.getSavedJobs(userId);

  return { jobs };
};

export const seedJobs = async (request) => {
  const { jobs } = request.body || {};

  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return { error: "Body harus berisi array jobs" };
  }

  await jobsRepo.bulkInsert(jobs);
  return { message: "Seed berhasil", count: jobs.length };
};
