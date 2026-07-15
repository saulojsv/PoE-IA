---
name: poe-passive-tree-planner
description: Plan, validate, repair, or train Path of Exile 1 passive tree and ascendancy graph logic for IA - PoE 1. Use when Codex works on passive tree node IDs, GGG/PoB tree data, route connectivity, class starts, ascendancy paths, mastery effects, jewel sockets, cluster socket budgeting, official passive tree URLs, tree dataset generation, route scoring, or blockers involving disconnected/over-budget/wrong-version tree candidates.
---

# PoE Passive Tree Planner

## Core Rule

Treat the passive tree as a graph, never as a loose list of node IDs. A target node is legal only when the selected class start, full connecting path, point budget, tree version, ascendancy budget, mastery context and official URL/export state all agree.

## Project Location

Use:

```text
C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1
```

Read relevant files before tree work:

- `docs/07-passive-tree-graph-map.md`
- `docs/20-phase-7-passive-tree-graph-validation-plan.md`
- `docs/21-phase-8-passive-tree-resolver-checklist.md`
- `docs/28-tree-dataset-stateful-generation-rules.md` for dataset route rows
- `docs/audits/pob-data-compatibility-audit.md` for current tree coverage gaps
- `data/passive-tree/index/summary.json`
- `backend/passive-tree-engine/ascendancy.go`
- `backend/passive-tree-engine/ascendancy_test.go`
- `backend/passive-tree-engine/budget.go`
- `backend/passive-tree-engine/graph.go`
- `backend/passive-tree-engine/graph_test.go`
- `backend/passive-tree-engine/planner.go`
- `backend/passive-tree-engine/planner_test.go`
- `scripts/build-passive-tree-index.js`
- `data/passive-tree/index`

## Reference Routing

- For route legality, read `references/tree-legality.md`.
- For dataset/training rows, read `references/tree-training.md`.

## Workflow

1. Load the trusted tree graph from local GGG/PoB-derived data.
2. Normalize class and ascendancy before planning.
3. Generate path segments through graph search, not Euclidean guesses.
4. Validate connectivity after every add/remove/mutation.
5. Keep main passive points and ascendancy points as separate budgets.
6. Validate mastery effects only with legal mastery node context.
7. If the local index exposes mastery choice nodes but not selectable mastery stats, keep the mastery effect blocked instead of inventing the bonus.
8. Treat jewel sockets as potential until the item/jewel layer validates a jewel.
9. Export official tree URL and parse/round-trip before final confidence.

## Blockers

Block or heavily penalize:

- unknown node IDs;
- wrong tree version;
- disconnected nodes;
- passive budget exceeded;
- ascendancy node in main tree budget;
- invalid ascendancy/class pairing;
- mastery effect without valid node/context;
- `TREE_MASTERY_STATS_EMPTY` when the local tree index has the mastery shell but not the effect stats;
- cluster jewel stats without socket and point budget;
- official URL missing when final export requires it.
