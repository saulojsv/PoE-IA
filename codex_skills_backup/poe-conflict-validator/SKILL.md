---
name: poe-conflict-validator
description: Validate Path of Exile 1 skill records, classify evidence, score confidence, and resolve conflicting claims. Use before saving current facts, builds, interactions, prices, or support compatibility.
---

# PoE Conflict Validator

For detailed checks, read `references/validation-matrix.md`.
For rule precedence, use `C:\Users\saulo\Documents\Agente - PoE\docs\POE_ADVANCED_RULES_PRECEDENCE_BASE.md`.

Validate before publishing data as current.

Required checks:
- Every current skill has at least one source and patch.
- No empty source URLs.
- No build references removed skills.
- Support compatibility has justification and source.
- Required items have sources.
- Build patch is compatible with skill patch.
- No RAG chunk mixes patches.
- No price is permanent.
- No opinion is marked as official fact.

Confidence baseline:
- Official current: 0.98
- Current game data: 0.97
- Maintained technical source: 0.93
- Updated referenced wiki: 0.90
- Validated PoB: 0.90
- Current recognized creator: 0.82
- Community consensus: 0.72
- Isolated post: 0.45
- Unsourced comment: 0.20

Conflict rule: preserve all claims, compare source rank, date, patch, evidence, and reproducibility. If unresolved, set `status: conflicted` and `resolution: null`.
