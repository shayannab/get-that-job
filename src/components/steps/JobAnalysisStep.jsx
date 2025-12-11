import React from 'react';
import { analyzeJob } from '../../services/api';
import { Sparkles, CheckCircle, Briefcase, Target, Loader2 } from 'lucide-react';

function JobAnalysisStep({
  jobPosting,
  setJobPosting,
  jobAnalysis,
  setJobAnalysis,
  loading,
  setLoading,
  error,
  setError,
  onNext
}) {
  const handleAnalyze = async () => {
    if (!jobPosting.trim()) {
      setError('Please paste a job posting');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeJob(jobPosting);

      if (result.success) {
        setJobAnalysis(result.data);
      } else {
        setError(result.error || 'Failed to analyze job posting');
      }
    } catch (err) {
      setError('Failed to analyze job posting. Please try again.');
      console.error('Error analyzing job:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header - Already shown in parent, so minimal here */}
      <div className="text-center">
        <p className="text-textSecondary text-lg">
          Paste the job posting below. Our AI will extract key requirements and ATS keywords.
        </p>
      </div>

      {/* Job Posting Input - Premium Design */}
      <div className="relative">
        <div className="absolute -top-3 left-4 bg-white px-2 z-10">
          <span className="text-sm font-medium text-textSecondary">Job Description</span>
        </div>
        <textarea
          className="w-full min-h-[280px] p-6 pt-8 text-textPrimary bg-white border-2 border-border rounded-2xl 
                     resize-none focus:outline-none focus:border-textPrimary transition-all duration-300
                     placeholder:text-textMuted"
          placeholder="Paste the complete job description here...

Example:
We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and cloud technologies..."
          value={jobPosting}
          onChange={(e) => setJobPosting(e.target.value)}
          disabled={loading}
        />

        {/* Character Count */}
        <div className="absolute bottom-4 right-4">
          <span className="text-sm text-textMuted">
            {jobPosting.length} characters
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600">!</span>
          </div>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Analyze Button */}
      <div className="flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={loading || !jobPosting.trim()}
          className={`
            flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300
            ${loading || !jobPosting.trim()
              ? 'bg-surface text-textMuted cursor-not-allowed'
              : 'bg-backgroundDark text-white hover:scale-105 hover:shadow-lg'
            }
          `}
        >
          {loading ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={22} />
              Analyze with AI
            </>
          )}
        </button>
      </div>

      {/* Job Analysis Results - Cards Layout */}
      {jobAnalysis && (
        <div className="space-y-6 pt-8 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-backgroundDark">
            <CheckCircle size={24} />
            <h3 className="text-xl font-semibold">Analysis Complete</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Skills Card */}
            <div className="p-6 bg-surface rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Target size={20} className="text-textSecondary" />
                <h4 className="font-semibold text-textPrimary">Required Skills</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobAnalysis.requiredSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-white border border-border text-textPrimary rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Details Card */}
            <div className="p-6 bg-surface rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase size={20} className="text-textSecondary" />
                <h4 className="font-semibold text-textPrimary">Job Details</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-textSecondary">Level</span>
                  <span className="font-medium text-textPrimary capitalize">{jobAnalysis.jobLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textSecondary">Industry</span>
                  <span className="font-medium text-textPrimary">{jobAnalysis.industry}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-8 py-4 bg-backgroundDark text-white rounded-full font-semibold text-lg hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Continue to Questions
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobAnalysisStep;
