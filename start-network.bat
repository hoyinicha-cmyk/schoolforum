@echo off
echo ========================================
echo   School Forum - Network Setup
echo ========================================
echo.

REM Get IP Address
echo Getting your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)

:found
set IP=%IP:~1%
echo.
echo ========================================
echo   Your IP Address: %IP%
echo ========================================
echo.
echo Other users can access at:
echo   http://%IP%:3000
echo.
echo ========================================
echo.

REM Check if firewall rules exist
echo Checking firewall rules...
netsh advfirewall firewall show rule name="Node 3000" >nul 2>&1
if errorlevel 1 (
    echo Adding firewall rule for port 3000...
    netsh advfirewall firewall add rule name="Node 3000" dir=in action=allow protocol=TCP localport=3000
)

netsh advfirewall firewall show rule name="Node 5000" >nul 2>&1
if errorlevel 1 (
    echo Adding firewall rule for port 5000...
    netsh advfirewall firewall add rule name="Node 5000" dir=in action=allow protocol=TCP localport=5000
)

echo.
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo   Servers are starting...
echo ========================================
echo.
echo Backend:  http://%IP%:5000
echo Frontend: http://%IP%:3000
echo.
echo Share this URL with other users:
echo   http://%IP%:3000
echo.
echo Press any key to exit...
pause >nul
