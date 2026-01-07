class MatchCalculator {
  constructor() {
    // Mapping CV Type ke Job Categories (untuk context saja, bukan scoring)
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

  // MAIN MATCHING FUNCTION
  calculateMatches(cvAnalysis, jobsList) {
    if (!cvAnalysis || !jobsList || jobsList.length === 0) {
      console.warn("⚠️ Invalid input for matching");
      return [];
    }

    console.log("🎯 Starting job matching with transparent algorithm...");
    console.log("📊 CV Analysis:", {
      type: cvAnalysis.cvType,
      skills: cvAnalysis.skillsFound?.length || 0,
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

  // PERBAIKAN TOTAL - HAPUS SEMUA WEIGHTING, HANYA SKILL MATCH SAJA
  calculateJobMatch(cvAnalysis, job) {
    const cvSkills = (cvAnalysis.skillsFound || []).map((s) => s.toLowerCase());
    const jobSkills = (job.skills || []).map((s) => s.toLowerCase());

    console.log(`📋 Matching "${job.title}"`);
    console.log(`   CV Skills (${cvSkills.length}):`, cvSkills);
    console.log(`   Job Skills (${jobSkills.length}):`, jobSkills);

    // LANGKAH 1: Cari matching skills
    let matchingSkillsList = [];
    if (jobSkills.length > 0) {
      matchingSkillsList = cvSkills.filter((cvSkill) =>
        jobSkills.some((jobSkill) => this.areSimilarSkills(cvSkill, jobSkill))
      );
    }

    console.log(
      `   Matching Skills (${matchingSkillsList.length}):`,
      matchingSkillsList
    );

    // LANGKAH 2: HITUNG SCORE - HANYA DARI SKILL MATCH, TIDAK ADA YANG LAIN
    let finalScore = 0;
    if (jobSkills.length === 0) {
      finalScore = 0;
    } else {
      // Score = (matching / required) * 100, max 100%
      finalScore = (matchingSkillsList.length / jobSkills.length) * 100;
      finalScore = Math.min(finalScore, 100);
    }

    console.log(`   📊 FINAL SCORE: ${finalScore}%`);

    // LANGKAH 3: Generate reasons yang SESUAI dengan score
    const reasons = this.generateDetailedMatchReasons(
      cvAnalysis,
      job,
      matchingSkillsList,
      jobSkills
    );

    return {
      score: finalScore, // Ini adalah source of truth
      reasons,
      breakdown: {
        skillMatchPercentage: finalScore,
        matchingSkillsCount: matchingSkillsList.length,
        requiredSkillsCount: jobSkills.length,
        matchingSkills: matchingSkillsList,
      },
    };
  }

  // Better skill similarity detection
  areSimilarSkills(skill1, skill2) {
    // Exact match saja
    if (skill1 === skill2) return true;

    // Substring match - tapi jangan untuk kategori umum
    // Hanya boleh jika keyword lebih spesifik
    if (skill1.includes(skill2) || skill2.includes(skill1)) return true;

    // Synonym mapping - HANYA untuk true synonyms, bukan kategori
    const synonyms = {
      // Bahasa pemrograman
      javascript: ["js"],
      typescript: ["ts"],
      cpp: ["c++"],
      csharp: ["c#"],

      // Framework & library
      reactjs: ["react", "react.js"],
      vuejs: ["vue", "vue.js"],
      nextjs: ["next", "next.js"],
      "node.js": ["node", "nodejs"],
      "spring boot": ["springboot", "spring"],

      // API & protocol
      "rest api": ["rest", "restful", "restful api"],

      // Hanya EXACT skills, bukan kategori abstrak
    };

    for (const [main, syns] of Object.entries(synonyms)) {
      if (
        (skill1 === main || syns.includes(skill1)) &&
        (skill2 === main || syns.includes(skill2))
      ) {
        return true;
      }
    }

    return false;
  }

  // Generate detailed reasoning berdasarkan data KONKRET
  generateDetailedMatchReasons(cvAnalysis, job, matchingSkills, jobSkills) {
    const reasons = [];

    // LANGSUNG GUNAKAN matchingSkills yang sudah correct dari calculateJobMatch
    if (matchingSkills.length > 0 && jobSkills.length > 0) {
      // Hitung persentase dari matchingSkills langsung
      const skillPercentage = Math.min(
        Math.round((matchingSkills.length / jobSkills.length) * 100),
        100
      );

      reasons.push(
        `Memiliki ${matchingSkills.length} dari ${
          jobSkills.length
        } skill yang dibutuhkan (${skillPercentage}%): ${matchingSkills.join(
          ", "
        )}`
      );
    } else if (jobSkills.length === 0) {
      // Job tidak punya skill requirement
      reasons.push(`Job tidak memiliki persyaratan skill khusus`);
    } else {
      // Tidak ada skill match
      reasons.push(
        `Tidak ada skill Anda yang sesuai dengan persyaratan (0% match)`
      );
    }

    // CV Type hanya untuk konteks tambahan, BUKAN untuk score
    if (cvAnalysis.cvType && this.isCVTypeRelevant(cvAnalysis.cvType, job)) {
      reasons.push(
        `Catatan: Background ${cvAnalysis.cvType} mungkin relevan dengan posisi ini`
      );
    }

    return reasons;
  }

  // Helper: Check apakah CV Type relevant dengan job
  isCVTypeRelevant(cvType, job) {
    const jobTitleLower = job.title.toLowerCase();

    for (const keywords of Object.values(this.cvTypeMapping)) {
      const cvMatchesCategory = keywords.some((kw) =>
        cvType.toLowerCase().includes(kw)
      );
      const jobMatchesCategory = keywords.some((kw) =>
        jobTitleLower.includes(kw)
      );

      if (cvMatchesCategory && jobMatchesCategory) {
        return true;
      }
    }

    return false;
  }

  // Helper: Get matching skills
  getMatchingSkillsFromCV(cvAnalysis, job) {
    const cvSkills = (cvAnalysis.skillsFound || []).map((s) => s.toLowerCase());
    const jobSkills = (job.skills || []).map((s) => s.toLowerCase());

    return cvSkills.filter((cvSkill) =>
      jobSkills.some((jobSkill) => this.areSimilarSkills(cvSkill, jobSkill))
    );
  }

  getMatchingSkills(cvAnalysis, job) {
    return this.getMatchingSkillsFromCV(cvAnalysis, job);
  }
}

export const matchCalculator = new MatchCalculator();
