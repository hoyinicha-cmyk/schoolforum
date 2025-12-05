-- Add verification_token column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) DEFAULT NULL;
