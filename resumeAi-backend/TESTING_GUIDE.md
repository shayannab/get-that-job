# Testing Guide

This guide shows you how to test the Resume Builder Backend application.

## 📋 Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the project root:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=llama-3.1-70b-versatile
   PORT=3000
   ```

   **Get your Groq API key from:** https://console.groq.com/

## 🧪 Testing Methods

### Method 1: Unit Test (Job Analyzer)

Test the job analyzer directly with sample job postings:

```bash
npm test
```

Or directly:
```bash
node testJobAnalyzer.js
```

This will:
- Test error handling (empty strings, null values, missing API key)
- Test job analysis with 3 sample job postings
- Display the extracted structured data

**Expected Output:**
```
Job Analyzer Test Suite
Make sure GROQ_API_KEY is set in your environment variables

============================================================
Testing Error Handling
============================================================
✅ Correctly caught error for empty string: ...
✅ Correctly caught error for null input: ...

============================================================
Testing: Sample Job Posting 1: Software Engineer (Mid-level)
============================================================

✅ Analysis successful!

Extracted Information:
{
  "requiredSkills": [...],
  "preferredQualifications": [...],
  "keyResponsibilities": [...],
  ...
}
```

---

### Method 2: Test the Server (API Endpoints)

#### Step 1: Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
🚀 Server is running on http://localhost:3000
📋 Health check: http://localhost:3000/health
🔗 API endpoints: http://localhost:3000/api
```

#### Step 2: Test Health Check

**Using curl:**
```bash
curl http://localhost:3000/health
```

**Using PowerShell (Windows):**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/health -Method Get
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": 1234567890123
}
```

---

### Method 3: Test API Endpoints

#### Test 1: Analyze Job Posting

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/analyze-job \
  -H "Content-Type: application/json" \
  -d '{
    "jobPosting": "Software Engineer - Full Stack Developer\n\nCompany: TechCorp\n\nWe are seeking a talented Software Engineer with 3+ years of experience. Required skills: JavaScript, React, Node.js, PostgreSQL. Responsibilities include designing and developing web applications."
  }'
```

**Using PowerShell (Windows):**
```powershell
$body = @{
    jobPosting = "Software Engineer - Full Stack Developer`n`nCompany: TechCorp`n`nWe are seeking a talented Software Engineer with 3+ years of experience. Required skills: JavaScript, React, Node.js, PostgreSQL. Responsibilities include designing and developing web applications."
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/analyze-job -Method Post -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "requiredSkills": ["JavaScript", "React", "Node.js", "PostgreSQL"],
    "preferredQualifications": [...],
    "keyResponsibilities": [...],
    "atsKeywords": [...],
    "jobLevel": "mid",
    "industry": "Software Development",
    "companyCultureIndicators": [...]
  }
}
```

#### Test 2: Generate Questions

First, save the job analysis from Test 1, then:

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "jobAnalysis": {
      "requiredSkills": ["JavaScript", "React", "Node.js"],
      "keyResponsibilities": ["Design web applications", "Write clean code"],
      "jobLevel": "mid",
      "industry": "Software Development"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": "full_name",
      "question": "Full name",
      "type": "text",
      "category": "personal",
      "required": true,
      "placeholder": "Enter your full name"
    },
    ...
  ]
}
```

#### Test 3: Generate Resume

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/generate-resume \
  -H "Content-Type: application/json" \
  -d '{
    "jobAnalysis": {
      "requiredSkills": ["JavaScript", "React", "Node.js"],
      "keyResponsibilities": ["Design web applications"],
      "atsKeywords": [{"keyword": "JavaScript", "frequency": 5}],
      "jobLevel": "mid",
      "industry": "Software Development"
    },
    "answers": {
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-123-4567",
      "years_of_experience": 5
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "resume": {
    "summary": "...",
    "experience": [...],
    "skills": {...},
    "education": [...],
    "additionalSections": [...]
  },
  "score": {
    "overallScore": 85,
    "keywordMatchScore": 90,
    "skillsCoverageScore": 80,
    "contentQualityScore": 85,
    "missingKeywords": [],
    "missingSkills": [],
    "suggestions": [...]
  }
}
```

---

### Method 4: Using Postman or Thunder Client

1. **Import the collection** (create manually):
   - Base URL: `http://localhost:3000`
   
2. **Endpoints to test:**
   - `GET /health`
   - `POST /api/analyze-job`
   - `POST /api/generate-questions`
   - `POST /api/generate-resume`

3. **Request Headers:**
   ```
   Content-Type: application/json
   ```

4. **Request Body Examples:**
   - See the curl examples above for JSON structure

---

### Method 5: Complete Workflow Test

Test the full workflow from job posting to resume:

```bash
# 1. Analyze a job posting
JOB_ANALYSIS=$(curl -s -X POST http://localhost:3000/api/analyze-job \
  -H "Content-Type: application/json" \
  -d '{"jobPosting": "Your job posting text here..."}')

# 2. Extract the analysis (you'll need to parse JSON)
# Then use it for generating questions and resume
```

**Or use a script:**

Create `test-workflow.js`:
```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testWorkflow() {
  try {
    // Step 1: Analyze job posting
    console.log('Step 1: Analyzing job posting...');
    const jobPosting = "Software Engineer - Full Stack Developer\n\nRequired: JavaScript, React, Node.js";
    const analysisResponse = await axios.post(`${BASE_URL}/api/analyze-job`, {
      jobPosting
    });
    const jobAnalysis = analysisResponse.data.data;
    console.log('✅ Job analyzed:', jobAnalysis.jobLevel, jobAnalysis.industry);

    // Step 2: Generate questions
    console.log('\nStep 2: Generating questions...');
    const questionsResponse = await axios.post(`${BASE_URL}/api/generate-questions`, {
      jobAnalysis
    });
    console.log('✅ Generated', questionsResponse.data.questions.length, 'questions');

    // Step 3: Generate resume
    console.log('\nStep 3: Generating resume...');
    const answers = {
      full_name: "John Doe",
      email: "john@example.com",
      phone: "+1-555-123-4567",
      years_of_experience: 5
    };
    const resumeResponse = await axios.post(`${BASE_URL}/api/generate-resume`, {
      jobAnalysis,
      answers
    });
    console.log('✅ Resume generated!');
    console.log('📊 ATS Score:', resumeResponse.data.score.overallScore);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testWorkflow();
```

Run it:
```bash
node test-workflow.js
```

---

## 🐛 Troubleshooting

### Error: "GROQ_API_KEY environment variable is not set"

**Solution:**
1. Create a `.env` file in the project root
2. Add: `GROQ_API_KEY=your_key_here`
3. Make sure `dotenv` is installed and loaded (it should be automatic)

### Error: "Groq API error: 401 Unauthorized"

**Solution:**
- Check that your API key is correct
- Verify the key is active in your xAI console
- Make sure there are no extra spaces in the `.env` file

### Error: "Groq API error: 429 Too Many Requests"

**Solution:**
- You've hit the rate limit
- Wait a few minutes and try again
- Consider implementing rate limiting in your code

### Server won't start

**Solution:**
1. Check if port 3000 is already in use:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Mac/Linux
   lsof -i :3000
   ```
2. Change PORT in `.env` file if needed
3. Make sure all dependencies are installed: `npm install`

---

## ✅ Success Criteria

Your tests are successful if:

1. ✅ Health check returns `{"status": "ok"}`
2. ✅ Job analyzer extracts structured data (skills, responsibilities, etc.)
3. ✅ Question generator returns 5-8 questions plus base questions
4. ✅ Resume generator creates a complete resume with all sections
5. ✅ ATS scorer returns scores between 0-100 with suggestions

---

## 📝 Quick Test Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with `GROQ_API_KEY`
- [ ] Server starts without errors (`npm start`)
- [ ] Health check works (`GET /health`)
- [ ] Job analysis works (`POST /api/analyze-job`)
- [ ] Question generation works (`POST /api/generate-questions`)
- [ ] Resume generation works (`POST /api/generate-resume`)
- [ ] Unit tests pass (`npm test`)

---

**Happy Testing! 🚀**

