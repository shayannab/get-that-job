/**
 * Extracts all text content from resume for analysis
 * @param {Object} resumeContent - The resume content object
 * @returns {string} - Combined text from all resume sections
 */
function extractResumeText(resumeContent) {
  let text = '';

  // Add summary
  if (resumeContent.summary && typeof resumeContent.summary === 'string') {
    text += resumeContent.summary + ' ';
  }

  // Add experience
  if (Array.isArray(resumeContent.experience)) {
    resumeContent.experience.forEach((exp) => {
      if (exp.company) text += exp.company + ' ';
      if (exp.role) text += exp.role + ' ';
      if (Array.isArray(exp.bullets)) {
        exp.bullets.forEach((bullet) => {
          text += bullet + ' ';
        });
      }
    });
  }

  // Add skills
  if (resumeContent.skills) {
    if (Array.isArray(resumeContent.skills.technical)) {
      text += resumeContent.skills.technical.join(' ') + ' ';
    }
    if (Array.isArray(resumeContent.skills.soft)) {
      text += resumeContent.skills.soft.join(' ') + ' ';
    }
    if (Array.isArray(resumeContent.skills.tools)) {
      text += resumeContent.skills.tools.join(' ') + ' ';
    }
  }

  // Add education
  if (Array.isArray(resumeContent.education)) {
    resumeContent.education.forEach((edu) => {
      if (edu.degree) text += edu.degree + ' ';
      if (edu.institution) text += edu.institution + ' ';
      if (edu.details) text += edu.details + ' ';
    });
  }

  // Add additional sections
  if (Array.isArray(resumeContent.additionalSections)) {
    resumeContent.additionalSections.forEach((section) => {
      if (section.title) text += section.title + ' ';
      if (Array.isArray(section.items)) {
        text += section.items.join(' ') + ' ';
      }
    });
  }

  return text.toLowerCase().trim();
}

/**
 * Normalizes a keyword for comparison (lowercase, remove special chars)
 * @param {string} keyword - The keyword to normalize
 * @returns {string} - Normalized keyword
 */
function normalizeKeyword(keyword) {
  return keyword.toLowerCase().replace(/[^\w\s]/g, '').trim();
}

/**
 * Counts occurrences of a keyword in text (case-insensitive, whole word matching)
 * @param {string} text - The text to search in
 * @param {string} keyword - The keyword to search for
 * @returns {number} - Number of occurrences
 */
function countKeywordOccurrences(text, keyword) {
  const normalizedText = normalizeKeyword(text);
  const normalizedKeyword = normalizeKeyword(keyword);
  
  // Use word boundary regex to match whole words
  const regex = new RegExp(`\\b${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  const matches = normalizedText.match(regex);
  
  return matches ? matches.length : 0;
}

/**
 * Calculates keyword match score based on ATS keywords
 * @param {string} resumeText - The extracted resume text
 * @param {Array<Object>} atsKeywords - Array of {keyword: string, frequency: number}
 * @returns {Object} - {score: number, missingKeywords: Array<string>, keywordCounts: Object}
 */
function calculateKeywordMatch(resumeText, atsKeywords) {
  if (!Array.isArray(atsKeywords) || atsKeywords.length === 0) {
    return { score: 0, missingKeywords: [], keywordCounts: {} };
  }

  const keywordCounts = {};
  const foundKeywords = [];
  const missingKeywords = [];

  // Count occurrences of each keyword
  atsKeywords.forEach((kwObj) => {
    const keyword = kwObj.keyword;
    const count = countKeywordOccurrences(resumeText, keyword);
    keywordCounts[keyword] = count;

    if (count > 0) {
      foundKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });

  // Calculate weighted score based on keyword frequency
  // Higher frequency keywords are more important
  let totalWeight = 0;
  let matchedWeight = 0;

  atsKeywords.forEach((kwObj) => {
    const keyword = kwObj.keyword;
    const frequency = kwObj.frequency || 1;
    const count = keywordCounts[keyword] || 0;
    
    totalWeight += frequency;
    if (count > 0) {
      // Bonus for keywords that appear multiple times (but not too many)
      const matchWeight = Math.min(count, 3) * frequency; // Cap at 3 occurrences
      matchedWeight += matchWeight;
    }
  });

  // Calculate score: weighted percentage
  const score = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;

  return {
    score: Math.min(100, Math.round(score * 100) / 100), // Cap at 100, round to 2 decimal places
    missingKeywords,
    keywordCounts,
  };
}

/**
 * Calculates skills coverage score
 * @param {Object} resumeContent - The resume content object
 * @param {Array<string>} requiredSkills - Array of required skills
 * @returns {Object} - {score: number, missingSkills: Array<string>, foundSkills: Array<string>}
 */
function calculateSkillsCoverage(resumeContent, requiredSkills) {
  if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
    return { score: 100, missingSkills: [], foundSkills: [] };
  }

  const resumeText = extractResumeText(resumeContent);
  const foundSkills = [];
  const missingSkills = [];

  // Check each required skill
  requiredSkills.forEach((skill) => {
    const normalizedSkill = normalizeKeyword(skill);
    const normalizedResumeText = normalizeKeyword(resumeText);
    
    // Check if skill appears in resume text (flexible matching)
    // Also check in skills arrays
    let found = false;

    // Check in resume text
    if (normalizedResumeText.includes(normalizedSkill)) {
      found = true;
    }

    // Check in skills.technical array
    if (!found && Array.isArray(resumeContent.skills?.technical)) {
      found = resumeContent.skills.technical.some(
        (s) => normalizeKeyword(s) === normalizedSkill || normalizeKeyword(s).includes(normalizedSkill) || normalizedSkill.includes(normalizeKeyword(s))
      );
    }

    // Check in skills.tools array
    if (!found && Array.isArray(resumeContent.skills?.tools)) {
      found = resumeContent.skills.tools.some(
        (s) => normalizeKeyword(s) === normalizedSkill || normalizeKeyword(s).includes(normalizedSkill) || normalizedSkill.includes(normalizeKeyword(s))
      );
    }

    if (found) {
      foundSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // Calculate score: percentage of required skills found
  const score = (foundSkills.length / requiredSkills.length) * 100;

  return {
    score: Math.round(score * 100) / 100,
    missingSkills,
    foundSkills,
  };
}

/**
 * Calculates content quality score based on various factors
 * @param {Object} resumeContent - The resume content object
 * @returns {number} - Content quality score (0-100)
 */
function calculateContentQuality(resumeContent) {
  let score = 0;
  let factors = 0;

  // Factor 1: Summary quality (0-25 points)
  if (resumeContent.summary && typeof resumeContent.summary === 'string') {
    const summary = resumeContent.summary;
    let summaryScore = 0;
    
    // Length check (2-3 sentences ideal)
    const sentenceCount = (summary.match(/[.!?]+/g) || []).length;
    if (sentenceCount >= 2 && sentenceCount <= 3) {
      summaryScore += 10;
    } else if (sentenceCount >= 1 && sentenceCount <= 4) {
      summaryScore += 5;
    }

    // Keyword presence
    if (summary.length > 50) {
      summaryScore += 10;
    }

    // Professional tone indicators
    const professionalWords = ['experienced', 'skilled', 'proven', 'expertise', 'proficient', 'accomplished'];
    const hasProfessionalWords = professionalWords.some(word => summary.toLowerCase().includes(word));
    if (hasProfessionalWords) {
      summaryScore += 5;
    }

    score += summaryScore;
    factors++;
  }

  // Factor 2: Experience bullets quality (0-40 points)
  if (Array.isArray(resumeContent.experience) && resumeContent.experience.length > 0) {
    let experienceScore = 0;
    let totalBullets = 0;
    let bulletsWithMetrics = 0;
    let bulletsWithActionVerbs = 0;

    const actionVerbs = [
      'developed', 'implemented', 'created', 'designed', 'built', 'led', 'managed',
      'optimized', 'improved', 'increased', 'reduced', 'achieved', 'delivered',
      'executed', 'launched', 'established', 'transformed', 'enhanced', 'streamlined'
    ];

    resumeContent.experience.forEach((exp) => {
      if (Array.isArray(exp.bullets)) {
        exp.bullets.forEach((bullet) => {
          totalBullets++;
          const bulletLower = bullet.toLowerCase();

          // Check for metrics (numbers, percentages, dollar signs)
          const hasMetrics = /\d+%|\$\d+|\d+\s*(million|thousand|k|m|b)|increased|decreased|reduced|improved|by\s+\d+/i.test(bullet);
          if (hasMetrics) {
            bulletsWithMetrics++;
          }

          // Check for action verbs
          const hasActionVerb = actionVerbs.some(verb => bulletLower.startsWith(verb) || bulletLower.includes(` ${verb}`));
          if (hasActionVerb) {
            bulletsWithActionVerbs++;
          }
        });
      }
    });

    if (totalBullets > 0) {
      const metricsRatio = bulletsWithMetrics / totalBullets;
      const actionVerbRatio = bulletsWithActionVerbs / totalBullets;
      
      experienceScore += metricsRatio * 20; // Up to 20 points for metrics
      experienceScore += actionVerbRatio * 15; // Up to 15 points for action verbs
      
      // Bonus for having multiple experience entries
      if (resumeContent.experience.length >= 2) {
        experienceScore += 5;
      }
    }

    score += experienceScore;
    factors++;
  }

  // Factor 3: Skills organization (0-20 points)
  if (resumeContent.skills) {
    let skillsScore = 0;
    
    const technicalCount = Array.isArray(resumeContent.skills.technical) ? resumeContent.skills.technical.length : 0;
    const softCount = Array.isArray(resumeContent.skills.soft) ? resumeContent.skills.soft.length : 0;
    const toolsCount = Array.isArray(resumeContent.skills.tools) ? resumeContent.skills.tools.length : 0;

    // Good skills distribution
    if (technicalCount >= 5) skillsScore += 10;
    else if (technicalCount >= 3) skillsScore += 5;

    if (softCount >= 3) skillsScore += 5;
    else if (softCount >= 1) skillsScore += 2;

    if (toolsCount >= 2) skillsScore += 5;
    else if (toolsCount >= 1) skillsScore += 2;

    score += skillsScore;
    factors++;
  }

  // Factor 4: Education presence (0-10 points)
  if (Array.isArray(resumeContent.education) && resumeContent.education.length > 0) {
    score += 10;
    factors++;
  }

  // Factor 5: Additional sections (0-5 points)
  if (Array.isArray(resumeContent.additionalSections) && resumeContent.additionalSections.length > 0) {
    score += 5;
    factors++;
  }

  // Normalize to 0-100 scale
  if (factors > 0) {
    // Maximum possible score is 100 (25 + 40 + 20 + 10 + 5)
    // But we calculate based on actual factors present
    const maxPossibleScore = 100;
    const normalizedScore = (score / maxPossibleScore) * 100;
    return Math.round(normalizedScore * 100) / 100;
  }

  return 0;
}

/**
 * Detects keyword stuffing in resume
 * @param {string} resumeText - The extracted resume text
 * @param {Array<Object>} atsKeywords - Array of ATS keywords
 * @returns {Array<string>} - Array of keywords that appear more than 5 times
 */
function detectKeywordStuffing(resumeText, atsKeywords) {
  const stuffedKeywords = [];

  if (!Array.isArray(atsKeywords)) {
    return stuffedKeywords;
  }

  atsKeywords.forEach((kwObj) => {
    const keyword = kwObj.keyword;
    const count = countKeywordOccurrences(resumeText, keyword);
    
    if (count > 5) {
      stuffedKeywords.push(keyword);
    }
  });

  return stuffedKeywords;
}

/**
 * Generates suggestions based on scoring results
 * @param {Object} scores - The scoring results
 * @param {Object} resumeContent - The resume content object
 * @param {Object} jobAnalysis - The job analysis object
 * @returns {Array<string>} - Array of suggestion strings
 */
function generateSuggestions(scores, resumeContent, jobAnalysis) {
  const suggestions = [];

  // Keyword match suggestions
  if (scores.keywordMatchScore < 75) {
    if (scores.missingKeywords.length > 0) {
      const topMissing = scores.missingKeywords.slice(0, 8);
      suggestions.push(`CRITICAL: Add these high-priority keywords to your resume: ${topMissing.join(', ')}. Include them in your summary and experience bullets.`);
    }
    suggestions.push('Incorporate more ATS keywords naturally throughout your resume. Focus on the summary (5-8 keywords) and experience bullets (2-3 keywords per bullet).');
  } else if (scores.keywordMatchScore < 85) {
    if (scores.missingKeywords.length > 0) {
      const topMissing = scores.missingKeywords.slice(0, 3);
      suggestions.push(`Add these remaining keywords to improve your score: ${topMissing.join(', ')}`);
    }
  }

  // Skills coverage suggestions
  if (scores.skillsCoverageScore < 75) {
    if (scores.missingSkills.length > 0) {
      const topMissing = scores.missingSkills.slice(0, 8);
      suggestions.push(`IMPORTANT: Add these required skills to your resume: ${topMissing.join(', ')}. List them in your skills section AND demonstrate them in your experience bullets with specific achievements.`);
    }
    suggestions.push('Ensure ALL required skills from the job posting appear in both your skills section and are demonstrated in your experience bullets.');
  } else if (scores.skillsCoverageScore < 90) {
    if (scores.missingSkills.length > 0) {
      const topMissing = scores.missingSkills.slice(0, 3);
      suggestions.push(`Consider adding these skills to improve coverage: ${topMissing.join(', ')}`);
    }
  }

  // Content quality suggestions
  if (scores.contentQualityScore < 75) {
    // Check if bullets have metrics
    let bulletsWithoutMetrics = 0;
    let totalBullets = 0;
    if (Array.isArray(resumeContent.experience)) {
      resumeContent.experience.forEach((exp) => {
        if (Array.isArray(exp.bullets)) {
          exp.bullets.forEach((bullet) => {
            totalBullets++;
            const hasMetrics = /\d+%|\$\d+|\d+\s*(million|thousand|k|m|b)|increased|decreased|reduced|improved|by\s+\d+|served|processed|managed\s+\d+/i.test(bullet);
            if (!hasMetrics) bulletsWithoutMetrics++;
          });
        }
      });
    }
    
    if (bulletsWithoutMetrics > 0 && totalBullets > 0) {
      suggestions.push(`CRITICAL: ${bulletsWithoutMetrics} out of ${totalBullets} experience bullets lack quantified metrics. Add specific numbers, percentages, dollar amounts, or scale indicators to EVERY bullet point.`);
    }
    
    suggestions.push('Start EVERY experience bullet with a strong action verb (Developed, Implemented, Led, Optimized, Designed, Built, Achieved, etc.).');
    
    if (!resumeContent.summary || resumeContent.summary.length < 100) {
      suggestions.push('Expand your professional summary to 2-3 sentences (100-150 words) that include ATS keywords and highlight your most relevant experience and skills.');
    }
  }

  // Keyword stuffing warnings
  if (scores.stuffedKeywords && scores.stuffedKeywords.length > 0) {
    suggestions.push(`Warning: These keywords appear too frequently and may be flagged as keyword stuffing: ${scores.stuffedKeywords.join(', ')}. Use them more naturally.`);
  }

  // General suggestions
  if (scores.overallScore < 60) {
    suggestions.push('Consider restructuring your resume to better match the job requirements. Focus on aligning your experience with the key responsibilities listed in the job posting.');
  } else if (scores.overallScore < 80) {
    suggestions.push('Your resume is good but could be improved. Focus on the missing keywords and skills to increase your ATS score.');
  } else {
    suggestions.push('Great job! Your resume is well-optimized for ATS. Continue to refine based on the specific job requirements.');
  }

  // Skills section suggestions
  if (resumeContent.skills) {
    const technicalCount = Array.isArray(resumeContent.skills.technical) ? resumeContent.skills.technical.length : 0;
    if (technicalCount < 5) {
      suggestions.push('Consider adding more technical skills to your skills section to better match the job requirements.');
    }
  }

  return suggestions;
}

/**
 * Scores a resume against job analysis for ATS optimization
 * @param {Object} resumeContent - The resume content object from generateResumeContent
 * @param {Object} resumeContent.summary - Professional summary string
 * @param {Object} resumeContent.experience - Array of experience objects
 * @param {Object} resumeContent.skills - Object with technical, soft, and tools arrays
 * @param {Object} resumeContent.education - Array of education objects
 * @param {Object} resumeContent.additionalSections - Array of additional section objects
 * @param {Object} jobAnalysis - The job analysis object from analyzeJobPosting
 * @param {Array<Object>} jobAnalysis.atsKeywords - Array of {keyword: string, frequency: number}
 * @param {Array<string>} jobAnalysis.requiredSkills - Array of required skills
 * @param {Array<string>} jobAnalysis.keyResponsibilities - Array of key responsibilities
 * @returns {Object} - Scoring results object
 * @returns {number} returns.overallScore - Overall ATS score (0-100)
 * @returns {number} returns.keywordMatchScore - Keyword match score (0-100)
 * @returns {number} returns.skillsCoverageScore - Skills coverage score (0-100)
 * @returns {number} returns.contentQualityScore - Content quality score (0-100)
 * @returns {Array<string>} returns.missingKeywords - Array of missing ATS keywords
 * @returns {Array<string>} returns.missingSkills - Array of missing required skills
 * @returns {Array<string>} returns.suggestions - Array of improvement suggestions
 * 
 * @example
 * const resumeContent = await generateResumeContent(jobAnalysis, userAnswers);
 * const scores = scoreResume(resumeContent, jobAnalysis);
 * console.log(scores.overallScore); // Overall ATS score
 */
function scoreResume(resumeContent, jobAnalysis) {
  // Validation
  if (!resumeContent || typeof resumeContent !== 'object') {
    throw new Error('resumeContent must be a valid object');
  }

  if (!jobAnalysis || typeof jobAnalysis !== 'object') {
    throw new Error('jobAnalysis must be a valid object');
  }

  // Extract resume text for analysis
  const resumeText = extractResumeText(resumeContent);

  // Calculate keyword match score (40% weight)
  const keywordMatch = calculateKeywordMatch(
    resumeText,
    jobAnalysis.atsKeywords || []
  );

  // Calculate skills coverage score (35% weight)
  const skillsCoverage = calculateSkillsCoverage(
    resumeContent,
    jobAnalysis.requiredSkills || []
  );

  // Calculate content quality score (25% weight)
  const contentQualityScore = calculateContentQuality(resumeContent);

  // Detect keyword stuffing
  const stuffedKeywords = detectKeywordStuffing(
    resumeText,
    jobAnalysis.atsKeywords || []
  );

  // Calculate overall score with improved weights
  // Keyword match is most important (50%), then skills (30%), then content quality (20%)
  const overallScore = Math.round(
    (keywordMatch.score * 0.50) +
    (skillsCoverage.score * 0.30) +
    (contentQualityScore * 0.20)
  );

  // Generate suggestions
  const suggestions = generateSuggestions(
    {
      keywordMatchScore: keywordMatch.score,
      skillsCoverageScore: skillsCoverage.score,
      contentQualityScore: contentQualityScore,
      overallScore: overallScore,
      missingKeywords: keywordMatch.missingKeywords,
      missingSkills: skillsCoverage.missingSkills,
      stuffedKeywords: stuffedKeywords,
    },
    resumeContent,
    jobAnalysis
  );

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)), // Clamp between 0-100
    keywordMatchScore: keywordMatch.score,
    skillsCoverageScore: skillsCoverage.score,
    contentQualityScore: contentQualityScore,
    missingKeywords: keywordMatch.missingKeywords,
    missingSkills: skillsCoverage.missingSkills,
    suggestions: suggestions,
  };
}

module.exports = {
  scoreResume,
};

