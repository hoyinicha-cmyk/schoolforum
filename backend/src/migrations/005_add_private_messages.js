const mysql = require('mysql2/promise');
require('dotenv').config();

async function addPrivateMessages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_forum'
  });

  try {
    console.log('📨 Adding private messages table...');

    // Create private_messages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS private_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_sender (sender_id),
        INDEX idx_receiver (receiver_id),
        INDEX idx_created (created_at)
      )
    `);

    console.log('✅ Private messages table created successfully!');
  } catch (error) {
    console.error('❌ Error adding private messages:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

addPrivateMessages();
