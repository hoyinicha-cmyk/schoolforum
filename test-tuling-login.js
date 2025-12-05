const http = require('http');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Testing login for tulingtuling@example.com\n');
console.log('This user has:');
console.log('  - status: active ✅');
console.log('  - email_verified: 1 ✅');
console.log('  - role: student ✅\n');

rl.question('Enter the password you used when creating this account: ', (password) => {
  const loginData = JSON.stringify({
    email: 'tulingtuling@example.com',
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

  console.log('\n📡 Sending login request...\n');

  const loginReq = http.request(loginOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response Status:', res.statusCode);
      
      try {
        const response = JSON.parse(data);
        console.log('\nResponse:', JSON.stringify(response, null, 2));

        if (res.statusCode === 200) {
          console.log('\n✅ LOGIN SUCCESSFUL!');
          console.log('\nUser can login. The issue might be in the frontend.');
          console.log('\nCheck:');
          console.log('  1. Browser console for errors (F12)');
          console.log('  2. Network tab to see the actual request/response');
          console.log('  3. Make sure frontend is using the correct API URL');
        } else if (res.statusCode === 401) {
          console.log('\n❌ LOGIN FAILED - Invalid Credentials');
          console.log('\nThe password you entered is incorrect.');
          console.log('Try to remember the password you used during registration.');
        } else if (res.statusCode === 403) {
          console.log('\n❌ LOGIN FAILED - Account Restricted');
          console.log('\nReason:', response.message);
        } else {
          console.log('\n❌ LOGIN FAILED');
          console.log('Error:', response.error);
          console.log('Message:', response.message);
        }
      } catch (e) {
        console.log('\nRaw Response:', data);
      }

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
