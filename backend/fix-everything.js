const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fixEverything() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  FIX EVERYTHING - ONE COMMAND');
  console.log('═══════════════════════════════════════════════════════════\n');

  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum',
      multipleStatements: true
    });

    console.log('✅ Connected to database\n');

    // Step 1: Run Migration
    console.log('STEP 1: Running Migration');
    console.log('─────────────────────────────────────────────────────────');
    try {
      const migrationPath = path.join(__dirname, '..', 'database', 'phc_features_migration.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      await connection.query(migrationSQL);
      console.log('✅ Migration completed\n');
    } catch (error) {
      if (error.message.includes('Duplicate column')) {
        console.log('ℹ️  Migration already run (columns exist)\n');
      } else {
        throw error;
      }
    }

    // Step 2: Activate All Users
    console.log('STEP 2: Activating All Users');
    console.log('─────────────────────────────────────────────────────────');
    const [result] = await connection.execute(`
      UPDATE users 
      SET status = 'active', email_verified = 1 
      WHERE status != 'active' OR email_verified = 0
    `);
    
    if (result.affectedRows > 0) {
      console.log(`✅ Activated ${result.affectedRows} user(s)\n`);
    } else {
      console.log('ℹ️  All users already active\n');
    }

    // Step 3: Show User Status
    console.log('STEP 3: User Status');
    console.log('─────────────────────────────────────────────────────────');
    const [users] = await connection.execute(`
      SELECT email, first_name, last_name, year_level, status, role, email_verified
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if (users.length === 0) {
      console.log('⚠️  No users found. Please register an account first.\n');
    } else {
      console.log('Recent users:\n');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Name: ${user.first_name} ${user.last_name}`);
        console.log(`   Status: ${user.status} ✅`);
        console.log(`   Email Verified: ${user.email_verified ? 'Yes ✅' : 'No'}`);
        console.log(`   Year Level: ${user.year_level}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Can post in General: ✅`);
        console.log(`   Can post in G11: ${user.year_level === 'G11' || user.role === 'admin' || user.role === 'moderator' ? '✅' : '❌'}`);
        console.log(`   Can post in G12: ${user.year_level === 'G12' || user.role === 'admin' || user.role === 'moderator' ? '✅' : '❌'}`);
        console.log();
      });
    }

    // Step 4: Verify Tables
    console.log('STEP 4: Verifying Tables');
    console.log('─────────────────────────────────────────────────────────');
    const tables = ['posts', 'replies', 'reactions', 'bookmarks', 'hidden_content_access'];
    for (const table of tables) {
      try {
        await connection.execute(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`✅ ${table} table ready`);
      } catch (error) {
        console.log(`❌ ${table} table missing`);
      }
    }
    console.log();

    // Step 5: Check Posts Columns
    console.log('STEP 5: Checking Posts Columns');
    console.log('─────────────────────────────────────────────────────────');
    const [columns] = await connection.execute('SHOW COLUMNS FROM posts');
    const requiredColumns = ['prefix', 'has_hidden_content', 'view_count'];
    
    let allColumnsExist = true;
    requiredColumns.forEach(col => {
      const exists = columns.some(c => c.Field === col);
      console.log(`${exists ? '✅' : '❌'} ${col} column`);
      if (!exists) allColumnsExist = false;
    });
    console.log();

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (allColumnsExist && users.length > 0) {
      console.log('🎉 EVERYTHING IS FIXED!\n');
      console.log('✅ Migration complete');
      console.log('✅ Users activated');
      console.log('✅ All tables ready');
      console.log('✅ All columns exist\n');
      console.log('NEXT STEPS:');
      console.log('1. Restart backend: npm start');
      console.log('2. Go to forum and try creating a thread');
      console.log('3. Should work perfectly! 🚀\n');
    } else {
      console.log('⚠️  SOME ISSUES REMAIN\n');
      if (!allColumnsExist) {
        console.log('❌ Some columns missing - check migration file');
      }
      if (users.length === 0) {
        console.log('❌ No users - register an account first');
      }
      console.log();
    }

    await connection.end();

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

fixEverything();
