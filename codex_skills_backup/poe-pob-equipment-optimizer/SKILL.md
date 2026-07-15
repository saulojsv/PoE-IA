---
name: poe-pob-equipment-optimizer
description: Generate, audit, repair, or optimize Path of Exile 1 equipment, jewels, flasks, uniques, talismans, item modifiers, item catalog indexes, and Path of Building XML item sections. Use when Codex works on IA - PoE 1 item logic, RePoE data, PoB XML export/import compatibility, golden PoB templates, rare affix legality, jewel socket coupling, cluster jewels, or build generation where equipment must align with the passive tree and ascendancy.
---

# PoE PoB Equipment Optimizer

## Core Rule

Treat every item as PoB input, not prose. A generated item is unsafe until its slot, base, item level, rarity, sockets, mod buckets, mod IDs, tree dependencies, and XML serialization can survive local round-trip checks and final Path of Building import.

Always optimize in this order:

1. PoB XML importability.
2. Correct base and slot legality.
3. Correct mod buckets and affix legality.
4. Tree, ascendancy and jewel socket coupling.
5. Requirements, resistances, mana and defensive blockers.
6. DPS and luxury scaling.

## Project Location

Use this project unless the user says otherwise:

```text
C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1
```

Before changing item, jewel, gear generation, or PoB XML logic, read the relevant local docs:

- `docs/31-pre-pob-xml-export-checklist.md` for the export gate.
- `docs/32-phase-10-equipment-catalog-and-optimizer-plan.md` for the full item architecture.
- `docs/22-phase-9-item-affix-jewel-resolver.md` for current resolver status.
- `docs/audits/pob-data-compatibility-audit.md` for current data trust limits.
- `docs/06-pob-xml-validity-map.md` and `docs/18-phase-5-xml-exporter-plan.md` when XML structure is involved.

## Data Contract

Use trusted local data before any LLM or text heuristic:

- `data/repoe/base_items.json`
- `data/repoe/mods.json`
- `data/repoe/stats.json`
- `data/repoe/stat_translations.json`
- `data/repoe/item_classes.json`
- `data/repoe/crafting_bench_options.json`
- `data/repoe/essences.json`
- `data/repoe/fossils.json`
- `data/repoe/cluster_jewels.json`
- `data/repoe/cluster_jewel_notables.json`
- `data/repoe/uniques.json`
- `data/item-catalog/index/*.json`
- `data/item-catalog/index/mods_by_base.json`
- `data/item-catalog/index/mods_by_slot_level_family.json`
- `data/item-catalog/index/dataset_summary.json`
- `data/item-catalog/index/item_training_rows.jsonl`
- `data/item-rules/*.json`
- `backend/build-generator/wizard.go`
- `backend/build-generator/wizard_test.go`
- `backend/poe-data/repoe_resolver.go`

Treat `data/repoe/uniques.json` as identity-first local data. If exact unique mods are incomplete or unresolved, keep numeric trust blocked until PoB or curated project data confirms them.
If `docs/audits/pob-data-compatibility-audit.md` reports `REPOE_MOD_WITHOUT_STATS`, do not treat those mod IDs as trusted numeric affixes; keep them out of deterministic scoring unless another trusted source resolves the stats.
If the same audit reports `REPOE_BASE_WITHOUT_NAME`, do not surface those unnamed bases as readable export candidates or final item text until a trusted name source exists.

If the catalog index is stale or missing, run:

```powershell
node scripts\build-item-catalog-index.js
node scripts\build-item-equipment-dataset.js
node scripts\audit-pob-data.js
```

Treat `data/item-rules/training-requirements.json` as the current source for item training/runtime hard gates, required files and recommended next blockers. Do not promote `recommendedAdditions` into enforced legality unless the local generator, validator or runtime actually implements them.

## Reference Routing

Read only what the task needs:

- For item catalog/index work, read `references/item-catalog.md`.
- For PoB XML/golden template work, read `references/pob-xml-golden-contract.md`.
- For jewels, clusters, unique jewels, Watcher's Eye, Timeless jewels, or talismans, read `references/jewels-uniques-talismans.md`.
- For recurring research/feed updates, read `references/research-refresh.md`.

## Workflow

1. Identify build context: level, class, ascendancy, main skill, damage archetype, defense policy, budget, league/mode and target content.
2. Load the passive tree state before counting jewels or cluster jewels.
3. Determine blocker targets first: elemental resistance cap, chaos policy, attributes, life/ES, mana usability, hit chance, suppression/block/armour/evasion and flask/ailment coverage.
4. Query the item catalog by level band, slot, base tags, required mod families and budget.
5. Build candidate item sets with separate buckets for implicit, explicit, crafted, fractured, enchant and corrupted mods.
6. Reject candidates that exceed prefix/suffix capacity, use illegal mod groups, require missing influence/corruption/eldritch state, or use mods above item level.
7. Equip jewels only when a valid socket source exists. Treat cluster jewels as tree extensions that consume sockets and passive points.
8. When the task uses the dashboard tree-plus-items flow, keep the current request contract explicit: rarity policy, scope, budget, modifier source, resistance policy, chaos policy, defensive base policy, affix strictness and jewel policy.
9. If the trained item scorer is not connected, allow deterministic preview/fallback gear only as structural output; do not present it as model-ranked or PoB-validated equipment.
10. Format items for PoB XML using the project exporter, never by hand-writing arbitrary item text into XML.
11. Run local encode/decode/parser checks. Keep final validation blocked until PoB imports the result.

## XML Formatting Requirements

When generating PoB items:

- Use the project XML exporter in `backend/xml-engine`.
- Preserve PoB-friendly item text line order.
- Keep item rarity, name, base type, sockets and mods as separate model fields before formatting.
- Escape XML special characters.
- Never insert unsupported generated text as a real mod.
- Never emit vague placeholder mods such as `+35% to one of Elemental Resistances`; use concrete PoB-safe lines or block the item.
- Move uncertain explanations to notes, not item mod lines.
- Use the golden template contract as the shape reference for XML sections.

The generated XML must include a valid `Items` section and must round-trip through local parser checks before being presented as PoB-ready.

## Blocker Discipline

Do not call an item set valid when any of these remain unresolved:

- `ITEM_REPOE_BASE_NOT_FOUND`
- `ITEM_REPOE_MOD_NOT_FOUND`
- `ITEM_REPOE_MOD_INVALID_STATS`
- `ITEM_ILLEGAL_AFFIX_SLOT`
- `ITEM_AFFIX_LEVEL_TOO_HIGH`
- `ITEM_PREFIX_LIMIT_EXCEEDED`
- `ITEM_SUFFIX_LIMIT_EXCEEDED`
- `ITEM_MOD_GROUP_CONFLICT`
- `ITEM_INFLUENCE_REQUIRED`
- `ITEM_CRAFT_STATE_CONFLICT`
- `ITEM_UNIQUE_MODS_UNRESOLVED`
- `JEWEL_SOCKET_NOT_ALLOCATED`
- `ABYSS_JEWEL_SOCKET_MISSING`
- `TREE_CLUSTER_UNSUPPORTED`
- `XML_ROUND_TRIP_FAILED`
- `POB_IMPORT_FAILED`

Use blocker codes in build output, tests and notes so later repair logic can act deterministically.

## Verification

For code/data changes, run the tightest useful checks:

```powershell
node scripts\build-item-catalog-index.js
node scripts\audit-pob-data.js
go test ./...
```

Run Go tests from the `backend` directory. Mention if PoB itself was not opened/import-tested.
