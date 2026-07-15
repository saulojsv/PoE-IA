# Tree Training

Use this for route dataset generation and tree model targets.

## Required Row Fields

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
- `label`

Keep `stateFeatures` fixed-size at 64 floats unless versioning the feature schema.

## Labels

Include:

- connected legality;
- passive budget legality;
- ascendancy legality;
- mastery legality;
- route quality tier;
- pathing efficiency;
- value density;
- archetype coherence;
- defense/offense floor;
- overtravel and role mismatch risk;
- XML/export success.

Invalid rows are useful negative examples when labeled clearly.
