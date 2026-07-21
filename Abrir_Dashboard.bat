@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale Node.js para abrir a dashboard React.
  pause
  exit /b 1
)
cd /d "%~dp0dashboard-new"
if not exist node_modules (
  call npm.cmd install
)
set DASH_PORT=5173
start "PoE React Dashboard" /min cmd /c "npm.cmd run dev -- --host 127.0.0.1 --port %DASH_PORT% --strictPort true"
for /l %%I in (1,1,30) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:%DASH_PORT%/dashboard' -TimeoutSec 1; if ($r.StatusCode -ge 200) { exit 0 } } catch {} ; exit 1" >nul 2>nul
  if not errorlevel 1 goto dashboard_ready
  timeout /t 1 /nobreak >nul
)
echo Nao foi possivel iniciar a dashboard na porta %DASH_PORT%.
pause
exit /b 1
:dashboard_ready
start "" "http://127.0.0.1:%DASH_PORT%/dashboard"
endlocal
