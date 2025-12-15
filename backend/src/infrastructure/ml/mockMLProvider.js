import { MLProvider } from "./MLProvider.js";

export class MockMLProvider extends MLProvider {
  async analyzeCV(text) {
    const words = (text || "").split(/\W+/).filter(Boolean);
    const skills = Array.from(new Set(words.filter((w) => w.length > 2))).slice(
      0,
      10
    );
    return { embedding: skills, skills };
  }
  async matchJobs(cvEmbedding, jobs) {
    return jobs.map((j) => {
      const overlap = (j.skills || []).filter((s) =>
        cvEmbedding.includes(s)
      ).length;
      const denom = Math.max(1, (j.skills || []).length);
      return { job_id: j.id, score: overlap / denom };
    });
  }
}
