-- Add status_reason column to users table
ALTER TABLE users ADD COLUMN status_reason TEXT NULL AFTER status;
