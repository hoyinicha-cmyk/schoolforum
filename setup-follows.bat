@echo off
echo ========================================
echo Setting up Follow System
echo ========================================
echo.

cd backend
node create-follows-table.js

echo.
echo ========================================
echo Follow System Setup Complete!
echo ========================================
echo.
echo Users can now:
echo - Follow other users
echo - See their followers and following lists
echo - Get notifications when followed
echo.
pause
