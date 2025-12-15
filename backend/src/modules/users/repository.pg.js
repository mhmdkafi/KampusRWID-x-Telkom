import { pool } from "../../config/db.js";
import { UsersRepository } from "./repository.js";

export class PgUsersRepository extends UsersRepository {
  async findById(userId) {
    const { rows } = await pool.query(
      "SELECT id, email, full_name, role FROM users WHERE id = $1",
      [userId]
    );
    return rows[0] || null;
  }

  async updateRole(userId, role) {
    await pool.query(
      "UPDATE users SET role = $1, updated_at = now() WHERE id = $2",
      [role, userId]
    );
  }
}
