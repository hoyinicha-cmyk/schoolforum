const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixEmailVerification() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum',
      port: process.env.DB_PORT || 3306
    });

    console.log('📄 Connected to database\n');

    // Update active users to have verified email
    console.log('🔧 Updating active users to have verified email...');
    const [result] = await connection.query(
      'UPDATE users SET email_verified = 1 WHERE status = ? AND email_verified = 0',
      ['active']
    );
    
    console.log(`✅ Updated ${result.affectedRows} users\n`);

    // Show all active users
    console.log('📋 Active users:');
    const [users] = await connection.query(
      'SELECT id, email, first_name, last_name, status, email_verified FROM users WHERE status = ?',
      ['active']
    );
    
    console.table(users);

    await connection.end();
    console.log('\n✅ Done! All active users now have verified emails.');
    console.log('\n📝 Users can now login successfully.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixEmailVerification();
