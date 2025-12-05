const mysql = require('mysql2/promise');
require('dotenv').config();

async function replaceHelpWithFood() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_forum'
  });

  try {
    console.log('🔧 Replacing "help" with "food"...\n');

    // Step 1: Update existing posts with 'help' prefix to 'food'
    const [updateResult] = await connection.execute(`
      UPDATE posts 
      SET prefix = 'food' 
      WHERE prefix = 'help'
    `);
    console.log(`✅ Updated ${updateResult.affectedRows} posts from 'help' to 'food'`);

    // Step 2: Alter the ENUM to replace 'help' with 'food'
    await connection.execute(`
      ALTER TABLE posts 
      MODIFY COLUMN prefix ENUM(
        'none',
        'question',
        'tutorial',
        'discussion',
        'news',
        'announcement',
        'food',
        'lost-found'
      ) DEFAULT 'discussion'
    `);
    console.log('✅ Updated ENUM: replaced "help" with "food"');
    
    // Verify
    const [columns] = await connection.execute('DESCRIBE posts');
    const prefixColumn = columns.find(c => c.Field === 'prefix');
    console.log('\n📋 Updated prefix column:');
    console.log(prefixColumn);

    // Check distribution
    const [stats] = await connection.execute(`
      SELECT prefix, COUNT(*) as count 
      FROM posts 
      GROUP BY prefix
    `);
    console.log('\n📊 Current prefix distribution:');
    stats.forEach(row => {
      console.log(`  ${row.prefix}: ${row.count} posts`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

replaceHelpWithFood();
