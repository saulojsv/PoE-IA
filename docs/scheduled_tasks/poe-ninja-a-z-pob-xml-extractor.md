# poe-ninja-a-z-pob-xml-extractor

Source: `C:\Users\saulo\.codex\automations\poe-ninja-a-z-pob-xml-extractor\automation.toml`

```toml
version = 1
id = "poe-ninja-a-z-pob-xml-extractor"
kind = "cron"
name = "PoE Ninja A-Z PoB XML extractor"
prompt = "Run the poe.ninja public API PoB XML extraction pass every 5 minutes.\n\nCommand:\n`C:\\Users\\saulo\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe scripts\\poe_ninja_api_pob_xml_by_skill.py`\n\nRules:\n- Use poe.ninja public API only.\n- Follow the A-Z order from `data/normalized/skill_catalog_az.json`, matching the Markdown skill catalog order.\n- Process the current A-Z skill using `data/poe_ninja/poe_ninja_dataset/poe_ninja_api_xml_cursor.json`.\n- Ensure one folder exists for every skill; if the current/next skill folder does not exist, create it automatically.\n- Try to extract up to 6 public Path of Building profiles/XMLs for the current skill, with at most 1 XML per character class.\n- Skip any new XML when its character class is already represented by an existing `.meta.json` for that skill.\n- Save every valid decoded PoB export as XML.\n- Only advance to the next A-Z skill after the current skill has 6 different classes covered, is already complete, or has no available public profiles.\n- Save XML under `C:\\Users\\saulo\\Documents\\Agente - PoE\\data\\poe_ninja\\poe_ninja_dataset\\xml\\{normalized_skill}\\{build_id}.xml`.\n- Save metadata beside it as `{build_id}.meta.json`.\n- Add/update only; never delete existing XML or metadata.\n- Respect rate limits. If poe.ninja returns 429, stop that run and continue next scheduled run.\n- Do not fabricate XML when no public PoB export exists.\n\nFinal response concise:\n- Skill processed:\n- XML generated:\n- XML count:\n- Unique class count:\n- Status:\n- Next skill:\n- Errors:"
status = "ACTIVE"
rrule = "RRULE:FREQ=MINUTELY;INTERVAL=5"
model = "gpt-5.5"
reasoning_effort = "low"
execution_environment = "local"
target = { type = "project", project_id = "C:\\Users\\saulo\\Documents\\Agente - PoE" }
cwds = ["C:\\Users\\saulo\\Documents\\Agente - PoE"]
created_at = 1783881503140
updated_at = 1783979418488

```
