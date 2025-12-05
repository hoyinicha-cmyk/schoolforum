-- Migration script to update status values from 'verified' to 'active'
-- Run this script if you have an existing database with 'verified' status

USE school_forum;

-- First, temporarily modify the ENUM to include both values
ALTER TABLE users MODIFY COLUMN status ENUM('pending', 'verified', 'rejected', 'suspended', 'active', 'banned') DEFAULT 'pending';

-- Update all 'verified' to 'active'
UPDATE users SET status = 'active' WHERE status = 'verified';

-- Update all 'rejected' to 'banned' (if you want to consolidate)
UPDATE users SET status = 'banned' WHERE status = 'rejected';

-- Now change the ENUM to only include the new values
ALTER TABLE users MODIFY COLUMN status ENUM('pending', 'active', 'suspended', 'banned') DEFAULT 'pending';

SELECT 'Migration completed successfully!' as status;
SELECT status, COUNT(*) as count FROM users GROUP BY status;
