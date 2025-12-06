require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error('❌ GROQ_API_KEY is not set');
  process.exit(1);
}

console.log('🔍 Detailed Groq API Test\n');
console.log('API Key:', apiKey.substring(0, 15) + '...' + apiKey.substring(apiKey.length - 5));
console.log('API Key Length:', apiKey.length);
console.log('API Key format check:', apiKey.length > 20);
console.log('');

// Test different endpoints
  const endpoints = [
  'https://api.groq.com/openai/v1/chat/completions',
  'https://api.groq.com/openai/v1/completions',
  'https://api.groq.com/openai/v1/models',
];

// Test different request formats
async function testEndpoint(endpoint, requestBody) {
  console.log(`\n📡 Testing: ${endpoint}`);
  console.log('Request Body:', JSON.stringify(requestBody, null, 2));
  console.log('─'.repeat(60));
  
  try {
    const response = await axios.post(
      endpoint,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    if (error.response) {
      console.log(`❌ Status: ${error.response.status}`);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('❌ No response received');
      console.log('Error:', error.message);
    } else {
      console.log('❌ Error:', error.message);
    }
    return false;
  }
}

async function runTests() {
  // Test 1: List models endpoint (to verify API key)
  console.log('\n🧪 Test 1: List Available Models');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.get(
      'https://api.groq.com/openai/v1/models',
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✅ API Key is valid!');
    console.log('Available models:', JSON.stringify(response.data, null, 2));
    
    // Extract model IDs
    if (response.data?.data) {
      const models = response.data.data.map(m => m.id);
      console.log('\n📋 Available Model IDs:');
      models.forEach(m => console.log(`   - ${m}`));
      
      // Test with first available model
      if (models.length > 0) {
        console.log(`\n🧪 Test 2: Chat Completion with model: ${models[0]}`);
        console.log('='.repeat(60));
        
        await testEndpoint(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: models[0],
            messages: [
              {
                role: 'user',
                content: 'Say hello',
              },
            ],
            max_tokens: 10,
          }
        );
      }
    }
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ Status: ${error.response.status}`);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.log('\n⚠️  API Key authentication failed');
        console.log('   The API key might be invalid or expired');
      } else if (error.response.status === 404) {
        console.log('\n⚠️  Endpoint not found');
        console.log('   The API endpoint might be incorrect');
      }
    } else {
      console.log('❌ Error:', error.message);
    }
  }
  
  // Test 3: Try common model names
  console.log('\n🧪 Test 3: Testing Common Model Names');
  console.log('='.repeat(60));
  
  const commonModels = ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];
  
  for (const model of commonModels) {
    const success = await testEndpoint(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: 'Say hello',
          },
        ],
        max_tokens: 10,
      }
    );
    
    if (success) {
      console.log(`\n🎉 Working model found: ${model}`);
      break;
    }
  }
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

