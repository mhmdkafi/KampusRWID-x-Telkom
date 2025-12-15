import { pool, withTransaction } from "../../config/db.js";
import { JobsRepository } from "./repository.js";

export class PgJobsRepository extends JobsRepository {
  async listAll({ limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT 
        id, title, company, location, skills, description,
        salary, benefits, experience_required, job_type, image_url,
        requirements, responsibilities, created_at, updated_at
      FROM jobs 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT 
        id, title, company, location, skills, description,
        salary, benefits, experience_required, job_type, image_url,
        requirements, responsibilities, created_at, updated_at
      FROM jobs 
      WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async bulkInsert(jobs) {
    return withTransaction(async (client) => {
      const text = `
        INSERT INTO jobs (
          title, company, location, skills, description,
          salary, benefits, experience_required, job_type, image_url,
          requirements, responsibilities
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      `;
      await Promise.all(
        jobs.map((j) =>
          client.query(text, [
            j.title,
            j.company,
            j.location ?? null,
            j.skills ?? [],
            j.description ?? null,
            j.salary ?? null,
            j.benefits ?? [],
            j.experience_required ?? null,
            j.job_type ?? "Full-time",
            j.image_url ?? null,
            j.requirements ?? [],
            j.responsibilities ?? [],
          ])
        )
      );
    });
  }

  async update(id, jobData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(jobData).forEach((key) => {
      if (jobData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(jobData[key]);
        paramCount++;
      }
    });

    values.push(id);

    const { rows } = await pool.query(
      `UPDATE jobs SET ${fields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return rows[0];
  }

  async delete(id) {
    await pool.query("DELETE FROM jobs WHERE id = $1", [id]);
  }

  // Saved Jobs Methods
  async saveJob(userId, jobId) {
    const { rows } = await pool.query(
      `INSERT INTO saved_jobs (user_id, job_id) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, job_id) DO NOTHING
       RETURNING *`,
      [userId, jobId]
    );
    return rows[0];
  }

  async unsaveJob(userId, jobId) {
    await pool.query(
      "DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2",
      [userId, jobId]
    );
  }

  async getSavedJobs(userId) {
    const { rows } = await pool.query(
      `SELECT 
        j.id, j.title, j.company, j.location, j.skills, j.description,
        j.salary, j.benefits, j.experience_required, j.job_type, j.image_url,
        j.requirements, j.responsibilities, j.created_at, j.updated_at,
        s.created_at as saved_at
      FROM saved_jobs s
      JOIN jobs j ON s.job_id = j.id
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC`,
      [userId]
    );
    return rows;
  }

  async isSaved(userId, jobId) {
    const { rows } = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM saved_jobs WHERE user_id = $1 AND job_id = $2) as is_saved",
      [userId, jobId]
    );
    return rows[0]?.is_saved || false;
  }
}
