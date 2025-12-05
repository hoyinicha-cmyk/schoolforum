-- Create email_change_codes table for Netflix-style email verification
CREATE TABLE IF NOT EXISTS email_change_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  new_email VARCHAR(255) NOT NULL,
  verification_code VARCHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_code (verification_code),
  INDEX idx_expires (expires_at)
);
