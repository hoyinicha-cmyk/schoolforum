require('dotenv').config();

const testResendVerification = async () => {
  try {
    console.log('🧪 Testing Resend Verification Email...\n');
    
    // Test with a sample email
    const testEmail = 'student@gmail.com'; // Use the demo student account
    
    const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: testEmail })
    });
    
    const data = await response.json();
    
    console.log('📡 Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Test PASSED: Resend verification endpoint is working!');
    } else {
      console.log('\n⚠️ Test Result:', data.error || data.message);
    }
    
  } catch (error) {
    console.error('\n❌ Test FAILED:', error.message);
  }
};

// Run the test
testResendVerification();
