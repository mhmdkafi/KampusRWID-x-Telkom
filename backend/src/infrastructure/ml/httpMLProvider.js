import { MLProvider } from "./MLProvider.js";
import { env } from "../../config/env.js";

export class HttpMLProvider extends MLProvider {
  constructor({ endpoint = env.ML_ENDPOINT, apiKey = env.ML_API_KEY } = {}) {
    super();
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  async analyzeAndMatch({ cvUrl, jobs }) {
    if (!this.endpoint) throw new Error("ML_ENDPOINT belum dikonfigurasi");
    const res = await fetch(`${this.endpoint}/analyze-match`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({ cv_url: cvUrl, jobs }),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(`ML error ${res.status}: ${msg}`);
    }
    return res.json(); // ekspektasi: { matches: [{job_id, score, explanation?}], skills?, embedding? }
  }
}
