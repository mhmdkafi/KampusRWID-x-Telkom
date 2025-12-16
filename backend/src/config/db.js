import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

const connectionConfig = {
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
  options: "-c search_path=public",
};

export const pool = new Pool(connectionConfig);

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err);
});

// Pool akan connect otomatis saat ada query pertama

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
