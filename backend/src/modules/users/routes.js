import { authGuard } from "../../config/supabaseAuth.js";
import { roleGuard } from "../../config/roleGuard.js";
import { UsersService } from "./service.js";

const usersService = new UsersService();

export async function usersRoutes(fastify) {
  // Get all users (admin only)
  fastify.get(
    "/users",
    {
      preHandler: [authGuard(), roleGuard(["admin"])],
    },
    async (request, reply) => {
      try {
        const users = await usersService.getAllUsers();
        return { users };
      } catch (error) {
        request.log.error({ error: error.message }, "Get users failed");
        return reply.code(500).send({ error: "Failed to fetch users" });
      }
    }
  );

  // Update user role (admin only)
  fastify.patch(
    "/users/:userId/role",
    {
      preHandler: [authGuard(), roleGuard(["admin"])],
    },
    async (request, reply) => {
      const { userId } = request.params;
      const { newRole } = request.body;
      const requestUserId = request.user?.sub || request.user?.id;

      try {
        const user = await usersService.updateUserRole(
          userId,
          newRole,
          requestUserId
        );

        return {
          user,
          message: "Role updated successfully",
        };
      } catch (error) {
        request.log.error({ error: error.message }, "Update user role failed");

        const status = error.status || 500;
        return reply.code(status).send({ error: error.message });
      }
    }
  );

  // Delete user (admin only)
  fastify.delete(
    "/users/:userId",
    {
      preHandler: [authGuard(), roleGuard(["admin"])],
    },
    async (request, reply) => {
      const { userId } = request.params;
      const requestUserId = request.user?.sub || request.user?.id;

      try {
        await usersService.deleteUser(userId, requestUserId);

        return { message: "User deleted successfully" };
      } catch (error) {
        request.log.error({ error: error.message }, "Delete user failed");

        const status = error.status || 500;
        return reply.code(status).send({ error: error.message });
      }
    }
  );
}
