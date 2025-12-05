@echo off
echo ========================================
echo Fixing Points Issue
echo ========================================
echo.
echo Step 1: Resetting admin points...
cd backend
node reset-admin-points.js

echo.
echo Step 2: Running backfill for all users...
node backfill-points.js

echo.
echo ========================================
echo Done! Points should now be correct.
echo ========================================
pause
