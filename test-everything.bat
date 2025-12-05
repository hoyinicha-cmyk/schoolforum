@echo off
echo ========================================
echo Testing Backend Endpoints
echo ========================================
echo.

echo Testing Login Endpoint...
echo.
powershell -Command "$body = @{email='moderator@school.edu';password='ModPass123!'} | ConvertTo-Json; $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method POST -Body $body -ContentType 'application/json'; Write-Host 'User Data:' -ForegroundColor Green; $response.user | ConvertTo-Json; Write-Host ''; if ($response.user.badge) { Write-Host 'Badge Check: PASS' -ForegroundColor Green; Write-Host 'Badge Value:' $response.user.badge -ForegroundColor Cyan } else { Write-Host 'Badge Check: FAIL - Badge is missing!' -ForegroundColor Red }"

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo If you see "Badge Check: PASS" above, the backend is working correctly!
echo.
echo Next step: Logout and login again in the browser to get fresh user data.
echo.
pause
