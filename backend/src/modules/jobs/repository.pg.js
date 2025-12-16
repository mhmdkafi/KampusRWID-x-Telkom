import { supabase } from "../../config/supabase.js";
import { pool, withTransaction } from "../../config/db.js";
import { JobsRepository } from "./repository.js";

export class PgJobsRepository extends JobsRepository {
  async listAll({ limit = 50, offset = 0 } = {}) {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, title, company, location, skills, description, salary, benefits, experience_required, job_type, image_url, requirements, responsibilities, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  async findById(id) {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, title, company, location, skills, description, salary, benefits, experience_required, job_type, image_url, requirements, responsibilities, created_at, updated_at"
      )
      .eq("id", id)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  async bulkInsert(jobs) {
    const { error } = await supabase.from("jobs").insert(jobs);
    if (error) throw error;
  }

  async update(id, jobData) {
    const { data, error } = await supabase
      .from("jobs")
      .update(jobData)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async delete(id) {
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) throw error;
  }

  // Saved Jobs Methods
  async saveJob(userId, jobId) {
    const { data, error } = await supabase
      .from("saved_jobs")
      .insert({ user_id: userId, job_id: jobId })
      .select()
      .maybeSingle();
    if (error && error.code !== "23505") throw error; // ignore unique violation
    return data || { user_id: userId, job_id: jobId };
  }

  async unsaveJob(userId, jobId) {
    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("user_id", userId)
      .eq("job_id", jobId);
    if (error) throw error;
  }

  async getSavedJobs(userId) {
    // Ambil saved_jobs + join job detail dalam 1 query
    const { data, error } = await supabase
      .from("saved_jobs")
      .select(`
        id,
        created_at,
        job:jobs (
          id, title, company, location, skills, description, salary, benefits,
          experience_required, job_type, image_url, requirements, responsibilities,
          created_at, updated_at
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`getSavedJobs error: ${error.message}`);

    // Flatten ke array job
    const jobs = (data || [])
      .map((row) => row.job)
      .filter(Boolean);

    return jobs;
  }

  async isSaved(userId, jobId) {
    const { data, error } = await supabase
      .from("saved_jobs")
      .select("id")
      .eq("user_id", userId)
      .eq("job_id", jobId)
      .limit(1);

    if (error) throw new Error(`isSaved error: ${error.message}`);
    return Array.isArray(data) && data.length > 0;
  }

  async isSaved(userId, jobId) {
    const { rows } = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM saved_jobs WHERE user_id = $1 AND job_id = $2) as is_saved",
      [userId, jobId]
    );
    return rows[0]?.is_saved || false;
  }
}
