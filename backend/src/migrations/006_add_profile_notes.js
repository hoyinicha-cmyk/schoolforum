const db = require('../config/database');

async function up() {
  try {
    console.log('Creating profile_notes table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS profile_notes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        content VARCHAR(40) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      )
    `);
    
    console.log('✅ Migration completed: profile_notes table created');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function down() {
  try {
    console.log('Dropping profile_notes table...');
    
    await db.execute(`DROP TABLE IF EXISTS profile_notes`);
    
    console.log('✅ Rollback completed: profile_notes table dropped');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down };
