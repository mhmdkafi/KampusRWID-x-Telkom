import { authGuard } from "../../config/supabaseAuth.js";
import { me } from "./controller.js";

export async function authRoutes(fastify) {
  // Ganti dari /me jadi /auth/me
  fastify.get(
    "/auth/me",
    {
      preHandler: [authGuard()],
    },
    me
  );
}
