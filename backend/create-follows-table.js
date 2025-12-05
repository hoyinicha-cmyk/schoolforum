require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createFollowsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_forum',
    multipleStatements: true
  });

  try {
    console.log('📝 Creating follows table...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/create_follows.sql'),
      'utf8'
    );
    
    await connection.query(sql);
    
    console.log('✅ follows table created successfully!');
    console.log('');
    console.log('Follow system enabled:');
    console.log('- Users can follow each other');
    console.log('- Followers get notified of new posts');
    console.log('- Direct reply notifications');
    
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

createFollowsTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
