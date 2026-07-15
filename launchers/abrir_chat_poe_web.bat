@echo off
cd /d "C:\Users\saulo\Documents\Agente - PoE"
start "" http://localhost:7860
"C:\Users\saulo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" scripts\poe_local_chat_web.py
