require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Sample resume content for testing
const sampleResume = {
  summary: 'Experienced Software Engineer with 5+ years of expertise in full-stack development. Proven track record of building scalable web applications using React, Node.js, and cloud technologies.',
  experience: [
    {
      company: 'TechCorp Inc.',
      role: 'Senior Software Engineer',
      duration: '2020 - Present',
      bullets: [
        'Developed scalable web applications serving 100K+ daily users, improving performance by 40%',
        'Led a team of 5 developers in implementing microservices architecture, reducing deployment time by 60%',
        'Implemented CI/CD pipelines using Docker and Kubernetes, increasing deployment frequency by 3x',
      ],
    },
    {
      company: 'StartupXYZ',
      role: 'Full Stack Developer',
      duration: '2018 - 2020',
      bullets: [
        'Built RESTful APIs using Node.js and Express, handling 1M+ requests daily',
        'Created responsive front-end applications using React, improving user engagement by 25%',
        'Optimized database queries, reducing response time by 50%',
      ],
    },
  ],
  skills: {
    technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'MongoDB'],
    soft: ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration'],
    tools: ['Git', 'Docker', 'Kubernetes', 'AWS', 'Jenkins'],
  },
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'State University',
      year: '2018',
      details: 'GPA: 3.8/4.0, Magna Cum Laude',
    },
  ],
  additionalSections: [
    {
      title: 'Certifications',
      items: [
        'AWS Certified Solutions Architect (2021)',
        'Certified Kubernetes Administrator (2022)',
      ],
    },
  ],
  personalInfo: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    linkedin: 'https://linkedin.com/in/johndoe',
  },
};

async function testExport(format) {
  console.log(`\n📄 Testing ${format.toUpperCase()} Export...`);
  console.log('='.repeat(60));

  try {
    const response = await axios.post(
      `${BASE_URL}/api/export-resume`,
      {
        resume: sampleResume,
        format: format,
      },
      {
        responseType: format === 'txt' || format === 'text' ? 'text' : 'arraybuffer',
      }
    );

    const filename = `test-resume.${format === 'txt' || format === 'text' ? 'txt' : format}`;
    
    if (format === 'txt' || format === 'text') {
      fs.writeFileSync(filename, response.data, 'utf8');
      console.log(`✅ ${format.toUpperCase()} exported successfully!`);
      console.log(`   File saved: ${filename}`);
      console.log(`   Size: ${response.data.length} bytes`);
    } else {
      fs.writeFileSync(filename, Buffer.from(response.data));
      console.log(`✅ ${format.toUpperCase()} exported successfully!`);
      console.log(`   File saved: ${filename}`);
      console.log(`   Size: ${Buffer.from(response.data).length} bytes`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error exporting ${format.toUpperCase()}:`);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    return false;
  }
}

async function runTests() {
  console.log('🧪 Document Export Test Suite');
  console.log('Make sure the server is running: npm start\n');

  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running\n');
  } catch (error) {
    console.error('❌ Server is not running!');
    console.error('   Please start the server first: npm start');
    process.exit(1);
  }

  // Test all formats
  const formats = ['pdf', 'docx', 'txt'];
  const results = [];

  for (const format of formats) {
    const success = await testExport(format);
    results.push({ format, success });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary:');
  console.log('='.repeat(60));
  results.forEach(({ format, success }) => {
    console.log(`${success ? '✅' : '❌'} ${format.toUpperCase()}: ${success ? 'PASSED' : 'FAILED'}`);
  });

  const allPassed = results.every(r => r.success);
  if (allPassed) {
    console.log('\n🎉 All export formats working correctly!');
  } else {
    console.log('\n⚠️  Some export formats failed. Check errors above.');
  }
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

