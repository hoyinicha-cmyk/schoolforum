const db = require('../config/database');

async function up() {
  try {
    console.log('Adding contributor role to users table...');
    
    await db.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('student', 'contributor', 'moderator', 'admin') DEFAULT 'student'
    `);
    
    console.log('✅ Migration completed: contributor role added');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function down() {
  try {
    console.log('Removing contributor role from users table...');
    
    // First, change any contributor users back to student
    await db.execute(`
      UPDATE users SET role = 'student' WHERE role = 'contributor'
    `);
    
    await db.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('student', 'moderator', 'admin') DEFAULT 'student'
    `);
    
    console.log('✅ Rollback completed: contributor role removed');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down };
