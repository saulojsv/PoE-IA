---
name: poe-data-normalizer
description: Normalize Path of Exile 1 research into stable local schemas, patch-aware records, and separate JSON files. Use when Codex converts collected skill evidence into structured files.
---

# PoE Data Normalizer

For schema and ID rules, read `references/skill-json-schema.md`.
When normalizing mechanics, preserve rule type: base rule, exception, conditional, cap, stack, trigger, local/global, conversion, gain_as_extra, or conflict.

Write normalized skill records to `data/normalized/skills/{normalized_name}.json`.

Minimum schema:
```json
{
  "id": "",
  "name": "",
  "normalized_name": "",
  "az_order": 0,
  "category": "",
  "variant_type": "",
  "base_skill_id": null,
  "aliases": [],
  "patch": "",
  "league": "",
  "collected_at": "",
  "last_verified_at": "",
  "confidence": 0.0,
  "status": "",
  "classification": [],
  "tags": [],
  "requirements": {},
  "levels": [],
  "quality_effects": [],
  "mechanics": [],
  "formulas": [],
  "limits_breakpoints": [],
  "support_relationships": [],
  "gem_links": [],
  "item_synergies": [],
  "passives_ascendancies": [],
  "builds": [],
  "guides": [],
  "market_usage": [],
  "patch_changes": [],
  "sources": [],
  "claims": [],
  "conflicts": [],
  "validation": []
}
```

Normalize names to lowercase snake_case. Use explicit arrays for repeatable facts. Put unconfirmed fields as `null` or `[]`, never fabricated defaults.
