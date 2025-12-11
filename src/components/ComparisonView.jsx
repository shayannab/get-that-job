import React from 'react';
import { FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';

/**
 * ComparisonView - Side-by-side comparison of job requirements vs user qualifications
 * Shows match percentage and detailed skill-by-skill comparison
 */
function ComparisonView({ jobAnalysis, resumeContent, userAnswers }) {
    if (!jobAnalysis || !resumeContent) {
        return null;
    }

    // Extract skills from resume content
    const resumeSkills = new Set([
        ...(resumeContent.skills?.languages || []),
        ...(resumeContent.skills?.frameworks || []),
        ...(resumeContent.skills?.databases || []),
        ...(resumeContent.skills?.cloud || []),
        ...(resumeContent.skills?.tools || []),
    ].map(s => s.toLowerCase().trim()));

    // Extract user's experience keywords from answers
    const userExperience = Object.values(userAnswers || {})
        .filter(v => typeof v === 'string')
        .join(' ')
        .toLowerCase();

    // Calculate skill matches
    const requiredSkills = jobAnalysis.requiredSkills || [];
    const skillMatches = requiredSkills.map(skill => {
        const skillLower = skill.toLowerCase().trim();
        const isMatched = resumeSkills.has(skillLower) ||
            [...resumeSkills].some(rs => rs.includes(skillLower) || skillLower.includes(rs)) ||
            userExperience.includes(skillLower);
        return { skill, matched: isMatched };
    });

    // Calculate qualification matches
    const preferredQualifications = jobAnalysis.preferredQualifications || [];
    const qualificationMatches = preferredQualifications.map(qual => {
        const qualLower = qual.toLowerCase();
        const isMatched = userExperience.includes(qualLower) ||
            [...resumeSkills].some(skill => qualLower.includes(skill));
        return { qualification: qual, matched: isMatched };
    });

    // Calculate overall match percentage
    const totalItems = skillMatches.length + qualificationMatches.length;
    const matchedItems = skillMatches.filter(s => s.matched).length +
        qualificationMatches.filter(q => q.matched).length;
    const matchPercentage = totalItems > 0 ? Math.round((matchedItems / totalItems) * 100) : 0;

    // Get match color
    const getMatchColor = (percentage) => {
        if (percentage >= 80) return { bg: 'bg-accent', text: 'text-accent', ring: 'ring-accent' };
        if (percentage >= 60) return { bg: 'bg-success', text: 'text-success', ring: 'ring-success' };
        if (percentage >= 40) return { bg: 'bg-warning', text: 'text-warning', ring: 'ring-warning' };
        return { bg: 'bg-error', text: 'text-error', ring: 'ring-error' };
    };

    const matchColor = getMatchColor(matchPercentage);

    // Calculate circumference for circular progress
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (matchPercentage / 100) * circumference;

    return (
        <div className="card mb-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-textPrimary">
                    Qualification Match
                </h3>

                {/* Circular Match Percentage */}
                <div className="relative w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        {/* Background circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-gray-200"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className={matchColor.text}
                            style={{
                                strokeDasharray: circumference,
                                strokeDashoffset: strokeDashoffset,
                                transition: 'stroke-dashoffset 0.5s ease-in-out',
                            }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${matchColor.text}`}>
                            {matchPercentage}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Job Requirements */}
                <div className="p-4 bg-surface rounded-lg border border-border">
                    <h4 className="text-lg font-semibold text-textPrimary mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-hover rounded-lg flex items-center justify-center">
                            📋
                        </span>
                        Job Requirements
                    </h4>

                    {/* Required Skills */}
                    <div className="mb-4">
                        <h5 className="text-sm font-medium text-textSecondary mb-2">Required Skills</h5>
                        <div className="space-y-2">
                            {skillMatches.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 bg-white rounded border border-border"
                                >
                                    <span className="text-sm text-textPrimary">{item.skill}</span>
                                    {item.matched ? (
                                        <FiCheck className="text-success w-5 h-5" />
                                    ) : (
                                        <FiX className="text-error w-5 h-5" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Preferred Qualifications */}
                    {qualificationMatches.length > 0 && (
                        <div>
                            <h5 className="text-sm font-medium text-textSecondary mb-2">Preferred Qualifications</h5>
                            <div className="space-y-2">
                                {qualificationMatches.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-2 bg-white rounded border border-border"
                                    >
                                        <span className="text-sm text-textPrimary truncate pr-2">{item.qualification}</span>
                                        {item.matched ? (
                                            <FiCheck className="text-success w-5 h-5 flex-shrink-0" />
                                        ) : (
                                            <FiAlertTriangle className="text-warning w-5 h-5 flex-shrink-0" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Your Qualifications */}
                <div className="p-4 bg-surface rounded-lg border border-border">
                    <h4 className="text-lg font-semibold text-textPrimary mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-hover rounded-lg flex items-center justify-center">
                            ✅
                        </span>
                        Your Qualifications
                    </h4>

                    {/* Matched Skills */}
                    <div className="mb-4">
                        <h5 className="text-sm font-medium text-success mb-2">
                            Matched Skills ({skillMatches.filter(s => s.matched).length}/{skillMatches.length})
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {skillMatches.filter(s => s.matched).map((item, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium border border-success/30"
                                >
                                    {item.skill}
                                </span>
                            ))}
                            {skillMatches.filter(s => s.matched).length === 0 && (
                                <span className="text-sm text-textSecondary italic">No exact matches found</span>
                            )}
                        </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="mb-4">
                        <h5 className="text-sm font-medium text-error mb-2">
                            Skills to Highlight ({skillMatches.filter(s => !s.matched).length})
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {skillMatches.filter(s => !s.matched).map((item, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1.5 bg-error/10 text-error rounded-full text-sm font-medium border border-error/30"
                                >
                                    {item.skill}
                                </span>
                            ))}
                            {skillMatches.filter(s => !s.matched).length === 0 && (
                                <span className="text-sm text-textSecondary italic">Great! You have all required skills</span>
                            )}
                        </div>
                    </div>

                    {/* Resume Skills */}
                    <div>
                        <h5 className="text-sm font-medium text-textSecondary mb-2">Your Skills in Resume</h5>
                        <div className="flex flex-wrap gap-1">
                            {[...resumeSkills].slice(0, 12).map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 bg-hover text-textPrimary rounded text-xs"
                                >
                                    {skill}
                                </span>
                            ))}
                            {resumeSkills.size > 12 && (
                                <span className="px-2 py-1 text-textSecondary text-xs">
                                    +{resumeSkills.size - 12} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Message */}
            <div className={`mt-4 p-4 rounded-lg ${matchColor.bg}/10 border ${matchColor.ring}/30`}>
                <p className={`text-sm ${matchColor.text} font-medium`}>
                    {matchPercentage >= 80 && "🎉 Excellent match! Your qualifications align very well with this position."}
                    {matchPercentage >= 60 && matchPercentage < 80 && "👍 Good match! You meet most of the requirements for this role."}
                    {matchPercentage >= 40 && matchPercentage < 60 && "⚡ Potential match. Consider highlighting transferable skills for the missing requirements."}
                    {matchPercentage < 40 && "🎯 This role may be a stretch. Focus on transferable skills and learning potential."}
                </p>
            </div>
        </div>
    );
}

export default ComparisonView;
