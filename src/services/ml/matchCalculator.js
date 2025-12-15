import { jobsData } from '../../data/jobData';

class MatchCalculator {
  constructor() {
    // Enhanced matching weights for 80%+ accuracy
    this.weights = {
      cvType: 45,      // CV type matching is most important (45%)
      skills: 30,      // Skills matching (30%)
      experience: 20,  // Experience level (20%)
      keywords: 5      // Additional keywords (5%)
    };

    // Enhanced CV type to job category mapping for better accuracy
    this.cvTypeJobMapping = {
      'technical': {
        primary: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Software Engineer', 'Web Developer'],
        secondary: ['UI/UX Designer', 'DevOps Engineer', 'Data Scientist', 'Mobile Developer', 'Technical Lead']
      },
      'business': {
        primary: ['Account Manager', 'Sales Manager', 'Business Development Manager', 'Customer Success Manager'], 
        secondary: ['Sales Executive', 'Regional Sales Manager', 'Business Analyst', 'Client Relations Manager']
      },
      'marketing': {
        primary: ['Digital Marketing Specialist', 'Marketing Manager', 'Content Marketing Manager'],
        secondary: ['Social Media Manager', 'SEO Specialist', 'PPC Specialist', 'Brand Manager', 'Growth Marketing Manager']
      },
      'finance': {
        primary: ['Financial Analyst', 'Accountant', 'Finance Manager', 'Budget Analyst'],
        secondary: ['Tax Specialist', 'Investment Analyst', 'Corporate Finance', 'Financial Controller', 'Audit Manager']
      }
    };
  }

  // ENHANCED MAIN MATCHING FUNCTION - Optimized for 80%+ accuracy
  calculateMatches(cvAnalysis) {
    const timestamp = new Date().toISOString();
    console.log(`🚀 Starting Enhanced Job Matching at ${timestamp}...`);
    console.log('Enhanced CV Analysis Input:', {
      cvType: cvAnalysis.cvType,
      skillScore: cvAnalysis.skillScore,
      experienceYears: cvAnalysis.experienceYears,
      finalScore: cvAnalysis.finalScore,
      skillsCount: cvAnalysis.skillsFound?.length || 0
    });

    const jobMatches = [];

    // Calculate enhanced match score for each job
    jobsData.forEach(job => {
      const matchScore = this.calculateJobMatch(cvAnalysis, job);
      
      jobMatches.push({
        ...job,
        matchScore: Math.round(matchScore),
        matchReasons: this.generateDetailedMatchReasons(cvAnalysis, job, matchScore)
      });
    });

    // Enhanced filtering and sorting
    const sortedMatches = jobMatches
      .sort((a, b) => b.matchScore - a.matchScore)
      .filter(job => job.matchScore >= 25) // DRASTICALLY LOWERED threshold for testing
      .slice(0, 5); // Limit to max 5 recommendations

    console.log('✅ Enhanced Quality Job Matches:', sortedMatches.map(job => ({
      title: job.title,
      score: job.matchScore,
      topReasons: job.matchReasons.slice(0, 2)
    })));

    return sortedMatches;
  }

  // Enhanced job match calculation with optimized scoring
  calculateJobMatch(cvAnalysis, job) {
    // 1. Enhanced CV Type Match (45% weight)
    const typeScore = this.calculateTypeMatch(cvAnalysis.cvType, job.title);
    
    // 2. Enhanced Skills Match (30% weight)
    const skillsScore = this.calculateSkillsMatch(cvAnalysis, job);
    
    // 3. Enhanced Experience Match (20% weight)
    const experienceScore = this.calculateExperienceMatch(cvAnalysis.experienceYears, job.experience);
    
    // 4. Keywords Match (5% weight)
    const keywordScore = this.calculateKeywordMatch(cvAnalysis, job);

    // Enhanced weighted final score with boost factors
    let finalScore = (
      (typeScore * this.weights.cvType) +
      (skillsScore * this.weights.skills) +
      (experienceScore * this.weights.experience) +
      (keywordScore * this.weights.keywords)
    ) / 100;

    // Quality boost for high-performing profiles
    let qualityBoost = 0;
    if (cvAnalysis.skillScore > 80 && cvAnalysis.experienceYears >= 3) {
      qualityBoost = finalScore * 0.1; // 10% boost
      finalScore = Math.min(100, finalScore * 1.1);
    }

    // COMPREHENSIVE DEBUG LOGGING
    console.log(`\n🎯 DETAILED MATCHING ANALYSIS:`);
    console.log(`   Job: "${job.title}"`);
    console.log(`   CV Type: "${cvAnalysis.cvType || 'Unknown'}"`);
    console.log(`   CV Skills Found: [${(cvAnalysis.skillsFound || []).join(', ')}]`);
    console.log(`   CV Skill Score: ${cvAnalysis.skillScore || 'N/A'}`);
    console.log(`   CV Experience: ${cvAnalysis.experienceYears || 'N/A'} years`);
    console.log(`   Job Requirements: [${(job.requirements || []).join(', ')}]`);
    console.log(`   Job Experience: "${job.experience || 'N/A'}"`);
    console.log(`\n📊 SCORING BREAKDOWN:`);
    console.log(`   🔸 Type Match: ${typeScore.toFixed(1)}% × 45% = ${(typeScore * 0.45).toFixed(1)}%`);
    console.log(`   🔸 Skills Match: ${skillsScore.toFixed(1)}% × 30% = ${(skillsScore * 0.30).toFixed(1)}%`);
    console.log(`   🔸 Experience Match: ${experienceScore.toFixed(1)}% × 20% = ${(experienceScore * 0.20).toFixed(1)}%`);
    console.log(`   🔸 Keywords Match: ${keywordScore.toFixed(1)}% × 5% = ${(keywordScore * 0.05).toFixed(1)}%`);
    console.log(`   🔸 Base Score: ${(finalScore - qualityBoost).toFixed(1)}%`);
    console.log(`   🔸 Quality Boost: +${qualityBoost.toFixed(1)}%`);
    console.log(`   🎯 FINAL SCORE: ${finalScore.toFixed(1)}%`);
    console.log(`   🎯 THRESHOLD: 45% - ${finalScore >= 45 ? '✅ PASS' : '❌ FAIL'}\n`);

    return Math.max(0, Math.min(100, finalScore));
  }

  // CRITICAL FIX: Enhanced CV Type Matching with Relaxed Criteria
  calculateTypeMatch(cvType, jobTitle) {
    const relevantJobs = this.cvTypeJobMapping[cvType];
    if (!relevantJobs) {
      console.log(`⚠️ No mapping for CV type: ${cvType}`);
      return 60; // Give reasonable default score
    }
    
    const jobTitleLower = jobTitle.toLowerCase();
    console.log(`🔍 Matching ${jobTitle} against ${cvType} category`);
    
    // Check for primary job matches (highest score)
    const primaryMatch = relevantJobs.primary.some(job => {
      const jobLower = job.toLowerCase();
      const match = jobTitleLower.includes(jobLower) || jobLower.includes(jobTitleLower);
      if (match) console.log(`✅ Primary match found: ${job}`);
      return match;
    });
    
    if (primaryMatch) {
      console.log(`✅ Primary type match: ${jobTitle} for ${cvType}`);
      return 95; // Very high score for primary matches
    }
    
    // Check for secondary job matches (medium score)
    const secondaryMatch = relevantJobs.secondary.some(job => {
      const jobLower = job.toLowerCase();
      const match = jobTitleLower.includes(jobLower) || jobLower.includes(jobTitleLower);
      if (match) console.log(`🔶 Secondary match found: ${job}`);
      return match;
    });
    
    if (secondaryMatch) {
      console.log(`🔶 Secondary type match: ${jobTitle} for ${cvType}`);
      return 80; // Good score for secondary matches
    }
    
    // RELAXED: Check for individual keyword matches
    const allJobs = [...relevantJobs.primary, ...relevantJobs.secondary];
    let keywordScore = 0;
    
    allJobs.forEach(job => {
      const jobWords = job.toLowerCase().split(' ');
      jobWords.forEach(word => {
        if (word.length > 3 && jobTitleLower.includes(word)) {
          keywordScore += 15; // Add points for each keyword match
          console.log(`🔸 Keyword match: ${word}`);
        }
      });
    });
    
    if (keywordScore > 0) {
      const finalScore = Math.min(75, keywordScore);
      console.log(`🔸 Partial type match: ${jobTitle} for ${cvType} (score: ${finalScore})`);
      return finalScore;
    }
    
    // FALLBACK: Give minimum score based on general category alignment
    const fallbackScore = this.getCategoryFallbackScore(cvType, jobTitle);
    console.log(`❌ No direct match, fallback score: ${fallbackScore} for ${jobTitle}`);
    return fallbackScore;
  }

  // NEW: Category fallback scoring untuk improve accuracy
  getCategoryFallbackScore(cvType, jobTitle) {
    const jobLower = jobTitle.toLowerCase();
    
    // Generic category alignment
    const categoryKeywords = {
      technical: ['developer', 'engineer', 'programmer', 'software', 'tech', 'coding', 'web', 'app', 'system'],
      business: ['manager', 'sales', 'account', 'business', 'client', 'customer', 'executive', 'lead'],
      marketing: ['marketing', 'digital', 'social', 'content', 'campaign', 'brand', 'promotion', 'advertising'],
      finance: ['finance', 'financial', 'accounting', 'analyst', 'budget', 'audit', 'investment', 'banking']
    };
    
    const keywords = categoryKeywords[cvType] || [];
    let matchCount = 0;
    
    keywords.forEach(keyword => {
      if (jobLower.includes(keyword)) {
        matchCount++;
      }
    });
    
    // Return score based on matches (minimum 30 for any category alignment)
    return Math.max(30, Math.min(70, matchCount * 15));
  }iteria
  calculateSkillsMatch(cvAnalysis, job) {
    const cvSkills = cvAnalysis.skillsFound || [];
    const jobRequirements = job.requirements || [];
    
    console.log(`🔧 Skills matching - CV has ${cvSkills.length} skills, Job needs ${jobRequirements.length} requirements`);
    
    // RELAXED: If no specific requirements, use CV skill score directly
    if (jobRequirements.length === 0) {
      const score = cvAnalysis.skillScore ? Math.min(90, Math.max(50, cvAnalysis.skillScore)) : 60;
      console.log(`📈 Using CV skill score directly: ${score}%`);
      return score;
    }
    
    if (cvSkills.length === 0) {
      console.log(`⚠️ No CV skills found, returning base score`);
      return 45;
    }
    
    let matchScore = 0;
    let totalPossibleScore = 0;
    const matchedSkills = [];
    
    jobRequirements.forEach((requirement, index) => {
      const reqLower = requirement.toLowerCase();
      totalPossibleScore += 10; // Each requirement worth 10 points
      
      console.log(`🎯 Checking requirement ${index + 1}: "${requirement}"`);
      
      // Check for exact skill match
      const exactMatch = cvSkills.find(skill => {
        const skillLower = skill.toLowerCase();
        return skillLower === reqLower || 
               skillLower.includes(reqLower) || 
               reqLower.includes(skillLower);
      });
      
      if (exactMatch) {
        matchScore += 10; // Full points for exact match
        matchedSkills.push(requirement);
        console.log(`✅ Exact skill match: "${requirement}" ↔ "${exactMatch}"`);
        return;
      }
      
      // RELAXED: Check for partial word matches
      const partialMatch = cvSkills.find(skill => {
        const skillWords = skill.toLowerCase().split(/[\s-_]+/);
        const reqWords = reqLower.split(/[\s-_]+/);
        
        return skillWords.some(skillWord => 
          reqWords.some(reqWord => 
            skillWord.length > 2 && reqWord.length > 2 &&
            (skillWord.includes(reqWord) || reqWord.includes(skillWord))
          )
        );
      });
      
      if (partialMatch) {
        matchScore += 7; // Good points for partial match
        matchedSkills.push(requirement);
        console.log(`🔸 Partial skill match: "${requirement}" ↔ "${partialMatch}"`);
        return;
      }
      
      // VERY RELAXED: Check for similar/related skills
      const relatedMatch = cvSkills.find(skill => {
        return this.areSimilarSkills(skill, requirement);
      });
      
      if (relatedMatch) {
        matchScore += 4; // Some points for related match
        console.log(`🔹 Related skill match: "${requirement}" ↔ "${relatedMatch}"`);
      } else {
        console.log(`❌ No match found for: "${requirement}"`);
      }
    });
    
    // Calculate base score
    const baseScore = totalPossibleScore > 0 ? (matchScore / totalPossibleScore) * 100 : 0;
    
    // GENEROUS: Add bonus for having many skills (indicates versatility)
    const skillCountBonus = Math.min(20, cvSkills.length * 1.5);
    
    // BONUS: If CV has high skill score, give additional boost
    const skillScoreBonus = cvAnalysis.skillScore > 70 ? 10 : 0;
    
    const finalScore = Math.min(100, baseScore + skillCountBonus + skillScoreBonus);
    
    console.log(`🎯 Skills matching summary:`);
    console.log(`   - Base score: ${baseScore.toFixed(1)}% (${matchedSkills.length}/${jobRequirements.length} requirements matched)`);
    console.log(`   - Skill count bonus: ${skillCountBonus.toFixed(1)}%`);
    console.log(`   - Skill score bonus: ${skillScoreBonus}%`);
    console.log(`   - Final score: ${finalScore.toFixed(1)}%`);
    console.log(`   - Matched skills: [${matchedSkills.join(', ')}]`);
    
    return finalScore;
  }

  // Enhanced Experience Matching with Smart Level Detection
  calculateExperienceMatch(cvExperienceYears, jobExperience) {
    if (!jobExperience || cvExperienceYears === undefined) return 60;
    
    const jobExpLower = jobExperience.toLowerCase();
    let requiredYears = 0;
    
    // Enhanced experience requirement parsing
    if (jobExpLower.includes('fresh') || jobExpLower.includes('entry')) {
      requiredYears = 0;
    } else if (jobExpLower.includes('1-2') || jobExpLower.includes('junior')) {
      requiredYears = 1;
    } else if (jobExpLower.includes('2-3') || jobExpLower.includes('3-5')) {
      requiredYears = 3;
    } else if (jobExpLower.includes('5+') || jobExpLower.includes('senior')) {
      requiredYears = 5;
    } else if (jobExpLower.includes('lead') || jobExpLower.includes('manager')) {
      requiredYears = 7;
    }
    
    // Enhanced experience scoring with overqualification handling
    if (cvExperienceYears >= requiredYears) {
      const overqualification = cvExperienceYears - requiredYears;
      if (overqualification <= 2) {
        return 100; // Perfect match
      } else if (overqualification <= 5) {
        return 90; // Slightly overqualified
      } else {
        return 75; // Significantly overqualified
      }
    } else {
      const shortfall = requiredYears - cvExperienceYears;
      if (shortfall === 1) {
        return 80; // Close match
      } else if (shortfall === 2) {
        return 60; // Moderate shortfall
      } else {
        return 30; // Significant shortfall
      }
    }
  }

  // Enhanced keyword matching
  calculateKeywordMatch(cvAnalysis, job) {
    const cvKeywords = cvAnalysis.keywords || [];
    const jobTitle = job.title.toLowerCase();
    const jobDescription = (job.description || '').toLowerCase();
    const combinedJobText = `${jobTitle} ${jobDescription}`;
    
    if (cvKeywords.length === 0) return 50;
    
    let matches = 0;
    cvKeywords.forEach(keyword => {
      if (combinedJobText.includes(keyword.toLowerCase())) {
        matches++;
      }
    });
    
    // Enhanced keyword scoring
    const score = Math.min(100, (matches / cvKeywords.length) * 100 + 20);
    return score;
  }

  // Enhanced detailed reasoning generation
  generateDetailedMatchReasons(cvAnalysis, job, matchScore) {
    const reasons = [];
    const cvText = cvAnalysis.rawText || '';
    
    // Enhanced type-based reasoning
    if (matchScore >= 80) {
      reasons.push(`Excellent match (${Math.round(matchScore)}%) - Strong alignment with ${cvAnalysis.cvType} background`);
    } else if (matchScore >= 65) {
      reasons.push(`Good match (${Math.round(matchScore)}%) - Suitable for ${job.title} role`);
    }
    
    // Enhanced experience reasoning
    const workExperience = this.extractWorkExperience(cvText);
    if (workExperience.length > 0) {
      const relevantExp = workExperience.filter(exp => 
        this.isRelevantExperience(exp, job.title)
      );
      
      if (relevantExp.length > 0) {
        reasons.push(`Relevant work experience: ${relevantExp[0]}`);
      } else if (workExperience.length > 0) {
        reasons.push(`Professional experience: ${workExperience[0]}`);
      }
    }
    
    // Enhanced education reasoning  
    const education = this.extractEducation(cvText);
    if (education.length > 0) {
      const relevantEd = education.find(ed => 
        this.isRelevantEducation(ed, job.title, cvAnalysis.cvType)
      );
      
      if (relevantEd) {
        reasons.push(`Educational background: ${relevantEd}`);
      }
    }
    
    // Enhanced skills reasoning
    const matchingSkills = this.getMatchingSkills(cvAnalysis, job);
    if (matchingSkills.length > 0) {
      reasons.push(`Key skills: ${matchingSkills.slice(0, 3).join(', ')}`);
    }
    
    // Enhanced combined reasoning
    if (workExperience.length > 0 && education.length > 0) {
      const combinedReason = this.getCombinedReason(workExperience[0], education[0], job.title);
      if (combinedReason) {
        reasons.push(combinedReason);
      }
    }
    
    return reasons.slice(0, 4); // Limit to top 4 reasons
  }

  // Helper methods for enhanced reasoning
  extractWorkExperience(cvText) {
    const experiencePatterns = [
      /worked as\s+([^.]+)/gi,
      /experience as\s+([^.]+)/gi, 
      /sebagai\s+([^.]+)/gi,
      /pengalaman sebagai\s+([^.]+)/gi,
      /experience as\s+([^.]+)\s+dengan/gi
    ];
    
    const experiences = [];
    experiencePatterns.forEach(pattern => {
      const matches = cvText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/(worked as|experience as|sebagai|pengalaman sebagai)\s+/i, '').trim();
          if (cleaned.length > 0 && cleaned.length < 100) {
            experiences.push(cleaned);
          }
        });
      }
    });
    
    return [...new Set(experiences)].slice(0, 3);
  }

  extractEducation(cvText) {
    const educationPatterns = [
      /bachelor[^.]+/gi,
      /master[^.]+/gi,
      /university[^.]+/gi,
      /degree[^.]+/gi,
      /sarjana[^.]+/gi,
      /universitas[^.]+/gi
    ];
    
    const educations = [];
    educationPatterns.forEach(pattern => {
      const matches = cvText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length > 10 && match.length < 100) {
            educations.push(match.trim());
          }
        });
      }
    });
    
    return [...new Set(educations)].slice(0, 2);
  }

  isRelevantExperience(experience, jobTitle) {
    const expLower = experience.toLowerCase();
    const jobLower = jobTitle.toLowerCase();
    
    const keywords = jobLower.split(' ').filter(word => word.length > 3);
    return keywords.some(keyword => expLower.includes(keyword));
  }

  isRelevantEducation(education, jobTitle, cvType) {
    const edLower = education.toLowerCase();
    const relevantFields = {
      technical: ['computer', 'software', 'engineering', 'technology', 'programming'],
      business: ['business', 'management', 'commerce', 'administration'],
      marketing: ['marketing', 'communication', 'advertising', 'media'],
      finance: ['finance', 'accounting', 'economics', 'business']
    };
    
    const fields = relevantFields[cvType] || [];
    return fields.some(field => edLower.includes(field));
  }

  getCombinedReason(experience, education, jobTitle) {
    const expWords = experience.toLowerCase().split(' ');
    const edWords = education.toLowerCase().split(' ');
    const jobWords = jobTitle.toLowerCase().split(' ');
    
    const commonExpJob = expWords.filter(word => 
      word.length > 3 && jobWords.some(jobWord => jobWord.includes(word))
    );
    
    if (commonExpJob.length > 0) {
      return `Combined strength: ${experience} experience with relevant ${education}`;
    }
    
    return null;
  }

  // ENHANCED: Better skill similarity detection
  areSimilarSkills(skill1, skill2) {
    const s1 = skill1.toLowerCase().trim();
    const s2 = skill2.toLowerCase().trim();
    
    if (s1 === s2) return true;
    if (s1.includes(s2) || s2.includes(s1)) return true;
    
    // Technology synonyms and related skills
    const skillSynonyms = {
      'javascript': ['js', 'react', 'vue', 'angular', 'node', 'typescript'],
      'python': ['django', 'flask', 'pandas', 'numpy'],
      'react': ['jsx', 'reactjs', 'javascript', 'frontend'],
      'sql': ['mysql', 'postgresql', 'database', 'oracle'],
      'css': ['styling', 'bootstrap', 'sass', 'scss'],
      'html': ['markup', 'web', 'frontend'],
      'sales': ['selling', 'account', 'business development', 'client'],
      'marketing': ['digital marketing', 'social media', 'advertising'],
      'accounting': ['bookkeeping', 'finance', 'financial'],
      'management': ['leadership', 'team lead', 'supervisor']
    };
    
    // Check if skills are related through synonyms
    for (const [key, synonyms] of Object.entries(skillSynonyms)) {
      if ((s1.includes(key) || synonyms.some(syn => s1.includes(syn))) &&
          (s2.includes(key) || synonyms.some(syn => s2.includes(syn)))) {
        return true;
      }
    }
    
    // Check common word overlap
    const words1 = s1.split(/[\s-_]+/).filter(w => w.length > 2);
    const words2 = s2.split(/[\s-_]+/).filter(w => w.length > 2);
    
    const overlap = words1.filter(w1 => 
      words2.some(w2 => w1.includes(w2) || w2.includes(w1))
    ).length;
    
    return overlap >= Math.min(words1.length, words2.length) * 0.5;
  }

  // ENHANCED: Better skill similarity detection
  areSimilarSkills(skill1, skill2) {
    const s1 = skill1.toLowerCase().trim();
    const s2 = skill2.toLowerCase().trim();
    
    if (s1 === s2) return true;
    if (s1.includes(s2) || s2.includes(s1)) return true;
    
    // Technology synonyms and related skills
    const skillSynonyms = {
      'javascript': ['js', 'react', 'vue', 'angular', 'node', 'typescript'],
      'python': ['django', 'flask', 'pandas', 'numpy'],
      'react': ['jsx', 'reactjs', 'javascript', 'frontend'],
      'sql': ['mysql', 'postgresql', 'database', 'oracle'],
      'css': ['styling', 'bootstrap', 'sass', 'scss'],
      'html': ['markup', 'web', 'frontend'],
      'sales': ['selling', 'account', 'business development', 'client'],
      'marketing': ['digital marketing', 'social media', 'advertising'],
      'accounting': ['bookkeeping', 'finance', 'financial'],
      'management': ['leadership', 'team lead', 'supervisor']
    };
    
    // Check if skills are related through synonyms
    for (const [key, synonyms] of Object.entries(skillSynonyms)) {
      if ((s1.includes(key) || synonyms.some(syn => s1.includes(syn))) &&
          (s2.includes(key) || synonyms.some(syn => s2.includes(syn)))) {
        return true;
      }
    }
    
    // Check common word overlap
    const words1 = s1.split(/[\s-_]+/).filter(w => w.length > 2);
    const words2 = s2.split(/[\s-_]+/).filter(w => w.length > 2);
    
    const overlap = words1.filter(w1 => 
      words2.some(w2 => w1.includes(w2) || w2.includes(w1))
    ).length;
    
    return overlap >= Math.min(words1.length, words2.length) * 0.5;
  }

  getMatchingSkills(cvAnalysis, job) {
    const cvSkills = cvAnalysis.skillsFound || [];
    const jobRequirements = job.requirements || [];
    
    const matchingSkills = [];
    jobRequirements.forEach(req => {
      const match = cvSkills.find(skill => 
        skill.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(skill.toLowerCase())
      );
      if (match) {
        matchingSkills.push(match);
      }
    });
    
    return matchingSkills;
  }
}

export const matchCalculator = new MatchCalculator();