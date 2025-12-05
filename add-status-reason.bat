@echo off
echo Adding status_reason column and updating suspended users...
echo.

REM Add the column if it doesn't exist
mysql -u root -p school_forum -e "ALTER TABLE users ADD COLUMN IF NOT EXISTS status_reason TEXT NULL AFTER status;"

REM Update suspended users with reasons
mysql -u root -p school_forum -e "UPDATE users SET status_reason = 'Spam or inappropriate content' WHERE status = 'suspended' AND email LIKE '81feminist%%' AND (status_reason IS NULL OR status_reason = '');"

mysql -u root -p school_forum -e "UPDATE users SET status_reason = 'Multiple rule violations' WHERE status = 'suspended' AND email = 'hahaha@gmail.com' AND (status_reason IS NULL OR status_reason = '');"

mysql -u root -p school_forum -e "UPDATE users SET status_reason = 'Violating community guidelines' WHERE status = 'suspended' AND email LIKE 'memaaccount%%' AND (status_reason IS NULL OR status_reason = '');"

echo.
echo Done! Status reasons have been added to suspended users.
echo Please refresh your admin panel to see the changes.
pause
