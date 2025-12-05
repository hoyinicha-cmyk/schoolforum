require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createPostViewsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_forum',
    multipleStatements: true
  });

  try {
    console.log('📝 Creating post_views table...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/create_post_views.sql'),
      'utf8'
    );
    
    await connection.query(sql);
    
    console.log('✅ post_views table created successfully!');
    console.log('');
    console.log('View tracking enabled:');
    console.log('- Each user counts as 1 view per post');
    console.log('- Revisiting posts won\'t increase view count');
    console.log('- Accurate view statistics');
    
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

createPostViewsTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
