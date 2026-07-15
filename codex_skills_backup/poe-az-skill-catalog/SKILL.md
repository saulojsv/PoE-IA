---
name: poe-az-skill-catalog
description: Build or update the canonical A-Z Path of Exile 1 skill catalog for automated skill-by-skill research. Use when Codex must discover, sort, resume, or verify the full PoE 1 skill queue from A to Z.
---

# PoE A-Z Skill Catalog

Create or update `data/normalized/skill_catalog_az.json`.

Required behavior:
- Include every PoE 1 active skill gem, support gem, Vaal skill, and transfigured gem.
- Seed/update from `https://www.poewiki.net/wiki/List_of_skill_gems` and `https://www.poewiki.net/wiki/List_of_transfigured_skill_gems`, then verify against official/game-data sources when researching each skill.
- Sort by canonical display name from A to Z.
- Use stable IDs: `skill:{normalized_name}` or `support:{normalized_name}`.
- Preserve aliases, old names, base skill, variant type, current/legacy/removed status, introduced/removed patch, and sources.
- Never use display name alone as a primary key.
- Do not invent missing patch data; use `null` plus `unverified` reason.

Minimum record:
```json
{
  "id": "skill:lightning_arrow",
  "name": "Lightning Arrow",
  "normalized_name": "lightning_arrow",
  "az_order": 0,
  "category": "active_skill_gem",
  "variant_type": "base",
  "base_skill_id": null,
  "aliases": [],
  "introduced_in_patch": null,
  "removed_in_patch": null,
  "legacy": false,
  "current": true,
  "sources": []
}
```

Also maintain `data/normalized/skill_research_cursor.json` with current cycle, last processed ID, next ID, errors, and timestamps.
