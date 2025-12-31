import { PgUsersRepository } from "./repository.pg.js";
import { NotFoundError, DomainError } from "../../core/errors.js";

export class UsersService {
  constructor() {
    this.usersRepo = new PgUsersRepository();
  }

  async getAllUsers() {
    return await this.usersRepo.listAll();
  }

  async getUserById(userId) {
    const user = await this.usersRepo.findById(userId);
    
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async updateUserRole(userId, newRole, requestUserId) {
    // Prevent self-role change
    if (userId === requestUserId) {
      throw new DomainError("Cannot change your own role");
    }

    if (!['user', 'admin'].includes(newRole)) {
      throw new DomainError("Invalid role. Must be 'user' or 'admin'");
    }

    await this.usersRepo.updateRole(userId, newRole);
    
    return await this.getUserById(userId);
  }

  async deleteUser(userId, requestUserId) {
    // Prevent self-delete
    if (userId === requestUserId) {
      throw new DomainError("Cannot delete yourself");
    }

    await this.usersRepo.delete(userId);
    
    return { success: true };
  }

  async ensureUserExists(userId, email, fullName) {
    const existing = await this.usersRepo.findById(userId);
    
    if (!existing) {
      await this.usersRepo.create({
        id: userId,
        email,
        full_name: fullName,
        role: 'user',
      });
    }

    return await this.getUserById(userId);
  }
}