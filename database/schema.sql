-- School Forum Database Schema
-- MySQL 8.0+ Compatible

CREATE DATABASE IF NOT EXISTS school_forum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE school_forum;

-- Users table
CREATE TABLE users (
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_role (role),
  INDEX idx_year_level (year_level),
  INDEX idx_email_verified (email_verified)
);

-- Posts table (for future forum posts)
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  forum_type ENUM('general', 'g11', 'g12') NOT NULL,
  prefix ENUM('none', 'question', 'tutorial', 'discussion', 'news', 'announcement', 'help') DEFAULT 'none',
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  has_hidden_content BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_forum_type (forum_type),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_pinned (is_pinned),
  INDEX idx_prefix (prefix)
);

-- Replies table (for future forum replies)
CREATE TABLE replies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  has_hidden_content BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Reactions table (PHC-style reactions)
CREATE TABLE reactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  post_id INT NULL,
  reply_id INT NULL,
  reaction_type ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_id) REFERENCES replies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_post_reaction (user_id, post_id, reply_id),
  INDEX idx_post_id (post_id),
  INDEX idx_reply_id (reply_id),
  INDEX idx_user_id (user_id),
  INDEX idx_reaction_type (reaction_type)
);

-- Bookmarks table
CREATE TABLE bookmarks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_bookmark (user_id, post_id),
  INDEX idx_user_id (user_id),
  INDEX idx_post_id (post_id)
);

-- Hidden content access (tracks who can see hidden content)
CREATE TABLE hidden_content_access (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  post_id INT NULL,
  reply_id INT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_id) REFERENCES replies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_content_access (user_id, post_id, reply_id),
  INDEX idx_user_id (user_id),
  INDEX idx_post_id (post_id),
  INDEX idx_reply_id (reply_id)
);

-- Sessions table (for JWT blacklisting if needed)
CREATE TABLE user_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at)
);

-- Insert default admin user (password: AdminPass123!)
INSERT INTO users (
  email, 
  password, 
  first_name, 
  last_name, 
  year_level, 
  status, 
  role, 
  email_verified
) VALUES (
  'admin@school.edu',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewRuGO3KPiUvhm6C',  -- AdminPass123!
  'System',
  'Administrator',
  'G12',
  'active',
  'admin',
  1
);

-- Insert sample moderator (password: ModPass123!)
INSERT INTO users (
  email, 
  password, 
  first_name, 
  last_name, 
  year_level, 
  status, 
  role, 
  email_verified
) VALUES (
  'moderator@school.edu',
  '$2b$12$8K1kOQhbK.fS2Go2QmN.wuPqFJ7FgM4X9aWqJ0HhQ5w8kMxnXrJma',  -- ModPass123!
  'Forum',
  'Moderator',
  'G12',
  'active',
  'moderator',
  1
);

-- Sample posts for demonstration
INSERT INTO posts (user_id, forum_type, prefix, title, content, is_pinned, has_hidden_content) VALUES
(1, 'general', 'announcement', 'Welcome to School Forum!', 'Welcome to our school forum! This is a place for students to connect, share ideas, and support each other academically. Please read the community guidelines and be respectful to all members.', 1, 0),
(2, 'general', 'announcement', 'Community Guidelines', 'Please follow these guidelines:\n\n1. Be respectful and kind\n2. Keep discussions academic and appropriate\n3. No spam or irrelevant content\n4. Report inappropriate behavior\n5. Help create a positive learning environment\n\nViolations may result in account suspension.', 1, 0),
(1, 'g11', 'tutorial', 'G11 Study Resources', 'This section is for Grade 11 students to share study materials, form study groups, and discuss coursework. Good luck with your studies!', 1, 0),
(1, 'g12', 'discussion', 'G12 College Prep', 'Senior students can use this forum to discuss college applications, scholarship opportunities, and graduation requirements. Best of luck in your final year!', 1, 0);

-- Sample replies
INSERT INTO replies (post_id, user_id, content) VALUES
(1, 2, 'Thank you for creating this forum! Looking forward to connecting with fellow students.'),
(2, 1, 'Remember, we are all here to learn and grow together. Lets make this a supportive community!');

-- Create indexes for better performance
CREATE INDEX idx_posts_forum_created ON posts(forum_type, created_at DESC);
CREATE INDEX idx_replies_post_created ON replies(post_id, created_at ASC);
CREATE INDEX idx_users_status_role ON users(status, role);

-- Views for easier data access
CREATE VIEW verified_students AS
SELECT 
  id, email, first_name, last_name, year_level, role, created_at
FROM users 
WHERE status = 'active' AND email_verified = 1;

CREATE VIEW pending_registrations AS
SELECT 
  id, email, first_name, last_name, year_level, school_id_path, created_at
FROM users 
WHERE status = 'pending' AND email_verified = 1 AND school_id_path IS NOT NULL
ORDER BY created_at ASC;

-- Stored procedure to clean up old unverified accounts (optional)
DELIMITER //
CREATE PROCEDURE CleanupUnverifiedAccounts()
BEGIN
  DELETE FROM users 
  WHERE email_verified = 0 
    AND status = 'pending' 
    AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
END //
DELIMITER ;

-- Show table information
SHOW TABLES;
SELECT 'Database schema created successfully!' as status;