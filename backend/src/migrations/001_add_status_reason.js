const db = require('../config/database');

async function up() {
  try {
    console.log('🔄 Running migration: Add status_reason column...');
    
    // Check if column exists
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'status_reason'
    `);

    if (columns.length === 0) {
      // Add column
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN status_reason TEXT NULL AFTER status
      `);
      console.log('✅ Added status_reason column');
    } else {
      console.log('ℹ️  status_reason column already exists');
    }

    // Update existing suspended users with sample reasons
    await db.execute(`
      UPDATE users 
      SET status_reason = 'Spam or inappropriate content' 
      WHERE status = 'suspended' 
      AND email LIKE '81feminist%' 
      AND (status_reason IS NULL OR status_reason = '')
    `);

    await db.execute(`
      UPDATE users 
      SET status_reason = 'Multiple rule violations' 
      WHERE status = 'suspended' 
      AND email = 'hahaha@gmail.com' 
      AND (status_reason IS NULL OR status_reason = '')
    `);

    await db.execute(`
      UPDATE users 
      SET status_reason = 'Violating community guidelines' 
      WHERE status = 'suspended' 
      AND email LIKE 'memaaccount%' 
      AND (status_reason IS NULL OR status_reason = '')
    `);

    console.log('✅ Updated suspended users with reasons');
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

module.exports = { up };
