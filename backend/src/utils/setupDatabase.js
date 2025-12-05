const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const setupDatabase = async () => {
  try {
    // First connect without specifying database to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('📄 Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'school_forum'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('📄 Database created/verified');

    // Switch to the database
    await connection.query(`USE ${process.env.DB_NAME || 'school_forum'}`);

    // Create users table if it doesn't exist
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        year_level ENUM('G11', 'G12') NOT NULL,
        status ENUM('pending', 'active', 'suspended', 'banned') DEFAULT 'pending',
        role ENUM('student', 'moderator', 'admin') DEFAULT 'student',
        email_verified BOOLEAN DEFAULT FALSE,
        school_id_path VARCHAR(500) NULL,
        school_id_number VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_role (role)
      )
    `;
    
    await connection.query(createUsersTable);
    console.log('📄 Users table created/verified');
    
    // Add school_id_number column if it doesn't exist (for existing databases)
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS school_id_number VARCHAR(50) NULL
      `);
      console.log('📄 School ID number column added/verified');
    } catch (error) {
      // Column might already exist, ignore error
      if (!error.message.includes('Duplicate column')) {
        console.log('📄 School ID number column already exists');
      }
    }

    // Create demo accounts
    const adminPassword = await bcrypt.hash('AdminPass123!', 12);
    const modPassword = await bcrypt.hash('ModPass123!', 12);

    // Insert admin user
    const adminQuery = `
      INSERT INTO users (email, password, first_name, last_name, year_level, status, role, email_verified)
      VALUES ('admin@school.edu', ?, 'System', 'Administrator', 'G12', 'active', 'admin', 1)
      ON DUPLICATE KEY UPDATE
      password = VALUES(password),
      status = 'active',
      role = 'admin',
      email_verified = 1
    `;
    
    await connection.execute(adminQuery, [adminPassword]);
    console.log('📄 Admin account created/updated');

    // Insert moderator user
    const modQuery = `
      INSERT INTO users (email, password, first_name, last_name, year_level, status, role, email_verified)
      VALUES ('moderator@school.edu', ?, 'Forum', 'Moderator', 'G12', 'active', 'moderator', 1)
      ON DUPLICATE KEY UPDATE
      password = VALUES(password),
      status = 'active',
      role = 'moderator',
      email_verified = 1
    `;
    
    await connection.execute(modQuery, [modPassword]);
    console.log('📄 Moderator account created/updated');

    // Create a demo student account
    const studentPassword = await bcrypt.hash('StudentPass123!', 12);
    const studentQuery = `
      INSERT INTO users (email, password, first_name, last_name, year_level, status, role, email_verified)
      VALUES ('student@gmail.com', ?, 'Demo', 'Student', 'G11', 'active', 'student', 1)
      ON DUPLICATE KEY UPDATE
      password = VALUES(password),
      status = 'active',
      email_verified = 1
    `;
    
    await connection.execute(studentQuery, [studentPassword]);
    console.log('📄 Demo student account created/updated');

    await connection.end();
    console.log('✅ Database setup completed successfully!');
    
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    return false;
  }
};

module.exports = { setupDatabase };