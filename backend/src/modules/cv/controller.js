import { authGuard } from "../../config/supabaseAuth.js";
import { SupabaseStorage } from "../../infrastructure/storage/supabaseStorage.js";
import { PgJobsRepository } from "../jobs/repository.pg.js";
import { CVRepository } from "./repository.js";
import { env } from "../../config/env.js";

const storage = new SupabaseStorage(env.STORAGE_BUCKET);
const jobsRepo = new PgJobsRepository();
const cvRepo = new CVRepository();

export const uploadAndMatch = [
  authGuard(),
  async function handler(request, reply) {
    const file = await request.file();
    if (!file) return reply.code(400).send({ message: "File wajib di-upload" });

    const userId = request.user?.sub || request.user?.id;
    if (!userId) {
      return reply.code(401).send({ message: "User ID tidak ditemukan" });
    }

    // PERBAIKAN: Filename langsung di root bucket (tanpa folder sama sekali)
    const fileExtension = file.mimetype === 'application/pdf' ? 'pdf' : 
                         file.mimetype.includes('word') ? 'docx' : 'pdf';
    const storagePath = `${userId}.${fileExtension}`; // Contoh: "abc123.pdf" langsung di root

    try {
      console.log(`📤 Uploading CV for user ${userId}...`);
      console.log(`📁 Storage path: ${storagePath}`);

      // 1) Cek apakah user sudah punya CV sebelumnya
      const existingCV = await cvRepo.getUserCV(userId);

      // 2) Jika ada CV lama, hapus file lama dari storage
      if (existingCV && existingCV.storage_path) {
        try {
          await storage.delete(existingCV.storage_path);
          console.log(`🗑️  Old CV deleted: ${existingCV.storage_path}`);
        } catch (deleteError) {
          console.warn("⚠️  Could not delete old CV:", deleteError.message);
        }
      }

      // 3) Upload file baru ke Supabase Storage (akan overwrite jika ada)
      await storage.upload(file.file, {
        path: storagePath,
        contentType: file.mimetype,
      });

      console.log(`✅ CV uploaded to storage: ${storagePath}`);

      // 4) Simpan/Update record CV di database
      const cvRecord = await cvRepo.saveCVRecord(
        userId,
        file.filename,
        storagePath,
        null
      );

      console.log(`✅ CV record saved to DB: ${cvRecord.id}`);

      // 5) Dapatkan URL
      let cvUrl = storage.getPublicUrl(storagePath);
      if (!cvUrl) {
        cvUrl = await storage.createSignedUrl(storagePath, 3600);
      }

      // 6) Ambil jobs dari DB
      const jobs = await jobsRepo.listAll({ limit: 200, offset: 0 });

      console.log(`✅ Found ${jobs.length} jobs for matching`);

      // 7) Return success dengan data jobs
      return reply.send({
        success: true,
        cv_id: cvRecord.id,
        storage_path: storagePath,
        cv_url: cvUrl,
        filename: file.filename,
        jobs: jobs.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          salary: job.salary || "Negotiable",
          description: job.description,
          requirements: job.requirements,
        })),
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

export const deleteCV = [
  authGuard(),
  async function handler(request, reply) {
    const { cvId } = request.params;
    const userId = request.user?.sub || request.user?.id;

    if (!userId) {
      return reply.code(401).send({ message: "User ID tidak ditemukan" });
    }

    try {
      const cv = await cvRepo.getCVById(cvId);

      if (!cv) {
        return reply.code(404).send({ message: "CV not found" });
      }

      const isAdmin = request.user?.role === "admin";
      if (cv.user_id !== userId && !isAdmin) {
        return reply.code(403).send({ message: "Unauthorized to delete this CV" });
      }

      // Hapus file dari storage
      if (cv.storage_path) {
        try {
          await storage.delete(cv.storage_path);
          console.log(`🗑️  CV deleted from storage: ${cv.storage_path}`);
        } catch (deleteError) {
          console.warn("⚠️  Could not delete CV from storage:", deleteError.message);
        }
      }

      // Hapus record dari database
      await cvRepo.deleteCV(cvId);

      console.log(`✅ CV deleted: ${cvId}`);

      return reply.send({
        success: true,
        message: "CV deleted successfully",
      });
    } catch (error) {
      console.error("❌ Delete CV Error:", error);
      return reply.code(500).send({
        message: "Failed to delete CV",
        error: error.message,
      });
    }
  },
];
