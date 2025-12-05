const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function verifyFix() {
  console.log('🔍 Verifying the fix...\n');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database\n');

    // Test the exact query that User.findAll() uses
    console.log('📋 Testing User.findAll() query...\n');
    
    try {
      const [rows] = await connection.execute(`
        SELECT 
          id, 
          email, 
          first_name as firstName, 
          last_name as lastName, 
          year_level as gradeLevel, 
          status, 
          role, 
          email_verified as emailVerified, 
          created_at as createdAt
        FROM users 
        ORDER BY created_at DESC
      `);

      console.log(`✅ Query successful! Found ${rows.length} users:\n`);
      
      rows.forEach((user, i) => {
        console.log(`${i + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Status: ${user.status} | Role: ${user.role}`);
        console.log('');
      });

      console.log('✅ The database query is working correctly!');
      console.log('\n📝 Next steps:');
      console.log('   1. RESTART your backend server (Ctrl+C, then npm start)');
      console.log('   2. Login to the admin panel');
      console.log('   3. Navigate to /admin');
      console.log('   4. You should see all users listed!');

    } catch (queryError) {
      console.error('❌ Query failed:', queryError.message);
      console.log('\n⚠️  The query is still broken. Check backend/src/models/User.js');
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n⚠️  Make sure your database is running and .env is configured correctly');
  }
}

verifyFix();
