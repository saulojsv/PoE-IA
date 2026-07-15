---
name: poe-build-analyst
description: Analyze Path of Exile 1 Path of Building builds, PoB XML/export codes, poe.ninja/pobb.in references, skill-gem ideas, DPS/defense scaling, passive tree routes, items, jewels, flasks, configuration assumptions, and build viability. Use when Codex is asked to create, audit, compare, optimize, learn from, or reformulate PoE 1 builds using PoB, DeepSeek, poe.ninja, Craft of Exile, PoEDB, or local IA - PoE 1 project data.
---

# PoE Build Analyst

Use this skill for Path of Exile 1 build work where correctness depends on PoB mechanics, not generic build advice.

## Core Rule

Treat every build as a coupled system:

- skill gem tags and mechanical behavior;
- support gems and whether they scale the correct damage component;
- main skill configuration and realistic conditions;
- passive tree pathing, masteries, ascendancy and jewel sockets;
- item bases, affixes, uniques, jewels, flasks and craft availability;
- offensive metrics, defensive metrics, reservation, mana cost, attributes and warnings.

Never evaluate DPS or viability from one layer alone.

## Project Location

Use this project folder unless the user says otherwise:

```text
C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1
```

Read these files before changing build logic:

```text
docs/00-project-operating-guide.md
docs/25-ggg-first-data-source-architecture.md
docs/31-pre-pob-xml-export-checklist.md
docs/audits/pob-data-compatibility-audit.md
backend/handlers/import.go
backend/services/importer.go
backend/services/pob_codec.go
backend/services/pob_parser.go
scripts/audit-pob-data.js
scripts/refresh-codex-poe-skills.ps1
backend/poe-ninja-adapter/extract.go
backend/poe-ninja-adapter/ninja.go
backend/poe-ninja-adapter/ninja_test.go
```

For tree topology and legality checks, also read:

- `backend/passive-tree-engine/ascendancy.go`
- `backend/passive-tree-engine/ascendancy_test.go`
- `backend/passive-tree-engine/budget.go`
- `backend/passive-tree-engine/graph.go`
- `backend/passive-tree-engine/graph_test.go`
- `backend/passive-tree-engine/planner.go`
- `backend/passive-tree-engine/planner_test.go`

When analyzing PoB learning examples, also read:

```text
references/pob-analysis-workflow.md
references/import-evidence-workflow.md
references/research-refresh.md
```

## Workflow

1. Identify the user's requested skill, element/damage fantasy, budget, class, league and target content.
2. Load local gem catalog when available:

```text
data/gem-catalog/active_skill_gems.json
data/gem-catalog/support_gems.json
data/gem-catalog/skill_options_by_tag.json
```

3. Match the skill by exact name or close variants, including transfigured and Vaal versions.
4. Read the skill tags, requirements, granted effect ID and likely scaling families.
5. Build at least three candidate archetypes when plausible:
   - direct/original scaling;
   - conversion or ailment variant;
   - meta/stronger alternative if the requested fantasy is weak.
6. For each candidate, state the damage pipeline:
   - base damage source;
   - conversion or ailment creation;
   - increased/more multipliers;
   - resistance/penetration/exposure/wither/curse;
   - attack/cast rate or hit frequency;
   - crit, non-crit, DoT, poison, ignite, bleed, minion or trigger dependencies.
7. Validate assumptions against PoB data, the current local audit, and existing learning examples.
8. During recurring maintenance, run `scripts\refresh-codex-poe-skills.ps1` and only absorb candidate updates with local data evidence + tests.
9. Generate or modify PoB XML only after the mechanical plan is coherent.
10. Treat PoB warnings as blockers until explained or fixed.

## PoB Analysis Requirements

When the user uploads a PoB, pasted code, pobb.in link, or poe.ninja/GGG build:

1. Follow the live project import path:
   - raw XML or PoB code: `backend/handlers/import.go` -> `backend/services/pob_parser.go` and `backend/services/pob_codec.go`;
   - `pobb.in` URL: `backend/services/importer.go`;
   - `poe.ninja` or public GGG character URL: `backend/poe-ninja-adapter/ninja.go` and `backend/services/importer.go`.
2. Summarize:
   - main skill and supports;
   - enabled skill group used for calculations;
   - config assumptions;
   - item affix families;
   - tree/pathing/jewel socket usage;
   - defensive layers;
   - warnings and suspicious assumptions.
3. Explain where DPS comes from.
4. Explain where EHP/max hit/sustain come from.
5. Compare the imported artifact against the user's desired build idea.
6. Record source provenance, validation state and blocker codes before treating the build as learning evidence.
7. Store the analysis in `data/pob-learning/` only after the imported artifact and your notes agree on what is still heuristic versus PoB-validated.

For poe.ninja/GGG imports, treat character-window data and extracted PoB code as evidence, not proof. Keep the build below `pob_validated` until Path of Building itself confirms usable calculations and no fatal warnings.

## Local Audit Downgrade Rules

- If a build depends on a mastery effect that is not modeled in the local tree index, keep `TREE_MASTERY_STATS_EMPTY` and treat the mastery-derived scaling as heuristic.
- If a build depends on exact unique-item numeric mods that are still unresolved in local `data/repoe/uniques.json`, keep `REPOE_UNIQUE_MODS_INCOMPLETE` or `ITEM_UNIQUE_MODS_UNRESOLVED` and treat the unique as identity evidence only.
- Do not promote either case into structural truth until PoB or curated project data confirms the numbers.

## Hard Blocks

Do not call a build viable if any critical warning remains:

- main skill cannot be used because of mana;
- attributes do not meet gem/item requirements;
- hit chance is too low for attack ailment builds;
- elemental resistances are not capped for mapping;
- chaos resistance is dangerously low for the stated content;
- tree nodes are not connected;
- PoB uses fake conditions the build cannot sustain;
- jewels are listed but not socketed;
- unique or influenced item is assumed in SSF low budget without an alternative.

## DeepSeek Prompting Rule

When asking DeepSeek to build or reformulate a build, include:

- exact skill gem options from the local catalog;
- allowed damage fantasies;
- target content and budget;
- PoB learning examples relevant to the same skill/tag/archetype;
- explicit instruction to output alternatives, failure modes and confidence level;
- explicit instruction to justify every DPS and defense source.

DeepSeek output is a draft. PoB validation wins.
