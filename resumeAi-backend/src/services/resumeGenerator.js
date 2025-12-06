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

  // Extract years of experience from user answers
  const yearsOfExperience = parseInt(userAnswers.years_of_experience) || parseInt(userAnswers.yearsOfExperience) || 0;
  
  // Determine number of jobs to generate based on experience
  let numberOfJobs = 1;
  if (yearsOfExperience >= 6) {
    numberOfJobs = 4;
  } else if (yearsOfExperience >= 4) {
    numberOfJobs = 3;
  } else if (yearsOfExperience >= 2) {
    numberOfJobs = 2;
  } else {
    numberOfJobs = 1;
  }

  // Extract top ATS keywords (sorted by frequency)
  const topAtsKeywords = atsKeywords
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 15)
    .map(kw => kw.keyword)
    .join(', ');

  // Construct the system prompt
  const systemPrompt = `You are an expert resume writer and ATS optimization specialist with 15+ years of experience. Your resumes consistently pass ATS filters and get candidates interviews at top companies.

CRITICAL ATS OPTIMIZATION RULES:
1. Keyword Density: Naturally include ALL high-frequency ATS keywords from the job posting (${topAtsKeywords}) throughout the resume, especially in:
   - Professional summary (use 5-8 keywords)
   - Experience bullet points (use 2-3 keywords per bullet)
   - Skills section (list all required skills explicitly)

2. Action Verbs: Start EVERY experience bullet with a strong action verb:
   - Technical: Developed, Designed, Built, Implemented, Created, Architected, Optimized, Engineered
   - Leadership: Led, Managed, Directed, Coordinated, Oversaw, Spearheaded, Championed
   - Impact: Achieved, Increased, Reduced, Improved, Accelerated, Transformed, Delivered

3. Quantified Achievements: EVERY bullet MUST include specific metrics:
   - Numbers: "increased revenue by $2M", "reduced costs by 30%", "managed team of 12"
   - Percentages: "improved performance by 45%", "increased efficiency by 60%"
   - Scale: "processed 1M+ requests daily", "served 500K+ users", "handled 10K+ tickets"
   - Time: "reduced deployment time from 2 hours to 15 minutes", "cut processing time by 50%"
   - Money: "saved $500K annually", "generated $1.2M in revenue", "reduced costs by $200K"

4. Skills Matching: Ensure ALL required skills (${requiredSkills.join(', ')}) appear in:
   - Skills section (categorized into: languages, frameworks, databases, cloud, tools)
   - Experience bullets (demonstrated through achievements)
   - Summary (mentioned naturally)
   
   Skills must be categorized correctly:
   - languages: Programming languages (JavaScript, Python, Java, C++, SQL, etc.)
   - frameworks: Frameworks and libraries (React, Angular, Vue, Express, Django, Spring, etc.)
   - databases: Database systems (PostgreSQL, MongoDB, MySQL, Redis, etc.)
   - cloud: Cloud services and DevOps tools (AWS, Azure, GCP, Docker, Kubernetes, CI/CD, etc.)
   - tools: Development and productivity tools (Git, Webpack, Jest, Postman, Jira, etc.)
   
   DO NOT include soft skills in the skills object. Soft skills belong in the summary or experience descriptions, not in technical skills.

5. Job Alignment: Every experience bullet should directly relate to key responsibilities: ${keyResponsibilities.slice(0, 3).join('; ')}

6. Professional Summary: Must be 2-3 sentences that:
   - Start with years of experience and job level (${jobLevel})
   - Include 5-8 ATS keywords naturally
   - Highlight top 3-4 most relevant skills
   - Mention industry expertise (${industry})
   - End with a value proposition

7. Experience Bullets: Each role needs 3-5 bullets that:
   - Start with action verb
   - Include quantified metric
   - Demonstrate required skills
   - Show impact on business/team
   - Use ATS keywords naturally

Return ONLY valid JSON without any markdown formatting or code blocks.`;

  // Build experience structure description based on number of jobs
  let experienceStructure = '';
  if (numberOfJobs === 4) {
    experienceStructure = `[
    {
      "company": "Current/Most Recent Company Name",
      "role": "Senior Role Title (e.g., Senior Software Engineer, Lead Developer)",
      "duration": "MM/YYYY - Present (most recent, approximately ${yearsOfExperience - 1.5} years)",
      "bullets": [
        "Most impressive achievement with action verb and metric - USE candidate's specific achievements from their answers",
        "Second major achievement with quantified result",
        "Third achievement showing leadership/complexity",
        "Fourth achievement (senior-level impact)",
        "Fifth achievement (if applicable)"
      ]
    },
    {
      "company": "Previous Company Name",
      "role": "Mid-level Role Title (e.g., Software Engineer, ${industry} Developer)",
      "duration": "MM/YYYY - MM/YYYY (approximately ${yearsOfExperience - 3.5} to ${yearsOfExperience - 1.5} years ago, 1.5-2 years duration)",
      "bullets": [
        "Achievement showing growing responsibility with metrics",
        "Second achievement demonstrating skill development",
        "Third achievement (mid-level complexity)"
      ]
    },
    {
      "company": "Earlier Company Name",
      "role": "Mid-level or Junior Role Title (e.g., Junior Software Engineer, Associate ${industry} Professional)",
      "duration": "MM/YYYY - MM/YYYY (approximately ${yearsOfExperience - 5.5} to ${yearsOfExperience - 3.5} years ago, 1.5-2 years duration)",
      "bullets": [
        "Achievement showing building expertise with metrics",
        "Second achievement demonstrating foundational skills"
      ]
    },
    {
      "company": "First/Early Career Company Name",
      "role": "Junior/Entry-level Role Title (e.g., Junior Developer, Entry-level ${industry} Professional)",
      "duration": "MM/YYYY - MM/YYYY (approximately ${yearsOfExperience - 6.5} to ${yearsOfExperience - 5.5} years ago, 1 year duration)",
      "bullets": [
        "Early career achievement showing learning and contribution with metrics",
        "Second achievement demonstrating growth and impact"
      ]
    }
  ]`;
  } else if (numberOfJobs === 3) {
    experienceStructure = `[
    {
      "company": "Current/Most Recent Company Name",
      "role": "Senior/Mid-level Role Title (e.g., Senior Software Engineer, ${industry} Developer)",
      "duration": "MM/YYYY - Present (most recent, approximately ${yearsOfExperience - 1.5} years)",
      "bullets": [
        "Most impressive achievement with action verb and metric - USE candidate's specific achievements from their answers",
        "Second major achievement with quantified result",
        "Third achievement showing impact",
        "Fourth achievement (if senior role)"
      ]
    },
    {
      "company": "Previous Company Name",
      "role": "Mid-level Role Title (e.g., Software Engineer, ${industry} Professional)",
      "duration": "MM/YYYY - MM/YYYY (approximately ${yearsOfExperience - 3} to ${yearsOfExperience - 1.5} years ago, 1.5 years duration)",
      "bullets": [
        "Achievement showing growing responsibility with metrics",
        "Second achievement demonstrating skill development",
        "Third achievement (mid-level)"
      ]
    },
    {
      "company": "First/Early Career Company Name",
      "role": "Junior/Mid-level Role Title (e.g., Junior Software Engineer, Associate ${industry} Professional)",
      "duration": "MM/YYYY - MM/YYYY (approximately ${yearsOfExperience - 4.5} to ${yearsOfExperience - 3} years ago, 1-1.5 years duration)",
      "bullets": [
        "Early career achievement showing building expertise with metrics",
        "Second achievement demonstrating foundational skills"
      ]
    }
  ]`;
  } else if (numberOfJobs === 2) {
    experienceStructure = `[
    {
      "company": "Current/Most Recent Company Name",
      "role": "Mid-level Role Title (e.g., Software Engineer, ${industry} Developer)",
      "duration": "MM/YYYY - Present (most recent, approximately ${yearsOfExperience - 1} years)",
      "bullets": [
        "Key achievement with action verb and metric - USE candidate's specific achievements from their answers",
        "Second achievement with quantified result",
        "Third achievement showing impact"
      ]
    },
    {
      "company": "Previous Company Name",
      "role": "Junior/Mid-level Role Title (e.g., Junior Software Engineer, Associate ${industry} Professional)",
      "duration": "MM/YYYY - MM/YYYY (approximately ${yearsOfExperience - 2} to ${yearsOfExperience - 1} years ago, 1 year duration)",
      "bullets": [
        "Early career achievement showing growth with metrics",
        "Second achievement demonstrating learning and contribution"
      ]
    }
  ]`;
  } else {
    experienceStructure = `[
    {
      "company": "Current Company Name",
      "role": "Junior/Mid-level Role Title based on experience",
      "duration": "MM/YYYY - Present (${yearsOfExperience} years total)",
      "bullets": [
        "Key achievement with action verb and metric - USE candidate's specific achievements from their answers",
        "Second achievement with quantified result",
        "Third achievement showing impact"
      ]
    }
  ]`;
  }

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

CRITICAL REQUIREMENT: The candidate has ${yearsOfExperience} years of experience. You MUST generate EXACTLY ${numberOfJobs} work experience entries showing realistic career progression from junior to senior roles.

Generate a complete resume with the following structure. Return ONLY a JSON object:

{
  "summary": "2-3 sentence professional summary that is keyword-rich and highlights relevant experience",
  "experience": ${experienceStructure},
  "skills": {
    "languages": ["JavaScript", "TypeScript", "Python", "SQL"],
    "frameworks": ["React", "Next.js", "Node.js", "Express", "NestJS"],
    "databases": ["PostgreSQL", "MongoDB", "Redis", "MySQL"],
    "cloud": ["AWS EC2", "AWS S3", "AWS Lambda", "Docker", "Kubernetes", "CI/CD"],
    "tools": ["Git", "Webpack", "Jest", "Postman", "Jira"]
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

EXPERIENCE GENERATION DETAILS:
- Total years of experience: ${yearsOfExperience} years
- Number of jobs to generate: ${numberOfJobs} (MANDATORY)
- Career progression: ${numberOfJobs === 4 ? 'Senior → Mid → Mid → Junior' : numberOfJobs === 3 ? 'Senior/Mid → Mid → Junior' : numberOfJobs === 2 ? 'Mid → Junior' : 'Junior/Mid'}
- Use candidate's specific achievements (from key_achievements, relevant_skills, current_role fields) for the MOST RECENT job
- For earlier jobs, create realistic but professional achievements based on career progression
- All date ranges must be non-overlapping and total exactly ${yearsOfExperience} years
- Most recent job should end with "Present"
- Show clear career growth: complexity and impact should increase from oldest to newest job

CRITICAL GUIDELINES FOR EXPERIENCE GENERATION:
1. Generate EXACTLY ${numberOfJobs} work experience entries - this is mandatory
2. Show realistic career progression from junior to senior roles
3. Distribute user's achievements:
   - Use user's specific project descriptions, achievements, and key_achievements for the MOST RECENT job (Job 1)
   - For earlier jobs, infer realistic projects based on their skills, industry (${industry}), and career progression
   - Show growth: earlier jobs = simpler achievements, recent jobs = more complex/impactful ones
4. Date ranges must be realistic, non-overlapping, and total ${yearsOfExperience} years:
   - Calculate backwards from present
   - Most recent job: Ends with "Present" or current date
   - Previous jobs: Non-overlapping date ranges that add up to ${yearsOfExperience} years total
5. Role progression must match experience level:
   ${numberOfJobs === 4 ? '- Job 1: Senior role (Senior Software Engineer, Lead Developer, etc.)\n   - Job 2: Mid-level role (Software Engineer, Developer, etc.)\n   - Job 3: Mid-level or Junior role (Junior Software Engineer, Associate, etc.)\n   - Job 4: Junior/Entry role (Junior Developer, Entry-level, etc.)' : numberOfJobs === 3 ? '- Job 1: Senior/Mid-level role\n   - Job 2: Mid-level role\n   - Job 3: Junior/Mid-level role' : numberOfJobs === 2 ? '- Job 1: Mid-level role\n   - Job 2: Junior/Mid-level role' : '- Job 1: Junior/Mid-level role'}
6. Every experience bullet MUST start with a strong action verb and include a quantified achievement
7. Incorporate ATS keywords naturally throughout ALL experience entries (especially in most recent job)
8. Match the required skills - demonstrate them across multiple jobs to show skill progression
9. Use metrics: numbers, percentages, dollar amounts, time saved, efficiency gains, scale indicators
10. Make all jobs relevant to the job level (${jobLevel}) and industry (${industry})
11. Company names should be realistic and industry-appropriate
12. If user answers don't provide enough information, create realistic but professional content based on job requirements
13. Technical skills must be categorized correctly into: languages, frameworks, databases, cloud, and tools
14. All required skills from the job posting must appear in the appropriate skills category
15. DO NOT include soft skills in the skills object - they should be demonstrated in the summary and experience descriptions, not listed as technical skills

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
        temperature: 0.5, // Increased for more creative but still focused content
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

