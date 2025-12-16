import { authGuard } from "../../config/supabaseAuth.js";
import { SupabaseStorage } from "../../infrastructure/storage/supabaseStorage.js";
import { PgJobsRepository } from "../jobs/repository.pg.js";
import { CVRepository } from "./repository.js";
import { HttpMLProvider } from "../../infrastructure/ml/httpMLProvider.js";
import { MockMLProvider } from "../../infrastructure/ml/mockMLProvider.js";
import { env } from "../../config/env.js";

const storage = new SupabaseStorage(env.STORAGE_BUCKET);
const jobsRepo = new PgJobsRepository();
const cvRepo = new CVRepository();
const ml = env.ML_ENDPOINT ? new HttpMLProvider({}) : new MockMLProvider();

export const uploadAndMatch = [
  authGuard(),
  async function handler(request, reply) {
    const file = await request.file();
    if (!file) return reply.code(400).send({ message: "File wajib di-upload" });

    const userId = request.user?.sub || request.user?.id;
    if (!userId) {
      return reply.code(401).send({ message: "User ID tidak ditemukan" });
    }

    const safeName = file.filename.replace(/\s+/g, "_");
    const path = `${userId}/${Date.now()}-${safeName}`;

    try {
      // 1) Upload ke Supabase Storage
      const storagePath = await storage.upload(file.file, {
        path,
        contentType: file.mimetype,
      });

      // 2) Simpan record CV ke database (replace jika sudah ada)
      const cvRecord = await cvRepo.saveCVRecord(
        userId,
        file.filename,
        storagePath,
        null // text_content bisa diisi nanti setelah parsing PDF
      );

      console.log(`✅ CV saved to DB for user ${userId}:`, cvRecord.id);

      // 3) Dapatkan URL
      let cvUrl = storage.getPublicUrl(storagePath);
      if (!cvUrl) {
        cvUrl = await storage.createSignedUrl(storagePath, 3600);
      }

      // 4) Ambil jobs dari DB
      const jobs = await jobsRepo.listAll({ limit: 200, offset: 0 });

      // 5) Return success (matching akan dilakukan di frontend)
      return reply.send({
        success: true,
        cv_id: cvRecord.id,
        storage_path: storagePath,
        cv_url: cvUrl,
        filename: file.filename,
        jobs_count: jobs.length,
      });
    } catch (error) {
      console.error("❌ Upload CV Error:", error);
      return reply.code(500).send({
        message: "Failed to upload CV",
        error: error.message,
      });
    }
  },
];
