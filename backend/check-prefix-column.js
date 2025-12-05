const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkPrefixColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_forum'
  });

  try {
    console.log('🔍 Checking prefix column...\n');

    // Check column definition
    const [columns] = await connection.execute('DESCRIBE posts');
    const prefixColumn = columns.find(c => c.Field === 'prefix');
    console.log('Current prefix column:', prefixColumn);

    // Check actual values
    const [posts] = await connection.execute('SELECT id, title, prefix FROM posts LIMIT 10');
    console.log('\n📋 Sample posts:');
    posts.forEach(post => {
      console.log(`  ID ${post.id}: "${post.title}" - prefix: "${post.prefix}" (length: ${post.prefix ? post.prefix.length : 0})`);
    });

    // Fix: Alter column to allow NULL and set default
    console.log('\n🔧 Fixing prefix column...');
    await connection.execute(`
      ALTER TABLE posts 
      MODIFY COLUMN prefix VARCHAR(50) DEFAULT 'discussion'
    `);
    console.log('✅ Column altered successfully');

    // Update empty strings to discussion
    const [result] = await connection.execute(`
      UPDATE posts 
      SET prefix = 'discussion' 
      WHERE prefix = '' OR prefix IS NULL
    `);
    console.log(`✅ Updated ${result.affectedRows} posts`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

checkPrefixColumn();
