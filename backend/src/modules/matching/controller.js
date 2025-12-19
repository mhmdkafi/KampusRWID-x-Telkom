import { supabase } from "../../config/supabase.js";

export const saveRecommendations = async (request, reply) => {
  const userId = request.user?.sub || request.user?.id;
  const { cv_id, recommendations, cv_analysis } = request.body;

  if (!cv_id || !recommendations || !Array.isArray(recommendations)) {
    return reply.code(400).send({
      error: "cv_id and recommendations array required",
    });
  }

  try {
    // Check if already exists for this cv_id
    const { data: existing } = await supabase
      .from("job_recommendations")
      .select("id")
      .eq("user_id", userId)
      .eq("cv_id", cv_id)
      .maybeSingle();

    let result;

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("job_recommendations")
        .update({
          recommendations,
          cv_analysis,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from("job_recommendations")
        .insert({
          user_id: userId,
          cv_id,
          recommendations,
          cv_analysis,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return {
      message: "Recommendations saved successfully",
      recommendation: result,
    };
  } catch (error) {
    console.error("Save recommendations error:", error);
    return reply.code(500).send({
      error: "Failed to save recommendations",
      message: error.message,
    });
  }
};

export const getLatestRecommendations = async (request, reply) => {
  const userId = request.user?.sub || request.user?.id;

  try {
    const { data, error } = await supabase
      .from("job_recommendations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return {
      recommendation: data,
    };
  } catch (error) {
    console.error("Get recommendations error:", error);
    return reply.code(500).send({
      error: "Failed to get recommendations",
      message: error.message,
    });
  }
};