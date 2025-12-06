require('dotenv').config();
const axios = require('axios');

/**
 * Analyzes a job posting using Groq AI and extracts structured information
 * @param {string} jobPostingText - The full text of the job posting
 * @returns {Promise<Object>} - Object containing extracted job information
 */
async function analyzeJobPosting(jobPostingText) {
  // Validation
  if (!jobPostingText || typeof jobPostingText !== 'string') {
    throw new Error('jobPostingText must be a non-empty string');
  }

  if (jobPostingText.trim().length === 0) {
    throw new Error('jobPostingText cannot be empty');
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

  // Construct the prompt for Groq
  const prompt = `Analyze the following job posting and extract structured information. Return ONLY valid JSON without any markdown formatting or code blocks.

Job Posting:
${jobPostingText}

Extract and return a JSON object with the following structure:
{
  "requiredSkills": ["skill1", "skill2", ...],
  "preferredQualifications": ["qualification1", "qualification2", ...],
  "keyResponsibilities": ["responsibility1", "responsibility2", ...],
  "atsKeywords": [
    {"keyword": "keyword1", "frequency": number},
    {"keyword": "keyword2", "frequency": number}
  ],
  "jobLevel": "entry" | "mid" | "senior",
  "industry": "industry name",
  "companyCultureIndicators": ["indicator1", "indicator2", ...]
}

Guidelines:
- requiredSkills: List all technical skills, tools, languages, or technologies that are mandatory
- preferredQualifications: List qualifications that are nice-to-have but not required
- keyResponsibilities: List the main duties and responsibilities (3-8 items)
- atsKeywords: Extract important keywords/phrases that ATS systems look for, with their frequency count in the posting
- jobLevel: Determine if this is an entry-level, mid-level, or senior position based on experience requirements and responsibilities
- industry: Identify the industry or domain (e.g., "Software Development", "Healthcare", "Finance", "Marketing")
- companyCultureIndicators: Extract phrases or words that indicate company culture, values, or work environment

Return ONLY the JSON object, no additional text or explanation.`;

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
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error(`Failed to parse Groq response as JSON: ${parseError.message}. Response: ${responseText.substring(0, 200)}`);
    }

    // Validate the structure of the response
    validateResponse(parsedResponse);

    return parsedResponse;
  } catch (error) {
    // Handle API errors
    if (error.response) {
      // API responded with error status
      const errorDetails = error.response.data?.error || error.response.data;
      const errorMessage = errorDetails?.message || errorDetails || error.message;
      const errorStatus = error.response.status;
      
      // Log full error for debugging
      console.error('\n🔍 Groq API Error Details:');
      console.error('Status:', errorStatus);
      console.error('Status Text:', error.response.statusText);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Request URL:', apiUrl);
      console.error('Model:', modelName);
      console.error('API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET');
      
      throw new Error(`Groq API error: ${errorMessage} (status: ${errorStatus})`);
    } else if (error.message.includes('parse') || error.message.includes('JSON')) {
      throw error;
    } else {
      throw new Error(`Error analyzing job posting: ${error.message}`);
    }
  }
}

/**
 * Validates the structure of the response from Groq
 * @param {Object} response - The parsed response object
 * @throws {Error} If the response structure is invalid
 */
function validateResponse(response) {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response: expected an object');
  }

  const requiredFields = [
    'requiredSkills',
    'preferredQualifications',
    'keyResponsibilities',
    'atsKeywords',
    'jobLevel',
    'industry',
    'companyCultureIndicators',
  ];

  for (const field of requiredFields) {
    if (!(field in response)) {
      throw new Error(`Invalid response: missing required field '${field}'`);
    }
  }

  // Validate array fields
  const arrayFields = [
    'requiredSkills',
    'preferredQualifications',
    'keyResponsibilities',
    'companyCultureIndicators',
  ];

  for (const field of arrayFields) {
    if (!Array.isArray(response[field])) {
      throw new Error(`Invalid response: '${field}' must be an array`);
    }
  }

  // Validate atsKeywords structure
  if (!Array.isArray(response.atsKeywords)) {
    throw new Error("Invalid response: 'atsKeywords' must be an array");
  }

  for (const keywordObj of response.atsKeywords) {
    if (!keywordObj || typeof keywordObj !== 'object') {
      throw new Error("Invalid response: each item in 'atsKeywords' must be an object");
    }
    if (!('keyword' in keywordObj) || !('frequency' in keywordObj)) {
      throw new Error("Invalid response: each item in 'atsKeywords' must have 'keyword' and 'frequency' properties");
    }
    if (typeof keywordObj.frequency !== 'number' || keywordObj.frequency < 0) {
      throw new Error("Invalid response: 'frequency' in 'atsKeywords' must be a non-negative number");
    }
  }

  // Validate jobLevel
  const validJobLevels = ['entry', 'mid', 'senior'];
  if (!validJobLevels.includes(response.jobLevel)) {
    throw new Error(`Invalid response: 'jobLevel' must be one of: ${validJobLevels.join(', ')}`);
  }

  // Validate industry
  if (typeof response.industry !== 'string' || response.industry.trim().length === 0) {
    throw new Error("Invalid response: 'industry' must be a non-empty string");
  }
}

module.exports = {
  analyzeJobPosting,
};

