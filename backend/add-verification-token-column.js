require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function addVerificationTokenColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_forum',
    multipleStatements: true
  });

  try {
    console.log('📝 Adding verification_token column to users table...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/add_verification_token_column.sql'),
      'utf8'
    );
    
    await connection.query(sql);
    
    console.log('✅ verification_token column added successfully!');
    console.log('');
    console.log('This enables:');
    console.log('- Email verification when changing email');
    console.log('- Secure token-based verification');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  Column already exists');
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

addVerificationTokenColumn()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
