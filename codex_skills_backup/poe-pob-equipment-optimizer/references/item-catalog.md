# Item Catalog Reference

Use this when creating or changing item catalog indexes, rare affix selection, slot legality, level-band filtering, or gear generation.

## Required Local Files

- `scripts/build-item-catalog-index.js`
- `scripts/audit-pob-data.js`
- `data/item-catalog/index/bases_by_slot.json`
- `data/item-catalog/index/mods_by_slot.json`
- `data/item-catalog/index/mods_by_family.json`
- `data/item-catalog/index/uniques_by_slot.json`
- `data/item-catalog/index/summary.json`
- `data/item-rules/slots.json`
- `data/item-rules/mod-categories.json`
- `data/item-rules/archetype-rules.json`
- `data/item-rules/crafting-state-rules.json`
- `backend/poe-data/repoe_resolver.go`
- `backend/build-generator/wizard.go`
- `backend/build-generator/wizard_test.go`

## Refresh Gate

Before trusting catalog-backed item work, run:

```powershell
node scripts\build-item-catalog-index.js
node scripts\audit-pob-data.js
```

Use `data/item-catalog/index/summary.json` as the freshness snapshot and keep these local audit findings active when present:

- `REPOE_MOD_WITHOUT_STATS`
- `REPOE_BASE_WITHOUT_NAME`
- `REPOE_UNIQUE_MODS_INCOMPLETE`

If the audit reports them, block deterministic numeric trust rather than smoothing over the gaps.

## Level Bands

- `campaign_early`: character level 1-31, item level 1-35.
- `campaign_late`: character level 32-67, item level 36-67.
- `white_yellow_maps`: character level 68-82, item level 68-78.
- `red_maps`: character level 83-92, item level 79-84.
- `endgame`: character level 93+, item level 85-86+.

Filter bases by drop level and item class. Filter mods by domain, generation type, required level, item level, spawn tags, groups and crafting state.

## Slot Model

Every generated build needs explicit state for:

- Weapon 1.
- Weapon 2, shield or quiver.
- Helmet.
- Body Armour.
- Gloves.
- Boots.
- Amulet or talisman.
- Ring 1.
- Ring 2.
- Belt.
- Flask 1-5.
- Passive-tree jewels.
- Abyss jewels.
- Cluster jewels.

Two-handed weapons block offhand. Quivers require bow-compatible weapon state. Abyss jewels require abyss socket source. Cluster jewels require passive tree socket and passive-point budget.

## Affix Model

Each trusted affix needs:

- canonical mod ID;
- raw text and normalized text;
- stat IDs;
- family;
- prefix/suffix/implicit/crafted/fractured/enchant/corrupted bucket;
- required level;
- mod group;
- domain;
- generation type;
- spawn-weight tags;
- numeric min/max values.

Never infer prefix/suffix from list position once real mod IDs are available. Use `generation_type`.
Treat RePoE mods without `stats` as untrusted for deterministic numeric scoring and PoB-ready affix generation.
Filter unnamed base records out of readable export/item-text candidate sets until a trusted name source exists.
Treat generated gear normalized through `backend/build-generator/wizard.go` and `backend/poe-data/repoe_resolver.go` as resolver-backed candidates, not final PoB truth.

## Scoring Order

Score candidates by solving blockers first:

1. resistances and chaos policy;
2. attributes for gems and gear;
3. life/ES and defensive base;
4. mana/reservation;
5. attack hit chance or relevant non-attack equivalent;
6. ailment/flask safety;
7. skill-specific DPS families;
8. luxury stats.

Do not pick offensive mods that make requirements/resistance/mana blockers impossible.
