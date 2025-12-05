require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createNotificationsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_forum',
    multipleStatements: true
  });

  try {
    console.log('📝 Creating notifications table...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/create_notifications.sql'),
      'utf8'
    );
    
    await connection.query(sql);
    
    console.log('✅ notifications table created successfully!');
    console.log('');
    console.log('Notification system enabled:');
    console.log('- @mention notifications in chat');
    console.log('- Real-time notification count');
    console.log('- Mark as read functionality');
    
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

createNotificationsTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
