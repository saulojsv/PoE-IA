@echo off
cd /d "%~dp0.."
python scripts\poe_ninja_api_pob_xml_by_skill.py --batch-size 1 --target-per-skill 6 --max-profile-attempts 6 --sleep 8 --ensure-folders
