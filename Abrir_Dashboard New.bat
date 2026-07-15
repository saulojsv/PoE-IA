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

start "PoE Dashboard Server" cmd /c "npm.cmd run dev -- --host 127.0.0.1 --port 5173"
timeout /t 4 /nobreak >nul
start "" "http://127.0.0.1:5173/dashboard"
endlocal
