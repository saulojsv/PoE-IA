@echo off
setlocal
cd /d "%~dp0.."
call :runpy scripts\feed_poe_agent.py --skip-ninja --crawl-forum --forum-pages 5 --max-threads 200 --sleep 1.5
call :runpy scripts\optimize_poe_knowledge.py
call :runpy scripts\build_poe_rulebooks.py
pause
exit /b %errorlevel%

:runpy
py -3 %* 2>nul
if not errorlevel 9009 exit /b %errorlevel%
python %*
exit /b %errorlevel%
