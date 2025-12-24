import { supabase } from "../../config/supabase.js";
import { StorageProvider } from "./storageProvider.js";

export class SupabaseStorage extends StorageProvider {
  constructor(bucket = "cvs") {
    super();
    this.bucketName = bucket;
  }

  // Upload dari stream (Fastify multipart memberi stream di file.file)
  async upload(fileStream, options = {}) {
    const { path, contentType } = options;

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    console.log(`📤 Uploading to bucket: ${this.bucketName}, path: ${path}`);

    // Upload dengan upsert: true (akan overwrite jika file sudah ada)
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(path, buffer, {
        contentType,
        upsert: true, // PENTING: Overwrite file yang sudah ada
        cacheControl: "3600",
      });

    if (error) {
      console.error("❌ Upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log(`✅ Upload success:`, data);
    return data.path; // contoh: userId/12345-cv.pdf
  }

  async delete(path) {
    console.log(`🗑️  Deleting from bucket: ${this.bucketName}, path: ${path}`);

    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) {
      console.error("❌ Delete error:", error);
      throw new Error(`Delete failed: ${error.message}`);
    }

    console.log(`✅ Delete success: ${path}`);
    return true;
  }

  // Jika bucket public: dapatkan URL publik langsung
  getPublicUrl(path) {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return data?.publicUrl || null;
  }

  // Jika bucket private: buat URL bertanda tangan (berlaku sementara, default 1 jam)
  async createSignedUrl(path, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("❌ Create signed URL error:", error);
      throw new Error(`Create signed URL failed: ${error.message}`);
    }

    return data?.signedUrl || null;
  }

  async download(path) {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .download(path);

    if (error) {
      console.error("❌ Download error:", error);
      throw new Error(`Download failed: ${error.message}`);
    }

    return data;
  }

  async list(folder = "") {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .list(folder);

    if (error) {
      console.error("❌ List error:", error);
      throw new Error(`List failed: ${error.message}`);
    }

    return data;
  }
}
