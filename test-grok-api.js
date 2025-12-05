require('dotenv').config();
const axios = require('axios');

/**
 * Simple test to check if Groq API is working
 */
async function testGroqAPI() {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GROQ_API_KEY is not set in environment variables');
    process.exit(1);
  }

  console.log('🧪 Testing Groq API Connection...\n');
  console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
  
  const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'meta-llama/llama-4-scout-17b-16e-instruct'];
  
  for (const model of models) {
    console.log(`\n📋 Testing model: ${model}`);
    console.log('─'.repeat(60));
    
    try {
      const response = await axios.post(
        apiUrl,
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: 'Say "Hello, this is a test"',
            },
          ],
          max_tokens: 50,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ SUCCESS!');
      console.log('Response:', response.data.choices[0].message.content);
      console.log(`\n🎉 Working model found: ${model}`);
      console.log(`\n💡 Set this in your .env file:`);
      console.log(`   GROQ_MODEL=${model}`);
      return;
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        console.log(`❌ Failed (Status: ${status})`);
        
        if (status === 400) {
          console.log('   Error:', JSON.stringify(errorData, null, 2));
          if (errorData?.error?.message) {
            console.log('   Message:', errorData.error.message);
          }
        } else if (status === 401) {
          console.log('   ⚠️  Authentication failed - check your API key');
        } else if (status === 404) {
          console.log('   ⚠️  Model not found');
        } else {
          console.log('   Error:', JSON.stringify(errorData, null, 2));
        }
      } else {
        console.log(`❌ Network error: ${error.message}`);
      }
    }
  }
  
  console.log('\n❌ None of the tested models worked.');
  console.log('\n💡 Possible issues:');
  console.log('   1. API key might be invalid');
  console.log('   2. API endpoint might be wrong');
  console.log('   3. Model names might be different');
  console.log('   4. Check xAI console for correct API format');
  console.log('\n📚 Check: https://docs.x.ai/');
}

testGroqAPI().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

