# New Skill Candidates

Generated: 2026-07-12 13:31:17 +01:00

Create a new skill only when an area is recurring, stable, has local docs/scripts/data, and would bloat an existing skill.

## poe-import-training-curator

- Status: ready-to-create-if-needed
- Trigger: Recurring ingestion of pobb.in, poe.ninja, PoB XML and project learning datasets.
- Evidence area: poe-ninja-import
  - backend\poe-ninja-adapter\extract.go
  - backend\poe-ninja-adapter\ninja.go
  - backend\poe-ninja-adapter\ninja_test.go
  - backend\services\importer.go

## poe-codex-skill-maintainer

- Status: ready-to-create-if-needed
- Trigger: Recurring maintenance of Codex skills, skill feeds, automation outputs and project-to-skill distillation.
- Evidence area: skill-refresh-automation
  - scripts\refresh-codex-poe-skills.ps1

