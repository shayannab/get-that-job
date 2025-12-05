require('dotenv').config();
const axios = require('axios');

/**
 * Generates resume content using Groq API based on job analysis and user answers
 * @param {Object} jobAnalysis - The job analysis object from analyzeJobPosting
 * @param {Object} jobAnalysis.requiredSkills - Array of required skills
 * @param {Object} jobAnalysis.preferredQualifications - Array of preferred qualifications
 * @param {Object} jobAnalysis.keyResponsibilities - Array of key responsibilities
 * @param {Object} jobAnalysis.atsKeywords - Array of ATS keywords with frequency
 * @param {Object} jobAnalysis.jobLevel - Job level (entry/mid/senior)
 * @param {Object} jobAnalysis.industry - Industry/domain
 * @param {Object} userAnswers - Object containing user's answers to questions
 * @returns {Promise<Object>} - Object containing generated resume sections
 * @throws {Error} If jobAnalysis or userAnswers are invalid or API call fails
 * 
 * @example
 * const jobAnalysis = await analyzeJobPosting(jobPostingText);
 * const userAnswers = { full_name: "John Doe", email: "john@example.com", ... };
 * const resumeContent = await generateResumeContent(jobAnalysis, userAnswers);
 */
async function generateResumeContent(jobAnalysis, userAnswers) {
  // Validation
  if (!jobAnalysis || typeof jobAnalysis !== 'object') {
    throw new Error('jobAnalysis must be a valid object');
  }

  if (!userAnswers || typeof userAnswers !== 'object') {
    throw new Error('userAnswers must be a valid object');
  }

  // Validate required fields in jobAnalysis
  if (!Array.isArray(jobAnalysis.requiredSkills)) {
    throw new Error('jobAnalysis.requiredSkills must be an array');
  }

  if (!Array.isArray(jobAnalysis.keyResponsibilities)) {
    throw new Error('jobAnalysis.keyResponsibilities must be an array');
  }

  // Validate required user answers
  if (!userAnswers.full_name || typeof userAnswers.full_name !== 'string' || userAnswers.full_name.trim().length === 0) {
    throw new Error('userAnswers.full_name is required and must be a non-empty string');
  }

  if (!userAnswers.email || typeof userAnswers.email !== 'string' || userAnswers.email.trim().length === 0) {
    throw new Error('userAnswers.email is required and must be a non-empty string');
  }

  if (!userAnswers.phone || typeof userAnswers.phone !== 'string' || userAnswers.phone.trim().length === 0) {
    throw new Error('userAnswers.phone is required and must be a non-empty string');
  }

  // Check for API key
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  // Get model name from environment or use default
  const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  // Groq API endpoint
  const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  // Extract relevant information
  const requiredSkills = jobAnalysis.requiredSkills || [];
  const preferredQualifications = jobAnalysis.preferredQualifications || [];
  const keyResponsibilities = jobAnalysis.keyResponsibilities || [];
  const atsKeywords = jobAnalysis.atsKeywords || [];
  const jobLevel = jobAnalysis.jobLevel || 'mid';
  const industry = jobAnalysis.industry || '';

  // Extract top ATS keywords (sorted by frequency)
  const topAtsKeywords = atsKeywords
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 15)
    .map(kw => kw.keyword)
    .join(', ');

  // Construct the system prompt
  const systemPrompt = `You are an expert resume writer specializing in ATS (Applicant Tracking System) optimization. Your task is to create a professional, keyword-rich resume that maximizes the candidate's chances of passing ATS filters and impressing hiring managers.

Key Requirements:
1. ATS Optimization: Naturally incorporate high-frequency keywords from the job posting throughout the resume
2. Action Verbs: Use strong action verbs (e.g., "Developed", "Implemented", "Led", "Optimized", "Designed", "Managed", "Achieved")
3. Quantified Achievements: Include specific metrics, numbers, percentages, and measurable results in every bullet point
4. Match Job Requirements: Align all content with the required skills and key responsibilities
5. Professional Tone: Maintain a professional, confident, and achievement-focused tone
6. Achievement-Focused: Focus on accomplishments and impact, not just responsibilities

Resume Structure Guidelines:
- Summary: 2-3 sentences, keyword-rich, highlighting most relevant experience and skills
- Experience: Each role should have 3-5 achievement-focused bullets with metrics
- Skills: Organize into technical, soft, and tools categories
- Education: Include relevant degrees, certifications, or training
- Additional Sections: Include if relevant (certifications, projects, awards, etc.)

Return ONLY valid JSON without any markdown formatting or code blocks.`;

  // Construct the user prompt
  const userPrompt = `Generate a professional resume based on the following job requirements and candidate information.

JOB REQUIREMENTS:
- Required Skills: ${requiredSkills.join(', ')}
- Preferred Qualifications: ${preferredQualifications.join(', ')}
- Key Responsibilities: ${keyResponsibilities.join('; ')}
- Top ATS Keywords: ${topAtsKeywords}
- Job Level: ${jobLevel}
- Industry: ${industry}

CANDIDATE INFORMATION:
${JSON.stringify(userAnswers, null, 2)}

Generate a complete resume with the following structure. Return ONLY a JSON object:

{
  "summary": "2-3 sentence professional summary that is keyword-rich and highlights relevant experience",
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "MM/YYYY - MM/YYYY or Present",
      "bullets": [
        "Achievement-focused bullet with action verb and metric (e.g., 'Developed scalable API that processed 1M+ requests daily, reducing latency by 40%')",
        "Another achievement bullet with quantified result",
        "Third achievement bullet"
      ]
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2", ...],
    "soft": ["skill1", "skill2", ...],
    "tools": ["tool1", "tool2", ...]
  },
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "year": "YYYY",
      "details": "Optional additional details (GPA, honors, relevant coursework)"
    }
  ],
  "additionalSections": [
    {
      "title": "Section Title (e.g., Certifications, Projects, Awards)",
      "items": [
        "Item 1 with details",
        "Item 2 with details"
      ]
    }
  ]
}

CRITICAL GUIDELINES:
1. Every experience bullet MUST start with a strong action verb and include a quantified achievement
2. Incorporate ATS keywords naturally throughout the resume (especially in summary and experience bullets)
3. Match the required skills - include as many as possible in the skills section and demonstrate them in experience bullets
4. Focus on achievements and impact, not just responsibilities
5. Use metrics: numbers, percentages, dollar amounts, time saved, efficiency gains, etc.
6. Make the resume relevant to the job level (${jobLevel}) and industry (${industry})
7. If user answers don't provide enough information for a section, create realistic but professional content based on the job requirements
8. Ensure all dates, companies, and roles are consistent with the user's answers
9. Technical skills should match the required skills from the job posting
10. Soft skills should be relevant to the key responsibilities

Return ONLY the JSON object, no additional text or explanation.`;

  try {
    // Call Groq API
    const response = await axios.post(
      apiUrl,
      {
        model: modelName,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: 4000,
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract the response text
    const responseText = response.data.choices[0].message.content.trim();

    // Parse JSON response
    let parsedResume;
    try {
      // Remove markdown code blocks if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResume = JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error(`Failed to parse Groq response as JSON: ${parseError.message}. Response: ${responseText.substring(0, 200)}`);
    }

    // Validate the structure of the response
    validateResumeStructure(parsedResume);

    return parsedResume;
  } catch (error) {
    // Handle API errors
    if (error.response) {
      // API responded with error status
      const errorDetails = error.response.data?.error || error.response.data || {};
      const errorMessage = errorDetails?.message || errorDetails?.type || JSON.stringify(errorDetails) || error.message;
      const errorStatus = error.response.status;
      
      // Log full error for debugging
      console.error('\n🔍 Groq API Error Details (resumeGenerator):');
      console.error('Status:', errorStatus);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      
      throw new Error(`Groq API error: ${errorMessage} (status: ${errorStatus})`);
    } else if (error.message.includes('parse') || error.message.includes('JSON') || error.message.includes('Invalid')) {
      throw error;
    } else {
      throw new Error(`Error generating resume content: ${error.message}`);
    }
  }
}

/**
 * Validates the structure of the generated resume
 * @param {Object} resume - The parsed resume object
 * @throws {Error} If the resume structure is invalid
 */
function validateResumeStructure(resume) {
  if (!resume || typeof resume !== 'object') {
    throw new Error('Invalid resume: expected an object');
  }

  const requiredFields = ['summary', 'experience', 'skills', 'education', 'additionalSections'];
  for (const field of requiredFields) {
    if (!(field in resume)) {
      throw new Error(`Invalid resume: missing required field '${field}'`);
    }
  }

  // Validate summary
  if (typeof resume.summary !== 'string' || resume.summary.trim().length === 0) {
    throw new Error("Invalid resume: 'summary' must be a non-empty string");
  }

  // Validate experience
  if (!Array.isArray(resume.experience)) {
    throw new Error("Invalid resume: 'experience' must be an array");
  }

  resume.experience.forEach((exp, index) => {
    if (!exp || typeof exp !== 'object') {
      throw new Error(`Invalid resume: experience item at index ${index} must be an object`);
    }

    const requiredExpFields = ['company', 'role', 'duration', 'bullets'];
    for (const field of requiredExpFields) {
      if (!(field in exp)) {
        throw new Error(`Invalid resume: experience item at index ${index} missing required field '${field}'`);
      }
    }

    if (typeof exp.company !== 'string' || exp.company.trim().length === 0) {
      throw new Error(`Invalid resume: experience item at index ${index} 'company' must be a non-empty string`);
    }

    if (typeof exp.role !== 'string' || exp.role.trim().length === 0) {
      throw new Error(`Invalid resume: experience item at index ${index} 'role' must be a non-empty string`);
    }

    if (typeof exp.duration !== 'string' || exp.duration.trim().length === 0) {
      throw new Error(`Invalid resume: experience item at index ${index} 'duration' must be a non-empty string`);
    }

    if (!Array.isArray(exp.bullets)) {
      throw new Error(`Invalid resume: experience item at index ${index} 'bullets' must be an array`);
    }

    exp.bullets.forEach((bullet, bulletIndex) => {
      if (typeof bullet !== 'string' || bullet.trim().length === 0) {
        throw new Error(`Invalid resume: experience item at index ${index}, bullet at index ${bulletIndex} must be a non-empty string`);
      }
    });
  });

  // Validate skills
  if (!resume.skills || typeof resume.skills !== 'object') {
    throw new Error("Invalid resume: 'skills' must be an object");
  }

  const skillCategories = ['technical', 'soft', 'tools'];
  for (const category of skillCategories) {
    if (!(category in resume.skills)) {
      throw new Error(`Invalid resume: 'skills.${category}' is missing`);
    }
    if (!Array.isArray(resume.skills[category])) {
      throw new Error(`Invalid resume: 'skills.${category}' must be an array`);
    }
  }

  // Validate education
  if (!Array.isArray(resume.education)) {
    throw new Error("Invalid resume: 'education' must be an array");
  }

  resume.education.forEach((edu, index) => {
    if (!edu || typeof edu !== 'object') {
      throw new Error(`Invalid resume: education item at index ${index} must be an object`);
    }

    if (!('degree' in edu) || typeof edu.degree !== 'string' || edu.degree.trim().length === 0) {
      throw new Error(`Invalid resume: education item at index ${index} 'degree' must be a non-empty string`);
    }

    if (!('institution' in edu) || typeof edu.institution !== 'string' || edu.institution.trim().length === 0) {
      throw new Error(`Invalid resume: education item at index ${index} 'institution' must be a non-empty string`);
    }
  });

  // Validate additionalSections
  if (!Array.isArray(resume.additionalSections)) {
    throw new Error("Invalid resume: 'additionalSections' must be an array");
  }

  resume.additionalSections.forEach((section, index) => {
    if (!section || typeof section !== 'object') {
      throw new Error(`Invalid resume: additionalSections item at index ${index} must be an object`);
    }

    if (!('title' in section) || typeof section.title !== 'string' || section.title.trim().length === 0) {
      throw new Error(`Invalid resume: additionalSections item at index ${index} 'title' must be a non-empty string`);
    }

    if (!('items' in section) || !Array.isArray(section.items)) {
      throw new Error(`Invalid resume: additionalSections item at index ${index} 'items' must be an array`);
    }
  });
}

module.exports = {
  generateResumeContent,
};

