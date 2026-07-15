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

