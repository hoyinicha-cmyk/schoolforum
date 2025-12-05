const http = require('http');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Test with a newly activated student
const testEmail = '1sore@comfythings.com'; // bone nana - active student

console.log('🧪 Testing Login for Activated Student\n');
console.log('Testing with:', testEmail);
console.log('Status: active');
console.log('Role: student');
console.log('Email Verified: 1\n');

rl.question('Enter the password for this account: ', (password) => {
  const loginData = JSON.stringify({
    email: testEmail,
    password: password
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

  console.log('\n📡 Sending login request to backend...\n');

  const loginReq = http.request(loginOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('BACKEND RESPONSE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Status Code:', res.statusCode);
      console.log('');
      
      try {
        const response = JSON.parse(data);
        console.log('Response Body:');
        console.log(JSON.stringify(response, null, 2));
        console.log('');

        if (res.statusCode === 200) {
          console.log('✅ LOGIN SUCCESSFUL!');
          console.log('');
          console.log('User Details:');
          console.log('  Name:', response.user.firstName, response.user.lastName);
          console.log('  Email:', response.user.email);
          console.log('  Role:', response.user.role);
          console.log('  Status:', response.user.status);
          console.log('  Year Level:', response.user.yearLevel);
          console.log('  Access Level:', response.user.accessLevel);
          console.log('  Email Verified:', response.user.emailVerified);
          console.log('');
          console.log('Token:', response.token.substring(0, 50) + '...');
          console.log('');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('BACKEND IS WORKING CORRECTLY! ✅');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('');
          console.log('If frontend still can\'t login, the issue is in:');
          console.log('  1. Frontend Login.js component');
          console.log('  2. AuthContext.js login function');
          console.log('  3. Browser console errors (F12)');
          console.log('  4. Network request/response in browser');
          console.log('');
          console.log('Check browser console (F12) for errors!');
        } else if (res.statusCode === 401) {
          console.log('❌ LOGIN FAILED - Invalid Credentials');
          console.log('');
          console.log('Error:', response.error);
          console.log('Message:', response.message);
          console.log('');
          console.log('The password is incorrect.');
          console.log('Reset password with: node reset-user-password.js');
        } else if (res.statusCode === 403) {
          console.log('❌ LOGIN FAILED - Account Restricted');
          console.log('');
          console.log('Error:', response.error);
          console.log('Message:', response.message);
          console.log('');
          console.log('The account is suspended or banned.');
        } else {
          console.log('❌ LOGIN FAILED');
          console.log('');
          console.log('Error:', response.error);
          console.log('Message:', response.message);
        }
      } catch (e) {
        console.log('Raw Response:', data);
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      rl.close();
    });
  });

  loginReq.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
    console.log('\n⚠️  Make sure the backend server is running on port 5000');
    rl.close();
  });

  loginReq.write(loginData);
  loginReq.end();
});
