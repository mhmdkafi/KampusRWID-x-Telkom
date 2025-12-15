import { uploadAndMatch } from "./controller.js";

export async function cvRoutes(fastify) {
  fastify.post(
    "/cv/match",
    { preHandler: uploadAndMatch[0] },
    uploadAndMatch[1]
  );
}
