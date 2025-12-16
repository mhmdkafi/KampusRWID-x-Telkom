import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

// Parse connection string manually untuk force IPv4
const connectionConfig = {
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
  // Force IPv4 by setting family
  options: "-c search_path=public",
};

// Jika masih timeout, override host ke IP langsung
// Uncomment baris di bawah kalau masih error:
// connectionConfig.host = '13.229.188.88'; // IPv4 Supabase Singapore
// connectionConfig.port = 5432;
// connectionConfig.database = 'postgres';
// connectionConfig.user = 'postgres';
// connectionConfig.password = 'nauffalaja';
// delete connectionConfig.connectionString;

export const pool = new Pool(connectionConfig);

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err);
});

// Test connection on startup
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected successfully at", res.rows[0].now);
  }
});

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
