const db = require('../config/database');

async function up() {
  console.log('🔄 Adding last_chat_view column to users table...');
  
  try {
    // Check if column exists
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'last_chat_view'
    `);
    
    if (columns.length === 0) {
      // Add last_chat_view column
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN last_chat_view DATETIME DEFAULT NULL
      `);
      console.log('✅ Added last_chat_view column');
    } else {
      console.log('ℹ️  last_chat_view column already exists');
    }
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

module.exports = { up };
