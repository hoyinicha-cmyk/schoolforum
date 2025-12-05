const mysql = require('mysql2/promise');
require('dotenv').config();

async function testForumTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum'
    });

    console.log('✅ Connected to database');

    // Check if posts table has new columns
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM posts
    `);
    
    console.log('\n📋 Posts table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    const hasPrefix = columns.some(col => col.Field === 'prefix');
    const hasHiddenContent = columns.some(col => col.Field === 'has_hidden_content');
    const hasViewCount = columns.some(col => col.Field === 'view_count');

    console.log('\n🔍 PHC Features Check:');
    console.log(`  prefix column: ${hasPrefix ? '✅' : '❌ MISSING'}`);
    console.log(`  has_hidden_content column: ${hasHiddenContent ? '✅' : '❌ MISSING'}`);
    console.log(`  view_count column: ${hasViewCount ? '✅' : '❌ MISSING'}`);

    // Check if reactions table exists
    try {
      const [reactions] = await connection.execute('SELECT COUNT(*) as count FROM reactions');
      console.log(`  reactions table: ✅ (${reactions[0].count} reactions)`);
    } catch (error) {
      console.log('  reactions table: ❌ MISSING');
    }

    // Check if bookmarks table exists
    try {
      const [bookmarks] = await connection.execute('SELECT COUNT(*) as count FROM bookmarks');
      console.log(`  bookmarks table: ✅ (${bookmarks[0].count} bookmarks)`);
    } catch (error) {
      console.log('  bookmarks table: ❌ MISSING');
    }

    // Check if hidden_content_access table exists
    try {
      const [hidden] = await connection.execute('SELECT COUNT(*) as count FROM hidden_content_access');
      console.log(`  hidden_content_access table: ✅ (${hidden[0].count} unlocks)`);
    } catch (error) {
      console.log('  hidden_content_access table: ❌ MISSING');
    }

    if (!hasPrefix || !hasHiddenContent || !hasViewCount) {
      console.log('\n⚠️  WARNING: Some columns are missing!');
      console.log('Run this command to add them:');
      console.log('mysql -u root -p school_forum < database/phc_features_migration.sql');
    } else {
      console.log('\n✅ All PHC features are ready!');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testForumTables();
