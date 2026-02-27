@echo off
echo ========================================================
echo Starting Saral Lekhan Plus Expo Server (Port 8082)
echo ========================================================

echo Setting ADB Port Forwarding for device connection...
adb reverse tcp:8082 tcp:8082

echo Setting Node.js explicit path...
set "PATH=C:\Program Files\nodejs;%PATH%"

echo Cleaning cache and starting server...
"C:\Program Files\nodejs\npx.cmd" expo start -c --port 8082
