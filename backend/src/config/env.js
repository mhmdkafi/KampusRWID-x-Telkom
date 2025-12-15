import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 4000),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "http://localhost:3000",

  DATABASE_URL: process.env.DATABASE_URL,

  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // ML service (HTTP)
  ML_ENDPOINT: process.env.ML_ENDPOINT || "",
  ML_API_KEY: process.env.ML_API_KEY || "",

  STORAGE_BUCKET: process.env.STORAGE_BUCKET || "cv-files",
};

if (!env.DATABASE_URL) console.warn("[env] DATABASE_URL belum di-set");
if (!env.SUPABASE_URL) console.warn("[env] SUPABASE_URL belum di-set");
if (!env.SUPABASE_SERVICE_ROLE_KEY)
  console.warn("[env] SUPABASE_SERVICE_ROLE_KEY belum di-set");
