@echo off
cd /d "C:\Users\saulo\Documents\Agente - PoE"
"C:\Users\saulo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" scripts\feed_poe_agent.py --skip-ninja --crawl-forum --forum-pages 5 --max-threads 200 --sleep 1.5
"C:\Users\saulo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" scripts\optimize_poe_knowledge.py
"C:\Users\saulo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" scripts\build_poe_rulebooks.py
pause
