require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function addPasswordChangeCodesTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_forum',
    multipleStatements: true
  });

  try {
    console.log('📝 Adding password_change_codes table...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/add_password_change_codes.sql'),
      'utf8'
    );
    
    await connection.query(sql);
    
    console.log('✅ password_change_codes table added successfully!');
    console.log('');
    console.log('What this enables:');
    console.log('- Users can change password with email verification');
    console.log('- 4-digit code sent to email');
    console.log('- Codes expire after 10 minutes');
    
  } catch (error) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('ℹ️  Table already exists');
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

addPasswordChangeCodesTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
