import { PgJobsRepository } from "./repository.pg.js";
import { makeListJobs } from "./listjobs.js";
import { supabase } from "../../config/supabase.js";
import { CVRepository } from "../cv/repository.js";

const jobsRepo = new PgJobsRepository();
const cvRepo = new CVRepository();
const listJobs = makeListJobs({ jobsRepo });

export const getJobs = async (request, reply) => {
  const { user_id } = request.query;
  const jobs = await listJobs();

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
    application_url, // ADD: Tambahkan ini
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
  const userId = request.user?.sub || request.user?.id; // FIX: Support both

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
  const userId = request.user?.sub || request.user?.id; // FIX: Support both
  const jobs = await jobsRepo.getSavedJobs(userId);

  return { jobs };
};

// Job Applications Controllers
export const applyJob = async (request, reply) => {
  const { job_id, cover_letter } = request.body;
  const userId = request.user?.sub || request.user?.id;

  if (!job_id) {
    return reply.code(400).send({ error: "job_id required" });
  }

  try {
    // 1. Check if user has CV
    const userCV = await cvRepo.getUserCV(userId);

    if (!userCV) {
      return reply.code(400).send({
        error: "CV_REQUIRED",
        message: "Please upload your CV first before applying",
        redirect: "/matching",
      });
    }

    // 2. Check if already applied
    const { data: existing } = await supabase
      .from("job_applications")
      .select("id, status")
      .eq("user_id", userId)
      .eq("job_id", job_id)
      .maybeSingle();

    if (existing) {
      return reply.code(409).send({
        error: "ALREADY_APPLIED",
        message: "You have already applied to this job",
        application: existing,
      });
    }

    // 3. Create application
    const { data: application, error } = await supabase
      .from("job_applications")
      .insert({
        user_id: userId,
        job_id: job_id,
        cv_id: userCV.id,
        cover_letter: cover_letter || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    // 4. Get job details for confirmation
    const job = await jobsRepo.findById(job_id);

    return {
      message: "Application submitted successfully",
      application,
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
      },
    };
  } catch (error) {
    console.error("Apply job error:", error);
    return reply.code(500).send({
      error: "Failed to submit application",
      message: error.message,
    });
  }
};

export const getMyApplications = async (request, reply) => {
  const userId = request.user?.sub || request.user?.id;

  try {
    const { data, error } = await supabase
      .from("job_applications")
      .select(
        `
        id,
        job_id,
        status,
        cover_letter,
        applied_at,
        updated_at,
        job:jobs (
          id, title, company, location, salary, job_type, image_url
        )
      `
      )
      .eq("user_id", userId)
      .order("applied_at", { ascending: false });

    if (error) throw error;

    const applications = (data || []).map((app) => ({
      ...app,
      job: app.job || {},
    }));

    return { applications };
  } catch (error) {
    console.error("Get applications error:", error);
    return reply.code(500).send({
      error: "Failed to fetch applications",
    });
  }
};

export const checkApplicationStatus = async (request, reply) => {
  const { job_id } = request.params;
  const userId = request.user?.sub || request.user?.id;

  try {
    const { data, error } = await supabase
      .from("job_applications")
      .select("id, status, applied_at")
      .eq("user_id", userId)
      .eq("job_id", job_id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;

    return {
      applied: !!data,
      application: data || null,
    };
  } catch (error) {
    console.error("Check application error:", error);
    return reply.code(500).send({
      error: "Failed to check application status",
    });
  }
};

export const seedJobs = async (request) => {
  const { jobs } = request.body || {};

  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return { error: "jobs array kosong" };
  }

  await jobsRepo.bulkInsert(jobs);
  return { message: `${jobs.length} jobs inserted` };
};
