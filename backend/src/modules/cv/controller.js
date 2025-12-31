import { authGuard } from "../../config/supabaseAuth.js";
import { CVService } from "./service.js";

const cvService = new CVService();

export const uploadAndMatch = [
  authGuard(),
  async function handler(request, reply) {
    const file = await request.file();
    const userId = request.user?.sub || request.user?.id;

    if (!userId) {
      return reply.code(401).send({ error: "User ID not found" });
    }

    if (!file) {
      return reply.code(400).send({ error: "File is required" });
    }

    try {
      const result = await cvService.uploadCV(userId, file, request.log);

      return reply.send({
        success: true,
        cv_id: result.cvRecord.id,
        storage_path: result.cvRecord.storage_path,
        cv_url: result.cvUrl,
        filename: file.filename,
        jobs: result.jobs,
      });
    } catch (error) {
      request.log.error(
        { error: error.message, stack: error.stack },
        "Upload CV failed"
      );

      const status = error.status || 500;
      return reply.code(status).send({
        error: error.message || "Failed to upload CV",
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
      return reply.code(401).send({ error: "User ID not found" });
    }

    try {
      const isAdmin = request.user?.role === "admin";
      await cvService.deleteCV(cvId, userId, isAdmin, request.log);

      return reply.send({
        success: true,
        message: "CV deleted successfully",
      });
    } catch (error) {
      request.log.error(
        { error: error.message, stack: error.stack },
        "Delete CV failed"
      );

      const status = error.status || 500;
      return reply.code(status).send({
        error: error.message || "Failed to delete CV",
      });
    }
  },
];

export const getUserCV = [
  authGuard(),
  async function handler(request, reply) {
    const userId = request.user?.sub || request.user?.id;

    if (!userId) {
      return reply.code(401).send({ error: "User ID not found" });
    }

    try {
      const cv = await cvService.getUserCV(userId);

      return reply.send({
        cv: cv || null,
      });
    } catch (error) {
      request.log.error({ error: error.message }, "Get user CV failed");

      return reply.code(500).send({
        error: "Failed to get CV",
      });
    }
  },
];

export const listCVs = [
  authGuard(),
  async function handler(request, reply) {
    const { limit = 100, offset = 0 } = request.query;

    try {
      const cvs = await cvService.listAllCVs({
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });

      return reply.send({
        cvs,
      });
    } catch (error) {
      request.log.error({ error: error.message }, "List CVs failed");

      return reply.code(500).send({
        error: "Failed to list CVs",
      });
    }
  },
];
