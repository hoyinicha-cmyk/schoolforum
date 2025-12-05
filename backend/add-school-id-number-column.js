require('dotenv').config();
const mysql = require('mysql2/promise');

const addSchoolIdNumberColumn = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum',
      port: process.env.DB_PORT || 3306
    });

    console.log('📄 Connected to database');

    // Check if column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'school_id_number'
    `, [process.env.DB_NAME || 'school_forum']);

    if (columns.length > 0) {
      console.log('✅ Column school_id_number already exists');
    } else {
      // Add the column
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN school_id_number VARCHAR(50) NULL AFTER school_id_path
      `);
      console.log('✅ Column school_id_number added successfully');
    }

    await connection.end();
    console.log('✅ Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

addSchoolIdNumberColumn();
