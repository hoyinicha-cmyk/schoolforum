-- Add reasons to existing suspended users
UPDATE users 
SET status_reason = 'Spam or inappropriate content' 
WHERE status = 'suspended' AND email = '81feminist@2200fre...';

UPDATE users 
SET status_reason = 'Multiple rule violations' 
WHERE status = 'suspended' AND email = 'hahaha@gmail.com';

UPDATE users 
SET status_reason = 'Violating community guidelines' 
WHERE status = 'suspended' AND email = 'memaaccount@gma...';

-- If you want to update ALL suspended users with a generic reason:
-- UPDATE users 
-- SET status_reason = 'Account suspended for policy violations' 
-- WHERE status = 'suspended' AND status_reason IS NULL;
