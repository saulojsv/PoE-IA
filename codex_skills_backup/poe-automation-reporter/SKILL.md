---
name: poe-automation-reporter
description: Generate concise Path of Exile 1 automation reports, update cursors, and record next-run state. Use at the end of each scheduled skill-by-skill research run.
---

# PoE Automation Reporter

Update:
- `data/normalized/skill_research_cursor.json`
- `data/reports/latest_update.md`
- logs under `logs/`

Final report format:
```markdown
# Relatório da automação

## Estado
- Execução:
- Início:
- Fim:
- Skill processada:
- Ordem A-Z:
- Patch detectado:
- Liga detectada:
- Status:

## Resultados
- Skills no catálogo A-Z:
- Skills processadas no ciclo:
- Builds encontradas para esta skill:
- Fontes consultadas:
- Conflitos:
- Erros:

## Arquivos gerados
- JSON da skill:
- Markdown da skill:
- Cursor:

## Próxima execução
- Próxima skill A-Z:

## Limitações
- ...
```

Never omit errors. Never claim tests, Docker, schemas, URLs, or collection worked unless actually verified.
