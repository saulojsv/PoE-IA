# Model Safety

Use this when wiring trained models into dashboard behavior.

## Required Fallbacks

- If model is missing, use heuristic optimizer.
- If model tree version mismatches local tree, block model mode.
- If model feature schema or state-feature dimension mismatches phase-1 expectations, block model mode.
- If confidence is low, return conservative candidates.
- If XML gate fails, candidate cannot be final.
- If blockers exist, candidate is not optimized.
- If manifest is valid but scorer runtime is still absent, report runtime pending and keep deterministic fallback active.

## Candidate Lifecycle

```text
generated
  -> structurally_valid
  -> model_scored
  -> pareto_kept
  -> xml_built
  -> xml_roundtrip_ok
  -> dashboard_returned
```

The model-scored step may only rank or reorder candidates that already passed legality filters. It must not generate arbitrary node IDs, skip class/ascendancy validation, or bypass round-trip gates.

## Anti-Overfit Signals

Penalize:

- repeated meta template without objective-specific reason;
- high confidence with weak deterministic score;
- repeated supports across unrelated skills;
- repeated unique dependencies across impossible budgets;
- strong DPS with missing defense/resource gates.
