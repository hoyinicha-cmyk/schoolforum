const db = require('../config/database');

async function up() {
  try {
    console.log('🔄 Running migration: Add avatar_id column...');
    
    // Check if column exists
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'avatar_id'
    `);

    if (columns.length === 0) {
      // Add column
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN avatar_id INT DEFAULT 1 AFTER email_verified
      `);
      console.log('✅ Added avatar_id column');
    } else {
      console.log('ℹ️  avatar_id column already exists');
    }

    // Set random avatars for existing users (1-20)
    await db.execute(`
      UPDATE users 
      SET avatar_id = FLOOR(1 + RAND() * 20)
      WHERE avatar_id IS NULL OR avatar_id = 0
    `);

    console.log('✅ Set random avatars for existing users');
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

module.exports = { up };
