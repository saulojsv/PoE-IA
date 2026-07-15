# Six-Hour PoE Skill Research Prompt

Use this prompt in scheduled Codex runs after reading the local skills:

Refresh IA - PoE 1 equipment knowledge for Path of Exile 1 and Path of Building. Search current evidence for:

- Path of Building item XML/import behavior.
- RePoE/static data changes.
- Rare affix and item-level legality.
- Bench, essence, fossil, eldritch, influenced, fractured and corrupted crafting states.
- Unique item and unique jewel behavior.
- Cluster jewels and notables.
- Timeless/radius jewels.
- Flask affixes and uptime assumptions.
- Talismans and amulets.
- poe.ninja meta/price evidence, treated only as market evidence.

Priority order:

1. Local project data and tests.
2. Path of Building source/data.
3. GGG official/static exports.
4. RePoE/forked static exports.
5. poe.ninja market/meta data.
6. Community explanations only for notes.

Do not promote web claims into structural truth unless they become local data, a test, or a documented blocker. Preserve PoB XML/golden-template importability as the highest priority.

After the local refresh, inspect `references/functional-additions-candidates.md` and update existing skills when a candidate is complete, reusable, and validated. Inspect `references/new-skill-candidates.md`; create and fill a new skill with `$skill-creator` only when the new area is recurring, stable, and too large for an existing skill.
