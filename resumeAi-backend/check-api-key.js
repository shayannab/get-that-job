require('dotenv').config();
const fs = require('fs');

console.log('🔍 Checking API Key Format...\n');

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error('❌ GROQ_API_KEY not found in environment');
  process.exit(1);
}

console.log('API Key Details:');
console.log('  Length:', apiKey.length);
console.log('  Starts with gsk_:', apiKey.startsWith('gsk_'));
console.log('  Contains only valid chars:', /^[a-zA-Z0-9_]+$/.test(apiKey));
console.log('  Has leading spaces:', apiKey !== apiKey.trimStart());
console.log('  Has trailing spaces:', apiKey !== apiKey.trimEnd());
console.log('  Has newlines:', apiKey.includes('\n') || apiKey.includes('\r'));

// Check raw .env file
const envPath = '.env';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  const groqLine = lines.find(line => line.startsWith('GROQ_API_KEY='));
  
  if (groqLine) {
    console.log('\n📄 Raw .env file line:');
    console.log('  Full line:', JSON.stringify(groqLine));
    
    const parts = groqLine.split('=');
    if (parts.length > 1) {
      const keyValue = parts.slice(1).join('=');
      console.log('  Key value (raw):', JSON.stringify(keyValue));
      console.log('  Key value (trimmed):', JSON.stringify(keyValue.trim()));
      
      // Check for common issues
      if (keyValue.startsWith('"') && keyValue.endsWith('"')) {
        console.log('  ⚠️  WARNING: Key is wrapped in quotes! Remove quotes.');
      }
      if (keyValue.startsWith("'") && keyValue.endsWith("'")) {
        console.log("  ⚠️  WARNING: Key is wrapped in single quotes! Remove quotes.");
      }
      if (keyValue.includes(' ')) {
        console.log('  ⚠️  WARNING: Key contains spaces!');
      }
    }
  }
}

console.log('\n📋 Current API Key (first 20, last 10):');
console.log('  ' + apiKey.substring(0, 20) + '...' + apiKey.substring(apiKey.length - 10));

console.log('\n💡 Troubleshooting:');
console.log('  1. Make sure your .env file has: GROQ_API_KEY=your_key_here');
console.log('  2. NO quotes around the key');
console.log('  3. NO spaces before or after the =');
console.log('  4. Key should start with gsk_');
console.log('  5. Verify the key is active in https://console.x.ai/');
console.log('  6. Make sure you copied the ENTIRE key (usually 50-60 chars)');

