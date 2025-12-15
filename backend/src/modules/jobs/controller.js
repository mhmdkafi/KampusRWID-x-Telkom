import { PgJobsRepository } from "./repository.pg.js";
import { makeListJobs } from "./listjobs.js";

const jobsRepo = new PgJobsRepository();
const listJobs = makeListJobs({ jobsRepo });

export const getJobs = async () => {
  const jobs = await listJobs();
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

// Insert 1 job dari frontend atau Postman
export const createJob = async (request, reply) => {
  const { title, company, location, skills, description } = request.body || {};

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
  };

  await jobsRepo.bulkInsert([job]);

  return {
    message: "Job berhasil ditambahkan",
    job,
  };
};
