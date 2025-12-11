/**
 * Skills Gap Analyzer Service
 * Analyzes the gap between job requirements and user's qualifications
 * Provides recommendations for missing skills
 */

/**
 * Analyzes skills gap between job requirements and resume content
 * @param {Object} jobAnalysis - The job analysis object from analyzeJobPosting
 * @param {Object} resumeContent - The generated resume content
 * @param {Object} userAnswers - User's answers from the questionnaire
 * @returns {Object} Skills gap analysis with matched, missing, and recommendations
 */
function analyzeSkillsGap(jobAnalysis, resumeContent, userAnswers) {
    if (!jobAnalysis || typeof jobAnalysis !== 'object') {
        throw new Error('jobAnalysis must be a valid object');
    }

    if (!resumeContent || typeof resumeContent !== 'object') {
        throw new Error('resumeContent must be a valid object');
    }

    // Extract all skills from resume
    const resumeSkills = new Set();
    const skillCategories = resumeContent.skills || {};

    const allResumeSkills = [
        ...(skillCategories.languages || []),
        ...(skillCategories.frameworks || []),
        ...(skillCategories.databases || []),
        ...(skillCategories.cloud || []),
        ...(skillCategories.tools || []),
    ];

    allResumeSkills.forEach(skill => {
        resumeSkills.add(skill.toLowerCase().trim());
    });

    // Extract user experience text for finding related experience
    const userExperienceText = Object.values(userAnswers || {})
        .filter(v => typeof v === 'string')
        .join(' ')
        .toLowerCase();

    // Analyze required skills
    const requiredSkills = jobAnalysis.requiredSkills || [];
    const matchedSkills = [];
    const missingSkills = [];

    requiredSkills.forEach(skill => {
        const skillLower = skill.toLowerCase().trim();
        const isMatched =
            resumeSkills.has(skillLower) ||
            [...resumeSkills].some(rs =>
                rs.includes(skillLower) ||
                skillLower.includes(rs) ||
                areRelatedSkills(rs, skillLower)
            ) ||
            userExperienceText.includes(skillLower);

        if (isMatched) {
            matchedSkills.push({
                skill,
                status: 'matched',
                source: 'resume',
            });
        } else {
            // Find related experience for missing skills
            const relatedExperience = findRelatedExperience(skill, userAnswers, resumeContent);

            missingSkills.push({
                skill,
                status: 'missing',
                relatedExperience: relatedExperience.length > 0 ? relatedExperience : null,
                recommendation: generateRecommendation(skill, relatedExperience),
            });
        }
    });

    // Analyze preferred qualifications
    const preferredQualifications = jobAnalysis.preferredQualifications || [];
    const matchedQualifications = [];
    const missingQualifications = [];

    preferredQualifications.forEach(qual => {
        const qualLower = qual.toLowerCase();
        const isMatched = userExperienceText.includes(qualLower) ||
            [...resumeSkills].some(skill => qualLower.includes(skill));

        if (isMatched) {
            matchedQualifications.push({ qualification: qual, status: 'matched' });
        } else {
            missingQualifications.push({
                qualification: qual,
                status: 'missing',
                recommendation: `Consider gaining experience with ${qual} or highlighting transferable experience.`
            });
        }
    });

    // Calculate match percentages
    const skillMatchPercentage = requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 100;

    const qualMatchPercentage = preferredQualifications.length > 0
        ? Math.round((matchedQualifications.length / preferredQualifications.length) * 100)
        : 100;

    const overallMatchPercentage = Math.round(
        (skillMatchPercentage * 0.7) + (qualMatchPercentage * 0.3)
    );

    // Generate overall recommendations
    const overallRecommendations = generateOverallRecommendations(
        missingSkills,
        missingQualifications,
        jobAnalysis
    );

    return {
        skills: {
            matched: matchedSkills,
            missing: missingSkills,
            matchPercentage: skillMatchPercentage,
        },
        qualifications: {
            matched: matchedQualifications,
            missing: missingQualifications,
            matchPercentage: qualMatchPercentage,
        },
        overallMatchPercentage,
        recommendations: overallRecommendations,
        summary: generateSummary(matchedSkills.length, missingSkills.length, overallMatchPercentage),
    };
}

/**
 * Check if two skills are related (e.g., React and React.js)
 */
function areRelatedSkills(skill1, skill2) {
    const relatedSkillsMap = {
        'react': ['reactjs', 'react.js', 'react native', 'reactnative'],
        'node': ['nodejs', 'node.js'],
        'javascript': ['js', 'es6', 'es2015', 'ecmascript'],
        'typescript': ['ts'],
        'python': ['py', 'python3'],
        'postgresql': ['postgres', 'psql'],
        'mongodb': ['mongo'],
        'kubernetes': ['k8s'],
        'docker': ['containers', 'containerization'],
        'aws': ['amazon web services', 'amazon-web-services'],
        'gcp': ['google cloud', 'google cloud platform'],
        'azure': ['microsoft azure'],
        'ci/cd': ['cicd', 'continuous integration', 'continuous deployment'],
        'rest': ['restful', 'rest api', 'restful api'],
        'graphql': ['gql'],
        'sql': ['mysql', 'postgresql', 'sqlite', 'mssql'],
        'nosql': ['mongodb', 'dynamodb', 'cassandra'],
        'git': ['github', 'gitlab', 'bitbucket'],
        'agile': ['scrum', 'kanban'],
    };

    for (const [key, related] of Object.entries(relatedSkillsMap)) {
        const allVariants = [key, ...related];
        if (allVariants.includes(skill1) && allVariants.includes(skill2)) {
            return true;
        }
    }

    return false;
}

/**
 * Find related experience from user's background for a missing skill
 */
function findRelatedExperience(missingSkill, userAnswers, resumeContent) {
    const relatedExperience = [];
    const missingSkillLower = missingSkill.toLowerCase();

    // Map of skills to potentially related technologies/concepts
    const skillRelationships = {
        'react': ['javascript', 'frontend', 'ui', 'component', 'vue', 'angular', 'web development'],
        'node.js': ['javascript', 'backend', 'express', 'api', 'server', 'npm'],
        'python': ['scripting', 'automation', 'data', 'backend', 'django', 'flask'],
        'aws': ['cloud', 'infrastructure', 'devops', 'azure', 'gcp', 'deployment'],
        'docker': ['containers', 'devops', 'deployment', 'kubernetes', 'orchestration'],
        'kubernetes': ['docker', 'containers', 'orchestration', 'devops', 'deployment'],
        'sql': ['database', 'data', 'query', 'mysql', 'postgresql', 'data management'],
        'mongodb': ['database', 'nosql', 'data', 'json', 'document database'],
        'typescript': ['javascript', 'type safety', 'frontend', 'angular'],
        'graphql': ['api', 'rest', 'backend', 'data fetching', 'query language'],
        'java': ['object-oriented', 'backend', 'enterprise', 'spring', 'jvm'],
        'machine learning': ['data science', 'python', 'statistics', 'data analysis', 'ai'],
        'agile': ['project management', 'scrum', 'teamwork', 'sprint', 'collaboration'],
        'leadership': ['management', 'team lead', 'mentoring', 'coordination'],
    };

    // Find related skills that user has
    const userExperience = Object.values(userAnswers || {})
        .filter(v => typeof v === 'string')
        .join(' ')
        .toLowerCase();

    // Check if any related concepts are mentioned in user's experience
    for (const [skill, related] of Object.entries(skillRelationships)) {
        if (missingSkillLower.includes(skill) || skill.includes(missingSkillLower)) {
            related.forEach(relatedConcept => {
                if (userExperience.includes(relatedConcept)) {
                    relatedExperience.push({
                        concept: relatedConcept,
                        suggestion: `Your experience with ${relatedConcept} is transferable to ${missingSkill}`,
                    });
                }
            });
        }
    }

    // Check resume experience bullets for related keywords
    const experienceBullets = resumeContent.experience || [];
    experienceBullets.forEach(exp => {
        (exp.bullets || []).forEach(bullet => {
            const bulletLower = (bullet || '').toLowerCase();
            for (const [skill, related] of Object.entries(skillRelationships)) {
                if (missingSkillLower.includes(skill)) {
                    related.forEach(concept => {
                        if (bulletLower.includes(concept) && !relatedExperience.some(r => r.concept === concept)) {
                            relatedExperience.push({
                                concept: concept,
                                suggestion: `Your work involving ${concept} at ${exp.company} relates to ${missingSkill}`,
                                source: exp.role,
                            });
                        }
                    });
                }
            }
        });
    });

    return relatedExperience.slice(0, 3); // Return top 3 related experiences
}

/**
 * Generate a recommendation for a missing skill
 */
function generateRecommendation(skill, relatedExperience) {
    if (relatedExperience && relatedExperience.length > 0) {
        return `Highlight your ${relatedExperience[0].concept} experience as it relates to ${skill}. Consider mentioning your transferable skills in your cover letter.`;
    }

    return `Consider taking an online course or certification in ${skill}. Meanwhile, emphasize your ability to learn quickly and adapt to new technologies.`;
}

/**
 * Generate overall recommendations based on gap analysis
 */
function generateOverallRecommendations(missingSkills, missingQualifications, jobAnalysis) {
    const recommendations = [];

    // Priority recommendations for critical missing skills
    const criticalMissing = missingSkills.filter(s =>
        !s.relatedExperience || s.relatedExperience.length === 0
    );

    if (criticalMissing.length > 0 && criticalMissing.length <= 2) {
        recommendations.push({
            priority: 'high',
            type: 'skill_gap',
            message: `Focus on highlighting transferable experience for: ${criticalMissing.map(s => s.skill).join(', ')}`,
        });
    } else if (criticalMissing.length > 2) {
        recommendations.push({
            priority: 'high',
            type: 'skill_gap',
            message: `This position requires several skills you may not have direct experience with. Consider upskilling in: ${criticalMissing.slice(0, 3).map(s => s.skill).join(', ')}`,
        });
    }

    // Recommendations for skills with related experience
    const transferable = missingSkills.filter(s =>
        s.relatedExperience && s.relatedExperience.length > 0
    );

    if (transferable.length > 0) {
        recommendations.push({
            priority: 'medium',
            type: 'transferable',
            message: `Good news! You have related experience for: ${transferable.map(s => s.skill).join(', ')}. Emphasize these transferable skills in your application.`,
        });
    }

    // Qualification recommendations
    if (missingQualifications.length > 0 && missingQualifications.length <= 2) {
        recommendations.push({
            priority: 'low',
            type: 'qualification',
            message: `The preferred qualifications include: ${missingQualifications.map(q => q.qualification).join(', ')}. These are often nice-to-haves, not dealbreakers.`,
        });
    }

    // Industry-specific recommendation
    if (jobAnalysis.industry) {
        recommendations.push({
            priority: 'medium',
            type: 'industry',
            message: `Tailor your resume language to the ${jobAnalysis.industry} industry. Use industry-specific terminology where applicable.`,
        });
    }

    return recommendations;
}

/**
 * Generate a summary message based on the analysis
 */
function generateSummary(matchedCount, missingCount, overallPercentage) {
    if (overallPercentage >= 80) {
        return `Excellent match! You have ${matchedCount} of the required skills. Your profile aligns very well with this position.`;
    } else if (overallPercentage >= 60) {
        return `Good potential! You match ${matchedCount} skills, with ${missingCount} areas for improvement. Focus on highlighting transferable experience.`;
    } else if (overallPercentage >= 40) {
        return `Moderate match. While you have ${matchedCount} relevant skills, consider emphasizing your ability to learn quickly and any related experience.`;
    } else {
        return `This role may be a stretch but not impossible. You have ${matchedCount} matching skills. Highlight your learning agility and transferable experience.`;
    }
}

module.exports = {
    analyzeSkillsGap,
};
