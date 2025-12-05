const db = require('../config/database');

async function up() {
  console.log('🔄 Running migration: Add points and badge system...');
  
  try {
    // Add points column to users table
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS points INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS badge VARCHAR(50) DEFAULT 'Forum Newbie',
      ADD COLUMN IF NOT EXISTS posts_today INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_post_date DATE
    `);
    console.log('✅ Added points, badge, and daily post tracking columns');
    
    // Create points_history table for tracking
    await db.execute(`
      CREATE TABLE IF NOT EXISTS points_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        points INT NOT NULL,
        action VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Created points_history table');
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function down() {
  console.log('🔄 Rolling back: Remove points system...');
  
  try {
    await db.execute(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS points,
      DROP COLUMN IF EXISTS badge,
      DROP COLUMN IF EXISTS posts_today,
      DROP COLUMN IF EXISTS last_post_date
    `);
    
    await db.execute('DROP TABLE IF EXISTS points_history');
    
    console.log('✅ Rollback completed!');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down };
