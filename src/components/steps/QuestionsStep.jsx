import React, { useEffect, useState } from 'react';
import { generateQuestions as generateQuestionsAPI } from '../../services/api';
import { Loader2, User, Briefcase, GraduationCap, Sparkles, AlertCircle, Rocket } from 'lucide-react';

function QuestionsStep({
  jobAnalysis,
  questions,
  setQuestions,
  answers,
  setAnswers,
  onGenerateResume,
  loading,
  setLoading,
  error,
  setError
}) {
  const [fieldErrors, setFieldErrors] = useState({});
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // Auto-fetch questions when component mounts and jobAnalysis exists
  useEffect(() => {
    if (jobAnalysis && questions.length === 0) {
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobAnalysis]);

  // Calculate progress
  const requiredQuestions = questions.filter(q => q.required);
  const answeredRequired = requiredQuestions.filter(q => answers[q.id] && answers[q.id].trim() !== '');
  const progress = requiredQuestions.length > 0
    ? Math.round((answeredRequired.length / requiredQuestions.length) * 100)
    : 0;

  // Generate questions from API
  const fetchQuestions = async () => {
    if (!jobAnalysis) return;

    setIsGeneratingQuestions(true);
    setError(null);

    try {
      const result = await generateQuestionsAPI(jobAnalysis);

      if (result.success) {
        setQuestions(result.data || []);
      } else {
        setError(result.error || 'Failed to generate questions');
      }
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error('Error generating questions:', err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateField = (question, value) => {
    if (question.required && (!value || value.trim() === '')) {
      return 'This field is required';
    }

    if (value && value.trim() !== '') {
      switch (question.type) {
        case 'email':
          if (!validateEmail(value)) return 'Please enter a valid email address';
          break;
        case 'tel':
          if (!validatePhone(value)) return 'Please enter a valid phone number';
          break;
        case 'url':
          if (!validateUrl(value)) return 'Please enter a valid URL';
          break;
        case 'number':
          if (isNaN(value) || parseFloat(value) < 0) return 'Please enter a valid number';
          break;
        default:
          break;
      }
    }
    return null;
  };

  // Handle input change with validation
  const handleInputChange = (question, value) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    const validationError = validateField(question, value);
    if (validationError) {
      setFieldErrors({ ...fieldErrors, [question.id]: validationError });
    } else {
      const newErrors = { ...fieldErrors };
      delete newErrors[question.id];
      setFieldErrors(newErrors);
    }
  };

  // Handle form submission
  const handleGenerateResume = async () => {
    const errors = {};
    questions.forEach(question => {
      const validationError = validateField(question, answers[question.id]);
      if (validationError) {
        errors[question.id] = validationError;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix all errors before continuing');
      return;
    }

    const missingRequired = questions.filter(
      q => q.required && (!answers[q.id] || answers[q.id].trim() === '')
    );

    if (missingRequired.length > 0) {
      setError(`Please fill in all required fields`);
      return;
    }

    if (onGenerateResume) {
      await onGenerateResume(answers);
    }
  };

  // Don't render if no jobAnalysis
  if (!jobAnalysis) {
    return (
      <div className="text-center py-12">
        <p className="text-textSecondary">Please complete job analysis first.</p>
      </div>
    );
  }

  // Loading state while generating questions
  if (isGeneratingQuestions) {
    return (
      <div className="text-center py-16">
        <Loader2 size={40} className="animate-spin text-textPrimary mx-auto mb-4" />
        <p className="text-textSecondary text-lg">Generating personalized questions...</p>
        <p className="text-textMuted mt-2">Based on job requirements</p>
      </div>
    );
  }

  // Render form field based on type
  const renderField = (question) => {
    const hasError = fieldErrors[question.id];
    const value = answers[question.id] || '';

    const inputClasses = `
      w-full p-4 text-textPrimary bg-white border-2 rounded-xl
      transition-all duration-300 placeholder:text-textMuted
      ${hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
        : 'border-border focus:border-textPrimary focus:ring-2 focus:ring-gray-100'
      }
      focus:outline-none
    `;

    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            className={`${inputClasses} min-h-[120px] resize-none`}
            placeholder={question.placeholder}
            value={value}
            onChange={(e) => handleInputChange(question, e.target.value)}
            required={question.required}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className={inputClasses}
            placeholder={question.placeholder}
            value={value}
            onChange={(e) => handleInputChange(question, e.target.value)}
            required={question.required}
            min="0"
          />
        );
      default:
        return (
          <input
            type={question.type}
            className={inputClasses}
            placeholder={question.placeholder}
            value={value}
            onChange={(e) => handleInputChange(question, e.target.value)}
            required={question.required}
          />
        );
    }
  };

  // Group questions by category
  const groupedQuestions = questions.reduce((acc, q) => {
    const category = q.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(q);
    return acc;
  }, {});

  const categoryConfig = {
    personal: { label: 'Personal Information', icon: User },
    experience: { label: 'Experience & Achievements', icon: Briefcase },
    skills: { label: 'Skills & Qualifications', icon: Sparkles },
    education: { label: 'Education & Certifications', icon: GraduationCap },
    other: { label: 'Additional Information', icon: Briefcase }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-textSecondary text-lg">
          Fill in your details to create a personalized, ATS-optimized resume.
        </p>
      </div>

      {/* Progress Ring */}
      <div className="flex justify-center">
        <div className="relative w-24 h-24">
          {/* Background circle */}
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#f0f0f0"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#000"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${progress * 2.51} 251`}
              className="transition-all duration-500"
            />
          </svg>
          {/* Progress text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-textPrimary">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={20} className="text-red-500" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Questions Form - Card-based Categories */}
      <div className="space-y-6">
        {Object.keys(groupedQuestions).map((category) => {
          const config = categoryConfig[category] || categoryConfig.other;
          const IconComponent = config.icon;

          return (
            <div key={category} className="bg-surface rounded-2xl p-6">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-xl bg-backgroundDark flex items-center justify-center">
                  <IconComponent size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-textPrimary">
                  {config.label}
                </h3>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {groupedQuestions[category].map((question) => (
                  <div key={question.id}>
                    <label className="block text-sm font-medium text-textPrimary mb-2">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(question)}
                    {fieldErrors[question.id] && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {fieldErrors[question.id]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate Resume Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleGenerateResume}
          disabled={loading || progress < 100 || Object.keys(fieldErrors).length > 0}
          className={`
            flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300
            ${loading || progress < 100 || Object.keys(fieldErrors).length > 0
              ? 'bg-surface text-textMuted cursor-not-allowed'
              : 'bg-backgroundDark text-white hover:scale-105 hover:shadow-lg'
            }
          `}
        >
          {loading ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              Generating Resume...
            </>
          ) : (
            <>
              <Rocket size={22} />
              Generate Resume
            </>
          )}
        </button>
      </div>

      {progress < 100 && (
        <p className="text-center text-textMuted text-sm">
          Complete all required fields to continue
        </p>
      )}
    </div>
  );
}

export default QuestionsStep;
