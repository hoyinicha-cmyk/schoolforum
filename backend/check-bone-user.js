const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUser() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum',
      port: process.env.DB_PORT || 3306
    });

    console.log('📄 Checking user data...\n');

    const [users] = await connection.query(
      'SELECT id, email, first_name, last_name, year_level, status, role FROM users WHERE email = ?',
      ['1sore@comfythings.com']
    );

    if (users.length === 0) {
      console.log('❌ User not found');
      await connection.end();
      return;
    }

    const user = users[0];
    console.log('👤 User Data:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.first_name, user.last_name);
    console.log('   Year Level:', user.year_level);
    console.log('   Status:', user.status);
    console.log('   Role:', user.role);
    console.log('');

    // Check if year_level matches 'G11'
    console.log('🔍 Checking year_level match:');
    console.log('   year_level === "G11":', user.year_level === 'G11');
    console.log('   year_level === "g11":', user.year_level === 'g11');
    console.log('   year_level type:', typeof user.year_level);
    console.log('   year_level value:', JSON.stringify(user.year_level));
    console.log('');

    // Simulate forum access logic
    console.log('🎓 Forum Access Simulation:');
    const accessibleForums = ['general'];
    
    if (user.status === 'active') {
      console.log('✅ User is active');
      
      if (user.role === 'admin' || user.role === 'moderator') {
        accessibleForums.push('g11', 'g12');
        console.log('✅ Admin/Moderator: Added g11, g12');
      } else if (user.year_level === 'G11') {
        accessibleForums.push('g11');
        console.log('✅ G11 Student: Added g11');
      } else if (user.year_level === 'G12') {
        accessibleForums.push('g12');
        console.log('✅ G12 Student: Added g12');
      } else {
        console.log('❌ No grade match!');
        console.log('   Expected: "G11" or "G12"');
        console.log('   Got:', user.year_level);
      }
    } else {
      console.log('❌ User is not active. Status:', user.status);
    }
    
    console.log('');
    console.log('📋 Accessible Forums:', accessibleForums);
    console.log('');
    
    if (accessibleForums.includes('g11')) {
      console.log('✅ G11 forum should be accessible!');
    } else {
      console.log('❌ G11 forum is NOT accessible!');
      console.log('');
      console.log('🔧 To fix:');
      console.log('   Make sure year_level is exactly "G11" (uppercase)');
      console.log('   Make sure status is "active"');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUser();
