import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

// Pool configuration (fallback untuk transaction kompleks)
const connectionConfig = {
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 5, // Reduce dari 10 karena jarang dipakai
  options: "-c search_path=public",
};

export const pool = new Pool(connectionConfig);

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err);
});

/**
 * Execute work within a database transaction
 * @param {Function} work - Async function that receives client as parameter
 * @returns {Promise<any>} Result from work function
 */
export async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
