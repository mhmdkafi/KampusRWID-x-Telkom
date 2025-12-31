import { JobsService } from "./service.js";

const jobsService = new JobsService();

export const getJobs = async (request, reply) => {
  const { user_id, limit = 10, offset = 0 } = request.query;

  try {
    const jobs = await jobsService.listJobs({
      limit,
      offset,
      userId: user_id,
    });

    return { jobs };
  } catch (error) {
    request.log.error({ error: error.message }, "Get jobs failed");
    return reply.code(500).send({ error: "Failed to get jobs" });
  }
};

export const getJobById = async (request, reply) => {
  const { id } = request.params;

  try {
    const job = await jobsService.getJobById(id);
    return { job };
  } catch (error) {
    request.log.error({ error: error.message }, "Get job by ID failed");

    const status = error.status || 500;
    return reply.code(status).send({ error: error.message });
  }
};

export const createJob = async (request, reply) => {
  try {
    const job = await jobsService.createJob(request.body);

    return {
      message: "Job created successfully",
      job,
    };
  } catch (error) {
    request.log.error({ error: error.message }, "Create job failed");

    const status = error.status || 500;
    return reply.code(status).send({ error: error.message });
  }
};

export const updateJob = async (request, reply) => {
  const { id } = request.params;

  try {
    const job = await jobsService.updateJob(id, request.body);

    return {
      message: "Job updated successfully",
      job,
    };
  } catch (error) {
    request.log.error({ error: error.message }, "Update job failed");

    const status = error.status || 500;
    return reply.code(status).send({ error: error.message });
  }
};

export const deleteJob = async (request, reply) => {
  const { id } = request.params;

  try {
    await jobsService.deleteJob(id);

    return {
      message: "Job deleted successfully",
    };
  } catch (error) {
    request.log.error({ error: error.message }, "Delete job failed");

    return reply.code(500).send({ error: "Failed to delete job" });
  }
};

// Saved Jobs Controllers
export const saveJob = async (request, reply) => {
  const { job_id } = request.body;
  const userId = request.user?.sub || request.user?.id;

  try {
    const saved = await jobsService.saveJob(userId, job_id);

    return {
      message: "Job saved successfully",
      saved,
    };
  } catch (error) {
    request.log.error({ error: error.message }, "Save job failed");

    const status = error.status || 500;
    return reply.code(status).send({ error: error.message });
  }
};

export const unsaveJob = async (request, reply) => {
  const { job_id } = request.params;
  const userId = request.user?.sub || request.user?.id;

  if (!userId) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  try {
    await jobsService.unsaveJob(userId, job_id);
    request.log.info({ jobId: job_id, userId }, "Job unsaved successfully");

    return {
      message: "Job unsaved successfully",
    };
  } catch (error) {
    request.log.error({ error: error.message }, "Unsave job failed");

    return reply.code(500).send({
      error: "Failed to unsave job",
    });
  }
};

export const getSavedJobs = async (request, reply) => {
  const userId = request.user?.sub || request.user?.id;

  try {
    const jobs = await jobsService.getSavedJobs(userId);
    return { jobs };
  } catch (error) {
    request.log.error({ error: error.message }, "Get saved jobs failed");

    return reply.code(500).send({ error: "Failed to get saved jobs" });
  }
};

export const seedJobs = async (request, reply) => {
  try {
    const result = await jobsService.seedJobs(request.body?.jobs);

    return { message: `${result.count} jobs inserted` };
  } catch (error) {
    request.log.error({ error: error.message }, "Seed jobs failed");

    const status = error.status || 500;
    return reply.code(status).send({ error: error.message });
  }
};

export const getJobsCount = async (request, reply) => {
  try {
    const count = await jobsService.getJobsCount();
    return { count };
  } catch (error) {
    request.log.error({ error: error.message }, "Get jobs count failed");

    return reply.code(500).send({ error: "Failed to get jobs count" });
  }
};
