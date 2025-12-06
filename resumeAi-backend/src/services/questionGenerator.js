require('dotenv').config();
const axios = require('axios');

/**
 * Base questions that are always included in the questionnaire
 * @type {Array<Object>}
 */
const BASE_QUESTIONS = [
  {
    id: 'full_name',
    question: 'Full name',
    type: 'text',
    category: 'personal',
    required: true,
    placeholder: 'Enter your full name',
  },
  {
    id: 'email',
    question: 'Email',
    type: 'email',
    category: 'personal',
    required: true,
    placeholder: 'your.email@example.com',
  },
  {
    id: 'phone',
    question: 'Phone',
    type: 'tel',
    category: 'personal',
    required: true,
    placeholder: '+1 (555) 123-4567',
  },
  {
    id: 'linkedin_url',
    question: 'LinkedIn URL',
    type: 'url',
    category: 'personal',
    required: false,
    placeholder: 'https://linkedin.com/in/yourprofile',
  },
  {
    id: 'years_of_experience',
    question: 'Years of experience',
    type: 'number',
    category: 'experience',
    required: true,
    placeholder: '5',
  },
];

/**
 * Generates additional questions based on job analysis using Groq API
 * @param {Object} jobAnalysis - The job analysis object from analyzeJobPosting
 * @returns {Promise<Array<Object>>} - Array of generated question objects
 */
async function generateAdditionalQuestions(jobAnalysis) {
  // Check for API key
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  // Get model name from environment or use default
  const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  // Groq API endpoint
  const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  // Extract relevant information from job analysis
  const requiredSkills = jobAnalysis.requiredSkills || [];
  const keyResponsibilities = jobAnalysis.keyResponsibilities || [];
  const jobLevel = jobAnalysis.jobLevel || 'mid';
  const industry = jobAnalysis.industry || '';

  // Construct the prompt for Groq
  const prompt = `Generate 5-8 interview questions based on the following job requirements. Return ONLY valid JSON without any markdown formatting or code blocks.

Job Requirements:
- Required Skills: ${requiredSkills.join(', ')}
- Key Responsibilities: ${keyResponsibilities.join('; ')}
- Job Level: ${jobLevel}
- Industry: ${industry}

Generate questions that:
1. Ask about specific technical skills mentioned in the required skills
2. Inquire about past projects or work experience related to the key responsibilities
3. Request achievements with metrics (numbers, percentages, impact)
4. Explore experience relevant to the job requirements
5. Are tailored to the job level (${jobLevel})

Return a JSON array of question objects. Each question object must have this exact structure:
{
  "id": "unique_snake_case_id",
  "question": "The question text",
  "type": "text" | "textarea" | "number" | "select" | "multiselect",
  "category": "skills" | "experience" | "achievements" | "projects",
  "required": true | false,
  "placeholder": "Example answer or hint text"
}

Guidelines:
- Use "textarea" for questions requiring detailed answers (projects, achievements)
- Use "text" for short answers
- Use "number" for metrics or years
- Use "select" or "multiselect" for questions with predefined options
- Make most questions required (true), but some can be optional (false)
- Include placeholders that guide the user on what to provide
- Focus on skills, past projects, achievements with metrics, and relevant experience
- Generate 5-8 questions total

Return ONLY the JSON array, no additional text or explanation.`;

  try {
    // Call Groq API
    const response = await axios.post(
      apiUrl,
      {
        model: modelName,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
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
    let parsedQuestions;
    try {
      // Remove markdown code blocks if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedQuestions = JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error(`Failed to parse Groq response as JSON: ${parseError.message}. Response: ${responseText.substring(0, 200)}`);
    }

    // Validate the structure of the response
    if (!Array.isArray(parsedQuestions)) {
      throw new Error('Invalid response: expected an array of questions');
    }

    // Validate each question object
    parsedQuestions.forEach((question, index) => {
      validateQuestion(question, index);
    });

    // Ensure we have 5-8 questions
    if (parsedQuestions.length < 5) {
      throw new Error(`Invalid response: expected at least 5 questions, got ${parsedQuestions.length}`);
    }
    if (parsedQuestions.length > 8) {
      // Trim to 8 if more than 8
      parsedQuestions = parsedQuestions.slice(0, 8);
    }

    return parsedQuestions;
  } catch (error) {
    // Handle API errors
    if (error.response) {
      // API responded with error status
      const errorDetails = error.response.data?.error || error.response.data || {};
      const errorMessage = errorDetails?.message || errorDetails?.type || JSON.stringify(errorDetails) || error.message;
      const errorStatus = error.response.status;
      
      // Log full error for debugging
      console.error('\n🔍 Groq API Error Details (questionGenerator):');
      console.error('Status:', errorStatus);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      
      throw new Error(`Groq API error: ${errorMessage} (status: ${errorStatus})`);
    } else if (error.message.includes('parse') || error.message.includes('JSON') || error.message.includes('Invalid response')) {
      throw error;
    } else {
      throw new Error(`Error generating questions: ${error.message}`);
    }
  }
}

/**
 * Validates a question object structure
 * @param {Object} question - The question object to validate
 * @param {number} index - The index of the question in the array (for error messages)
 * @throws {Error} If the question structure is invalid
 */
function validateQuestion(question, index) {
  if (!question || typeof question !== 'object') {
    throw new Error(`Invalid question at index ${index}: expected an object`);
  }

  const requiredFields = ['id', 'question', 'type', 'category', 'required', 'placeholder'];
  for (const field of requiredFields) {
    if (!(field in question)) {
      throw new Error(`Invalid question at index ${index}: missing required field '${field}'`);
    }
  }

  // Validate field types
  if (typeof question.id !== 'string' || question.id.trim().length === 0) {
    throw new Error(`Invalid question at index ${index}: 'id' must be a non-empty string`);
  }

  if (typeof question.question !== 'string' || question.question.trim().length === 0) {
    throw new Error(`Invalid question at index ${index}: 'question' must be a non-empty string`);
  }

  const validTypes = ['text', 'textarea', 'number', 'select', 'multiselect', 'email', 'tel', 'url'];
  if (!validTypes.includes(question.type)) {
    throw new Error(`Invalid question at index ${index}: 'type' must be one of: ${validTypes.join(', ')}`);
  }

  const validCategories = ['skills', 'experience', 'achievements', 'projects', 'personal'];
  if (!validCategories.includes(question.category)) {
    throw new Error(`Invalid question at index ${index}: 'category' must be one of: ${validCategories.join(', ')}`);
  }

  if (typeof question.required !== 'boolean') {
    throw new Error(`Invalid question at index ${index}: 'required' must be a boolean`);
  }

  if (typeof question.placeholder !== 'string') {
    throw new Error(`Invalid question at index ${index}: 'placeholder' must be a string`);
  }
}

/**
 * Generates a complete set of questions (base + AI-generated) based on job analysis
 * @param {Object} jobAnalysis - The job analysis object from analyzeJobPosting
 * @param {Object} jobAnalysis.requiredSkills - Array of required skills
 * @param {Object} jobAnalysis.keyResponsibilities - Array of key responsibilities
 * @param {Object} jobAnalysis.jobLevel - Job level (entry/mid/senior)
 * @param {Object} jobAnalysis.industry - Industry/domain
 * @returns {Promise<Array<Object>>} - Array of all questions (base + generated)
 * @throws {Error} If jobAnalysis is invalid or API call fails
 * 
 * @example
 * const jobAnalysis = await analyzeJobPosting(jobPostingText);
 * const questions = await generateQuestions(jobAnalysis);
 * console.log(questions); // Array of question objects
 */
async function generateQuestions(jobAnalysis) {
  // Validation
  if (!jobAnalysis || typeof jobAnalysis !== 'object') {
    throw new Error('jobAnalysis must be a valid object');
  }

  // Validate required fields
  if (!Array.isArray(jobAnalysis.requiredSkills)) {
    throw new Error('jobAnalysis.requiredSkills must be an array');
  }

  if (!Array.isArray(jobAnalysis.keyResponsibilities)) {
    throw new Error('jobAnalysis.keyResponsibilities must be an array');
  }

  // Generate additional questions using Claude
  let additionalQuestions = [];
  try {
    additionalQuestions = await generateAdditionalQuestions(jobAnalysis);
  } catch (error) {
    // If question generation fails, we can still return base questions
    // but log the error for debugging
    console.warn(`Warning: Failed to generate additional questions: ${error.message}`);
    // Return only base questions if generation fails
    return [...BASE_QUESTIONS];
  }

  // Combine base questions with generated questions
  const allQuestions = [...BASE_QUESTIONS, ...additionalQuestions];

  return allQuestions;
}

module.exports = {
  generateQuestions,
};

