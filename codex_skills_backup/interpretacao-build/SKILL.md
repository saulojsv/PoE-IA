---
name: interpretacao-build
description: Interpret Path of Exile 1 builds from local PoB XML exports, normalized poe.ninja datasets, passive tree data, gem/support compatibility, items, defenses, DPS metrics, and build archetype patterns. Use when Codex needs to explain how a build is formed, learn from extracted builds, compare archetypes, infer why classes/ascendancies/skills/items/passives are combined, generate build-learning notes, or guide a local offline PoE build agent.
---

# Interpretacao Build

## Workflow

1. Prefer local evidence before web: read `C:\Users\saulo\Documents\Agente - PoE\local_poe_learning_dataset`.
2. Read `references/build-interpretation-logic.md` before interpreting or teaching build logic.
3. For each build, identify: main skill, class/ascendancy role, delivery method, damage scaling, defensive layers, reservation/aura setup, item dependencies, passive-tree route, notables, masteries, jewels/clusters, flasks, and PoB config assumptions.
4. Explain why each important node, mastery, notable, item, and gem group was chosen. Tie every choice to a mechanic: damage, defense, resource, requirement, ailment, recovery, speed, uptime, or enabling condition.
5. Compare against similar local builds before answering broad questions about formation logic.
6. Separate fact from inference. Fact comes from XML/JSON/indexes; inference is build reasoning.
7. Do not invent legality. If a support/item/passive interaction is uncertain, mark as needs validation in PoB or local game data.

## Local Dataset

Use:

```text
C:\Users\saulo\Documents\Agente - PoE\data\local_poe_learning_dataset
```

Prefer the interpreted knowledge base when it exists:

```text
C:\Users\saulo\Documents\Agente - PoE\data\local_poe_build_knowledge
```

Key interpreted files:

- `build_knowledge.jsonl`: one compact learning note per build.
- `build_notes/*.json`: detailed interpreted facts per build.
- `skill_rules.json`: patterns by main skill.
- `class_index.json`: builds by class.
- `ascendancy_index.json`: builds by ascendancy.
- `forum_rules.json`: forum-derived build logic rules.

Key files:

- `builds.jsonl`: normalized build facts.
- `xml/*.xml`: full PoB XML exports.
- `skill_to_builds.json`: skill archetypes.
- `class_to_builds.json`: base-class patterns.
- `ascendancy_to_builds.json`: ascendancy patterns.
- `item_to_builds.json`: item dependency patterns.
- `passive_to_builds.json`: passive-node reuse.
- `support_to_main_skills.json`: support-gem pairings.

## Output Rules

When asked to interpret a build, return:

1. Build identity: class, ascendancy, main skill, role/archetype.
2. Formation logic: why the class, ascendancy, skill, supports, items, notables, masteries, tree path, and defenses fit.
3. Evidence: cite local files or XML build id when possible.
4. Risks/gaps: invalid assumptions, missing config, weak defenses, PoB-only artifacts.

Keep answers concise unless the user asks for full audit.
