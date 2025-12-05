const db = require('../config/database');

async function up() {
  try {
    console.log('🔄 Checking if gender column exists...');

    // Check if gender column exists
    const [columns] = await db.execute(`
      SHOW COLUMNS FROM users LIKE 'gender'
    `);

    if (columns.length === 0) {
      console.log('🔄 Adding gender column to users table...');
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN gender ENUM('male', 'female', 'prefer_not_to_say') DEFAULT 'prefer_not_to_say'
        AFTER year_level
      `);
      console.log('✅ Gender column added successfully!');
    } else {
      console.log('ℹ️ Gender column already exists, skipping...');
    }

    // Set default avatars based on gender
    console.log('🔄 Setting default avatars based on gender...');
    
    // Set default avatars for existing users
    // Male users get Mason (16), Female users get Sophia (17)
    await db.execute(`
      UPDATE users 
      SET avatar_id = CASE 
        WHEN gender = 'male' THEN 16
        WHEN gender = 'female' THEN 17
        ELSE 16
      END
      WHERE avatar_id IS NULL OR avatar_id = '' OR avatar_id = 'mason' OR avatar_id = 'zoe'
    `);

    console.log('✅ Default avatars set successfully!');
    console.log('📝 Note: Male → Mason (16), Female → Sophia (17), Prefer not to say → Mason (16)');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function down() {
  try {
    console.log('Removing gender column from users table...');
    
    await db.execute(`
      ALTER TABLE users 
      DROP COLUMN gender
    `);
    
    console.log('✅ Rollback completed: gender column removed');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down };
