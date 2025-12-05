const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum',
      port: process.env.DB_PORT || 3306
    });

    console.log('📄 Connected to database');

    // First, temporarily modify the ENUM to include both values
    console.log('📄 Updating ENUM to include both old and new values...');
    await connection.query(`
      ALTER TABLE users 
      MODIFY COLUMN status ENUM('pending', 'verified', 'rejected', 'suspended', 'active', 'banned') 
      DEFAULT 'pending'
    `);

    // Update all 'verified' to 'active'
    console.log('📄 Migrating verified → active...');
    const [result1] = await connection.query(`
      UPDATE users SET status = 'active' WHERE status = 'verified'
    `);
    console.log(`✅ Updated ${result1.affectedRows} users from 'verified' to 'active'`);

    // Update all 'rejected' to 'banned' (optional)
    console.log('📄 Migrating rejected → banned...');
    const [result2] = await connection.query(`
      UPDATE users SET status = 'banned' WHERE status = 'rejected'
    `);
    console.log(`✅ Updated ${result2.affectedRows} users from 'rejected' to 'banned'`);

    // Now change the ENUM to only include the new values
    console.log('📄 Updating ENUM to only include new values...');
    await connection.query(`
      ALTER TABLE users 
      MODIFY COLUMN status ENUM('pending', 'active', 'suspended', 'banned') 
      DEFAULT 'pending'
    `);

    // Show final status counts
    const [counts] = await connection.query(`
      SELECT status, COUNT(*) as count FROM users GROUP BY status
    `);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Current status distribution:');
    counts.forEach(row => {
      console.log(`   ${row.status}: ${row.count}`);
    });

    await connection.end();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
