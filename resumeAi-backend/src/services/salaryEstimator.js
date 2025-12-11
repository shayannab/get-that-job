/**
 * Salary Estimator Service
 * Estimates salary range based on job requirements, resume strength, and market data
 * Uses heuristics and AI to provide salary insights
 */

require('dotenv').config();
const axios = require('axios');

/**
 * Estimate salary range based on job analysis and resume quality
 * @param {Object} jobAnalysis - The job analysis object
 * @param {Object} resumeContent - The generated resume content
 * @param {Object} atsScore - The ATS score data
 * @param {Object} userAnswers - User's answers including years of experience
 * @returns {Promise<Object>} Salary estimate with range and factors
 */
async function estimateSalary(jobAnalysis, resumeContent, atsScore, userAnswers) {
    if (!jobAnalysis || typeof jobAnalysis !== 'object') {
        throw new Error('jobAnalysis must be a valid object');
    }

    // Extract key factors
    const jobLevel = jobAnalysis.jobLevel || 'mid';
    const industry = jobAnalysis.industry || 'Technology';
    const requiredSkills = jobAnalysis.requiredSkills || [];
    const yearsOfExperience = parseInt(userAnswers?.years_of_experience || userAnswers?.yearsOfExperience) || 3;
    const overallATSScore = atsScore?.overallScore || 70;

    // Base salary ranges by job level (USD annual)
    const baseSalaryRanges = {
        entry: { min: 45000, mid: 60000, max: 80000 },
        mid: { min: 70000, mid: 95000, max: 130000 },
        senior: { min: 110000, mid: 145000, max: 200000 },
    };

    // Industry multipliers
    const industryMultipliers = {
        'Software Development': 1.15,
        'Technology': 1.12,
        'Finance': 1.20,
        'Healthcare': 1.05,
        'Marketing': 0.95,
        'Consulting': 1.10,
        'Retail': 0.85,
        'Manufacturing': 0.90,
        'Education': 0.80,
        'Government': 0.85,
        'default': 1.0,
    };

    // High-demand skills that increase salary
    const highDemandSkills = [
        'machine learning', 'ai', 'artificial intelligence',
        'kubernetes', 'cloud', 'aws', 'gcp', 'azure',
        'react', 'node.js', 'python', 'golang', 'rust',
        'data science', 'blockchain', 'security', 'devops',
        'typescript', 'microservices', 'system design',
    ];

    // Calculate factors
    const baseRange = baseSalaryRanges[jobLevel] || baseSalaryRanges.mid;

    // Industry adjustment
    const industryKey = Object.keys(industryMultipliers).find(key =>
        industry.toLowerCase().includes(key.toLowerCase())
    ) || 'default';
    const industryMultiplier = industryMultipliers[industryKey];

    // Experience adjustment (2% per year over base)
    const baseYears = { entry: 1, mid: 3, senior: 6 }[jobLevel] || 3;
    const experienceBonus = Math.max(0, (yearsOfExperience - baseYears) * 0.02);

    // Skills premium
    const matchedHighDemand = requiredSkills.filter(skill =>
        highDemandSkills.some(hd => skill.toLowerCase().includes(hd))
    ).length;
    const skillsMultiplier = 1 + (matchedHighDemand * 0.02); // 2% per high-demand skill

    // ATS score adjustment (better resume = better negotiating position)
    const atsMultiplier = overallATSScore >= 80 ? 1.05 :
        overallATSScore >= 60 ? 1.0 : 0.95;

    // Calculate final ranges
    const totalMultiplier = industryMultiplier * (1 + experienceBonus) * skillsMultiplier * atsMultiplier;

    const estimatedRange = {
        min: Math.round(baseRange.min * totalMultiplier / 1000) * 1000,
        mid: Math.round(baseRange.mid * totalMultiplier / 1000) * 1000,
        max: Math.round(baseRange.max * totalMultiplier / 1000) * 1000,
    };

    // Build factors breakdown
    const factors = [];

    factors.push({
        factor: 'Job Level',
        value: jobLevel.charAt(0).toUpperCase() + jobLevel.slice(1),
        impact: 'baseline',
        description: `${jobLevel}-level positions typically command ${jobLevel === 'senior' ? 'higher' : jobLevel === 'entry' ? 'starting' : 'mid-range'} salaries`,
    });

    factors.push({
        factor: 'Industry',
        value: industry,
        impact: industryMultiplier > 1 ? 'positive' : industryMultiplier < 1 ? 'negative' : 'neutral',
        description: `${industry} industry ${industryMultiplier > 1 ? 'typically pays above average' : industryMultiplier < 1 ? 'typically pays below tech average' : 'pays at market rate'}`,
    });

    factors.push({
        factor: 'Years of Experience',
        value: `${yearsOfExperience} years`,
        impact: experienceBonus > 0.05 ? 'positive' : 'neutral',
        description: `${yearsOfExperience} years of experience ${experienceBonus > 0 ? 'adds premium to base salary' : 'matches expected level'}`,
    });

    if (matchedHighDemand > 0) {
        factors.push({
            factor: 'High-Demand Skills',
            value: `${matchedHighDemand} skills`,
            impact: 'positive',
            description: `Required skills include ${matchedHighDemand} high-demand technologies that command premium pay`,
        });
    }

    factors.push({
        factor: 'Resume Strength',
        value: `${overallATSScore}% ATS Score`,
        impact: atsMultiplier > 1 ? 'positive' : atsMultiplier < 1 ? 'negative' : 'neutral',
        description: overallATSScore >= 80
            ? 'Strong resume gives better negotiating leverage'
            : overallATSScore >= 60
                ? 'Solid resume positions you competitively'
                : 'Improving your resume could strengthen your position',
    });

    // Generate tips
    const tips = [];

    if (overallATSScore < 80) {
        tips.push('Improve your ATS score to strengthen your negotiating position');
    }

    if (matchedHighDemand < 2) {
        tips.push('Highlight any experience with high-demand technologies like cloud, AI, or modern frameworks');
    }

    tips.push('Research company-specific salaries on Glassdoor and Levels.fyi for more accurate expectations');
    tips.push('Consider total compensation including equity, bonuses, and benefits');

    if (yearsOfExperience > baseYears + 2) {
        tips.push('Your experience exceeds typical requirements - use this as leverage in negotiations');
    }

    return {
        range: estimatedRange,
        currency: 'USD',
        period: 'annual',
        factors,
        tips,
        confidence: calculateConfidence(jobAnalysis, userAnswers),
        disclaimer: 'These estimates are based on general market data and should be used as a starting point for research. Actual salaries vary by location, company size, and individual negotiation.',
    };
}

/**
 * Calculate confidence level of the estimate
 */
function calculateConfidence(jobAnalysis, userAnswers) {
    let score = 50; // Base confidence

    // More factors = higher confidence
    if (jobAnalysis.industry) score += 10;
    if (jobAnalysis.jobLevel) score += 10;
    if (jobAnalysis.requiredSkills?.length > 3) score += 10;
    if (userAnswers?.years_of_experience || userAnswers?.yearsOfExperience) score += 10;
    if (jobAnalysis.companyCultureIndicators?.length > 0) score += 5;

    return Math.min(score, 85); // Cap at 85% - never fully confident
}

module.exports = {
    estimateSalary,
};
