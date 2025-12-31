import { authGuard } from "../../config/supabaseAuth.js";
import { MatchingService } from "./service.js";

const matchingService = new MatchingService();

export const saveRecommendations = [
  authGuard(),
  async (request, reply) => {
    const userId = request.user?.sub || request.user?.id;
    const { cv_id, recommendations, cv_analysis } = request.body;

    try {
      const result = await matchingService.saveRecommendations(
        userId,
        cv_id,
        recommendations,
        cv_analysis
      );

      return {
        message: "Recommendations saved successfully",
        recommendation: result,
      };
    } catch (error) {
      request.log.error(
        { error: error.message },
        "Save recommendations failed"
      );

      const status = error.status || 500;
      return reply.code(status).send({
        error: error.message || "Failed to save recommendations",
      });
    }
  },
];

export const getLatestRecommendations = [
  authGuard(),
  async (request, reply) => {
    const userId = request.user?.sub || request.user?.id;

    try {
      const recommendation = await matchingService.getLatestRecommendations(
        userId
      );

      return {
        recommendation,
      };
    } catch (error) {
      request.log.error({ error: error.message }, "Get recommendations failed");

      return reply.code(500).send({
        error: "Failed to get recommendations",
      });
    }
  },
];
