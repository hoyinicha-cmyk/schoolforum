const db = require('../config/database');

async function up() {
  try {
    console.log('🔄 Checking if profile_photo column exists...');
    
    // Check if column exists
    const [columns] = await db.execute(`
      SHOW COLUMNS FROM users LIKE 'profile_photo'
    `);
    
    if (columns.length === 0) {
      console.log('Adding profile_photo column to users table...');
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN profile_photo VARCHAR(255) DEFAULT NULL AFTER avatar_id
      `);
      console.log('✅ Migration completed: profile_photo column added');
    } else {
      console.log('ℹ️  profile_photo column already exists, skipping...');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function down() {
  try {
    console.log('Removing profile_photo column from users table...');
    
    await db.execute(`
      ALTER TABLE users 
      DROP COLUMN profile_photo
    `);
    
    console.log('✅ Rollback completed: profile_photo column removed');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down };
