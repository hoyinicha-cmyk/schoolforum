const mysql = require('mysql2/promise');
require('dotenv').config();

async function replaceNewsWithUnlock() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_forum'
  });

  try {
    console.log('🔧 Replacing "news" with "unlock-request"...\n');

    // Step 1: Update existing posts
    const [updateResult] = await connection.execute(`
      UPDATE posts 
      SET prefix = 'unlock-request' 
      WHERE prefix = 'news'
    `);
    console.log(`✅ Updated ${updateResult.affectedRows} posts from 'news' to 'unlock-request'`);

    // Step 2: Alter ENUM
    await connection.execute(`
      ALTER TABLE posts 
      MODIFY COLUMN prefix ENUM(
        'none',
        'question',
        'tutorial',
        'discussion',
        'unlock-request',
        'announcement',
        'food',
        'lost-found'
      ) DEFAULT 'discussion'
    `);
    console.log('✅ Updated ENUM: replaced "news" with "unlock-request"');
    
    // Verify
    const [columns] = await connection.execute('DESCRIBE posts');
    const prefixColumn = columns.find(c => c.Field === 'prefix');
    console.log('\n📋 Updated prefix column:');
    console.log(prefixColumn);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

replaceNewsWithUnlock();
