const http = require('http');

// Test login with the active user that can't login
const loginData = JSON.stringify({
  email: 'tulingtuling@example.com',  // Active user with email_verified = 0
  password: 'Password123!'  // Replace with actual password if different
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

console.log('🔐 Testing login for active user with unverified email...\n');
console.log('Email: tulingtuling@example.com');
console.log('Status in DB: active');
console.log('Email Verified in DB: 0 (false)\n');

const loginReq = http.request(loginOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Headers:', JSON.stringify(res.headers, null, 2));
    
    try {
      const response = JSON.parse(data);
      console.log('\nResponse Body:', JSON.stringify(response, null, 2));

      if (res.statusCode === 200) {
        console.log('\n✅ Login successful!');
        console.log('User can login despite unverified email.');
      } else {
        console.log('\n❌ Login failed!');
        console.log('Error:', response.error);
        console.log('Message:', response.message);
      }
    } catch (e) {
      console.log('\nRaw Response:', data);
    }
  });
});

loginReq.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
  console.log('\n⚠️  Make sure the backend server is running on port 5000');
});

loginReq.write(loginData);
loginReq.end();
