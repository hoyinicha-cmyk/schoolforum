@echo off
echo ========================================
echo   Setting up Nested Replies Feature
echo ========================================
echo.

cd backend
echo Running database migration...
node add-nested-replies.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Migration completed successfully!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Restart your backend: cd backend ^&^& npm start
    echo 2. Restart your frontend: cd frontend ^&^& npm start
    echo 3. Try replying to comments in any thread!
    echo.
) else (
    echo.
    echo ========================================
    echo   Migration failed!
    echo ========================================
    echo Please check the error message above.
    echo.
)

pause
