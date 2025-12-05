@echo off
echo ========================================
echo DATABASE RESET SCRIPT
echo ========================================
echo.
echo WARNING: This will DELETE ALL DATA!
echo - All users will be deleted
echo - All posts and replies will be deleted
echo - All chat messages will be deleted
echo - AUTO_INCREMENT will reset to 1
echo.
echo Press Ctrl+C to cancel, or
pause

cd backend
echo.
echo Running reset script...
node reset-database.js

echo.
echo ========================================
echo Reset complete!
echo ========================================
echo.
echo Now restart your backend server with:
echo   npm start
echo.
pause
