require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createChatTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_forum',
    multipleStatements: true
  });

  try {
    console.log('📝 Creating chat_messages table...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/create_chat_messages.sql'),
      'utf8'
    );
    
    await connection.query(sql);
    
    console.log('✅ chat_messages table created successfully!');
    console.log('');
    console.log('Chat feature enabled:');
    console.log('- Real-time messaging for all students');
    console.log('- Messages stored in database');
    console.log('- Auto-refresh every 3 seconds');
    
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

createChatTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
