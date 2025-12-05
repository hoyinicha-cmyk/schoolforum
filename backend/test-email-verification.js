const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('🧪 Testing Email Verification Flow\n');

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET not found in .env file');
  process.exit(1);
}

// Create a test verification token
const testUserId = 6; // examplestudent@gmail.com
const verificationToken = jwt.sign(
  { userId: testUserId, type: 'email_verification' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('📝 Test Details:');
console.log('   User ID:', testUserId);
console.log('   Token:', verificationToken.substring(0, 50) + '...');
console.log('');

// Test the verification URL
console.log('🔗 Verification URLs:');
console.log('   Email URL:', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`);
console.log('   API URL:', `http://localhost:5000/api/auth/verify/${verificationToken}`);
console.log('');

// Test the backend API
console.log('📡 Testing backend API...\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: `/api/auth/verify/${verificationToken}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    
    try {
      const response = JSON.parse(data);
      console.log('Response:', JSON.stringify(response, null, 2));

      if (res.statusCode === 200) {
        console.log('\n✅ EMAIL VERIFICATION SUCCESSFUL!');
        console.log('\nThe backend API is working correctly.');
        console.log('\n📝 Next steps:');
        console.log('   1. Restart backend server to load the email URL fix');
        console.log('   2. Register a new account');
        console.log('   3. Check your email for verification link');
        console.log('   4. Click the link - should work now!');
        console.log('');
        console.log('🔗 The email will now send:');
        console.log(`   ${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/[token]`);
        console.log('');
        console.log('   Instead of the old broken URL:');
        console.log(`   ${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/[token]`);
      } else {
        console.log('\n❌ VERIFICATION FAILED');
        console.log('Error:', response.error);
        console.log('Message:', response.message);
      }
    } catch (e) {
      console.log('\nRaw Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
  console.log('\n⚠️  Make sure the backend server is running on port 5000');
});

req.end();
