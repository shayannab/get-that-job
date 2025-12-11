require('dotenv').config();
const axios = require('axios');

/**
 * Generates a cover letter using Groq AI based on job analysis and user profile
 * @param {Object} jobAnalysis - The job analysis object from analyzeJobPosting
 * @param {Object} userAnswers - User's answers from the questionnaire
 * @param {Object} resumeContent - Optional: Generated resume content for consistency
 * @returns {Promise<Object>} - Object containing generated cover letter
 */
async function generateCoverLetter(jobAnalysis, userAnswers, resumeContent = null) {
    // Validation
    if (!jobAnalysis || typeof jobAnalysis !== 'object') {
        throw new Error('jobAnalysis must be a valid object');
    }

    if (!userAnswers || typeof userAnswers !== 'object') {
        throw new Error('userAnswers must be a valid object');
    }

    // Validate required user info
    if (!userAnswers.full_name || typeof userAnswers.full_name !== 'string') {
        throw new Error('userAnswers.full_name is required');
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

    // Extract key information
    const requiredSkills = jobAnalysis.requiredSkills || [];
    const keyResponsibilities = jobAnalysis.keyResponsibilities || [];
    const industry = jobAnalysis.industry || '';
    const jobLevel = jobAnalysis.jobLevel || 'mid';
    const companyCultureIndicators = jobAnalysis.companyCultureIndicators || [];

    // Get user's key achievements if available
    const achievements = userAnswers.key_achievements || userAnswers.achievements || '';
    const yearsOfExperience = userAnswers.years_of_experience || userAnswers.yearsOfExperience || '';
    const currentRole = userAnswers.current_role || userAnswers.currentRole || '';

    // Extract company name if present in culture indicators or job analysis
    const companyName = extractCompanyName(jobAnalysis) || '[Company Name]';

    // Build the prompt
    const systemPrompt = `You are an expert cover letter writer who creates compelling, personalized cover letters that get candidates interviews. Your cover letters are:
- Genuine and conversational, not generic or robotic
- Tailored specifically to the job requirements
- Highlight relevant achievements with specific metrics
- Show enthusiasm for the role and company
- Professional yet personable in tone

IMPORTANT GUIDELINES:
1. Start with an engaging opening that shows genuine interest
2. Reference specific requirements from the job posting
3. Include 2-3 specific achievements that demonstrate relevant skills
4. Show knowledge of company culture where possible
5. End with a confident but not arrogant closing
6. Keep it to 3-4 paragraphs (approximately 250-350 words)
7. Use natural language, avoid clichés like "I am excited to apply" or "I am confident"
8. DO NOT start sentences with "I" too frequently`;

    const userPrompt = `Generate a professional cover letter for the following position:

JOB DETAILS:
- Industry: ${industry}
- Job Level: ${jobLevel}
- Required Skills: ${requiredSkills.join(', ')}
- Key Responsibilities: ${keyResponsibilities.join('; ')}
- Company Culture: ${companyCultureIndicators.join(', ')}
- Company Name: ${companyName}

CANDIDATE DETAILS:
- Name: ${userAnswers.full_name}
- Email: ${userAnswers.email || '[email]'}
- Phone: ${userAnswers.phone || '[phone]'}
- Current/Recent Role: ${currentRole}
- Years of Experience: ${yearsOfExperience}
- Key Achievements: ${achievements}
- LinkedIn: ${userAnswers.linkedin_url || userAnswers.linkedin || ''}

${resumeContent ? `RESUME SUMMARY FOR REFERENCE:
${resumeContent.summary || 'Not provided'}

KEY EXPERIENCE (use for specific examples):
${resumeContent.experience ? resumeContent.experience.slice(0, 2).map(exp =>
        `- ${exp.role} at ${exp.company}: ${(exp.bullets || []).slice(0, 2).join('; ')}`
    ).join('\n') : 'Not provided'}` : ''}

Generate a cover letter and return ONLY a JSON object with the following structure:
{
  "greeting": "Dear Hiring Manager," or "Dear [specific title if known],",
  "opening": "First paragraph - hook and interest",
  "body": "Middle paragraphs - achievements and skills",
  "closing": "Final paragraph - call to action",
  "signoff": "Best regards,\\n[Name]",
  "fullText": "The complete cover letter as a single string with proper paragraph breaks"
}

Return ONLY the JSON object, no additional text or explanation.`;

    try {
        const response = await axios.post(
            apiUrl,
            {
                model: modelName,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: 2000,
                temperature: 0.7, // Slightly higher for more natural writing
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Extract and parse response
        const responseText = response.data.choices[0].message.content.trim();

        let parsedCoverLetter;
        try {
            const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsedCoverLetter = JSON.parse(jsonText);
        } catch (parseError) {
            throw new Error(`Failed to parse cover letter response as JSON: ${parseError.message}`);
        }

        // Validate required fields
        validateCoverLetterStructure(parsedCoverLetter);

        // Add metadata
        return {
            ...parsedCoverLetter,
            metadata: {
                generatedAt: new Date().toISOString(),
                targetCompany: companyName,
                targetRole: currentRole || 'Position',
                industry: industry,
            },
        };
    } catch (error) {
        if (error.response) {
            const errorDetails = error.response.data?.error || error.response.data || {};
            const errorMessage = errorDetails?.message || JSON.stringify(errorDetails) || error.message;
            throw new Error(`Groq API error: ${errorMessage} (status: ${error.response.status})`);
        }
        throw error;
    }
}

/**
 * Extract company name from job analysis
 */
function extractCompanyName(jobAnalysis) {
    // Check if company name is in culture indicators
    const cultureIndicators = jobAnalysis.companyCultureIndicators || [];

    // Look for patterns like "at [Company]" or "[Company]'s culture"
    for (const indicator of cultureIndicators) {
        const companyMatch = indicator.match(/(?:at|join|with)\s+([A-Z][a-zA-Z0-9\s&]+?)(?:\s|,|'s|$)/);
        if (companyMatch) {
            return companyMatch[1].trim();
        }
    }

    return null;
}

/**
 * Validates the structure of the generated cover letter
 */
function validateCoverLetterStructure(coverLetter) {
    if (!coverLetter || typeof coverLetter !== 'object') {
        throw new Error('Invalid cover letter: expected an object');
    }

    const requiredFields = ['greeting', 'opening', 'body', 'closing', 'signoff', 'fullText'];
    for (const field of requiredFields) {
        if (!(field in coverLetter)) {
            throw new Error(`Invalid cover letter: missing required field '${field}'`);
        }
        if (typeof coverLetter[field] !== 'string' || coverLetter[field].trim().length === 0) {
            throw new Error(`Invalid cover letter: '${field}' must be a non-empty string`);
        }
    }
}

module.exports = {
    generateCoverLetter,
};
