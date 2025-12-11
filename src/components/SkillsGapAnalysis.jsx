import React, { useState } from 'react';
import { FiCheck, FiX, FiChevronDown, FiChevronUp, FiTarget, FiTrendingUp, FiAlertCircle, FiZap } from 'react-icons/fi';

/**
 * SkillsGapAnalysis - Display skills gap analysis with recommendations
 * Shows matched skills, missing skills, and actionable suggestions
 */
function SkillsGapAnalysis({ skillsGap }) {
    const [expandedSkill, setExpandedSkill] = useState(null);
    const [showAllRecommendations, setShowAllRecommendations] = useState(false);

    if (!skillsGap) {
        return null;
    }

    const { skills, qualifications, overallMatchPercentage, recommendations, summary } = skillsGap;

    // Get color based on percentage
    const getPercentageColor = (percentage) => {
        if (percentage >= 80) return 'text-accent';
        if (percentage >= 60) return 'text-success';
        if (percentage >= 40) return 'text-warning';
        return 'text-error';
    };

    // Get priority badge style
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high':
                return 'bg-error/10 text-error border-error/30';
            case 'medium':
                return 'bg-warning/10 text-warning border-warning/30';
            case 'low':
                return 'bg-success/10 text-success border-success/30';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const toggleSkillExpand = (skillName) => {
        setExpandedSkill(expandedSkill === skillName ? null : skillName);
    };

    return (
        <div className="card border-warning mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                        <FiTarget className="text-warning w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-textPrimary">Skills Gap Analysis</h3>
                        <p className="text-sm text-textSecondary">{summary}</p>
                    </div>
                </div>
                <div className={`text-2xl font-bold ${getPercentageColor(overallMatchPercentage)}`}>
                    {overallMatchPercentage}%
                </div>
            </div>

            {/* Skills and Qualifications Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Skills Match */}
                <div className="p-4 bg-surface rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-textPrimary">Required Skills</span>
                        <span className={`text-sm font-bold ${getPercentageColor(skills.matchPercentage)}`}>
                            {skills.matched.length}/{skills.matched.length + skills.missing.length}
                        </span>
                    </div>
                    <div className="progress-track">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${skills.matchPercentage >= 80 ? 'bg-accent' :
                                skills.matchPercentage >= 60 ? 'bg-success' :
                                    skills.matchPercentage >= 40 ? 'bg-warning' : 'bg-error'
                                }`}
                            style={{ width: `${skills.matchPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Qualifications Match */}
                <div className="p-4 bg-surface rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-textPrimary">Preferred Qualifications</span>
                        <span className={`text-sm font-bold ${getPercentageColor(qualifications.matchPercentage)}`}>
                            {qualifications.matched.length}/{qualifications.matched.length + qualifications.missing.length}
                        </span>
                    </div>
                    <div className="progress-track">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${qualifications.matchPercentage >= 80 ? 'bg-accent' :
                                qualifications.matchPercentage >= 60 ? 'bg-success' :
                                    qualifications.matchPercentage >= 40 ? 'bg-warning' : 'bg-error'
                                }`}
                            style={{ width: `${qualifications.matchPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Missing Skills with Recommendations */}
            {skills.missing && skills.missing.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-textPrimary mb-3 flex items-center gap-2">
                        <FiAlertCircle className="text-warning" />
                        Skills Gap - Action Required
                    </h4>
                    <div className="space-y-2">
                        {skills.missing.map((item, idx) => (
                            <div key={idx} className="border border-border rounded-lg overflow-hidden">
                                <button
                                    onClick={() => toggleSkillExpand(item.skill)}
                                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-hover transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <FiX className="text-error w-4 h-4" />
                                        <span className="text-sm font-medium text-textPrimary">{item.skill}</span>
                                        {item.relatedExperience && (
                                            <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">
                                                Has related experience
                                            </span>
                                        )}
                                    </div>
                                    {expandedSkill === item.skill ? (
                                        <FiChevronUp className="text-textSecondary" />
                                    ) : (
                                        <FiChevronDown className="text-textSecondary" />
                                    )}
                                </button>

                                {expandedSkill === item.skill && (
                                    <div className="p-3 bg-surface border-t border-border">
                                        <div className="flex items-start gap-2 mb-2">
                                            <FiZap className="text-warning mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-textSecondary">{item.recommendation}</p>
                                        </div>

                                        {item.relatedExperience && item.relatedExperience.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-xs font-medium text-textPrimary mb-2">Transferable Experience:</p>
                                                <div className="space-y-1">
                                                    {item.relatedExperience.map((exp, expIdx) => (
                                                        <div key={expIdx} className="flex items-start gap-2 text-xs text-textSecondary">
                                                            <FiTrendingUp className="text-success mt-0.5 flex-shrink-0" />
                                                            <span>{exp.suggestion}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Matched Skills */}
            {skills.matched && skills.matched.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-success mb-3 flex items-center gap-2">
                        <FiCheck />
                        Matched Skills ({skills.matched.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {skills.matched.map((item, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium border border-success/30"
                            >
                                {item.skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
                <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-textPrimary flex items-center gap-2">
                            <FiZap className="text-warning" />
                            Recommendations
                        </h4>
                        {recommendations.length > 2 && (
                            <button
                                onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                                className="text-xs text-accent hover:underline"
                            >
                                {showAllRecommendations ? 'Show less' : `Show all (${recommendations.length})`}
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {(showAllRecommendations ? recommendations : recommendations.slice(0, 2)).map((rec, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-lg border ${getPriorityBadge(rec.priority)}`}
                            >
                                <div className="flex items-start gap-2">
                                    <span className="text-xs uppercase font-bold opacity-75">{rec.priority}</span>
                                    <p className="text-sm">{rec.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SkillsGapAnalysis;
