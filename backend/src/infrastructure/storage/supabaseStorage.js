import { supabase } from "../../config/supabase.js";
import { StorageProvider } from "./storageProvider.js";

export class SupabaseStorage extends StorageProvider {
  constructor(bucket = "cv-files") {
    super();
    this.bucket = bucket;
  }

  // Upload dari stream (Fastify multipart memberi stream di file.file)
  async upload(fileStream, { path, contentType }) {
    if (!supabase) throw new Error("Supabase client belum siap");
    const chunks = [];
    for await (const chunk of fileStream) chunks.push(chunk);
    const fileBuffer = Buffer.concat(chunks);

    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(path, fileBuffer, { contentType, upsert: false });

    if (error) throw error;
    return data.path; // contoh: userId/12345-cv.pdf
  }

  // Jika bucket public: dapatkan URL publik langsung
  getPublicUrl(path) {
    if (!supabase) throw new Error("Supabase client belum siap");
    const { data } = supabase.storage.from(this.bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  }

  // Jika bucket private: buat URL bertanda tangan (berlaku sementara, default 1 jam)
  async createSignedUrl(path, expiresIn = 3600) {
    if (!supabase) throw new Error("Supabase client belum siap");
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }
}
