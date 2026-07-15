@echo off
setlocal
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python nao encontrado. Instale Python ou adicione ao PATH.
  pause
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale Node.js para abrir a dashboard React.
  pause
  exit /b 1
)
start "PoE Data Server" /min python -m http.server 8765
cd /d "%~dp0dashboard-new"
if not exist node_modules (
  call npm.cmd install
)
start "PoE React Dashboard" /min npm.cmd run dev -- --host 127.0.0.1 --port 5173
timeout /t 4 /nobreak >nul
start "" "http://127.0.0.1:5173/dashboard"
endlocal
