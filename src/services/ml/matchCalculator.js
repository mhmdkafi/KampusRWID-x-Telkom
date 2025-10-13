class MatchCalculator {
    constructor() {
      this.weights = {
        skills: 0.4,
        experience: 0.25,
        jobTitle: 0.2,
        education: 0.1,
        keywords: 0.05
      };
    }
  
    // Main matching function
    async calculateMatches(cvAnalysis, jobsData) {
      const matches = [];
  
      for (const job of jobsData) {
        const matchScore = this.calculateJobMatch(cvAnalysis, job);
        
        matches.push({
          ...job,
          matchScore: Math.round(matchScore),
          matchDetails: this.getMatchDetails(cvAnalysis, job),
          recommendations: this.getRecommendations(cvAnalysis, job, matchScore)
        });
      }
  
      // Sort by match score and return top matches
      return matches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5); // Top 5 matches
    }
  
    // Calculate match score for a specific job
    calculateJobMatch(cvAnalysis, job) {
      const skillsScore = this.calculateSkillsMatch(cvAnalysis.skills, job.skills);
      const experienceScore = this.calculateExperienceMatch(cvAnalysis.experienceYears, job.experience);
      const jobTitleScore = this.calculateJobTitleMatch(cvAnalysis.jobTitles, job.title);
      const educationScore = this.calculateEducationMatch(cvAnalysis.education, job);
      const keywordsScore = this.calculateKeywordsMatch(cvAnalysis.keywords, job);
  
      const totalScore = 
        (skillsScore * this.weights.skills) +
        (experienceScore * this.weights.experience) +
        (jobTitleScore * this.weights.jobTitle) +
        (educationScore * this.weights.education) +
        (keywordsScore * this.weights.keywords);
  
      return Math.min(100, Math.max(0, totalScore));
    }
  
    // Calculate skills matching score
    calculateSkillsMatch(cvSkills, jobSkills) {
      if (!jobSkills || jobSkills.length === 0) return 50;
  
      let matchedSkills = 0;
      let totalJobSkills = jobSkills.length;
  
      // Convert CV skills to flat array
      const cvSkillsFlat = [];
      Object.values(cvSkills).forEach(categorySkills => {
        categorySkills.forEach(skillData => {
          cvSkillsFlat.push(skillData.skill.toLowerCase());
        });
      });
  
      // Check each job skill against CV skills
      jobSkills.forEach(jobSkill => {
        const jobSkillLower = jobSkill.toLowerCase();
        if (cvSkillsFlat.some(cvSkill => 
          cvSkill.includes(jobSkillLower) || 
          jobSkillLower.includes(cvSkill) ||
          this.calculateSimilarity(cvSkill, jobSkillLower) > 0.8
        )) {
          matchedSkills++;
        }
      });
  
      return (matchedSkills / totalJobSkills) * 100;
    }
  
    // Calculate experience matching score
    calculateExperienceMatch(cvExperienceYears, jobExperience) {
      const jobExpRequired = this.parseJobExperience(jobExperience);
      
      if (cvExperienceYears >= jobExpRequired) {
        return 100;
      } else if (cvExperienceYears >= jobExpRequired * 0.7) {
        return 80;
      } else if (cvExperienceYears >= jobExpRequired * 0.5) {
        return 60;
      } else {
        return Math.max(20, (cvExperienceYears / jobExpRequired) * 100);
      }
    }
  
    // Calculate job title matching score
    calculateJobTitleMatch(cvJobTitles, jobTitle) {
      if (!cvJobTitles || cvJobTitles.length === 0) return 30;
  
      const jobTitleLower = jobTitle.toLowerCase();
      let maxSimilarity = 0;
  
      cvJobTitles.forEach(cvTitle => {
        const similarity = this.calculateSimilarity(cvTitle.toLowerCase(), jobTitleLower);
        maxSimilarity = Math.max(maxSimilarity, similarity);
      });
  
      return maxSimilarity * 100;
    }
  
    // Calculate education matching score
    calculateEducationMatch(cvEducation, job) {
      // Simple education matching logic
      if (!cvEducation || cvEducation.length === 0) return 50;
  
      // Check if job requires specific education
      const jobRequiresHigherEd = job.requirements?.some(req => 
        req.toLowerCase().includes('bachelor') || 
        req.toLowerCase().includes('degree') ||
        req.toLowerCase().includes('university')
      );
  
      if (jobRequiresHigherEd) {
        const hasHigherEd = cvEducation.some(edu => 
          edu.type === 'bachelor' || 
          edu.type === 'master' || 
          edu.type === 'phd'
        );
        return hasHigherEd ? 100 : 40;
      }
  
      return 70; // Default score if no specific education required
    }
  
    // Calculate keywords matching score
    calculateKeywordsMatch(cvKeywords, job) {
      if (!cvKeywords || cvKeywords.length === 0) return 50;
  
      const jobText = `${job.title} ${job.company} ${job.description || ''} ${(job.skills || []).join(' ')}`.toLowerCase();
      let matchedKeywords = 0;
  
      cvKeywords.slice(0, 10).forEach(keywordData => {
        if (jobText.includes(keywordData.word.toLowerCase())) {
          matchedKeywords++;
        }
      });
  
      return (matchedKeywords / Math.min(10, cvKeywords.length)) * 100;
    }
  
    // Get detailed match breakdown
    getMatchDetails(cvAnalysis, job) {
      return {
        skillsMatch: {
          score: Math.round(this.calculateSkillsMatch(cvAnalysis.skills, job.skills)),
          matchedSkills: this.getMatchedSkills(cvAnalysis.skills, job.skills),
          missingSkills: this.getMissingSkills(cvAnalysis.skills, job.skills)
        },
        experienceMatch: {
          score: Math.round(this.calculateExperienceMatch(cvAnalysis.experienceYears, job.experience)),
          cvYears: cvAnalysis.experienceYears,
          requiredYears: this.parseJobExperience(job.experience)
        },
        titleMatch: {
          score: Math.round(this.calculateJobTitleMatch(cvAnalysis.jobTitles, job.title)),
          similarTitles: cvAnalysis.jobTitles
        }
      };
    }
  
    // Get recommendations for improvement
    getRecommendations(cvAnalysis, job, matchScore) {
      const recommendations = [];
  
      if (matchScore < 70) {
        const missingSkills = this.getMissingSkills(cvAnalysis.skills, job.skills);
        if (missingSkills.length > 0) {
          recommendations.push({
            type: 'skills',
            message: `Pelajari skill: ${missingSkills.slice(0, 3).join(', ')}`,
            priority: 'high'
          });
        }
  
        const expGap = this.parseJobExperience(job.experience) - cvAnalysis.experienceYears;
        if (expGap > 0) {
          recommendations.push({
            type: 'experience',
            message: `Tambah pengalaman ${expGap} tahun lagi`,
            priority: 'medium'
          });
        }
      }
  
      return recommendations;
    }
  
    // Helper functions
    calculateSimilarity(str1, str2) {
      // Simple Jaccard similarity
      const set1 = new Set(str1.split(' '));
      const set2 = new Set(str2.split(' '));
      const intersection = new Set([...set1].filter(x => set2.has(x)));
      const union = new Set([...set1, ...set2]);
      return intersection.size / union.size;
    }
  
    parseJobExperience(experience) {
      if (typeof experience !== 'string') return 0;
      
      const expLower = experience.toLowerCase();
      if (expLower.includes('fresh') || expLower.includes('entry')) return 0;
      if (expLower.includes('1-2')) return 1.5;
      if (expLower.includes('2-3')) return 2.5;
      if (expLower.includes('3-5')) return 4;
      if (expLower.includes('5+') || expLower.includes('senior')) return 6;
      
      // Extract number from string
      const numbers = experience.match(/\d+/g);
      return numbers ? parseInt(numbers[0]) : 1;
    }
  
    getMatchedSkills(cvSkills, jobSkills) {
      const matched = [];
      const cvSkillsFlat = [];
      
      Object.values(cvSkills).forEach(categorySkills => {
        categorySkills.forEach(skillData => {
          cvSkillsFlat.push(skillData.skill);
        });
      });
  
      jobSkills?.forEach(jobSkill => {
        if (cvSkillsFlat.some(cvSkill => 
          cvSkill.toLowerCase().includes(jobSkill.toLowerCase()) || 
          jobSkill.toLowerCase().includes(cvSkill.toLowerCase())
        )) {
          matched.push(jobSkill);
        }
      });
  
      return matched;
    }
  
    getMissingSkills(cvSkills, jobSkills) {
      const matched = this.getMatchedSkills(cvSkills, jobSkills);
      return jobSkills?.filter(skill => !matched.includes(skill)) || [];
    }
  }
  
  export const matchCalculator = new MatchCalculator();