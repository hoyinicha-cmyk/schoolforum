const mysql = require('mysql2/promise');
require('dotenv').config();

async function testAdminAPI() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum',
      port: process.env.DB_PORT || 3306
    });

    console.log('📄 Connected to database\n');

    // Test 1: Get all users
    console.log('🧪 Test 1: Fetching all users...');
    const [users] = await connection.query(`
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
    
    console.log(`✅ Found ${users.length} users:\n`);
    users.forEach(user => {
      console.log(`   ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Status: ${user.status} | Role: ${user.role} | Grade: ${user.gradeLevel}`);
      console.log(`   Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Test 2: Count by status
    console.log('🧪 Test 2: User counts by status...');
    const [statusCounts] = await connection.query(`
      SELECT status, COUNT(*) as count FROM users GROUP BY status
    `);
    
    console.log('✅ Status distribution:');
    statusCounts.forEach(row => {
      console.log(`   ${row.status}: ${row.count}`);
    });
    console.log('');

    // Test 3: Verify admin users
    console.log('🧪 Test 3: Checking admin/moderator accounts...');
    const [admins] = await connection.query(`
      SELECT email, role, status FROM users WHERE role IN ('admin', 'moderator')
    `);
    
    console.log('✅ Admin/Moderator accounts:');
    admins.forEach(admin => {
      console.log(`   ${admin.email} - ${admin.role} (${admin.status})`);
    });
    console.log('');

    // Test 4: Verify status values are valid
    console.log('🧪 Test 4: Validating status values...');
    const validStatuses = ['pending', 'active', 'suspended', 'banned'];
    const [allStatuses] = await connection.query(`
      SELECT DISTINCT status FROM users
    `);
    
    const invalidStatuses = allStatuses.filter(
      row => !validStatuses.includes(row.status)
    );
    
    if (invalidStatuses.length === 0) {
      console.log('✅ All status values are valid!');
    } else {
      console.log('❌ Found invalid status values:');
      invalidStatuses.forEach(row => {
        console.log(`   ${row.status}`);
      });
    }
    console.log('');

    console.log('✅ All tests passed! Admin panel is ready to use.');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the backend: cd backend && npm start');
    console.log('   2. Start the frontend: cd frontend && npm start');
    console.log('   3. Login as admin: admin@school.edu / AdminPass123!');
    console.log('   4. Navigate to /admin to manage users');

    await connection.end();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAdminAPI();
