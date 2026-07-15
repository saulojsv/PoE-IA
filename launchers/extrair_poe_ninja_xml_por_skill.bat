@echo off
setlocal
cd /d "%~dp0.."
call :runpy scripts\poe_ninja_api_pob_xml_by_skill.py --batch-size 1 --target-per-skill 6 --max-profile-attempts 6 --sleep 8 --ensure-folders
exit /b %errorlevel%

:runpy
py -3 %* 2>nul
if not errorlevel 9009 exit /b %errorlevel%
python %*
exit /b %errorlevel%
