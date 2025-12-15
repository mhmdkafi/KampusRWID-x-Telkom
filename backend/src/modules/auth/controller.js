import { PgUsersRepository } from "../users/repository.pg.js";

const usersRepo = new PgUsersRepository();

export const me = async (request) => {
  const userId = request.user?.sub;
  const user = await usersRepo.findById(userId);

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
  };
};
