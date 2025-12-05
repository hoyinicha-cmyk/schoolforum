const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixSuggestFood() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_forum'
  });

  try {
    console.log('🔧 Fixing "suggest food" post prefix...\n');

    const [result] = await connection.execute(`
      UPDATE posts 
      SET prefix = 'food' 
      WHERE title = 'suggest food'
    `);

    console.log(`✅ Updated ${result.affectedRows} post(s) to 'food' prefix`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

fixSuggestFood();
