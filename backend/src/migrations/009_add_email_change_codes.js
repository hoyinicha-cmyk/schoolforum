const db = require('../config/database');

async function up() {
  console.log('📝 Creating email_change_codes table...');
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS email_change_codes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      new_email VARCHAR(255) NOT NULL,
      verification_code VARCHAR(10) NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_code (verification_code),
      INDEX idx_expires (expires_at)
    )
  `);
  
  console.log('✅ email_change_codes table created');
}

async function down() {
  console.log('📝 Dropping email_change_codes table...');
  await db.execute('DROP TABLE IF EXISTS email_change_codes');
  console.log('✅ email_change_codes table dropped');
}

module.exports = { up, down };
