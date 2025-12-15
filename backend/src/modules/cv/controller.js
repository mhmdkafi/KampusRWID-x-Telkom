import { authGuard } from "../../config/supabaseAuth.js";
import { SupabaseStorage } from "../../infrastructure/storage/supabaseStorage.js";
import { PgJobsRepository } from "../jobs/repository.pg.js";
import { HttpMLProvider } from "../../infrastructure/ml/httpMLProvider.js";
import { MockMLProvider } from "../../infrastructure/ml/mockMLProvider.js";
import { env } from "../../config/env.js";

const storage = new SupabaseStorage(env.STORAGE_BUCKET);
const jobsRepo = new PgJobsRepository();
const ml = env.ML_ENDPOINT ? new HttpMLProvider({}) : new MockMLProvider();

export const uploadAndMatch = [
  authGuard(), // preHandler dipakai di routes
  async function handler(request, reply) {
    const file = await request.file();
    if (!file)
      return reply.code(400).send({ message: "File PDF wajib di-upload" });
    if (file.mimetype !== "application/pdf") {
      return reply.code(400).send({ message: "Hanya PDF yang didukung" });
    }

    const userId = request.user?.sub || "anonymous";
    const safeName = file.filename.replace(/\s+/g, "_");
    const path = `${userId}/${Date.now()}-${safeName}`;

    // 1) Upload ke Supabase Storage
    const storagePath = await storage.upload(file.file, {
      path,
      contentType: file.mimetype,
    });

    // 2) Dapatkan URL (pakai public bucket ATAU signed URL)
    let cvUrl = storage.getPublicUrl(storagePath);
    if (!cvUrl) {
      cvUrl = await storage.createSignedUrl(storagePath, 3600);
    }

    // 3) Ambil daftar jobs dari DB
    const jobs = await jobsRepo.listAll({ limit: 200, offset: 0 });

    // 4) Panggil ML service (atau Mock bila belum dikonfigurasi)
    const result = await (ml.analyzeAndMatch
      ? ml.analyzeAndMatch({ cvUrl, jobs })
      : (async () => {
          // fallback untuk Mock: analisa teks tidak tersedia karena kita tidak parse PDF di backend
          // gunakan skills dari job untuk skor dummy saja
          return {
            matches: jobs.map((j) => ({ job_id: j.id, score: Math.random() })),
          };
        })());

    // 5) (Opsional) simpan ke DB tabel cvs/matches — nanti kita tambahkan repository-nya
    return reply.send({
      storage_path: storagePath,
      cv_url: cvUrl,
      matches: result.matches || [],
      // result.skills / embedding jika disediakan ML juga ikut diteruskan
      skills: result.skills || undefined,
    });
  },
];
