---
name: poe-codex-skill-maintainer
description: Run recurring PoE skill-feed hygiene, reconcile local candidate evidence, and update skill references only when backed by docs, data, scripts, and tests.
---

# PoE Codex Skill Maintainer

## Core Rule

Keep skill knowledge updates deterministic:

- only apply changes from local feeds and local project evidence;
- do not promote candidate behavior into structural truth without parser/tests/blocker checks;
- never edit project runtime files when only skill knowledge is being updated.

## Refresh Workflow

1. Run `scripts\refresh-codex-poe-skills.ps1`.
2. Reconcile candidate files:
   - `poe-functional-additions-candidates.md` (merge complete candidates into existing skill references/SKILLs);
   - `poe-new-skill-candidates.md` (create new skills only if recurring, stable, and too large for existing ones).
3. For any updated skill, keep edits scoped to actionable, reusable workflow evidence.
4. If no project files changed, run `scripts\quick_validate.py` on each edited skill folder.

## Evidence Sources

- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\scripts\refresh-codex-poe-skills.ps1`
- `C:\Users\saulo\.codex\skills\poe-functional-additions-candidates.md`
- `C:\Users\saulo\.codex\skills\poe-new-skill-candidates.md`

## Validation Discipline

Treat blocked/unverified candidates as notes only.
Record concrete blockers with codes and keep PoB/XML/learned statements separate from local project truth.
