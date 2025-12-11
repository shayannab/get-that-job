import React from 'react';
import { Award, TrendingUp, Target, AlertCircle, CheckCircle, Sparkles, DollarSign, Briefcase, GraduationCap, Edit3, Download } from 'lucide-react';

function ResumePreviewStep({
  resumeContent,
  atsScore,
  suggestions,
  jobAnalysis,
  userAnswers,
  skillsGap,
  salaryInsights,
  onBack,
  onContinue
}) {
  // Get score label
  const getScoreLabel = (score) => {
    if (score >= 86) return 'Excellent';
    if (score >= 76) return 'Good';
    if (score >= 61) return 'Fair';
    return 'Needs Work';
  };

  if (!resumeContent || !atsScore) {
    return (
      <div className="text-center py-12">
        <p className="text-textSecondary">No resume content available. Please generate a resume first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* ATS Score - Large Featured Card */}
        <div className="md:col-span-1 lg:row-span-2 bg-backgroundDark rounded-3xl p-6 flex flex-col items-center justify-center text-white">
          <Award size={32} className="mb-3 opacity-80" />
          <span className="text-sm font-medium opacity-70 mb-2">ATS Score</span>
          <span className="text-7xl font-bold mb-2">{atsScore.overallScore}</span>
          <span className="text-xl font-medium opacity-90">{getScoreLabel(atsScore.overallScore)}</span>
        </div>

        {/* Score Breakdown Cards */}
        <div className="bg-surface rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-textSecondary font-medium">Keyword Match</span>
            <span className="text-2xl font-bold text-textPrimary">{atsScore.keywordMatchScore || 0}%</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-backgroundDark rounded-full transition-all duration-500"
              style={{ width: `${atsScore.keywordMatchScore || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-surface rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-textSecondary font-medium">Skills Coverage</span>
            <span className="text-2xl font-bold text-textPrimary">{atsScore.skillsCoverageScore || 0}%</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-backgroundDark rounded-full transition-all duration-500"
              style={{ width: `${atsScore.skillsCoverageScore || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-surface rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-textSecondary font-medium">Content Quality</span>
            <span className="text-2xl font-bold text-textPrimary">{atsScore.contentQualityScore || 0}%</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-backgroundDark rounded-full transition-all duration-500"
              style={{ width: `${atsScore.contentQualityScore || 0}%` }}
            />
          </div>
        </div>

        {/* Skills Gap - Wide Card */}
        {skillsGap && (
          <div className="md:col-span-2 bg-surface rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-backgroundDark flex items-center justify-center">
                <Target size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-textPrimary">Skills Gap Analysis</h3>
                <p className="text-sm text-textSecondary">{skillsGap.summary}</p>
              </div>
              <span className="text-3xl font-bold text-textPrimary">{skillsGap.matchPercentage}%</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-textSecondary">Required Skills</span>
                  <span className="font-semibold text-textPrimary">{skillsGap.requiredSkillsMatched}/{skillsGap.totalRequiredSkills}</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-backgroundDark rounded-full"
                    style={{ width: `${(skillsGap.requiredSkillsMatched / skillsGap.totalRequiredSkills) * 100}%` }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-textSecondary">Preferred Skills</span>
                  <span className="font-semibold text-textPrimary">{skillsGap.preferredSkillsMatched}/{skillsGap.totalPreferredSkills}</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-400 rounded-full"
                    style={{ width: `${(skillsGap.preferredSkillsMatched / skillsGap.totalPreferredSkills) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Salary Insights */}
        {salaryInsights && (
          <div className="bg-surface rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={20} className="text-textSecondary" />
              <span className="font-semibold text-textPrimary">Salary Range</span>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-textPrimary mb-1">
                ${salaryInsights.median?.toLocaleString()}
              </p>
              <p className="text-sm text-textSecondary">
                ${salaryInsights.min?.toLocaleString()} - ${salaryInsights.max?.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Missing Skills - Alert Card */}
        {atsScore.missingSkills?.length > 0 && (
          <div className="md:col-span-2 lg:col-span-3 bg-amber-50 border border-amber-200 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={20} className="text-amber-600" />
              <span className="font-semibold text-amber-800">Skills to Add</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {atsScore.missingSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Section */}
      {suggestions?.length > 0 && (
        <div className="bg-surface rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-textSecondary" />
            <h3 className="font-semibold text-textPrimary">Suggestions for Improvement</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-2xl">
                <CheckCircle size={18} className="text-backgroundDark mt-0.5 flex-shrink-0" />
                <span className="text-sm text-textSecondary">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resume Preview - Collapsible or Separate */}
      <div className="bg-white rounded-3xl p-8 border border-border">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <Briefcase size={24} className="text-textPrimary" />
          <h3 className="text-xl font-bold text-textPrimary">Resume Preview</h3>
        </div>

        {/* Summary */}
        {resumeContent.summary && (
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-textSecondary uppercase tracking-wide mb-3">Professional Summary</h4>
            <p className="text-textPrimary leading-relaxed">{resumeContent.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resumeContent.experience?.length > 0 && (
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-textSecondary uppercase tracking-wide mb-4">Experience</h4>
            <div className="space-y-6">
              {resumeContent.experience.map((exp, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-border">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-backgroundDark" />
                  <h5 className="font-semibold text-textPrimary">{exp.role}</h5>
                  <p className="text-sm text-textSecondary mb-2">{exp.company} • {exp.duration}</p>
                  {exp.bullets?.length > 0 && (
                    <ul className="space-y-2">
                      {exp.bullets.map((bullet, i) => (
                        <li key={i} className="text-sm text-textSecondary flex items-start gap-2">
                          <span className="text-textPrimary">•</span>
                          {typeof bullet === 'string' ? bullet.replace(/^[\s*•\-]+/, '').trim() : bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Grid */}
        {resumeContent.skills && (
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-textSecondary uppercase tracking-wide mb-4">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {[
                ...(resumeContent.skills.languages || []),
                ...(resumeContent.skills.frameworks || []),
                ...(resumeContent.skills.databases || []),
                ...(resumeContent.skills.cloud || []),
                ...(resumeContent.skills.tools || [])
              ].map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-surface border border-border text-textPrimary rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resumeContent.education?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-textSecondary uppercase tracking-wide mb-4 flex items-center gap-2">
              <GraduationCap size={16} />
              Education
            </h4>
            <div className="space-y-3">
              {resumeContent.education.map((edu, idx) => (
                <div key={idx}>
                  <h5 className="font-medium text-textPrimary">{edu.degree}</h5>
                  <p className="text-sm text-textSecondary">{edu.institution} {edu.year && `• ${edu.year}`}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-textPrimary hover:bg-surface rounded-full transition-all duration-300"
        >
          <Edit3 size={18} />
          Edit Answers
        </button>
        <button
          onClick={onContinue}
          className="flex items-center gap-2 px-8 py-4 bg-backgroundDark text-white rounded-full font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300"
        >
          Continue to Download
          <Download size={18} />
        </button>
      </div>
    </div>
  );
}

export default ResumePreviewStep;
