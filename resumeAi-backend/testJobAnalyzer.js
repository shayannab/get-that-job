require('dotenv').config();
const { analyzeJobPosting } = require('./jobAnalyzer');

// Sample job posting 1: Software Engineer
const sampleJobPosting1 = `
Software Engineer - Full Stack Developer

Company: TechCorp Inc.
Location: San Francisco, CA (Remote)
Type: Full-time

About Us:
TechCorp is a fast-growing startup focused on building innovative SaaS solutions. We value collaboration, innovation, and work-life balance. Our team is passionate about creating products that make a difference.

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

What We Offer:
- Competitive salary and equity package
- Health, dental, and vision insurance
- Flexible work hours and remote work options
- Professional development opportunities
- Collaborative and inclusive work environment
`;

// Sample job posting 2: Marketing Manager
const sampleJobPosting2 = `
Marketing Manager - Digital Marketing Specialist

Company: GrowthMarketing Solutions
Location: New York, NY
Type: Full-time

About the Role:
We are looking for an experienced Marketing Manager to lead our digital marketing efforts. This is a senior-level position requiring 5+ years of experience in digital marketing.

Responsibilities:
- Develop and execute comprehensive digital marketing strategies
- Manage social media campaigns across multiple platforms (Facebook, Instagram, LinkedIn, Twitter)
- Create and optimize content for SEO and SEM
- Analyze marketing metrics and KPIs to measure campaign performance
- Lead a team of marketing specialists
- Collaborate with sales team to align marketing and sales goals
- Manage marketing budget and allocate resources effectively

Required Qualifications:
- 5+ years of experience in digital marketing
- Proven track record of successful marketing campaigns
- Strong knowledge of Google Analytics, Google Ads, and Facebook Ads
- Experience with marketing automation tools (HubSpot, Marketo)
- Excellent written and verbal communication skills
- Strong analytical and problem-solving abilities

Preferred Skills:
- Experience with content management systems (WordPress, Drupal)
- Knowledge of email marketing platforms (Mailchimp, Constant Contact)
- Graphic design skills (Adobe Creative Suite)
- Experience in B2B marketing
- MBA or Master's degree in Marketing

Company Culture:
We foster a results-driven culture with emphasis on creativity and innovation. Our team values transparency, accountability, and continuous learning. We offer flexible schedules and support work-life balance.
`;

// Sample job posting 3: Entry-level Data Analyst
const sampleJobPosting3 = `
Junior Data Analyst

Company: DataInsights LLC
Location: Austin, TX (Hybrid)
Type: Full-time, Entry-level

Job Summary:
We are seeking an entry-level Data Analyst to join our analytics team. This is an excellent opportunity for recent graduates or individuals looking to start their career in data analysis.

Key Duties:
- Collect and clean data from various sources
- Perform data analysis using Excel and SQL
- Create reports and visualizations using Tableau
- Assist senior analysts with complex projects
- Maintain data quality and integrity
- Support business decision-making with data insights

Requirements:
- Bachelor's degree in Statistics, Mathematics, Economics, or related field
- Basic knowledge of SQL and Excel
- Strong attention to detail
- Good communication skills
- Ability to work in a team environment
- Eagerness to learn and grow

Nice to Have:
- Experience with Python or R
- Knowledge of statistical analysis
- Internship experience in data analysis
- Familiarity with business intelligence tools

Our Culture:
We are a collaborative team that values mentorship and professional growth. We provide comprehensive training and support for career development. Our office culture is friendly, inclusive, and supportive of work-life balance.
`;

/**
 * Test function to analyze a job posting
 */
async function testJobAnalyzer(jobPosting, testName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${testName}`);
  console.log('='.repeat(60));

  try {
    const result = await analyzeJobPosting(jobPosting);
    
    console.log('\n✅ Analysis successful!\n');
    console.log('Extracted Information:');
    console.log(JSON.stringify(result, null, 2));
    
    return true;
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('Testing Error Handling');
  console.log('='.repeat(60));

  // Test 1: Empty string
  try {
    await analyzeJobPosting('');
    console.log('❌ Should have thrown error for empty string');
  } catch (error) {
    console.log('✅ Correctly caught error for empty string:', error.message);
  }

  // Test 2: Non-string input
  try {
    await analyzeJobPosting(null);
    console.log('❌ Should have thrown error for null input');
  } catch (error) {
    console.log('✅ Correctly caught error for null input:', error.message);
  }

  // Test 3: Missing API key (if not set)
  if (!process.env.GROQ_API_KEY) {
    try {
      await analyzeJobPosting('test job posting');
      console.log('❌ Should have thrown error for missing API key');
    } catch (error) {
      console.log('✅ Correctly caught error for missing API key:', error.message);
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('Job Analyzer Test Suite');
  console.log('Make sure GROQ_API_KEY is set in your environment variables\n');

  // Check if API key is set
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️  WARNING: GROQ_API_KEY environment variable is not set.');
    console.warn('   Set it using: export GROQ_API_KEY=your_key_here');
    console.warn('   Or on Windows: set GROQ_API_KEY=your_key_here');
    console.warn('   Or create a .env file with: GROQ_API_KEY=your_key_here\n');
  }

  // Run error handling tests first
  await testErrorHandling();

  // Only run API tests if API key is available
  if (process.env.GROQ_API_KEY) {
    // Test with sample job postings
    await testJobAnalyzer(sampleJobPosting1, 'Sample Job Posting 1: Software Engineer (Mid-level)');
    await testJobAnalyzer(sampleJobPosting2, 'Sample Job Posting 2: Marketing Manager (Senior)');
    await testJobAnalyzer(sampleJobPosting3, 'Sample Job Posting 3: Junior Data Analyst (Entry-level)');
  } else {
    console.log('\n⚠️  Skipping API tests - GROQ_API_KEY not set');
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('Test Suite Complete');
  console.log('='.repeat(60));
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error('Fatal error in test suite:', error);
    process.exit(1);
  });
}

module.exports = {
  testJobAnalyzer,
  runTests,
};

