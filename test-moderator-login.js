const fetch = require('node-fetch');

async function testModeratorLogin() {
  try {
    console.log('🔐 Testing moderator login...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'moderator@school.edu',
        password: 'ModPass123!'
      })
    });
    
    const data = await response.json();
    
    console.log('\n📦 Response Status:', response.status);
    console.log('\n👤 User Data:');
    console.log(JSON.stringify(data.user, null, 2));
    
    if (data.user.badge) {
      console.log('\n✅ Badge property exists:', data.user.badge);
    } else {
      console.log('\n❌ Badge property is missing!');
    }
    
    if (data.user.role === 'moderator') {
      console.log('✅ Role is moderator');
    } else {
      console.log('❌ Role is not moderator:', data.user.role);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testModeratorLogin();
