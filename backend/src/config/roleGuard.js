import { PgUsersRepository } from "../modules/users/repository.pg.js";

const usersRepo = new PgUsersRepository();

export function roleGuard(allowedRoles = []) {
  return async function (request, reply) {
    const userId = request.user?.sub;
    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const user = await usersRepo.findById(userId);
    if (!user) {
      return reply.code(403).send({ message: "User tidak ditemukan" });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return reply.code(403).send({
        message: `Akses ditolak. Role dibutuhkan: ${allowedRoles.join(", ")}`,
      });
    }

    // Simpan user data ke request
    request.userRole = user.role;
    request.userData = user;
  };
}
