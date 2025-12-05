const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'phc_features_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Running PHC features migration...');

    // Execute migration
    await connection.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('\n📋 PHC Features Added:');
    console.log('  ✅ Reactions table (like, love, haha, wow, sad, angry)');
    console.log('  ✅ Bookmarks table');
    console.log('  ✅ Hidden content access table');
    console.log('  ✅ Posts: prefix, has_hidden_content, view_count columns');
    console.log('  ✅ Replies: has_hidden_content column');
    console.log('\n🎉 Your forum now has PHCorner-style features!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
