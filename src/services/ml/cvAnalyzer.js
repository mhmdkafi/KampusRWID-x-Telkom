import { textExtractor } from '../utils/textExtractor';

class CVAnalyzer {
  constructor() {
    // Predefined skill categories and keywords
    this.skillCategories = {
      programming: [
        'javascript', 'python', 'java', 'react', 'vue', 'angular', 'node.js', 
        'php', 'ruby', 'c++', 'c#', 'go', 'typescript', 'swift', 'kotlin',
        'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind'
      ],
      database: [
        'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle',
        'sql server', 'sqlite', 'cassandra', 'dynamodb'
      ],
      framework: [
        'laravel', 'django', 'flask', 'spring', 'express', 'fastapi', 
        'rails', 'asp.net', 'nextjs', 'nuxt', 'gatsby'
      ],
      tools: [
        'git', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github',
        'jira', 'confluence', 'slack', 'trello', 'figma', 'adobe'
      ],
      cloud: [
        'aws', 'azure', 'google cloud', 'heroku', 'digitalocean',
        'firebase', 'vercel', 'netlify'
      ],
      soft_skills: [
        'leadership', 'communication', 'teamwork', 'problem solving',
        'analytical', 'creative', 'adaptable', 'time management'
      ]
    };

    this.experienceLevels = {
      'fresh graduate': 0,
      'entry level': 1,
      'junior': 1,
      '1-2 years': 1.5,
      '2-3 years': 2.5,
      '3-5 years': 4,
      'mid level': 4,
      'senior': 6,
      '5+ years': 6,
      'lead': 8,
      'manager': 8
    };
  }

  // Main CV analysis function
  async analyzeCV(file) {
    try {
      // Extract text from CV file
      const extractedText = await textExtractor.extractFromFile(file);
      
      // Perform analysis
      const analysis = {
        rawText: extractedText,
        skills: this.extractSkills(extractedText),
        experience: this.extractExperience(extractedText),
        education: this.extractEducation(extractedText),
        jobTitles: this.extractJobTitles(extractedText),
        keywords: this.extractKeywords(extractedText),
        summary: this.generateSummary(extractedText)
      };

      // Calculate skill score and category weights
      analysis.skillScore = this.calculateSkillScore(analysis.skills);
      analysis.experienceYears = this.calculateExperienceYears(analysis.experience);
      
      return analysis;
    } catch (error) {
      console.error('CV Analysis Error:', error);
      throw new Error('Failed to analyze CV');
    }
  }

  // Extract skills from CV text
  extractSkills(text) {
    const lowerText = text.toLowerCase();
    const foundSkills = {};

    // Check each skill category
    Object.keys(this.skillCategories).forEach(category => {
      foundSkills[category] = [];
      
      this.skillCategories[category].forEach(skill => {
        // Use word boundaries to match exact skills
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = text.match(regex);
        
        if (matches && matches.length > 0) {
          foundSkills[category].push({
            skill: skill,
            count: matches.length,
            category: category
          });
        }
      });
    });

    return foundSkills;
  }

  // Extract work experience information
  extractExperience(text) {
    const experiences = [];
    const lines = text.split('\n');
    
    // Look for patterns indicating work experience
    const experiencePatterns = [
      /(\d{4})\s*[-–]\s*(\d{4}|present|now)/gi,
      /(\w+\s+\d{4})\s*[-–]\s*(\w+\s+\d{4}|present|now)/gi,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/gi
    ];

    const jobTitlePatterns = [
      /\b(developer|engineer|programmer|analyst|manager|director|coordinator|specialist|consultant|designer|architect)\b/gi
    ];

    lines.forEach((line, index) => {
      // Check for date patterns
      experiencePatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          // Look for job titles in surrounding lines
          const contextLines = lines.slice(Math.max(0, index - 2), index + 3);
          const context = contextLines.join(' ');
          
          const jobTitleMatch = context.match(jobTitlePatterns);
          if (jobTitleMatch) {
            experiences.push({
              period: matches[0],
              title: jobTitleMatch[0],
              context: line.trim(),
              estimatedYears: this.parseExperienceYears(matches[0])
            });
          }
        }
      });
    });

    return experiences;
  }

  // Extract education information
  extractEducation(text) {
    const education = [];
    const educationKeywords = [
      'university', 'college', 'institute', 'school',
      'bachelor', 'master', 'phd', 'diploma',
      'degree', 'certification', 'course'
    ];

    const lines = text.split('\n');
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
        education.push({
          text: line.trim(),
          type: this.classifyEducation(line)
        });
      }
    });

    return education;
  }

  // Extract potential job titles from CV
  extractJobTitles(text) {
    const jobTitlePatterns = [
      'software developer', 'web developer', 'frontend developer', 'backend developer',
      'full stack developer', 'mobile developer', 'data scientist', 'data analyst',
      'ui/ux designer', 'product manager', 'project manager', 'business analyst',
      'system administrator', 'devops engineer', 'quality assurance', 'software engineer'
    ];

    const foundTitles = [];
    const lowerText = text.toLowerCase();

    jobTitlePatterns.forEach(title => {
      if (lowerText.includes(title)) {
        foundTitles.push(title);
      }
    });

    return foundTitles;
  }

  // Extract important keywords
  extractKeywords(text) {
    // Remove common words and extract meaningful keywords
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));

    // Count word frequency
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Return top keywords
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));
  }

  // Generate CV summary
  generateSummary(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Simple extractive summarization - take first few meaningful sentences
    const summary = sentences.slice(0, 3).join('. ').trim();
    
    return summary || 'No clear summary found in CV';
  }

  // Calculate overall skill score
  calculateSkillScore(skills) {
    let totalScore = 0;
    let totalSkills = 0;

    Object.values(skills).forEach(categorySkills => {
      categorySkills.forEach(skillData => {
        totalScore += skillData.count;
        totalSkills++;
      });
    });

    return totalSkills > 0 ? Math.min(100, (totalScore / totalSkills) * 10) : 0;
  }

  // Calculate total years of experience
  calculateExperienceYears(experiences) {
    let totalYears = 0;
    
    experiences.forEach(exp => {
      totalYears += exp.estimatedYears || 0;
    });

    return Math.min(20, totalYears); // Cap at 20 years
  }

  // Helper functions
  parseExperienceYears(periodText) {
    // Simple year extraction and calculation
    const years = periodText.match(/\d{4}/g);
    if (years && years.length >= 2) {
      const startYear = parseInt(years[0]);
      const endYear = years[1] === 'present' || years[1] === 'now' ? 
        new Date().getFullYear() : parseInt(years[1]);
      return Math.max(0, endYear - startYear);
    }
    return 1; // Default to 1 year if unclear
  }

  classifyEducation(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('bachelor') || lowerText.includes('s1')) return 'bachelor';
    if (lowerText.includes('master') || lowerText.includes('s2')) return 'master';
    if (lowerText.includes('phd') || lowerText.includes('s3')) return 'phd';
    if (lowerText.includes('diploma')) return 'diploma';
    return 'other';
  }
}

export const cvAnalyzer = new CVAnalyzer();