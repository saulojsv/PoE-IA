@echo off
setlocal
cd dashboard-new
start "PoE Dashboard Server" npm run dev
timeout /t 2 /nobreak >nul
start "" "http://localhost:5173/"
endlocal
