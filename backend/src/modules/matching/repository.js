import { supabase } from "../../config/supabase.js";

export class MatchingRepository {
  async saveRecommendations(userId, cvId, recommendations, cvAnalysis) {
    // Check if already exists for this cv_id
    const { data: existing } = await supabase
      .from("job_recommendations")
      .select("id")
      .eq("user_id", userId)
      .eq("cv_id", cvId)
      .maybeSingle();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("job_recommendations")
        .update({
          recommendations,
          cv_analysis: cvAnalysis,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update recommendations: ${error.message}`);
      return data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from("job_recommendations")
        .insert({
          user_id: userId,
          cv_id: cvId,
          recommendations,
          cv_analysis: cvAnalysis,
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to save recommendations: ${error.message}`);
      return data;
    }
  }

  async getLatestRecommendations(userId) {
    const { data, error } = await supabase
      .from("job_recommendations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }

    return data;
  }

  async getRecommendationsByCvId(userId, cvId) {
    const { data, error } = await supabase
      .from("job_recommendations")
      .select("*")
      .eq("user_id", userId)
      .eq("cv_id", cvId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get recommendations by CV: ${error.message}`);
    }

    return data;
  }

  async deleteRecommendations(userId, cvId) {
    const { error } = await supabase
      .from("job_recommendations")
      .delete()
      .eq("user_id", userId)
      .eq("cv_id", cvId);

    if (error) throw new Error(`Failed to delete recommendations: ${error.message}`);
  }
}