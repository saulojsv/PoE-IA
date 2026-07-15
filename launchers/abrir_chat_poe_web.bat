@echo off
setlocal
cd /d "%~dp0.."
start "" http://localhost:7860
call :runpy scripts\poe_local_chat_web.py
exit /b %errorlevel%

:runpy
py -3 %* 2>nul
if not errorlevel 9009 exit /b %errorlevel%
python %*
exit /b %errorlevel%
