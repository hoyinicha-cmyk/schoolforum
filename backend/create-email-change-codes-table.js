const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createEmailChangeCodesTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_forum'
  });

  try {
    console.log('📧 Creating email_change_codes table...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/create_email_change_codes.sql'),
      'utf8'
    );
    
    await connection.query(sql);
    
    console.log('✅ email_change_codes table created successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createEmailChangeCodesTable();
