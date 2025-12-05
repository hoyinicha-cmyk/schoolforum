@echo off
echo ========================================
echo Backfilling Points for Existing Users
echo ========================================
echo.
echo This will calculate and award points for:
echo - Existing posts
echo - Existing replies
echo - Existing reactions
echo - Existing bookmarks
echo - Existing follows
echo.
pause

cd backend
node backfill-points.js

echo.
echo ========================================
echo Backfill complete!
echo Check the admin panel to see updated points.
echo ========================================
pause
