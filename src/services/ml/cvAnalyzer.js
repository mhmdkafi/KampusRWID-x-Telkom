import { textExtractor } from "../utils/textExtractor";

class CVAnalyzer {
  constructor() {
    // CLEAN skill database (NO ROLES)
    this.skillDatabase = {
      programming: [
        "javascript",
        "typescript",
        "python",
        "java",
        "c++",
        "cpp",
        "c#",
        "php",
        "go",
        "golang",
        "dart",
        "kotlin",
        "swift",
      ],

      frontend: [
        "html",
        "css",
        "bootstrap",
        "tailwind",
        "react",
        "next.js",
        "vue",
        "angular",
        "jquery",
        "figma",
      ],

      backend: [
        "node.js",
        "express",
        "fastify",
        "nestjs",
        "spring boot",
        "laravel",
        "restful api",
        "swagger",
      ],

      databases: [
        "mysql",
        "postgresql",
        "postgres",
        "mongodb",
        "sqlite",
        "supabase",
        "redis",
      ],

      mobile: ["flutter", "react native"],

      devops: ["docker", "linux", "git", "github", "ci/cd"],
    };

    // ROLE KEYWORDS (NOT SKILLS)
    this.roleKeywords = {
      backend: [
        "backend developer",
        "backend engineer",
        "server-side",
        "api development",
      ],
      frontend: [
        "frontend developer",
        "ui developer",
        "web designer",
      ],
      fullstack: [
        "fullstack developer",
        "full stack developer",
      ],
      mobile: [
        "mobile developer",
        "android developer",
        "ios developer",
      ],
      data: [
        "data scientist",
        "machine learning",
        "data analyst",
      ],
    };
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  normalizeSkill(skill) {
    return skill
      .toLowerCase()
      .replace(/\.js/g, "")
      .replace(/apis?/g, "api")
      .replace(/\s+/g, " ")
      .trim();
  }

  buildSkillRegex(skill) {
    // 1. Escape SEMUA regex character
    let escaped = this.escapeRegex(skill.toLowerCase());

    // 2. Toleransi spasi / dot / dash
    escaped = escaped.replace(/\s+/g, "[\\s._-]+");

    // 3. RESTful API alias
    escaped = escaped.replace(/api$/, "apis?");

    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
  }


  async analyzeCV(file) {
    if (!textExtractor.isPDF(file)) {
      throw new Error("File must be PDF");
    }

    const text = await textExtractor.extractFromPDF(file);
    if (!text || text.length < 100) {
      throw new Error("Insufficient readable text");
    }

    return this.analyzeText(text);
  }

  analyzeText(text) {
    const textLower = text.toLowerCase();

    const skillsFound = this.extractSkills(textLower);
    const cvType = this.detectCVType(textLower, skillsFound);

    return {
      cvType,
      skillsFound,
      rawText: text,
      textLength: text.length,
    };
  }

  extractSkills(text) {
    const found = new Set();

    for (const skills of Object.values(this.skillDatabase)) {
      for (const skill of skills) {
        const regex = this.buildSkillRegex(skill);

        if (regex.test(text)) {
          found.add(this.normalizeSkill(skill));
        }
      }
    }

    return Array.from(found).sort();
  }

  // 🔹 ROLE + SKILL AWARE CV TYPE DETECTION
  detectCVType(text, skills) {
    const score = {
      backend: 0,
      frontend: 0,
      fullstack: 0,
      mobile: 0,
      data: 0,
    };

    // Role-based boost (strong signal)
    for (const [type, keywords] of Object.entries(this.roleKeywords)) {
      keywords.forEach((kw) => {
        if (text.includes(kw)) {
          score[type] += 4;
        }
      });
    }

    // Skill-category scoring (clean & safe)
    skills.forEach((skill) => {
      if (this.isSkillInCategory(skill, "backend")) score.backend += 2;
      if (this.isSkillInCategory(skill, "frontend")) score.frontend += 2;
      if (this.isSkillInCategory(skill, "mobile")) score.mobile += 2;
    });

    // Fullstack logic
    if (score.backend >= 4 && score.frontend >= 4) {
      score.fullstack += 6;
    }

    const [bestType, bestScore] = Object.entries(score).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return bestScore === 0 ? "general" : bestType;
  }

  isSkillInCategory(skill, category) {
    return this.skillDatabase[category]
      .map(s => this.normalizeSkill(s))
      .includes(skill);
  }
}

export const cvAnalyzer = new CVAnalyzer();
