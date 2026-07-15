# Dataset Contract

Use this for JSONL rows, manifests, labels and model target design.

## Required Row Sections

Every complete build-combination row should have:

- `id`
- `request`
- `tree`
- `gems`
- `items`
- `config`
- `validation`
- `metrics`
- `label`

Tree-only rows may omit full `items` and `gems`, but must explicitly set scope fields such as `itemsIncluded=false` and `metricScope=passive_tree_and_ascendancy_only`.

For the current phase-1 dashboard runtime, each tree-route row should also preserve the stateful route payload expected by the local trainer/runtime handoff:

- `nodeIds`
- `lockedNodeIds`
- `checkpointNodeIds`
- `extensionNodeIds`
- `remainingBudget`
- `stateFeatures` with 64 values
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

If a row is derived from dashboard error reports, also preserve:

- `feedbackIssues`
- `feedbackReportPath`
- `feedbackSavedAt`
- `rankingReview`
- `reportSource`

## Required Validation Fields

- `legalConnectedTree`
- `legalPassiveBudget`
- `legalAscendancy`
- `legalMasteries`
- `legalTreeVersion`
- `supportGemsCompatible`
- `itemAffixesLegal`
- `configSourcesPresent`
- `xmlExportOk`
- `roundTripOk`
- `pobValidated`
- `xmlGoldenProfile`
- `xmlStructureCompatible`
- `activePointersResolved`
- `blockers`
- `warnings`

## Labels

Use multi-task labels:

- final deterministic score;
- tree value score;
- support setup score;
- item feasibility score;
- config realism score;
- legality targets;
- XML success target;
- coherence score;
- novelty bucket;
- overfit signature penalty.

For dashboard feedback-derived rows:

- keep issue-derived labels negative-only;
- keep `rankingReview.improved` as comparison metadata, not as a positive issue label;
- preserve `category`, `reason`, `severity`, `count` and signed `weight` from the local report so later training can separate ranking feedback from legality truth.

## Sampling Mix

Recommended training mix:

- 40% valid strong/medium candidates.
- 20% valid weak but legal candidates.
- 15% legality failures.
- 10% XML failures.
- 10% skill/coherence failures.
- 5% novelty/adversarial edge cases.

Keep rejected candidates with clear failure reason. The model needs to learn why bad combinations are bad.

## Manifest

Each dataset output needs:

- `createdAt`
- `game`
- `treeVersion`
- `pipelinePhase`
- `trainingPhase`
- `optimizerPhase`
- `rulesVersion`
- `featureSchemaVersion`
- `rowCount`
- generation parameters
- source data paths/hashes when available
- validation summary

If the dataset is intended to feed the current phase-1 runtime, the exported model artifacts and manifest must remain compatible with:

- `exports/models/model_manifest.json`
- `exports/models/poe1_graphsage_tree_search_v001.pt`
- `exports/models/poe1_path_transformer_v001.pt`
- `exports/models/poe1_precomputed_node_embeddings_v001.pt`

The manifest should provide `stateFeatureDim=64`. If a legacy writer omits it, `dims.stateDim=64` is the only accepted fallback.

For complete PoB rows, set `xmlGoldenProfile=full_pob_3_28_penance_brand_reference` or the current profile name generated from `docs/pob_full_xml_golden_contract.json`. Tree-only rows must use a tree-only profile and cannot claim complete-build metrics.
