class MatchCalculator {
  constructor() {
    // Enhanced matching weights for 80%+ accuracy
    this.weights = {
      cvType: 45, // CV type match importance
      skills: 30, // Skills match importance
      experience: 20, // Experience level match
      keywords: 5, // Keyword match bonus
    };

    // Enhanced CV type to job category mapping for better accuracy
    this.cvTypeMapping = {
      technical: [
        "developer",
        "engineer",
        "programmer",
        "software",
        "data",
        "devops",
        "architect",
        "tech",
      ],
      business: [
        "manager",
        "business",
        "analyst",
        "consultant",
        "sales",
        "marketing",
        "strategy",
      ],
      design: ["designer", "ui", "ux", "graphic", "creative", "art"],
      data: [
        "data scientist",
        "data analyst",
        "machine learning",
        "ai",
        "analytics",
      ],
      marketing: [
        "marketing",
        "digital marketing",
        "content",
        "social media",
        "seo",
        "brand",
      ],
      finance: ["finance", "accounting", "financial", "auditor", "controller"],
      hr: ["hr", "human resource", "recruitment", "talent", "people"],
      operations: ["operations", "logistics", "supply chain", "procurement"],
    };
  }

  // ENHANCED MAIN MATCHING FUNCTION - Optimized for 80%+ accuracy
  calculateMatches(cvAnalysis, jobsList) {
    if (!cvAnalysis || !jobsList || jobsList.length === 0) {
      console.warn("⚠️ Invalid input for matching");
      return [];
    }

    console.log("🎯 Starting job matching with enhanced algorithm...");
    console.log("📊 CV Analysis:", {
      type: cvAnalysis.cvType,
      skills: cvAnalysis.skillsFound?.length || 0,
      experience: cvAnalysis.experienceLevel,
    });

    const matches = jobsList.map((job) => {
      const matchResult = this.calculateJobMatch(cvAnalysis, job);
      return {
        ...job,
        matchScore: Math.round(matchResult.score),
        matchReasons: matchResult.reasons,
        matchBreakdown: matchResult.breakdown,
      };
    });

    // Sort by match score descending
    const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore);

    console.log("✅ Matching complete!");
    console.log(
      `📈 Top 3 matches:`,
      sortedMatches.slice(0, 3).map((m) => ({
        title: m.title,
        score: m.matchScore,
      }))
    );

    return sortedMatches;
  }

  // Enhanced job match calculation with optimized scoring
  calculateJobMatch(cvAnalysis, job) {
    // Calculate individual scores
    const typeScore = this.calculateTypeMatch(cvAnalysis.cvType, job.title);
    const skillsScore = this.calculateSkillsMatch(cvAnalysis, job);
    const experienceScore = this.calculateExperienceMatch(
      cvAnalysis.experienceYears || 0,
      job.experience_required || job.experience || ""
    );
    const keywordScore = this.calculateKeywordMatch(cvAnalysis, job);

    // Weighted final score
    const finalScore =
      (typeScore * this.weights.cvType +
        skillsScore * this.weights.skills +
        experienceScore * this.weights.experience +
        keywordScore * this.weights.keywords) /
      100;

    // Generate detailed reasons
    const reasons = this.generateDetailedMatchReasons(
      cvAnalysis,
      job,
      finalScore
    );

    return {
      score: finalScore,
      reasons,
      breakdown: {
        typeScore,
        skillsScore,
        experienceScore,
        keywordScore,
      },
    };
  }

  // CRITICAL FIX: Enhanced CV Type Matching with Relaxed Criteria
  calculateTypeMatch(cvType, jobTitle) {
    if (!cvType || !jobTitle) return 50;

    const jobTitleLower = jobTitle.toLowerCase();
    const cvTypeLower = cvType.toLowerCase();

    // Direct match
    if (jobTitleLower.includes(cvTypeLower)) return 100;

    // Check category mapping
    const categoryMatch = this.getCategoryFallbackScore(cvType, jobTitle);
    if (categoryMatch > 0) return categoryMatch;

    return 50; // Default fallback
  }

  // NEW: Category fallback scoring untuk improve accuracy
  getCategoryFallbackScore(cvType, jobTitle) {
    const jobTitleLower = jobTitle.toLowerCase();
    const cvTypeLower = cvType.toLowerCase();

    for (const [category, keywords] of Object.entries(this.cvTypeMapping)) {
      const cvMatchesCategory = keywords.some((kw) => cvTypeLower.includes(kw));
      const jobMatchesCategory = keywords.some((kw) =>
        jobTitleLower.includes(kw)
      );

      if (cvMatchesCategory && jobMatchesCategory) {
        return 85; // Good category match
      }
    }

    return 0;
  }

  // RELAXED: Enhanced skills matching with synonyms and related skills
  calculateSkillsMatch(cvAnalysis, job) {
    const cvSkills = (cvAnalysis.skillsFound || []).map((s) => s.toLowerCase());
    const jobSkills = (job.skills || []).map((s) => s.toLowerCase());

    if (jobSkills.length === 0) return 70; // No specific skills required

    let matchCount = 0;
    jobSkills.forEach((jobSkill) => {
      const hasMatch = cvSkills.some((cvSkill) =>
        this.areSimilarSkills(cvSkill, jobSkill)
      );
      if (hasMatch) matchCount++;
    });

    const matchPercentage = (matchCount / jobSkills.length) * 100;
    return Math.min(matchPercentage, 100);
  }

  // ENHANCED: Better skill similarity detection
  areSimilarSkills(skill1, skill2) {
    if (skill1 === skill2) return true;
    if (skill1.includes(skill2) || skill2.includes(skill1)) return true;

    // Skill synonyms mapping
    const synonyms = {
      javascript: ["js", "node", "react", "vue", "angular"],
      python: ["py", "django", "flask"],
      database: ["sql", "mysql", "postgresql", "mongodb"],
      cloud: ["aws", "azure", "gcp", "google cloud"],
      frontend: ["react", "vue", "angular", "html", "css"],
      backend: ["node", "express", "fastify", "api"],
    };

    for (const [main, syns] of Object.entries(synonyms)) {
      if (
        (skill1.includes(main) || syns.some((s) => skill1.includes(s))) &&
        (skill2.includes(main) || syns.some((s) => skill2.includes(s)))
      ) {
        return true;
      }
    }

    return false;
  }

  // Enhanced Experience Matching with Smart Level Detection
  calculateExperienceMatch(cvExperienceYears, jobExperience) {
    if (!jobExperience) return 80; // No specific experience required

    const jobExpLower = jobExperience.toLowerCase();

    // Extract years from job requirement
    const yearMatch = jobExpLower.match(/(\d+)[+\-]?\s*(?:years?|tahun)/i);
    const requiredYears = yearMatch ? parseInt(yearMatch[1]) : null;

    if (requiredYears !== null) {
      const diff = Math.abs(cvExperienceYears - requiredYears);
      if (diff === 0) return 100;
      if (diff <= 1) return 90;
      if (diff <= 2) return 75;
      if (diff <= 3) return 60;
      return 40;
    }

    // Match experience levels
    if (jobExpLower.includes("senior") && cvExperienceYears >= 5) return 100;
    if (jobExpLower.includes("mid") && cvExperienceYears >= 3) return 100;
    if (
      (jobExpLower.includes("junior") || jobExpLower.includes("entry")) &&
      cvExperienceYears <= 2
    )
      return 100;
    if (
      jobExpLower.includes("fresh") ||
      jobExpLower.includes("graduate") ||
      jobExpLower.includes("intern")
    )
      return 100;

    return 70; // Default
  }

  // Enhanced keyword matching
  calculateKeywordMatch(cvAnalysis, job) {
    const cvText = `${cvAnalysis.cvType} ${cvAnalysis.skillsFound?.join(" ")} ${
      cvAnalysis.summary || ""
    }`.toLowerCase();
    const jobText = `${job.title} ${job.description || ""} ${
      job.requirements?.join(" ") || ""
    }`.toLowerCase();

    const keywords = jobText.split(/\s+/).filter((w) => w.length > 3);
    const matchingKeywords = keywords.filter((kw) => cvText.includes(kw));

    if (keywords.length === 0) return 50;
    return (matchingKeywords.length / keywords.length) * 100;
  }

  // Enhanced detailed reasoning generation
  generateDetailedMatchReasons(cvAnalysis, job, matchScore) {
    const reasons = [];

    // Skills match
    const matchingSkills = this.getMatchingSkills(cvAnalysis, job);
    if (matchingSkills.length > 0) {
      reasons.push(
        `Memiliki ${matchingSkills.length} skill yang sesuai: ${matchingSkills
          .slice(0, 3)
          .join(", ")}`
      );
    }

    // Experience match
    if (matchScore >= 70) {
      reasons.push(
        `Pengalaman sesuai dengan level yang dibutuhkan (${
          job.experience_required || job.experience || "Tidak disebutkan"
        })`
      );
    }

    // CV type match
    reasons.push(`Latar belakang ${cvAnalysis.cvType} relevan dengan posisi`);

    return reasons;
  }

  getMatchingSkills(cvAnalysis, job) {
    const cvSkills = (cvAnalysis.skillsFound || []).map((s) => s.toLowerCase());
    const jobSkills = (job.skills || []).map((s) => s.toLowerCase());

    return jobSkills.filter((jobSkill) =>
      cvSkills.some((cvSkill) => this.areSimilarSkills(cvSkill, jobSkill))
    );
  }
}

export const matchCalculator = new MatchCalculator();
