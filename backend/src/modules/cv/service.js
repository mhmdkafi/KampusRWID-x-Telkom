import { CVRepository } from "./repository.js";
import { SupabaseStorage } from "../../infrastructure/storage/supabaseStorage.js";
import { PgJobsRepository } from "../jobs/repository.pg.js";
import { env } from "../../config/env.js";
import { NotFoundError, DomainError } from "../../core/errors.js";

export class CVService {
  constructor() {
    this.cvRepo = new CVRepository();
    this.storage = new SupabaseStorage(env.STORAGE_BUCKET);
    this.jobsRepo = new PgJobsRepository();
  }

  async uploadCV(userId, file, logger) {
    if (!file) {
      throw new DomainError("File is required");
    }

    const fileExtension = file.mimetype === 'application/pdf' ? 'pdf' : 
                         file.mimetype.includes('word') ? 'docx' : 'pdf';
    const storagePath = `${userId}.${fileExtension}`;

    logger.info({ userId, storagePath }, 'Starting CV upload');

    try {
      // 1. Check existing CV
      const existingCV = await this.cvRepo.getUserCV(userId);

      // 2. Delete old file from storage if exists
      if (existingCV?.storage_path) {
        try {
          await this.storage.delete(existingCV.storage_path);
          logger.info({ path: existingCV.storage_path }, 'Old CV deleted');
        } catch (deleteError) {
          logger.warn({ error: deleteError.message }, 'Could not delete old CV');
        }
      }

      // 3. Upload new file
      await this.storage.upload(file.file, {
        path: storagePath,
        contentType: file.mimetype,
      });

      logger.info({ storagePath }, 'CV uploaded to storage');

      // 4. Save/Update CV record in database
      const cvRecord = await this.cvRepo.saveCVRecord(
        userId,
        file.filename,
        storagePath,
        null
      );

      logger.info({ cvId: cvRecord.id }, 'CV record saved to database');

      // 5. Get CV URL
      let cvUrl = this.storage.getPublicUrl(storagePath);
      if (!cvUrl) {
        cvUrl = await this.storage.createSignedUrl(storagePath, 3600);
      }

      // 6. Fetch jobs for matching
      const jobs = await this.jobsRepo.listAll({ limit: 200, offset: 0 });

      logger.info({ jobCount: jobs.length }, 'Jobs fetched for matching');

      return {
        cvRecord,
        cvUrl,
        jobs: jobs.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.job_type,
          salary: job.salary || "Negotiable",
          description: job.description,
          requirements: job.requirements,
        })),
      };
    } catch (error) {
      logger.error({ error: error.message }, 'CV upload failed');
      throw error;
    }
  }

  async deleteCV(cvId, userId, isAdmin, logger) {
    const cv = await this.cvRepo.getCVById(cvId);

    if (!cv) {
      throw new NotFoundError("CV not found");
    }

    // Authorization check
    if (cv.user_id !== userId && !isAdmin) {
      throw new DomainError("Unauthorized to delete this CV", 403);
    }

    // Delete file from storage
    if (cv.storage_path) {
      try {
        await this.storage.delete(cv.storage_path);
        logger.info({ path: cv.storage_path }, 'CV deleted from storage');
      } catch (deleteError) {
        logger.warn({ error: deleteError.message }, 'Could not delete CV from storage');
      }
    }

    // Delete record from database
    await this.cvRepo.deleteCV(cvId);

    logger.info({ cvId }, 'CV deleted successfully');

    return { success: true };
  }

  async getUserCV(userId) {
    return await this.cvRepo.getUserCV(userId);
  }

  async listAllCVs(params) {
    return await this.cvRepo.listAll(params);
  }
}