const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDatabase() {
  let connection;
  
  try {
    console.log('🔄 Starting database reset...');
    
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum'
    });
    
    console.log('✅ Connected to database');
    
    // Disable foreign key checks temporarily
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Disabled foreign key checks');
    
    // List of tables to reset (in order to avoid FK issues)
    const tables = [
      'hidden_content_access',
      'bookmarks',
      'reactions',
      'replies',
      'posts',
      'post_views',
      'follows',
      'notifications',
      'chat_messages',
      'password_reset_codes',
      'users'
    ];
    
    // Delete all data from each table
    for (const table of tables) {
      try {
        await connection.query(`DELETE FROM ${table}`);
        console.log(`🗑️  Cleared ${table}`);
      } catch (error) {
        console.log(`⚠️  Table ${table} might not exist, skipping...`);
      }
    }
    
    // Reset AUTO_INCREMENT for all tables
    console.log('\n🔢 Resetting AUTO_INCREMENT counters...');
    
    const autoIncrementTables = [
      'users',
      'posts',
      'replies',
      'reactions',
      'bookmarks',
      'notifications',
      'chat_messages',
      'follows',
      'post_views',
      'hidden_content_access',
      'password_reset_codes'
    ];
    
    for (const table of autoIncrementTables) {
      try {
        await connection.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
        console.log(`✅ Reset ${table} AUTO_INCREMENT to 1`);
      } catch (error) {
        console.log(`⚠️  Could not reset ${table}, might not exist`);
      }
    }
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n🔒 Re-enabled foreign key checks');
    
    console.log('\n✅ Database reset complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. The setup script will recreate default accounts');
    console.log('   3. All IDs will start from 1');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 Database connection closed');
    }
  }
}

// Run the reset
resetDatabase();
