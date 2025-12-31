import { MatchingRepository } from "./repository.js";
import { DomainError } from "../../core/errors.js";

export class MatchingService {
  constructor() {
    this.matchingRepo = new MatchingRepository();
  }

  async saveRecommendations(userId, cvId, recommendations, cvAnalysis) {
    if (!cvId || !recommendations || !Array.isArray(recommendations)) {
      throw new DomainError("cv_id and recommendations array are required");
    }

    const result = await this.matchingRepo.saveRecommendations(
      userId, 
      cvId, 
      recommendations, 
      cvAnalysis
    );

    return result;
  }

  async getLatestRecommendations(userId) {
    return await this.matchingRepo.getLatestRecommendations(userId);
  }

  async getRecommendationsByCvId(userId, cvId) {
    return await this.matchingRepo.getRecommendationsByCvId(userId, cvId);
  }

  async deleteRecommendations(userId, cvId) {
    await this.matchingRepo.deleteRecommendations(userId, cvId);
    return { success: true };
  }
}