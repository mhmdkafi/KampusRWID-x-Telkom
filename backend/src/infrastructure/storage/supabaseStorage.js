import { supabase } from "../../config/supabase.js";
import { StorageProvider } from "./storageProvider.js";

export class SupabaseStorage extends StorageProvider {
  constructor(bucket = "cvs") {
    super();
    this.bucketName = bucket;
  }

  async upload(fileStream, options = {}) {
    const { path, contentType } = options;

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Upload with upsert: true (will overwrite existing file)
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(path, buffer, {
        contentType,
        upsert: true,
        cacheControl: "3600",
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    return data.path;
  }

  async delete(path) {
    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    return true;
  }

  getPublicUrl(path) {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return data?.publicUrl || null;
  }

  async createSignedUrl(path, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Create signed URL failed: ${error.message}`);
    }

    return data?.signedUrl || null;
  }

  async download(path) {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .download(path);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    return data;
  }

  async list(folder = "") {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .list(folder);

    if (error) {
      throw new Error(`List failed: ${error.message}`);
    }

    return data || [];
  }
}