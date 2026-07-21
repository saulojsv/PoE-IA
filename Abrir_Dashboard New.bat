@echo off
setlocal

cd /d "%~dp0dashboard-new"

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERRO] Node.js e npm nao foram encontrados.
  echo Instale o Node.js e execute este arquivo novamente.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo.
  echo Instalando dependencias do PoE Build Lab...
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERRO] Nao foi possivel instalar as dependencias.
    pause
    exit /b 1
  )
)

start "PoE Dashboard Server" cmd /c "npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort true"
for /l %%I in (1,1,30) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:5173/dashboard' -TimeoutSec 1; if ($r.StatusCode -ge 200) { exit 0 } } catch {} ; exit 1" >nul 2>nul
  if not errorlevel 1 goto dashboard_ready
  timeout /t 1 /nobreak >nul
)
echo Nao foi possivel iniciar a dashboard na porta 5173.
pause
exit /b 1
:dashboard_ready
start "" "http://127.0.0.1:5173/dashboard"
endlocal
