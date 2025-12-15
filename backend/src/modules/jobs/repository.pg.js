import { pool, withTransaction } from "../../config/db.js";
import { JobsRepository } from "./repository.js";

export class PgJobsRepository extends JobsRepository {
  async listAll({ limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      "SELECT id, title, company, location, skills, description FROM jobs ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return rows;
  }

  async bulkInsert(jobs) {
    return withTransaction(async (client) => {
      const text =
        "INSERT INTO jobs (title, company, location, skills, description) VALUES ($1,$2,$3,$4,$5)";
      await Promise.all(
        jobs.map((j) =>
          client.query(text, [
            j.title,
            j.company,
            j.location ?? null,
            j.skills ?? [],
            j.description ?? null,
          ])
        )
      );
    });
  }
}
