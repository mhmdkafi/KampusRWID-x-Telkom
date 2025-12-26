import { authGuard } from "../../config/supabaseAuth.js";
import { me, resetPassword } from "./controller.js";

export async function authRoutes(fastify) {
  // Get current user
  fastify.get(
    "/auth/me",
    {
      preHandler: [authGuard()],
    },
    me
  );

  // Reset password (public endpoint)
  fastify.post("/auth/reset-password", resetPassword);
}
