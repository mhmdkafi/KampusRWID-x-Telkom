import { supabaseAuth } from "../../config/supabaseAuth.js";
import {
  saveRecommendations,
  getLatestRecommendations,
} from "./controller.js";

export default async function recommendationsRoutes(fastify) {
  fastify.post("/recommendations", {
    preHandler: [supabaseAuth],
    handler: saveRecommendations,
  });

  fastify.get("/recommendations/latest", {
    preHandler: [supabaseAuth],
    handler: getLatestRecommendations,
  });
}