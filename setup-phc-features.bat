@echo off
echo ========================================
echo PHC Forum Features Setup
echo ========================================
echo.

echo Step 1: Checking database tables...
cd backend
node test-forum-tables.js
echo.

echo Step 2: Running migration...
node run-phc-migration.js
echo.

echo Step 3: Verifying migration...
node test-forum-tables.js
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your backend: cd backend ^&^& npm start
echo 2. Restart your frontend: cd frontend ^&^& npm start
echo 3. Test creating a thread!
echo.
pause
