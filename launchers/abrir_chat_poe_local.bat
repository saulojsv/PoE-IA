@echo off
setlocal
cd /d "%~dp0.."
call :runpy scripts\chat_poe_local.py
exit /b %errorlevel%

:runpy
py -3 %* 2>nul
if not errorlevel 9009 exit /b %errorlevel%
python %*
exit /b %errorlevel%
