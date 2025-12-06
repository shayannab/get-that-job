# Quick API Testing Guide

## 🚀 Quick Start

### 1. Navigate to Backend
```bash
cd resumeAi-backend
```

### 2. Check Environment
```bash
npm run check-env
```

### 3. Start the Server
```bash
npm start
```

Server will run on: `http://localhost:3000`

---

## 🧪 Testing Methods

### Method 1: Quick Unit Test (No Server Needed)
```bash
npm test
```
Tests the job analyzer directly with sample job postings.

### Method 2: Full Workflow Test (Requires Server)
**Terminal 1:**
```bash
npm start
```

**Terminal 2:**
```bash
npm run test:workflow
```
Tests the complete flow: analyze job → generate questions → generate resume → ATS score.

### Method 3: Test API Connection
```bash
npm run test:api
```
Tests Groq API connection and finds working models.

### Method 4: Test Document Export (Requires Server)
**Terminal 1:**
```bash
npm start
```

**Terminal 2:**
```bash
npm run test:export
```
Tests PDF, DOCX, and TXT export functionality.

---

## 📡 Manual API Testing

### Using PowerShell (Windows)

#### 1. Health Check
```powershell
Invoke-RestMethod -Uri http://localhost:3000/health -Method Get
```

#### 2. Analyze Job Posting
```powershell
$body = @{
    jobPosting = "Software Engineer - Full Stack Developer`n`nRequired: JavaScript, React, Node.js"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/analyze-job -Method Post -Body $body -ContentType "application/json"
```

#### 3. Generate Questions
```powershell
$body = @{
    jobAnalysis = @{
        requiredSkills = @("JavaScript", "React", "Node.js")
        keyResponsibilities = @("Design web applications", "Write clean code")
        jobLevel = "mid"
        industry = "Software Development"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri http://localhost:3000/api/generate-questions -Method Post -Body $body -ContentType "application/json"
```

#### 4. Generate Resume
```powershell
$body = @{
    jobAnalysis = @{
        requiredSkills = @("JavaScript", "React", "Node.js")
        keyResponsibilities = @("Design web applications")
        atsKeywords = @(@{keyword = "JavaScript"; frequency = 5})
        jobLevel = "mid"
        industry = "Software Development"
    }
    answers = @{
        full_name = "John Doe"
        email = "john@example.com"
        phone = "+1-555-123-4567"
        years_of_experience = 5
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri http://localhost:3000/api/generate-resume -Method Post -Body $body -ContentType "application/json"
```

#### 5. Export Resume (PDF)
```powershell
$body = @{
    resume = @{
        summary = "Experienced Software Engineer..."
        experience = @(@{
            company = "TechCorp"
            role = "Senior Developer"
            duration = "2020 - Present"
            bullets = @("Developed scalable applications", "Led team of 5")
        })
        skills = @{
            technical = @("JavaScript", "React", "Node.js")
            soft = @("Leadership", "Communication")
            tools = @("Git", "Docker")
        }
        education = @(@{
            degree = "BS Computer Science"
            institution = "State University"
            year = "2018"
        })
    }
    format = "pdf"
} | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -Uri http://localhost:3000/api/export-resume -Method Post -Body $body -ContentType "application/json"
[System.IO.File]::WriteAllBytes("resume.pdf", $response.Content)
```

---

## 🌐 Using Browser/Postman

### Health Check
```
GET http://localhost:3000/health
```

### Analyze Job
```
POST http://localhost:3000/api/analyze-job
Content-Type: application/json

{
  "jobPosting": "Software Engineer - Full Stack Developer\n\nRequired: JavaScript, React, Node.js"
}
```

### Generate Questions
```
POST http://localhost:3000/api/generate-questions
Content-Type: application/json

{
  "jobAnalysis": {
    "requiredSkills": ["JavaScript", "React", "Node.js"],
    "keyResponsibilities": ["Design web applications"],
    "jobLevel": "mid",
    "industry": "Software Development"
  }
}
```

### Generate Resume
```
POST http://localhost:3000/api/generate-resume
Content-Type: application/json

{
  "jobAnalysis": { /* from analyze-job response */ },
  "answers": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-123-4567",
    "years_of_experience": 5
  }
}
```

### Export Resume
```
POST http://localhost:3000/api/export-resume
Content-Type: application/json

{
  "resume": { /* from generate-resume response */ },
  "format": "pdf"  // or "docx" or "txt"
}
```

---

## ✅ Expected Results

- **Health Check**: `{"status":"ok","timestamp":1234567890}`
- **Analyze Job**: Returns structured job analysis with skills, responsibilities, ATS keywords
- **Generate Questions**: Returns array of questions (base + AI-generated)
- **Generate Resume**: Returns resume content + ATS score
- **Export Resume**: Returns binary file (PDF/DOCX) or text (TXT)

---

## 🐛 Troubleshooting

**Server won't start?**
- Check if port 3000 is in use
- Verify `.env` file exists with `GROQ_API_KEY`
- Run `npm run check-env`

**API returns 500 error?**
- Check `GROQ_API_KEY` is set correctly
- Verify API key is valid at https://console.groq.com/
- Check server console for error messages

**Export not working?**
- Make sure server is running
- Check resume object structure matches expected format
- Verify format is one of: "pdf", "docx", "txt"

