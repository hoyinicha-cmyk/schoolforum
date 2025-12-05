const http = require('http');

// Test with the demo student account
const testAccounts = [
  { email: 'student@gmail.com', password: 'StudentPass123!', name: 'Demo Student' },
  { email: 'xaliga2059@chaineor.com', password: 'Password123!', name: 'song monding' },
  { email: 'lala@example.com', password: 'Password123!', name: 'sasasasasasasa longadog' }
];

async function testLogin(account) {
  return new Promise((resolve) => {
    const loginData = JSON.stringify({
      email: account.email,
      password: account.password
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

    const loginReq = http.request(loginOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            account: account.name,
            email: account.email,
            status: res.statusCode,
            success: res.statusCode === 200,
            response: response
          });
        } catch (e) {
          resolve({
            account: account.name,
            email: account.email,
            status: res.statusCode,
            success: false,
            error: data
          });
        }
      });
    });

    loginReq.on('error', (error) => {
      resolve({
        account: account.name,
        email: account.email,
        success: false,
        error: error.message
      });
    });

    loginReq.write(loginData);
    loginReq.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Student Login\n');
  console.log('Testing 3 active student accounts...\n');

  for (const account of testAccounts) {
    console.log(`📝 Testing: ${account.name} (${account.email})`);
    const result = await testLogin(account);

    if (result.success) {
      console.log(`✅ SUCCESS - Status: ${result.status}`);
      console.log(`   User: ${result.response.user.firstName} ${result.response.user.lastName}`);
      console.log(`   Role: ${result.response.user.role}`);
      console.log(`   Status: ${result.response.user.status}`);
      console.log(`   Access Level: ${result.response.user.accessLevel}`);
    } else {
      console.log(`❌ FAILED - Status: ${result.status}`);
      if (result.response) {
        console.log(`   Error: ${result.response.error || result.response.message}`);
      } else {
        console.log(`   Error: ${result.error}`);
      }
    }
    console.log('');
  }

  console.log('📊 Summary:');
  console.log('If all tests pass, the backend is working correctly.');
  console.log('If tests fail, check:');
  console.log('  1. Backend server is running');
  console.log('  2. Passwords are correct');
  console.log('  3. User status is "active" in database');
  console.log('  4. Email is verified in database');
}

runTests();
