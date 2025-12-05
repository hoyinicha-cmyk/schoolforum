const https = require('http');

// Test login
const loginData = JSON.stringify({
  email: 'admin@school.edu',
  password: 'AdminPass123!'
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

console.log('🔐 Testing login...\n');

const loginReq = https.request(loginOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const response = JSON.parse(data);
    console.log('Response:', JSON.stringify(response, null, 2));

    if (response.token) {
      console.log('\n✅ Login successful!\n');
      console.log('👤 Testing /api/admin/users...\n');

      // Test admin users endpoint
      const usersOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/users',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${response.token}`,
          'Content-Type': 'application/json'
        }
      };

      const usersReq = https.request(usersOptions, (res2) => {
        let data2 = '';

        res2.on('data', (chunk) => {
          data2 += chunk;
        });

        res2.on('end', () => {
          console.log('Status:', res2.statusCode);
          const usersResponse = JSON.parse(data2);
          console.log('Response:', JSON.stringify(usersResponse, null, 2));
          
          if (usersResponse.users) {
            console.log(`\n✅ Found ${usersResponse.users.length} users!`);
            console.log('\n📋 Users:');
            usersResponse.users.forEach((user, i) => {
              console.log(`${i + 1}. ${user.firstName} ${user.lastName} - ${user.email} (${user.status})`);
            });
          } else {
            console.log('\n❌ No users in response!');
          }
        });
      });

      usersReq.on('error', (error) => {
        console.error('❌ Error:', error);
      });

      usersReq.end();
    } else {
      console.log('\n❌ Login failed!');
    }
  });
});

loginReq.on('error', (error) => {
  console.error('❌ Error:', error);
  console.log('\n⚠️  Make sure the backend server is running on port 5000');
});

loginReq.write(loginData);
loginReq.end();
