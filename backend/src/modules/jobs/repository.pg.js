import { supabase } from "../../config/supabase.js";
import { pool } from "../../config/db.js";
import { JobsRepository } from "./repository.js";

export class PgJobsRepository extends JobsRepository {
  async listAll({ limit = 50, offset = 0 } = {}) {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, title, company, location, skills, description, salary, job_type, image_url, requirements, responsibilities, application_url, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  async findById(id) {
    // Pastikan id adalah integer
    const jobId = parseInt(id, 10);
    if (isNaN(jobId)) {
      throw new Error("Invalid job ID");
    }

    // GUNAKAN SUPABASE UNTUK MENGHINDARI CONNECTION LEAK
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
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
    const { data, error } = await supabase
      .from("saved_jobs")
      .select(
        `
        id,
        created_at,
        job:jobs (
          id, title, company, location, skills, description, salary,
          job_type, image_url, requirements, responsibilities, application_url,
          created_at, updated_at
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`getSavedJobs error: ${error.message}`);

    const jobs = (data || []).map((row) => row.job).filter(Boolean);

    return jobs;
  }

  // FIX: Hapus duplicate, gunakan Supabase untuk konsistensi
  async isSaved(userId, jobId) {
    try {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("user_id", userId)
        .eq("job_id", jobId)
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("isSaved error:", error);
        return false; // Return false instead of throwing
      }

      return !!data;
    } catch (error) {
      console.error("isSaved catch error:", error);
      return false; // Return false on any error
    }
  }
}
