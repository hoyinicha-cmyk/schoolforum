@echo off
echo ========================================
echo Adding Welcome Post to Forum
echo ========================================
echo.

REM Run the SQL script
mysql -u root -p school_network < database/seed-welcome-post.sql

echo.
echo ========================================
echo Welcome post added successfully!
echo Check the General Discussion forum.
echo ========================================
pause
