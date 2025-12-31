import { saveRecommendations, getLatestRecommendations } from "./controller.js";

export default async function recommendationsRoutes(fastify) {
  fastify.post(
    "/recommendations",
    { preHandler: saveRecommendations[0] },
    saveRecommendations[1]
  );

  fastify.get(
    "/recommendations/latest",
    { preHandler: getLatestRecommendations[0] },
    getLatestRecommendations[1]
  );
}
