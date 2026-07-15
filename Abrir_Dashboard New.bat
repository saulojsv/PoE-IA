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

start "PoE Dashboard Server" cmd /c "npm run dev"
timeout /t 2 /nobreak >nul
start "" "http://localhost:5173/"
endlocal
