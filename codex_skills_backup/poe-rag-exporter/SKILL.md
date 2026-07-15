---
name: poe-rag-exporter
description: Export Path of Exile 1 skill knowledge to Markdown, JSONL, CSV, and patch-safe RAG chunks with embedding metadata. Use when Codex prepares local files for retrieval or model consumption.
---

# PoE RAG Exporter

For chunk schema and patch-safety, read `references/rag-chunk-rules.md`.

Outputs:
- `data/exports/skills/{normalized_name}.md`
- `data/exports/skills.jsonl`
- `data/exports/skills.csv`
- `data/exports/skill_supports.csv`
- `data/exports/skill_items.csv`
- `data/exports/skill_builds.csv`
- `data/exports/sources.csv`

Chunk types: definition, mechanics, compatibility, formula, build, item, passive, patch_change, guide, FAQ, conflict, market_snapshot.

Minimum chunk metadata:
```json
{
  "entity_id": "",
  "entity_type": "skill",
  "chunk_type": "",
  "patch": "",
  "league": "",
  "source_type": "",
  "confidence": 0.0,
  "current": false,
  "source_url": ""
}
```

Never mix patches in one chunk. Prefer small chunks with enough context to answer one retrieval question.
