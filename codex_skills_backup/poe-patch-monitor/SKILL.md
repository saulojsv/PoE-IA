---
name: poe-patch-monitor
description: Detect Path of Exile 1 patch or league changes, snapshot prior data, diff affected entities, and queue skill reprocessing. Use when Codex checks official updates or migration impact.
---

# PoE Patch Monitor

Check official announcements, patch notes, balance manifestos, gem changes, passive tree, items, ascendancies, crafting, bosses, and league changes.

On new patch:
1. Create snapshot under `data/snapshots/`.
2. Preserve old data.
3. Diff changed entities.
4. Queue affected skills/builds/items first.
5. Mark builds `current`, `likely_current`, `needs_review`, `outdated`, or `broken`.
6. Invalidate affected RAG chunks/embeddings.
7. Write `data/reports/patch_diff.md`.

Never overwrite prior patch facts. Add new patch-scoped records.
