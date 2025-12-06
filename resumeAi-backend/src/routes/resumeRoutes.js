const express = require('express');
const router = express.Router();
const { analyzeJobPosting } = require('../../jobAnalyzer');
const { generateQuestions } = require('../services/questionGenerator');
const { generateResumeContent } = require('../services/resumeGenerator');
const { scoreResume } = require('../services/atsScorer');
const { exportResume } = require('../services/documentExporter');

/**
 * POST /analyze-job
 * Analyzes a job posting and extracts structured information
 * 
 * @route POST /analyze-job
 * @param {Object} req.body - Request body
 * @param {string} req.body.jobPosting - The job posting text to analyze
 * @returns {Object} 200 - Success response with job analysis
 * @returns {Object} 400 - Validation error
 * @returns {Object} 500 - Server error
 */
router.post('/analyze-job', async (req, res) => {
  try {
    // Validate input
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
      });
    }

    const { jobPosting } = req.body;

    if (!jobPosting || typeof jobPosting !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'jobPosting is required and must be a string',
      });
    }

    if (jobPosting.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'jobPosting cannot be empty',
      });
    }

    // Call job analyzer
    const analysis = await analyzeJobPosting(jobPosting);

    // Return success response
    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    // Handle validation errors (from jobAnalyzer)
    if (error.message.includes('must be') || error.message.includes('required') || error.message.includes('cannot be empty')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Handle API key errors
    if (error.message.includes('GROQ_API_KEY')) {
      return res.status(500).json({
        success: false,
        error: 'API configuration error: ' + error.message,
      });
    }

    // Handle other errors
    console.error('Error in /analyze-job:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze job posting: ' + error.message,
    });
  }
});

/**
 * POST /generate-questions
 * Generates interview questions based on job analysis
 * 
 * @route POST /generate-questions
 * @param {Object} req.body - Request body
 * @param {Object} req.body.jobAnalysis - The job analysis object from analyzeJobPosting
 * @returns {Object} 200 - Success response with questions array
 * @returns {Object} 400 - Validation error
 * @returns {Object} 500 - Server error
 */
router.post('/generate-questions', async (req, res) => {
  try {
    // Validate input
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
      });
    }

    const { jobAnalysis } = req.body;

    if (!jobAnalysis || typeof jobAnalysis !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'jobAnalysis is required and must be an object',
      });
    }

    // Validate required fields in jobAnalysis
    if (!Array.isArray(jobAnalysis.requiredSkills)) {
      return res.status(400).json({
        success: false,
        error: 'jobAnalysis.requiredSkills must be an array',
      });
    }

    if (!Array.isArray(jobAnalysis.keyResponsibilities)) {
      return res.status(400).json({
        success: false,
        error: 'jobAnalysis.keyResponsibilities must be an array',
      });
    }

    // Call question generator
    const questions = await generateQuestions(jobAnalysis);

    // Return success response
    return res.status(200).json({
      success: true,
      questions: questions,
    });
  } catch (error) {
    // Handle validation errors
    if (error.message.includes('must be') || error.message.includes('required')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Handle API key errors
    if (error.message.includes('GROQ_API_KEY')) {
      return res.status(500).json({
        success: false,
        error: 'API configuration error: ' + error.message,
      });
    }

    // Handle other errors
    console.error('Error in /generate-questions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate questions: ' + error.message,
    });
  }
});

/**
 * POST /generate-resume
 * Generates resume content and calculates ATS score
 * 
 * @route POST /generate-resume
 * @param {Object} req.body - Request body
 * @param {Object} req.body.jobAnalysis - The job analysis object from analyzeJobPosting
 * @param {Object} req.body.answers - User answers to the generated questions
 * @returns {Object} 200 - Success response with resume content and ATS score
 * @returns {Object} 400 - Validation error
 * @returns {Object} 500 - Server error
 */
router.post('/generate-resume', async (req, res) => {
  try {
    // Validate input
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
      });
    }

    const { jobAnalysis, answers } = req.body;

    if (!jobAnalysis || typeof jobAnalysis !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'jobAnalysis is required and must be an object',
      });
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'answers is required and must be an object',
      });
    }

    // Validate required fields in jobAnalysis
    if (!Array.isArray(jobAnalysis.requiredSkills)) {
      return res.status(400).json({
        success: false,
        error: 'jobAnalysis.requiredSkills must be an array',
      });
    }

    if (!Array.isArray(jobAnalysis.keyResponsibilities)) {
      return res.status(400).json({
        success: false,
        error: 'jobAnalysis.keyResponsibilities must be an array',
      });
    }

    // Validate required user answers
    if (!answers.full_name || typeof answers.full_name !== 'string' || answers.full_name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'answers.full_name is required and must be a non-empty string',
      });
    }

    if (!answers.email || typeof answers.email !== 'string' || answers.email.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'answers.email is required and must be a non-empty string',
      });
    }

    if (!answers.phone || typeof answers.phone !== 'string' || answers.phone.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'answers.phone is required and must be a non-empty string',
      });
    }

    // Generate resume content
    const resumeContent = await generateResumeContent(jobAnalysis, answers);

    // Add personal info to resume content for export
    const resumeWithPersonalInfo = {
      ...resumeContent,
      personalInfo: {
        name: answers.full_name,
        email: answers.email,
        phone: answers.phone,
        linkedin: answers.linkedin_url || answers.linkedin || null,
      },
      userAnswers: answers,
    };

    // Calculate ATS score
    const scoreData = scoreResume(resumeContent, jobAnalysis);

    // Return success response
    return res.status(200).json({
      success: true,
      resume: resumeWithPersonalInfo,
      score: scoreData,
    });
  } catch (error) {
    // Handle validation errors
    if (error.message.includes('must be') || error.message.includes('required') || error.message.includes('cannot be empty')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Handle API key errors
    if (error.message.includes('GROQ_API_KEY')) {
      return res.status(500).json({
        success: false,
        error: 'API configuration error: ' + error.message,
      });
    }

    // Handle other errors
    console.error('Error in /generate-resume:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate resume: ' + error.message,
    });
  }
});

/**
 * POST /export-resume
 * Exports resume in specified format (PDF, DOCX, or TXT)
 * 
 * @route POST /export-resume
 * @param {Object} req.body - Request body
 * @param {Object} req.body.resume - The resume content object
 * @param {Object} req.body.userAnswers - User answers for personal info
 * @param {string} req.body.format - Export format: 'pdf', 'docx', or 'txt'
 * @returns {Buffer|string} 200 - Exported file (binary for PDF/DOCX, text for TXT)
 * @returns {Object} 400 - Validation error
 * @returns {Object} 500 - Server error
 */
router.post('/export-resume', async (req, res) => {
  try {
    // Validate input
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
      });
    }

    const { resume, userAnswers, format } = req.body;

    if (!resume || typeof resume !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'resume is required and must be an object',
      });
    }

    if (!format || typeof format !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'format is required and must be a string (pdf, docx, or txt)',
      });
    }

    const validFormats = ['pdf', 'docx', 'txt', 'text'];
    if (!validFormats.includes(format.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid format. Supported formats: ${validFormats.join(', ')}`,
      });
    }

    // Merge userAnswers into resume for personal info
    const resumeWithPersonalInfo = {
      ...resume,
      userAnswers: userAnswers || {},
    };

    // Export resume
    const exportedContent = await exportResume(resumeWithPersonalInfo, format);

    // Set appropriate headers based on format
    const formatLower = format.toLowerCase();
    if (formatLower === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
      return res.status(200).send(exportedContent);
    } else if (formatLower === 'docx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment; filename="resume.docx"');
      return res.status(200).send(exportedContent);
    } else {
      // txt or text
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="resume.txt"');
      return res.status(200).send(exportedContent);
    }
  } catch (error) {
    // Handle validation errors
    if (error.message.includes('Unsupported format') || error.message.includes('Invalid format')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Handle other errors
    console.error('Error in /export-resume:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to export resume: ' + error.message,
    });
  }
});

module.exports = router;

