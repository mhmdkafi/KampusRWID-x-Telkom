import { supabase } from "../../config/supabase.js";

export class CVRepository {
  async saveCVRecord(userId, filename, storagePath, textContent = null) {
    // Check if user already has CV
    const { data: existing } = await supabase
      .from("cvs")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      // Update existing CV
      const { data, error } = await supabase
        .from("cvs")
        .update({
          filename,
          storage_path: storagePath,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update CV: ${error.message}`);
      }

      return data;
    } else {
      // Insert new CV
      const { data, error } = await supabase
        .from("cvs")
        .insert({
          user_id: userId,
          filename,
          storage_path: storagePath,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save CV: ${error.message}`);
      }

      return data;
    }
  }

  async getUserCV(userId) {
    const { data, error } = await supabase
      .from("cvs")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to get CV: ${error.message}`);
    }

    return data;
  }

  async getCVById(cvId) {
    const { data, error } = await supabase
      .from("cvs")
      .select("*")
      .eq("id", cvId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to get CV by ID: ${error.message}`);
    }

    return data;
  }

  async deleteCV(cvId) {
    const { error } = await supabase.from("cvs").delete().eq("id", cvId);

    if (error) {
      throw new Error(`Failed to delete CV: ${error.message}`);
    }

    return true;
  }

  async deleteCVsByUserId(userId) {
    const { error } = await supabase.from("cvs").delete().eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete user CVs: ${error.message}`);
    }

    return true;
  }

  async listAll({ limit = 100, offset = 0 }) {
    const { data, error } = await supabase
      .from("cvs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list CVs: ${error.message}`);
    }

    return data || [];
  }
}
