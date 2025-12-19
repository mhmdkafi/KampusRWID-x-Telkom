import { supabase } from "../../config/supabase.js";

export class CVRepository {
  async saveCVRecord(userId, filename, storagePath, textContent = null) {
    // Cek apakah user sudah punya CV, jika ya update
    const { data: existing } = await supabase
      .from("cvs")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      // Update CV yang sudah ada
      const { data, error } = await supabase
        .from("cvs")
        .update({
          filename,
          storage_path: storagePath,
          created_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .maybeSingle();

      if (error) throw new Error(`Failed to update CV: ${error.message}`);
      return data;
    } else {
      // Insert CV baru
      const { data, error } = await supabase
        .from("cvs")
        .insert({
          user_id: userId,
          filename,
          storage_path: storagePath,
        })
        .select()
        .maybeSingle();

      if (error) throw new Error(`Failed to save CV: ${error.message}`);
      return data;
    }
  }

  async getUserCV(userId) {
    const { data, error } = await supabase
      .from("cvs")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(`Failed to get CV: ${error.message}`);
    return data;
  }
}
