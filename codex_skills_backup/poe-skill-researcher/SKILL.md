---
name: poe-skill-researcher
description: Research exactly one Path of Exile 1 skill at a time from the A-Z queue and save verified local JSON and Markdown files. Use for scheduled PoE automation runs that process skill-by-skill.
---

# PoE Skill Researcher

Process exactly one skill per run.

For the full run checklist, read `references/intensive-skill-workflow.md`.

Workflow:
1. Read `data/normalized/skill_catalog_az.json` and `data/normalized/skill_research_cursor.json`.
2. Select the next unprocessed A-Z skill.
3. Research only that skill.
4. Save `data/normalized/skills/{normalized_name}.json`.
5. Save `data/exports/skills/{normalized_name}.md`.
6. Update cursor.

Collect: identity, variants, tags, requirements, costs, levels, quality, mechanics, formulas, limits, breakpoints, support compatibility, gem links, items, passives, ascendancies, builds, guides, videos, PoB links, market/meta, patch changes, bugs, claims, conflicts, sources.

Rules:
- Never process multiple skills in one run.
- Never mix patches inside one factual claim or RAG chunk.
- Never mark data current without patch, source URL, source date or collection date.
- Store uncertainty explicitly.

Use this output path pattern only:
```text
data/normalized/skills/{normalized_name}.json
data/exports/skills/{normalized_name}.md
```
