const mysql = require('mysql2/promise');
require('dotenv').config();

async function testCreatePost() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum'
    });

    console.log('✅ Connected to database\n');

    // Test 1: Check if posts table has required columns
    console.log('TEST 1: Checking posts table structure');
    console.log('─────────────────────────────────────────');
    try {
      const [columns] = await connection.execute('SHOW COLUMNS FROM posts');
      console.log('Posts table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
      
      const hasPrefix = columns.some(c => c.Field === 'prefix');
      const hasHiddenContent = columns.some(c => c.Field === 'has_hidden_content');
      
      if (!hasPrefix || !hasHiddenContent) {
        console.log('\n❌ MISSING COLUMNS!');
        console.log('   Run: node run-phc-migration.js');
        await connection.end();
        return;
      }
      console.log('\n✅ All required columns exist\n');
    } catch (error) {
      console.log('❌ Error checking posts table:', error.message);
      await connection.end();
      return;
    }

    // Test 2: Try to insert a test post
    console.log('TEST 2: Trying to insert a test post');
    console.log('─────────────────────────────────────────');
    try {
      // Get first user
      const [users] = await connection.execute('SELECT id, email, status FROM users LIMIT 1');
      
      if (users.length === 0) {
        console.log('❌ No users found. Register an account first.');
        await connection.end();
        return;
      }

      const user = users[0];
      console.log(`Using user: ${user.email} (ID: ${user.id}, Status: ${user.status})`);

      // Try to insert
      const [result] = await connection.execute(`
        INSERT INTO posts (user_id, forum_type, prefix, title, content, has_hidden_content)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [user.id, 'general', 'discussion', 'Test Post', 'Test content', false]);

      console.log(`✅ Post created successfully! Post ID: ${result.insertId}\n`);

      // Clean up test post
      await connection.execute('DELETE FROM posts WHERE id = ?', [result.insertId]);
      console.log('✅ Test post cleaned up\n');

    } catch (error) {
      console.log('❌ Error inserting post:', error.message);
      console.log('\nFull error:', error);
      
      if (error.message.includes("Unknown column 'prefix'")) {
        console.log('\n💡 FIX: Run migration');
        console.log('   node run-phc-migration.js');
      } else if (error.message.includes("doesn't exist")) {
        console.log('\n💡 FIX: Run migration');
        console.log('   node run-phc-migration.js');
      }
    }

    // Test 3: Check user status
    console.log('TEST 3: Checking user accounts');
    console.log('─────────────────────────────────────────');
    const [allUsers] = await connection.execute(`
      SELECT id, email, first_name, last_name, status, email_verified, year_level
      FROM users
      ORDER BY created_at DESC
      LIMIT 3
    `);

    allUsers.forEach(u => {
      console.log(`\n${u.email}:`);
      console.log(`  Status: ${u.status} ${u.status === 'active' ? '✅' : '❌ NOT ACTIVE'}`);
      console.log(`  Email Verified: ${u.email_verified ? '✅' : '❌'}`);
      console.log(`  Year Level: ${u.year_level}`);
      
      if (u.status !== 'active') {
        console.log(`  💡 FIX: node activate-my-account.js (use email: ${u.email})`);
      }
    });

    console.log('\n═══════════════════════════════════════════');
    console.log('SUMMARY');
    console.log('═══════════════════════════════════════════\n');

    const inactiveUsers = allUsers.filter(u => u.status !== 'active');
    if (inactiveUsers.length > 0) {
      console.log('⚠️  Some users are not active');
      console.log('   Run: node activate-my-account.js\n');
    } else {
      console.log('✅ All users are active\n');
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (connection) await connection.end();
  }
}

testCreatePost();
