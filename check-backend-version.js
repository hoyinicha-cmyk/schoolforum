const fetch = require('node-fetch');

async function checkBackendVersion() {
  try {
    console.log('🔍 Checking if backend has new code...\n');
    
    // Try to hit the server
    const response = await fetch('http://localhost:5000/api/auth/health');
    
    if (response.ok) {
      console.log('✅ Backend server is running');
      console.log('\n⚠️  To check if it has the new code:');
      console.log('   1. Try to change email in the app');
      console.log('   2. Check the backend terminal for these logs:');
      console.log('      - "📝 Email change request received"');
      console.log('      - "✅ Token generated"');
      console.log('      - "✅ Confirmation saved to database"');
      console.log('      - "✅ Confirmation email sent!"');
      console.log('\n   If you see these logs = NEW CODE is loaded ✅');
      console.log('   If you DON\'T see these logs = OLD CODE still running ❌');
      console.log('\n💡 If OLD CODE is still running:');
      console.log('   1. Stop backend (Ctrl+C)');
      console.log('   2. Start backend (npm start)');
    } else {
      console.log('❌ Backend server is not responding');
    }
  } catch (error) {
    console.log('❌ Backend server is NOT running');
    console.log('\n📌 Start the backend server:');
    console.log('   cd backend');
    console.log('   npm start');
  }
  
  process.exit(0);
}

checkBackendVersion();
