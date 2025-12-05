require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function addNestedReplies() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_forum',
    multipleStatements: true
  });

  try {
    console.log('📝 Adding nested replies support...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/add_nested_replies.sql'),
      'utf8'
    );
    
    await connection.query(sql);
    
    console.log('✅ Nested replies support added successfully!');
    console.log('');
    console.log('What this enables:');
    console.log('- Users can now reply to specific comments');
    console.log('- Threaded conversations in forum posts');
    console.log('- Better discussion organization');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  Nested replies already enabled');
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

addNestedReplies()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
