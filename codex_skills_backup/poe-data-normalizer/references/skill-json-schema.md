# Skill JSON Schema Rules

Each skill file must be independent and patch-aware.

Use arrays for repeatable facts:
- `sources`
- `claims`
- `conflicts`
- `support_relationships`
- `gem_links`
- `item_synergies`
- `passives_ascendancies`
- `builds`
- `guides`
- `market_usage`
- `patch_changes`

Use explicit status:
- `current`
- `likely_current`
- `needs_review`
- `outdated`
- `broken`
- `unverified`
- `conflicted`

Do not delete older patch facts. Add a new patch-scoped entry and mark old facts as old or historical.

Normalize IDs:
- skill: `skill:{snake_case_name}`
- support: `support:{snake_case_name}`
- item: `item:{snake_case_name}`
- passive: `passive:{snake_case_name_or_id}`
- build: `build:{skill_id}:{source_slug}:{patch}`
