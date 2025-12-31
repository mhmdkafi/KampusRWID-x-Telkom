import { PgJobsRepository } from "./repository.pg.js";
import { NotFoundError, DomainError } from "../../core/errors.js";

export class JobsService {
  constructor() {
    this.jobsRepo = new PgJobsRepository();
  }

  async listJobs({ limit = 10, offset = 0, userId = null }) {
    const parsedLimit = parseInt(limit, 10) || 10;
    const parsedOffset = parseInt(offset, 10) || 0;

    const jobs = await this.jobsRepo.listAll({ 
      limit: parsedLimit, 
      offset: parsedOffset 
    });

    // If userId provided, flag saved jobs
    if (userId) {
      const savedJobIds = await this.jobsRepo.getSavedJobIds(userId);
      return jobs.map((job) => ({
        ...job,
        is_saved: savedJobIds.has(job.id),
      }));
    }

    return jobs;
  }

  async getJobById(jobId) {
    const job = await this.jobsRepo.findById(jobId);

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    return job;
  }

  async createJob(jobData) {
    const { title, company } = jobData;

    if (!title || !company) {
      throw new DomainError("Title and company are required");
    }

    const job = {
      title,
      company,
      location: jobData.location || null,
      skills: Array.isArray(jobData.skills) ? jobData.skills : [],
      description: jobData.description || null,
      salary: jobData.salary || null,
      job_type: jobData.job_type || "Full-time",
      image_url: jobData.image_url || null,
      requirements: Array.isArray(jobData.requirements) ? jobData.requirements : [],
      responsibilities: Array.isArray(jobData.responsibilities) ? jobData.responsibilities : [],
      application_url: jobData.application_url || null,
    };

    const created = await this.jobsRepo.create(job);
    return created;
  }

  async updateJob(jobId, jobData) {
    const updatedJob = await this.jobsRepo.update(jobId, jobData);

    if (!updatedJob) {
      throw new NotFoundError("Job not found");
    }

    return updatedJob;
  }

  async deleteJob(jobId) {
    await this.jobsRepo.delete(jobId);
    return { success: true };
  }

  async saveJob(userId, jobId) {
    if (!jobId) {
      throw new DomainError("job_id is required");
    }

    const saved = await this.jobsRepo.saveJob(userId, jobId);
    return saved;
  }

  async unsaveJob(userId, jobId) {
    await this.jobsRepo.unsaveJob(userId, jobId);
    return { success: true };
  }

  async getSavedJobs(userId) {
    return await this.jobsRepo.getSavedJobs(userId);
  }

  async seedJobs(jobs) {
    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      throw new DomainError("Jobs array is empty");
    }

    await this.jobsRepo.bulkInsert(jobs);
    return { count: jobs.length };
  }

  async getJobsCount() {
    return await this.jobsRepo.getCount();
  }
}