const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixPrefix() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_forum'
  });

  try {
    console.log('🔧 Fixing empty prefix values...');

    // Update all posts with empty or NULL prefix to 'discussion'
    const [result] = await connection.execute(`
      UPDATE posts 
      SET prefix = 'discussion' 
      WHERE prefix IS NULL OR prefix = '' OR prefix = 'none'
    `);

    console.log(`✅ Updated ${result.affectedRows} posts with default prefix 'discussion'`);
    
    // Show current prefix distribution
    const [stats] = await connection.execute(`
      SELECT prefix, COUNT(*) as count 
      FROM posts 
      GROUP BY prefix
    `);
    
    console.log('\n📊 Current prefix distribution:');
    stats.forEach(row => {
      console.log(`  ${row.prefix || '(empty)'}: ${row.count} posts`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

fixPrefix();
