const mysql = require('mysql2/promise');
require('dotenv').config();

async function diagnoseAll() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  COMPLETE FORUM DIAGNOSIS');
  console.log('═══════════════════════════════════════════════════════════\n');

  let connection;
  
  try {
    // Test 1: Database Connection
    console.log('TEST 1: Database Connection');
    console.log('─────────────────────────────────────────────────────────');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum'
    });
    console.log('✅ Database connected successfully\n');

    // Test 2: Check Tables
    console.log('TEST 2: Required Tables');
    console.log('─────────────────────────────────────────────────────────');
    
    const tables = ['users', 'posts', 'replies', 'reactions', 'bookmarks', 'hidden_content_access'];
    for (const table of tables) {
      try {
        await connection.execute(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`✅ ${table} table exists`);
      } catch (error) {
        console.log(`❌ ${table} table MISSING - Run migration!`);
      }
    }
    console.log();

    // Test 3: Check Posts Table Columns
    console.log('TEST 3: Posts Table Columns');
    console.log('─────────────────────────────────────────────────────────');
    const [columns] = await connection.execute('SHOW COLUMNS FROM posts');
    const requiredColumns = ['prefix', 'has_hidden_content', 'view_count'];
    
    requiredColumns.forEach(col => {
      const exists = columns.some(c => c.Field === col);
      console.log(`${exists ? '✅' : '❌'} ${col} column ${exists ? 'exists' : 'MISSING - Run migration!'}`);
    });
    console.log();

    // Test 4: Check Users
    console.log('TEST 4: User Accounts');
    console.log('─────────────────────────────────────────────────────────');
    const [users] = await connection.execute(`
      SELECT id, email, first_name, last_name, year_level, status, role, email_verified 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
    } else {
      console.log(`Found ${users.length} recent users:\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Name: ${user.first_name} ${user.last_name}`);
        console.log(`   Status: ${user.status} ${user.status === 'active' ? '✅' : '⚠️ NOT ACTIVE'}`);
        console.log(`   Email Verified: ${user.email_verified ? '✅ Yes' : '❌ No'}`);
        console.log(`   Year Level: ${user.year_level}`);
        console.log(`   Role: ${user.role}`);
        
        // Check forum access
        const canPostGeneral = user.status !== 'banned';
        const canPostG11 = user.status === 'active' && (user.role === 'admin' || user.role === 'moderator' || user.year_level === 'G11');
        const canPostG12 = user.status === 'active' && (user.role === 'admin' || user.role === 'moderator' || user.year_level === 'G12');
        
        console.log(`   Can post in General: ${canPostGeneral ? '✅' : '❌'}`);
        console.log(`   Can post in G11: ${canPostG11 ? '✅' : '❌'}`);
        console.log(`   Can post in G12: ${canPostG12 ? '✅' : '❌'}`);
        
        if (user.status !== 'active') {
          console.log(`   ⚠️  FIX: Run "node activate-my-account.js" with email: ${user.email}`);
        }
        console.log();
      });
    }

    // Test 5: Check Posts
    console.log('TEST 5: Existing Posts');
    console.log('─────────────────────────────────────────────────────────');
    const [posts] = await connection.execute(`
      SELECT COUNT(*) as count, forum_type 
      FROM posts 
      GROUP BY forum_type
    `);
    
    if (posts.length === 0) {
      console.log('ℹ️  No posts yet - this is normal for new setup');
    } else {
      posts.forEach(p => {
        console.log(`✅ ${p.count} posts in ${p.forum_type} forum`);
      });
    }
    console.log();

    // Test 6: Check Backend Server
    console.log('TEST 6: Backend Server');
    console.log('─────────────────────────────────────────────────────────');
    try {
      const http = require('http');
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/profile',
        method: 'GET',
        timeout: 2000
      };
      
      await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          console.log('✅ Backend server is running on http://localhost:5000');
          resolve();
        });
        req.on('error', () => {
          console.log('❌ Backend server is NOT running');
          console.log('   FIX: Run "cd backend && npm start"');
          resolve();
        });
        req.on('timeout', () => {
          console.log('❌ Backend server timeout');
          resolve();
        });
        req.end();
      });
    } catch (error) {
      console.log('❌ Cannot check backend server');
    }
    console.log();

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  DIAGNOSIS SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Check if migration needed
    const needsMigration = !columns.some(c => c.Field === 'prefix');
    if (needsMigration) {
      console.log('❌ MIGRATION NEEDED');
      console.log('   Run: node run-phc-migration.js\n');
    } else {
      console.log('✅ Migration complete\n');
    }

    // Check if users need activation
    const inactiveUsers = users.filter(u => u.status !== 'active');
    if (inactiveUsers.length > 0) {
      console.log('⚠️  USERS NEED ACTIVATION');
      console.log('   Run: node activate-my-account.js');
      console.log('   Emails to activate:');
      inactiveUsers.forEach(u => console.log(`   - ${u.email}`));
      console.log();
    } else if (users.length > 0) {
      console.log('✅ All users are active\n');
    }

    // Next steps
    console.log('NEXT STEPS:');
    console.log('─────────────────────────────────────────────────────────');
    if (needsMigration) {
      console.log('1. Run migration: node run-phc-migration.js');
    }
    if (inactiveUsers.length > 0) {
      console.log('2. Activate account: node activate-my-account.js');
    }
    console.log('3. Restart backend: npm start');
    console.log('4. Try creating a thread in General forum');
    console.log();

    await connection.end();

  } catch (error) {
    console.error('❌ DIAGNOSIS ERROR:', error.message);
    console.error('\nDetails:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

diagnoseAll();
