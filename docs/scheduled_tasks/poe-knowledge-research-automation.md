# poe-knowledge-research-automation

Source: `C:\Users\saulo\.codex\automations\poe-knowledge-research-automation\automation.toml`

```toml
version = 1
id = "poe-knowledge-research-automation"
kind = "cron"
name = "PoE A-Z 10-skill batch automation"
prompt = "Execute diretamente uma corrida automatizada em lote de 10 skills do PoE 1.\n\nComando principal:\n`C:\\Users\\saulo\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe scripts\\poe_knowledge_research_automation.py`\n\nO script controla: lock anti-concorrÃªncia, catÃ¡logo A-Z, cursor, lote de 10, ciclo, foco por ciclo, missing_fields e refinamento contÃ­nuo.\n\nFoco por ciclo:\n1. oficiais/wiki/PoB bÃ¡sicos\n2. supports + links 2L-6L\n3. itens/mods/jewels/flasks\n4. passivas/masteries/ascendÃªncias\n5. builds/PoB/guias/XML externo, sem poe.ninja\n6+. mercado, conflitos, bugs, updates, refinamento\n\nXML/PoB:\n- NÃ£o acesse poe.ninja.\n- Buscar PoB/XML em fÃ³rum oficial, Mobalytics, YouTube, pobb.in, Maxroll, PoE Vault, Reddit, GitHub e docs de criadores.\n- Salvar XML em `C:\\Users\\saulo\\Documents\\Agente - PoE\\data\\poe_ninja\\poe_ninja_dataset\\xml\\{normalized_skill}\\{build_id}.xml`.\n- Salvar meta ao lado como `{build_id}.meta.json`.\n- Se nÃ£o houver XML/PoB vÃ¡lido, registrar pending; nunca inventar XML.\n\nRegras:\n- NÃ£o narrar exploraÃ§Ã£o interna.\n- NÃ£o procurar manualmente memory.md antes de executar.\n- NÃ£o processar lote piloto antigo.\n- Processar exatamente o lote do script: 10 skills.\n- Se o script falhar por lock, relatar que jÃ¡ existe execuÃ§Ã£o ativa.\n- Se o script falhar por outro motivo, relatar erro curto e nÃ£o improvisar outro lote.\n- ApÃ³s executar, ler apenas o cursor e `data/exports/reports/latest_update.md` para responder.\n- Manter JSON por skill em `data/normalized/skills/{normalized_name}.json`.\n- Manter Markdown por skill em `data/exports/skills/{normalized_name}.md`.\n\nResposta final mÃ¡xima:\n- Lote processado:\n- PrÃ³xima skill:\n- Foco:\n- Status:\n- Erros:\n- Arquivos:"
status = "ACTIVE"
rrule = "RRULE:FREQ=MINUTELY;INTERVAL=1"
model = "gpt-5.5"
reasoning_effort = "low"
execution_environment = "local"
target = { type = "project", project_id = "C:\\Users\\saulo\\Documents\\Agente - PoE" }
cwds = ["C:\\Users\\saulo\\Documents\\Agente - PoE"]
created_at = 1783877013827
updated_at = 1783980617892

```
