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
for /f %%P in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "$l=[System.Net.Sockets.TcpListener]::new([Net.IPAddress]::Parse(''127.0.0.1''),0);$l.Start();$p=$l.LocalEndpoint.Port;$l.Stop();$p"') do set DASH_PORT=%%P
start "PoE React Dashboard" /min npm.cmd run dev -- --host 127.0.0.1 --port %DASH_PORT% --strictPort true
timeout /t 4 /nobreak >nul
start "" "http://127.0.0.1:%DASH_PORT%/dashboard"
endlocal
