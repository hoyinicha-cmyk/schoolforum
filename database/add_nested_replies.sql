-- Add support for nested replies (reply to reply)
ALTER TABLE replies 
ADD COLUMN parent_reply_id INT DEFAULT NULL AFTER post_id,
ADD FOREIGN KEY (parent_reply_id) REFERENCES replies(id) ON DELETE CASCADE,
ADD INDEX idx_parent_reply_id (parent_reply_id);

-- Update the index for better performance with nested replies
CREATE INDEX idx_replies_post_parent ON replies(post_id, parent_reply_id, created_at ASC);
