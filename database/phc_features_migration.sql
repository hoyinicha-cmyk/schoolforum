-- PHCorner-style Features Migration
-- Run this to add reactions, bookmarks, prefixes, and hidden content features

USE school_forum;

-- Add new columns to posts table
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS prefix ENUM('none', 'question', 'tutorial', 'discussion', 'news', 'announcement', 'help') DEFAULT 'none' AFTER forum_type,
  ADD COLUMN IF NOT EXISTS has_hidden_content BOOLEAN DEFAULT FALSE AFTER content,
  ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0 AFTER is_locked;

-- Add index for prefix
ALTER TABLE posts ADD INDEX IF NOT EXISTS idx_prefix (prefix);

-- Add hidden content column to replies
ALTER TABLE replies 
  ADD COLUMN IF NOT EXISTS has_hidden_content BOOLEAN DEFAULT FALSE AFTER content;

-- Create reactions table
CREATE TABLE IF NOT EXISTS reactions (
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

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
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

-- Create hidden content access table
CREATE TABLE IF NOT EXISTS hidden_content_access (
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

-- Update existing posts with default prefix
UPDATE posts SET prefix = 'discussion' WHERE prefix IS NULL OR prefix = '';

SELECT 'PHCorner-style features migration completed!' as status;
