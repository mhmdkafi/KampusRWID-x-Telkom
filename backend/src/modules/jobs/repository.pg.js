import { supabase } from "../../config/supabase.js";

export class PgJobsRepository {
  async listAll({ limit = 10, offset = 0 } = {}) {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to list jobs: ${error.message}`);
    return data || [];
  }

  async findById(id) {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to find job: ${error.message}`);
    return data || null;
  }

  async create(jobData) {
    const { data, error } = await supabase
      .from("jobs")
      .insert([jobData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create job: ${error.message}`);
    return data;
  }

  async bulkInsert(jobs) {
    const { error } = await supabase.from("jobs").insert(jobs);

    if (error) throw new Error(`Failed to bulk insert jobs: ${error.message}`);
  }

  async update(id, jobData) {
    const { data, error } = await supabase
      .from("jobs")
      .update(jobData)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw new Error(`Failed to update job: ${error.message}`);
    return data || null;
  }

  async delete(id) {
    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete job: ${error.message}`);
  }

  async getCount() {
    const { count, error } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true });

    if (error) throw new Error(`Failed to get jobs count: ${error.message}`);
    return count || 0;
  }

  // Saved Jobs Methods
  async saveJob(userId, jobId) {
    const { data, error } = await supabase
      .from("saved_jobs")
      .insert({ user_id: userId, job_id: jobId })
      .select()
      .maybeSingle();

    // Ignore unique constraint violation (23505)
    if (error && error.code !== "23505") {
      throw new Error(`Failed to save job: ${error.message}`);
    }

    return data || { user_id: userId, job_id: jobId };
  }

  async unsaveJob(userId, jobId) {
    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("user_id", userId)
      .eq("job_id", jobId);

    if (error) throw new Error(`Failed to unsave job: ${error.message}`);
  }

  async getSavedJobs(userId) {
    const { data, error } = await supabase
      .from("saved_jobs")
      .select(
        `
        id,
        created_at,
        job:jobs (*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to get saved jobs: ${error.message}`);

    // Extract jobs from join result
    const jobs = (data || []).map((row) => row.job).filter(Boolean);
    return jobs;
  }

  async getSavedJobIds(userId) {
    const { data, error } = await supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to get saved job IDs: ${error.message}`);

    const savedJobIds = new Set();
    if (data) {
      data.forEach((item) => savedJobIds.add(item.job_id));
    }

    return savedJobIds;
  }

  async isSaved(userId, jobId) {
    const { data, error } = await supabase
      .from("saved_jobs")
      .select("id")
      .eq("user_id", userId)
      .eq("job_id", jobId)
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to check if job is saved: ${error.message}`);
    }

    return !!data;
  }
}
