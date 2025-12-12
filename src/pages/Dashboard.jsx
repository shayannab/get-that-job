import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  HelpCircle,
  Eye,
  Mail,
  Download,
  Home,
  Check,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { generateResume } from '../services/api';
import JobAnalysisStep from '../components/steps/JobAnalysisStep';
import QuestionsStep from '../components/steps/QuestionsStep';
import ResumePreviewStep from '../components/steps/ResumePreviewStep';
import CoverLetterStep from '../components/steps/CoverLetterStep';
import DownloadStep from '../components/steps/DownloadStep';

function Dashboard() {
  const navigate = useNavigate();

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [jobPosting, setJobPosting] = useState('');
  const [jobAnalysis, setJobAnalysis] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [resumeContent, setResumeContent] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [skillsGap, setSkillsGap] = useState(null);
  const [salaryInsights, setSalaryInsights] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step navigation with icons
  const steps = [
    { id: 1, name: 'Job Analysis', shortName: 'Analysis', icon: FileText },
    { id: 2, name: 'Questions', shortName: 'Questions', icon: HelpCircle },
    { id: 3, name: 'Preview', shortName: 'Preview', icon: Eye },
    { id: 4, name: 'Cover Letter', shortName: 'Letter', icon: Mail },
    { id: 5, name: 'Download', shortName: 'Download', icon: Download },
  ];

  const handleStepClick = (stepId) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps.find(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-surface">
      {/* Minimal Header */}
      <header className="bg-white border-b border-border">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <img src="/assets/logo.png" alt="ResumeLab" className="h-8 w-8" />
              <span className="text-2xl font-bold text-textPrimary tracking-tight">
                ResumeLab
              </span>
            </div>
            <button
              className="btn-ghost flex items-center gap-2 text-textSecondary hover:text-textPrimary"
              onClick={() => navigate('/')}
            >
              <Home size={18} />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* Centered Step Indicator */}
      <div className="bg-white border-b border-border py-8">
        <div className="container-custom">
          {/* Step Progress - Horizontal Pills */}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = step.id < currentStep;
              const isDisabled = step.id > currentStep;
              const IconComponent = step.icon;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => handleStepClick(step.id)}
                    disabled={isDisabled}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300
                      ${isActive
                        ? 'bg-backgroundDark text-white shadow-lg scale-105'
                        : isCompleted
                          ? 'bg-surface text-textPrimary hover:bg-hover cursor-pointer'
                          : 'bg-white text-textMuted cursor-not-allowed border border-border'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check size={16} className="text-backgroundDark" />
                    ) : (
                      <IconComponent size={16} />
                    )}
                    <span className="hidden md:inline text-sm font-medium">
                      {step.shortName}
                    </span>
                  </button>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 md:w-12 h-0.5 transition-colors duration-300 ${step.id < currentStep ? 'bg-backgroundDark' : 'bg-border'
                        }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Current Step Title */}
          <div className="text-center mt-6">
            <h2 className="text-2xl md:text-3xl font-bold text-textPrimary">
              {currentStepData?.name}
            </h2>
            <p className="text-textSecondary mt-2">
              Step {currentStep} of {steps.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Centered Card */}
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Step Content Card */}
          <div
            key={currentStep}
            className="bg-white rounded-2xl shadow-subtle border border-border p-6 md:p-10 animate-fade-in"
          >
            {currentStep === 1 && (
              <JobAnalysisStep
                jobPosting={jobPosting}
                setJobPosting={setJobPosting}
                jobAnalysis={jobAnalysis}
                setJobAnalysis={setJobAnalysis}
                loading={loading}
                setLoading={setLoading}
                error={error}
                setError={setError}
                onNext={handleNext}
              />
            )}

            {currentStep === 2 && (
              <QuestionsStep
                jobAnalysis={jobAnalysis}
                questions={questions}
                setQuestions={setQuestions}
                answers={answers}
                setAnswers={setAnswers}
                onGenerateResume={async (answersData) => {
                  setLoading(true);
                  setError(null);
                  try {
                    const result = await generateResume(jobAnalysis, answersData);

                    if (result.success) {
                      setResumeContent(result.data.resume);
                      setAtsScore(result.data.score);
                      setSkillsGap(result.data.skillsGap);
                      setSalaryInsights(result.data.salaryInsights);
                      setSuggestions(result.data.score.suggestions || []);
                      handleNext();
                    } else {
                      setError(result.error || 'Failed to generate resume');
                    }
                  } catch (err) {
                    setError('Failed to generate resume: ' + (err.message || 'Unknown error'));
                    console.error('Error generating resume:', err);
                  } finally {
                    setLoading(false);
                  }
                }}
                loading={loading}
                setLoading={setLoading}
                error={error}
                setError={setError}
              />
            )}

            {currentStep === 3 && (
              <ResumePreviewStep
                resumeContent={resumeContent}
                atsScore={atsScore}
                suggestions={suggestions}
                jobAnalysis={jobAnalysis}
                userAnswers={answers}
                skillsGap={skillsGap}
                salaryInsights={salaryInsights}
                onBack={handleBack}
                onContinue={handleNext}
              />
            )}

            {currentStep === 4 && (
              <CoverLetterStep
                jobAnalysis={jobAnalysis}
                userAnswers={answers}
                resumeContent={resumeContent}
                onBack={handleBack}
                onContinue={handleNext}
              />
            )}

            {currentStep === 5 && (
              <DownloadStep
                resumeContent={resumeContent}
                jobAnalysis={jobAnalysis}
                answers={answers}
                onStartNew={() => {
                  setCurrentStep(1);
                  setJobPosting('');
                  setJobAnalysis(null);
                  setQuestions([]);
                  setAnswers({});
                  setResumeContent(null);
                  setAtsScore(null);
                  setSkillsGap(null);
                  setSuggestions([]);
                  setError(null);
                }}
              />
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300
                ${currentStep === 1
                  ? 'text-textMuted cursor-not-allowed'
                  : 'text-textPrimary hover:bg-hover'
                }
              `}
            >
              <ArrowLeft size={18} />
              Back
            </button>

            {/* Progress Dots */}
            <div className="flex items-center gap-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`
                    w-2.5 h-2.5 rounded-full transition-all duration-300
                    ${step.id === currentStep
                      ? 'w-8 bg-backgroundDark'
                      : step.id < currentStep
                        ? 'bg-backgroundDark'
                        : 'bg-border'
                    }
                  `}
                />
              ))}
            </div>

            {currentStep < 5 && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-backgroundDark text-white rounded-full font-medium hover:bg-accentLight transition-all duration-300"
              >
                Next
                <ArrowRight size={18} />
              </button>
            )}
            {currentStep === 5 && (
              <div className="w-24" />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
