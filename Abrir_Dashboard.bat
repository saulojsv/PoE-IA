@echo off
setlocal
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python nao encontrado. Instale Python ou adicione ao PATH.
  pause
  exit /b 1
)
start "PoE Dashboard Server" /min python -m http.server 8765
timeout /t 2 /nobreak >nul
start "" "http://localhost:8765/dashboard/"
endlocal
