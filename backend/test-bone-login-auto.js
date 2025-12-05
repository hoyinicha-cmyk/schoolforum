const http = require('http');

const testEmail = '1sore@comfythings.com';
const testPassword = 'Student123!';

console.log('🧪 Testing Login for Activated Student\n');
console.log('Email:', testEmail);
console.log('Password:', testPassword);
console.log('Status: active');
console.log('Role: student\n');

const loginData = JSON.stringify({
  email: testEmail,
  password: testPassword
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

console.log('📡 Sending login request...\n');

const loginReq = http.request(loginOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('BACKEND API RESPONSE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Status Code:', res.statusCode);
    console.log('');
    
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      console.log('');

      if (res.statusCode === 200) {
        console.log('✅✅✅ LOGIN SUCCESSFUL! ✅✅✅');
        console.log('');
        console.log('The BACKEND is working correctly!');
        console.log('Students CAN login when activated.');
        console.log('');
        console.log('User logged in:');
        console.log('  Name:', response.user.firstName, response.user.lastName);
        console.log('  Role:', response.user.role);
        console.log('  Status:', response.user.status);
        console.log('  Access Level:', response.user.accessLevel);
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('CONCLUSION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('The backend login is working perfectly.');
        console.log('');
        console.log('If you still can\'t login from the frontend:');
        console.log('');
        console.log('1. Make sure you\'re using the correct password');
        console.log('2. Check browser console (F12) for errors');
        console.log('3. Check Network tab (F12) to see the request/response');
        console.log('4. Make sure frontend is running on port 3000');
        console.log('5. Make sure backend is running on port 5000');
        console.log('');
        console.log('Try logging in with:');
        console.log('  Email:', testEmail);
        console.log('  Password:', testPassword);
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
  });
});

loginReq.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
  console.log('\n⚠️  Make sure the backend server is running on port 5000');
});

loginReq.write(loginData);
loginReq.end();
