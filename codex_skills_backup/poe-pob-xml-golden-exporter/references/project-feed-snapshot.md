# PoE 1 Skill Feed Snapshot

Generated: 2026-07-12 13:31:17 +01:00

Project root: C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1

## Git

~~~text
f685ada Wire dashboard to current training bundle
## main...origin/main
 M backend/api/handlers.go
 M backend/model-runtime/manifest.go
 M backend/xml-engine/exporter.go
 M backend/xml-engine/exporter_test.go
 M backend/xml-engine/parser.go
 M backend/xml-engine/parser_test.go
 M data/item-catalog/index/summary.json
 M docs/33-full-pob-xml-golden-dataset-contract.md
 M docs/47-dashboard-item-model-runtime-error.md
 M docs/audits/pob-data-compatibility-audit.md
 M docs/poe_item_training_colab.py
 M frontend/src/components/CombinatorialOptimizer.tsx
 M frontend/src/services/api.ts
 M scripts/generate-equipment-training-dataset.py
~~~

## Local Refresh Commands

### Item catalog

~~~json
{
  "outDir": "C:\\Users\\saulo\\Desktop\\IA - Projetos\\IA - PoE 1\\data\\item-catalog\\index",
  "bases": 5052,
  "mods": 39292,
  "uniques": 1525
}
~~~

### Data audit

~~~json
{
  "generatedAt": "2026-07-12T12:31:03.053Z",
  "issues": 4,
  "bySeverity": {
    "medium": 4
  },
  "notes": 5
}
~~~

### Go tests

~~~text
?   	backend	[no test files]
?   	backend/api	[no test files]
?   	backend/build-analyzer	[no test files]
ok  	backend/build-audit	(cached)
?   	backend/build-comparator	[no test files]
?   	backend/build-engine	[no test files]
ok  	backend/build-generator	(cached)
ok  	backend/build-repair	(cached)
?   	backend/dps-engine	[no test files]
?   	backend/gemini-agent	[no test files]
?   	backend/handlers	[no test files]
?   	backend/jobs	[no test files]
?   	backend/model-runtime	[no test files]
ok  	backend/models	(cached)
ok  	backend/passive-tree-engine	(cached)
?   	backend/passive-tree-optimizer	[no test files]
?   	backend/pobb-adapter	[no test files]
ok  	backend/poe-data	(cached)
ok  	backend/poe-ninja-adapter	(cached)
?   	backend/recommendation-engine	[no test files]
?   	backend/reports	[no test files]
ok  	backend/services	(cached)
?   	backend/storage	[no test files]
ok  	backend/validation-engine	(cached)
ok  	backend/xml-engine	(cached)
~~~

## Item Catalog Summary

~~~json
{
  "generatedAt": "2026-07-12T12:31:02.887Z",
  "source": "data/repoe",
  "bases": 5052,
  "mods": 39292,
  "uniques": 1525,
  "slots": {
    "other": 3887,
    "ring": 123,
    "jewel": 22,
    "weapon": 369,
    "boots": 85,
    "amulet": 58,
    "belt": 17,
    "shield": 111,
    "helmet": 96,
    "body_armour": 124,
    "gloves": 80,
    "flask": 51,
    "quiver": 29
  },
  "modSlots": {
    "weapon": 1633,
    "shield": 802,
    "quiver": 357,
    "helmet": 2326,
    "body_armour": 1646,
    "gloves": 1273,
    "boots": 1026,
    "amulet": 1096,
    "ring": 460,
    "belt": 354,
    "flask": 350,
    "jewel": 89
  },
  "modFamilies": {
    "attributes": 545,
    "uncategorized": 31460,
    "maximum_life": 1088,
    "maximum_energy_shield": 1193,
    "attack_speed": 761,
    "spell_damage": 860,
    "minion": 1343,
    "damage_over_time_multiplier": 514,
    "cast_speed": 780,
    "chaos_resistance": 333,
    "elemental_resistance": 780,
    "critical_multiplier": 495,
    "spell_suppression": 241
  }
}
~~~

## Current Audit Summary

# PoB Data Compatibility Audit

Generated at: 2026-07-12T12:31:03.053Z

## Summary

- Issues: 4
- critical: 0
- high: 0
- medium: 4
- low: 0

## Coverage Notes

- **passive_tree**: 3337 nodes, 780 notables, 353 masteries, 517 ascendancy nodes, 57 jewel sockets audited.
- **repoe**: 39292 mods, 5052 base item records, 774 bench records, 106 essences, 445 fossils, 3 cluster families, 309 cluster notables, 11075 stat translations audited.
- **item_rules**: 11 slot rules, 20 mod categories, 9 archetype item rules, 10 crafting states audited.
- **item_catalog**: 5052 bases, 39292 mods and 1525 uniques indexed for equipment planning.
- **pob_xml_golden**: Full XML golden contract audited with sections Build -> Skills -> Items -> Calcs -> Config -> TreeView -> Import -> Party -> Tree -> Notes and activeSpec 15.

## Findings

### [MEDIUM] TREE_MASTERY_STATS_EMPTY

Area: passive_tree

Mastery choice nodes exist, but the selectable mastery effects are not modeled in this index.

Sample:
- `89:Mine Mastery`
- `240:Lightning Mastery`
- `292:Life Mastery`
- `857:Energy Shield Mastery`
- `1205:Poison Mastery`
- `1215:Evasion and Energy Shield Mastery`
- `2054:Aura Effect Mastery`
- `2510:Critical Chance Mastery`
- `2828:Damage Over Time Mastery`
- `2841:Mana Mastery`
- `3042:Life Mastery`
- `3471:Energy Shield Mastery`

### [MEDIUM] REPOE_MOD_WITHOUT_STATS

Area: repoe

Some RePoE mods have no stats; they cannot directly become PoB numeric affixes.

Sample:
- `LocalAddedPhysicalDamageEssence7`
- `LocalAddedPhysicalDamageTwoHandEssence7`
- `MonsterThornsPhysical1`
- `MonsterThornsElemental1`
- `MonsterThornsPhysical1Large`
- `MonsterThornsElemental1Large`
- `FlaskLevelRequirement7`
- `FlaskLevelRequirement8`
- `FlaskLevelRequirement10`
- `FlaskLevelRequirement14Real_`
- `FlaskLevelRequirement14`
- `FlaskLevelRequirement18`

### [MEDIUM] REPOE_BASE_WITHOUT_NAME

Area: repoe

Base items without names cannot be exported cleanly to readable item text.

Sample:
- `Metadata/Items/Currency/RandomFossilOutcome1`
- `Metadata/Items/Currency/RandomFossilOutcome2`
- `Metadata/Items/Currency/RandomFossilOutcome3`
- `Metadata/Items/Currency/RandomFossilOutcome4`
- `Metadata/Items/Currency/RandomFossilOutcome5`
- `Metadata/Items/Currency/RandomFossilOutcome6`
- `Metadata/Items/Currency/RandomFossilOutcome7`
- `Metadata/Items/Currency/RandomFossilOutcome8`
- `Metadata/Items/Currency/RandomFossilOutcome9`
- `Metadata/Items/Currency/RandomFossilOutcome10`
- `Metadata/Items/Currency/RandomFossilOutcome11`
- `Metadata/Items/Currency/RandomFossilOutcome12`

### [MEDIUM] REPOE_UNIQUE_MODS_INCOMPLETE

Area: repoe

The local uniques export is identity/art-focused; exact unique mods still need PoB or curated unique data before numeric trust.

Sample:
- `Kaom's Primacy`
- `Redbeak`
- `Stone of Lazhwar`
- `Blackheart`
- `Kaom's Sign`
- `Andvarius`
- `Lioneye's Glare`
- `Demigod's Presence`
- `Voll's Protector`
- `Divinarius`
- `Silverbranch`
- `Ephemeral Edge`

## Compatibility Rule

A candidate can be exported as draft XML when it passes local encode/decode/parser checks. It can only be trusted as PoB-valid after Path of Building imports it and returns usable DPS/EHP/requirements without fatal warnings.


## Mandatory Item Checklist

## Mandatory Work Checklist


Run this checklist for every item, jewel, flask, talisman, unique, catalog, optimizer or XML export change. The goal is to prevent strong-looking builds that either import incorrectly into PoB or count stats that are not actually legal.

- [ ] Confirm the item data source: RePoE, PoB import/XML, GGG export, curated local data, or explicit fallback.
- [ ] Confirm the item is a candidate, not final truth, unless it has passed local round-trip and PoB validation.
- [ ] Confirm slot legality: weapon, offhand, shield, quiver, helmet, body armour, gloves, boots, amulet/talisman, ring, belt, flask, regular jewel, abyss jewel or cluster jewel.
- [ ] Confirm base legality: item class, drop level, requirements, base tags and weapon/offhand compatibility.
- [ ] Confirm level legality: character level band, item level, base drop level and mod required level.
- [ ] Confirm rarity behavior: normal/magic/rare generated from affix pools; unique only from fixed unique data or PoB import; talisman treated as special/corrupted-style unless proven otherwise.
- [ ] Confirm affix buckets: implicit, explicit prefix, explicit suffix, crafted, fractured, enchant, eldritch, corrupted and unique-fixed lines are not mixed.
- [ ] Confirm capacity: magic cannot exceed 1 prefix/1 suffix; rare cannot exceed 3 prefixes/3 suffixes; fractured/crafted mods reserve their own legal slots.
- [ ] Confirm mod legality: domain, generation type, spawn tags, mod group conflicts, item level, influence/eldritch/corruption/craft state and base tags.
- [ ] Confirm defensive blockers are solved before luxury DPS: elemental resistance cap, chaos policy, life/ES, attributes, mana/reservation and ailment/flask coverage.
- [ ] Confirm offensive mods match the skill and tree: attack/spell, hit/DoT/ailment, crit/non-crit, minion/totem/trap/mine, weapon style and conversion.
- [ ] Confirm tree coupling: attributes, keystones, masteries, ascendancy behavior, jewel sockets and cluster point budget are reflected before counting item stats.
- [ ] Confirm regular jewels have allocated passive sockets before counting stats.
- [ ] Confirm abyss jewels have abyss socket source before counting stats.
- [ ] Confirm cluster jewels have outer socket, added passive count, connected subgraph and point budget before counting notables.
- [ ] Confirm unique jewels have radius/limit/pair/seed/aura/class constraints validated before counting special effects.
- [ ] Confirm flask assumptions: affixes are legal, ailment removal/avoidance is sourced, and uptime is not claimed as permanent unless PoB/config evidence supports it.
- [ ] Confirm XML safety: item text is produced by exporter/model fields, XML characters are escaped, unsupported generated prose is moved to notes, and required `Items`/`Slot` sections exist.
- [ ] Run `node scripts\build-item-catalog-index.js`.
- [ ] Run `node scripts\audit-pob-data.js`.
- [ ] Run `go test ./...` from `backend`.
- [ ] If possible, import the generated PoB code/XML into Path of Building. If not performed, keep the build below `pob_validated` and say so.

Final rule: when any checklist item is uncertain, add a blocker or warning instead of silently making the item stronger.


## Functional Areas Snapshot

# Functional Additions Candidates

Generated: 2026-07-12 13:31:17 +01:00

These project areas appear reusable enough to feed into existing PoE skills when evidence includes local docs/data/scripts/tests and does not bypass PoB validation.

## item-catalog-index

- Target skill: poe-pob-equipment-optimizer
- Status: complete-enough
- Function: Item catalog indexing from RePoE into slot/family/unique lookup files.
- Evidence:
  - data\item-catalog\index\mods_by_slot.json
  - data\item-catalog\index\summary.json
  - docs\32-phase-10-equipment-catalog-and-optimizer-plan.md
  - scripts\build-item-catalog-index.js

## pob-data-audit

- Target skill: poe-build-analyst
- Status: complete-enough
- Function: Structural audit for passive tree, RePoE, item rules and item catalog coverage.
- Evidence:
  - docs\audits\pob-data-compatibility-audit.md
  - scripts\audit-pob-data.js

## pob-xml-export

- Target skill: poe-pob-xml-golden-exporter
- Status: complete-enough
- Function: PoB XML exporter/parser/codec and golden export gate.
- Evidence:
  - backend\xml-engine\codec.go
  - backend\xml-engine\exporter.go
  - backend\xml-engine\parser.go
  - docs\31-pre-pob-xml-export-checklist.md

## passive-tree-planner

- Target skill: poe-build-analyst
- Status: complete-enough
- Function: Trusted passive tree graph loading, connectivity checks, URL encoding and planner tests.
- Evidence:
  - backend\passive-tree-engine\ascendancy.go
  - backend\passive-tree-engine\ascendancy_test.go
  - backend\passive-tree-engine\budget.go
  - backend\passive-tree-engine\graph.go
  - backend\passive-tree-engine\graph_test.go
  - backend\passive-tree-engine\planner.go
  - backend\passive-tree-engine\planner_test.go
  - data\passive-tree\index\summary.json
  - scripts\build-passive-tree-index.js

## jewel-cluster-contract

- Target skill: poe-jewel-cluster-specialist
- Status: complete-enough
- Function: Jewel sockets, cluster jewel data and blockers for unvalidated jewel effects.
- Evidence:
  - data\passive-tree\index\jewel_sockets.json
  - docs\22-phase-9-item-affix-jewel-resolver.md

## build-generator-item-normalization

- Target skill: poe-pob-equipment-optimizer
- Status: complete-enough
- Function: Generated build gear normalization and RePoE resolver integration.
- Evidence:
  - backend\build-generator\wizard.go
  - backend\build-generator\wizard_test.go
  - backend\poe-data\repoe_resolver.go

## poe-ninja-import

- Target skill: poe-build-analyst
- Status: complete-enough
- Function: poe.ninja/GGG character import evidence for real builds and item sets.
- Evidence:
  - backend\poe-ninja-adapter\extract.go
  - backend\poe-ninja-adapter\ninja.go
  - backend\poe-ninja-adapter\ninja_test.go
  - backend\services\importer.go

## skill-refresh-automation

- Target skill: poe-build-analyst
- Status: complete-enough
- Function: Codex skill feed refresh wrapper and recurring research prompt.
- Evidence:
  - scripts\refresh-codex-poe-skills.ps1

