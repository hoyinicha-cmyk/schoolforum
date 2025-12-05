const mysql = require('mysql2/promise');
require('dotenv').config();

async function addLostFoundPrefix() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_forum'
  });

  try {
    console.log('🔧 Adding "lost-found" to prefix ENUM...\n');

    // Alter the ENUM to include 'lost-found'
    await connection.execute(`
      ALTER TABLE posts 
      MODIFY COLUMN prefix ENUM(
        'none',
        'question',
        'tutorial',
        'discussion',
        'news',
        'announcement',
        'help',
        'lost-found'
      ) DEFAULT 'discussion'
    `);

    console.log('✅ Successfully added "lost-found" to prefix options!');
    
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

addLostFoundPrefix();
