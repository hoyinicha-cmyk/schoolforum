require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');

async function cleanup() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum',
      port: process.env.DB_PORT || 3306
    });

    console.log('🗑️  Dropping email_change_confirmations table...');
    await connection.query('DROP TABLE IF EXISTS email_change_confirmations');
    console.log('✅ Table dropped successfully!');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanup();
