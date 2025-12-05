require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Sample job posting
const sampleJobPosting = `
Software Engineer - Full Stack Developer

Company: TechCorp Inc.
Location: San Francisco, CA (Remote)
Type: Full-time

Job Description:
We are seeking a talented Software Engineer to join our engineering team. You will be responsible for designing, developing, and maintaining our web applications using modern technologies.

Key Responsibilities:
- Design and develop scalable web applications using React and Node.js
- Collaborate with cross-functional teams including product managers and designers
- Write clean, maintainable, and well-documented code
- Participate in code reviews and contribute to technical discussions
- Debug and fix issues in production systems
- Implement automated testing to ensure code quality

Required Skills:
- 3+ years of experience in software development
- Strong proficiency in JavaScript and TypeScript
- Experience with React.js and Node.js
- Knowledge of RESTful APIs and GraphQL
- Experience with databases (PostgreSQL, MongoDB)
- Familiarity with Git version control
- Understanding of cloud platforms (AWS, Azure)

Preferred Qualifications:
- Experience with Docker and Kubernetes
- Knowledge of microservices architecture
- Experience with CI/CD pipelines
- Familiarity with Agile/Scrum methodologies
- Bachelor's degree in Computer Science or related field
`;

async function testWorkflow() {
  console.log('🚀 Starting Complete Workflow Test\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Health Check
    console.log('\n📋 Step 1: Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    if (healthResponse.data.status !== 'ok') {
      throw new Error('Health check failed');
    }

    // Step 2: Analyze Job Posting
    console.log('\n📋 Step 2: Analyzing Job Posting...');
    const analysisResponse = await axios.post(`${BASE_URL}/api/analyze-job`, {
      jobPosting: sampleJobPosting
    });

    if (!analysisResponse.data.success) {
      throw new Error('Job analysis failed');
    }

    const jobAnalysis = analysisResponse.data.data;
    console.log('✅ Job analyzed successfully!');
    console.log(`   - Job Level: ${jobAnalysis.jobLevel}`);
    console.log(`   - Industry: ${jobAnalysis.industry}`);
    console.log(`   - Required Skills: ${jobAnalysis.requiredSkills.length} skills`);
    console.log(`   - Key Responsibilities: ${jobAnalysis.keyResponsibilities.length} items`);

    // Step 3: Generate Questions
    console.log('\n📋 Step 3: Generating Questions...');
    const questionsResponse = await axios.post(`${BASE_URL}/api/generate-questions`, {
      jobAnalysis
    });

    if (!questionsResponse.data.success) {
      throw new Error('Question generation failed');
    }

    const questions = questionsResponse.data.questions;
    console.log('✅ Questions generated successfully!');
    console.log(`   - Total Questions: ${questions.length}`);
    console.log(`   - Base Questions: 5`);
    console.log(`   - Generated Questions: ${questions.length - 5}`);

    // Step 4: Generate Resume
    console.log('\n📋 Step 4: Generating Resume...');
    const userAnswers = {
      full_name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1-555-123-4567",
      linkedin_url: "https://linkedin.com/in/johndoe",
      years_of_experience: 5
    };

    const resumeResponse = await axios.post(`${BASE_URL}/api/generate-resume`, {
      jobAnalysis,
      answers: userAnswers
    });

    if (!resumeResponse.data.success) {
      throw new Error('Resume generation failed');
    }

    const resume = resumeResponse.data.resume;
    const score = resumeResponse.data.score;

    console.log('✅ Resume generated successfully!');
    console.log(`   - Summary: ${resume.summary.substring(0, 50)}...`);
    console.log(`   - Experience Entries: ${resume.experience.length}`);
    console.log(`   - Technical Skills: ${resume.skills.technical.length}`);
    console.log(`   - Education Entries: ${resume.education.length}`);

    // Step 5: Display ATS Score
    console.log('\n📋 Step 5: ATS Scoring Results...');
    console.log('✅ ATS Score calculated!');
    console.log(`   - Overall Score: ${score.overallScore}/100`);
    console.log(`   - Keyword Match: ${score.keywordMatchScore}/100`);
    console.log(`   - Skills Coverage: ${score.skillsCoverageScore}/100`);
    console.log(`   - Content Quality: ${score.contentQualityScore}/100`);
    console.log(`   - Missing Keywords: ${score.missingKeywords.length}`);
    console.log(`   - Missing Skills: ${score.missingSkills.length}`);
    console.log(`   - Suggestions: ${score.suggestions.length}`);

    if (score.suggestions.length > 0) {
      console.log('\n💡 Top Suggestions:');
      score.suggestions.slice(0, 3).forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed successfully! 🎉');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  console.log('Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error('\n❌ Server is not running!');
    console.error(`   Please start the server first: npm start`);
    console.error(`   Then run this test: node test-workflow.js`);
    process.exit(1);
  }

  await testWorkflow();
})();

