import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

/**
 * Analyze job posting and extract structured data
 * @param {string} jobPosting - The job posting text
 * @returns {Promise<Object>} - Analysis result with success flag and data/error
 */
export const analyzeJob = async (jobPosting) => {
  try {
    if (!jobPosting || typeof jobPosting !== 'string' || jobPosting.trim().length === 0) {
      return {
        success: false,
        error: 'Job posting text is required',
      };
    }

    const response = await api.post('/analyze-job', {
      jobPosting: jobPosting.trim(),
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Failed to analyze job posting',
      };
    }
  } catch (error) {
    console.error('Error analyzing job:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error: error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        error: 'No response from server. Please check if the backend is running.',
      };
    } else {
      // Error setting up request
      return {
        success: false,
        error: error.message || 'Failed to analyze job posting',
      };
    }
  }
};

/**
 * Generate personalized questions based on job analysis
 * @param {Object} jobAnalysis - The job analysis object
 * @returns {Promise<Object>} - Questions array with success flag and data/error
 */
export const generateQuestions = async (jobAnalysis) => {
  try {
    if (!jobAnalysis || typeof jobAnalysis !== 'object') {
      return {
        success: false,
        error: 'Job analysis is required',
      };
    }

    const response = await api.post('/generate-questions', {
      jobAnalysis,
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.questions || [],
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Failed to generate questions',
      };
    }
  } catch (error) {
    console.error('Error generating questions:', error);

    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`,
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'No response from server. Please check if the backend is running.',
      };
    } else {
      return {
        success: false,
        error: error.message || 'Failed to generate questions',
      };
    }
  }
};

/**
 * Generate resume content based on job analysis and user answers
 * @param {Object} jobAnalysis - The job analysis object
 * @param {Object} answers - User answers object
 * @returns {Promise<Object>} - Resume content and ATS score with success flag
 */
export const generateResume = async (jobAnalysis, answers) => {
  try {
    if (!jobAnalysis || typeof jobAnalysis !== 'object') {
      return {
        success: false,
        error: 'Job analysis is required',
      };
    }

    if (!answers || typeof answers !== 'object') {
      return {
        success: false,
        error: 'Answers are required',
      };
    }

    const response = await api.post('/generate-resume', {
      jobAnalysis,
      answers,
    });

    if (response.data.success) {
      return {
        success: true,
        data: {
          resume: response.data.resume,
          score: response.data.score,
          skillsGap: response.data.skillsGap,
          salaryInsights: response.data.salaryInsights,
        },
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Failed to generate resume',
      };
    }
  } catch (error) {
    console.error('Error generating resume:', error);

    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`,
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'No response from server. Please check if the backend is running.',
      };
    } else {
      return {
        success: false,
        error: error.message || 'Failed to generate resume',
      };
    }
  }
};

/**
 * Export resume in specified format
 * @param {Object} resumeContent - The resume content object
 * @param {Object} jobAnalysis - The job analysis object (optional)
 * @param {Object} answers - User answers object (optional)
 * @param {string} format - Format: 'pdf', 'docx', or 'txt'
 * @returns {Promise<Object>} - Blob data with success flag
 */
export const exportResume = async (resumeContent, jobAnalysis = null, answers = null, format = 'pdf') => {
  try {
    if (!resumeContent || typeof resumeContent !== 'object') {
      return {
        success: false,
        error: 'Resume content is required',
      };
    }

    const validFormats = ['pdf', 'docx', 'txt'];
    const normalizedFormat = format.toLowerCase();

    if (!validFormats.includes(normalizedFormat)) {
      return {
        success: false,
        error: `Invalid format. Must be one of: ${validFormats.join(', ')}`,
      };
    }

    const response = await api.post(
      '/export-resume',
      {
        resume: resumeContent,
        jobAnalysis,
        answers,
        format: normalizedFormat,
      },
      {
        responseType: 'blob', // Important for binary data
      }
    );

    // Check if response is actually an error (backend might return JSON error as blob)
    if (response.data.type === 'application/json') {
      const text = await response.data.text();
      const errorData = JSON.parse(text);
      return {
        success: false,
        error: errorData.error || 'Failed to export resume',
      };
    }

    return {
      success: true,
      data: response.data, // Blob data
      format: normalizedFormat,
    };
  } catch (error) {
    console.error('Error exporting resume:', error);

    if (error.response) {
      // Try to parse error blob if it's JSON
      if (error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          return {
            success: false,
            error: errorData.error || errorData.message || 'Failed to export resume',
          };
        } catch (parseError) {
          return {
            success: false,
            error: `Server error: ${error.response.status}`,
          };
        }
      }

      return {
        success: false,
        error: error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`,
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'No response from server. Please check if the backend is running.',
      };
    } else {
      return {
        success: false,
        error: error.message || 'Failed to export resume',
      };
    }
  }
};

/**
 * Generate cover letter based on job analysis and user answers
 * @param {Object} jobAnalysis - The job analysis object
 * @param {Object} answers - User answers object
 * @param {Object} resumeContent - Optional resume content for reference
 * @returns {Promise<Object>} - Cover letter with success flag
 */
export const generateCoverLetter = async (jobAnalysis, answers, resumeContent = null) => {
  try {
    if (!jobAnalysis || typeof jobAnalysis !== 'object') {
      return {
        success: false,
        error: 'Job analysis is required',
      };
    }

    if (!answers || typeof answers !== 'object') {
      return {
        success: false,
        error: 'Answers are required',
      };
    }

    const response = await api.post('/generate-cover-letter', {
      jobAnalysis,
      answers,
      resumeContent,
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.coverLetter,
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Failed to generate cover letter',
      };
    }
  } catch (error) {
    console.error('Error generating cover letter:', error);

    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`,
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'No response from server. Please check if the backend is running.',
      };
    } else {
      return {
        success: false,
        error: error.message || 'Failed to generate cover letter',
      };
    }
  }
};

/**
 * Helper function to trigger browser download for a blob
 * @param {Blob} blob - File blob
 * @param {string} filename - Filename for download
 */
export const downloadBlob = (blob, filename) => {
  try {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading blob:', error);
    throw new Error('Failed to trigger download');
  }
};

// Export default api instance for custom requests
export default api;

