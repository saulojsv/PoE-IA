# Tree And Ascendancy Combinations

Use this when generating passive tree, ascendancy, mastery or jewel-socket training examples.

## Non-Negotiable Legality

- Tree starts at selected class start.
- Every selected main-tree node must be connected.
- Passive budget cannot exceed configured level budget.
- Ascendancy points use separate ascendancy budget.
- Ascendancy nodes must belong to the selected ascendancy.
- Unknown node IDs and wrong tree-version nodes are illegal.
- Mastery effects require valid mastery context.
- Jewel sockets count only as potential unless a valid jewel/item layer supplies the jewel.

## Stateful Fields

Tree route examples should include:

- `nodeIds`
- `lockedNodeIds`
- `checkpointNodeIds`
- `extensionNodeIds`
- `initialExtensionNodeIds`
- `remainingBudget`
- `stateFeatures`
- `routeState`
- `trainingRuleLabels`
- `routeMetrics`
- `advancedRouteMetrics`
- `nextBestNodeIds`
- `className`
- `recommendedAscendancy`
- `ascendancyFitScore`
- `budgetStage`
- `progressiveBudgets`
- `label`

Keep `stateFeatures` fixed-size at 64 floats unless the model/schema version changes.

If the row is meant for the current phase-1 dashboard runtime, keep those field names stable so the runtime manifest and scorer path do not need ad hoc adapters.

## Metrics

Include:

- pathing efficiency;
- value density;
- travel node count;
- notable/mastery/keystone/jewel counts;
- offense/defense/utility shares;
- archetype coherence;
- risky keystone context;
- overtravel/glass-cannon/low-damage/role-mismatch risks;
- ascendancy fit score.

## Negative Examples

Include:

- disconnected trees;
- over-budget trees;
- invalid ascendancy paths;
- invalid mastery selections;
- long travel with weak payoff;
- skill-incoherent clusters;
- XML-broken candidates.

Do not let the neural model repair legality by guessing. Deterministic validators win.

The future scorer may rank legal route continuations, but it must not invent fresh node IDs outside the validated candidate set.
