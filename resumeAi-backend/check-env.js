require('dotenv').config();

console.log('🔍 Checking Environment Variables...\n');

const requiredVars = ['GROQ_API_KEY'];
const optionalVars = ['GROQ_MODEL', 'PORT'];

let allGood = true;

// Check required variables
console.log('Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask the API key for security
    const masked = varName.includes('KEY') || varName.includes('SECRET') 
      ? value.substring(0, 8) + '...' + value.substring(value.length - 4)
      : value;
    console.log(`  ✅ ${varName}: ${masked}`);
  } else {
    console.log(`  ❌ ${varName}: NOT SET`);
    allGood = false;
  }
});

// Check optional variables
console.log('\nOptional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value}`);
  } else {
    console.log(`  ⚠️  ${varName}: Not set (using default)`);
  }
});

// Check if .env file exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');

console.log('\n📁 .env File:');
if (fs.existsSync(envPath)) {
  console.log('  ✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasGroqKey = envContent.includes('GROQ_API_KEY');
  if (hasGroqKey) {
    console.log('  ✅ GROQ_API_KEY found in .env file');
  } else {
    console.log('  ❌ GROQ_API_KEY not found in .env file');
    allGood = false;
  }
} else {
  console.log('  ❌ .env file does not exist');
  console.log('  💡 Create a .env file in the project root with:');
  console.log('     GROQ_API_KEY=your_key_here');
  allGood = false;
}

console.log('\n' + '='.repeat(60));
if (allGood) {
  console.log('✅ All required environment variables are set!');
  console.log('🚀 You can now run: npm test or npm start');
} else {
  console.log('❌ Some required environment variables are missing!');
  console.log('\n📝 To fix this:');
  console.log('   1. Create a .env file in the project root');
    console.log('   2. Add: GROQ_API_KEY=your_groq_api_key_here');
  console.log('   3. Get your API key from: https://console.x.ai/');
}
console.log('='.repeat(60));

process.exit(allGood ? 0 : 1);

