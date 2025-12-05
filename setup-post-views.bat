@echo off
echo ========================================
echo Setting up Post Views Tracking
echo ========================================
echo.

cd backend
node create-post-views-table.js

echo.
echo ========================================
echo Post Views Setup Complete!
echo ========================================
echo.
echo Now each user will only count as 1 view per post
echo Revisiting posts won't increase the view count
echo.
pause
