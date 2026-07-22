# Continuous learning loop

## Minimum persisted state

Keep one append-only Markdown or JSONL record per experiment. Store the PoB export/checkpoint separately when possible. Never overwrite the baseline.

## Promotion policy

- `confirmed`: observed in at least two controlled comparisons or directly supported by deterministic graph/PoB output.
- `partially_confirmed`: works only under named conditions; keep the conditions attached.
- `refuted`: remove from ranking and preserve as a negative example.
- `inconclusive`: do not use for optimization; queue a retest with one variable changed.
- `stale`: invalidate when patch, PoB version, tree data, or configuration changes.

## Token-efficient retrieval

Load only the current baseline, active frontier, rules matching the current skill/tag/region, and the last few failures. Search the full archive by node ID, notable name, mechanic, error code, or experiment ID instead of reading it all.

## Safe learning

Do not learn from an illegal/disconnected tree, fake uptime, accidental configuration change, missing item, or unverified web claim. Store the failure because it prevents repeated work, but do not promote it into a positive rule.
