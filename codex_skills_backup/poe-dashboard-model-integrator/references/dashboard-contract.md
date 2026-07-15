# Dashboard Contract

Use this when changing optimizer API requests/responses or frontend candidate display.

## Phase 1 Runtime Boundary

For the current tree-only phase:

- expose only class, ascendancy, main skill, objective, simple defense focus, damage mode, point budget, ascendancy budget and depth preset;
- translate `Rapido`, `Equilibrado`, `Profundo` into internal search knobs in the frontend/backend contract;
- do not expose raw `beamWidth`, `searchPasses`, `stateFeatures`, `noveltyWeight` or score weights as user-facing controls;
- report readiness for required local files separately from optional trained-model artifacts.
- gate the generate action behind a preflight checklist: required files ready, class fixed, valid ascendancy, real PoE 1 skill, legal passive/ascendancy budgets and chosen depth preset.

## Request Fields

Recommended fields:

- game;
- className;
- ascendancy;
- mainSkill;
- objective;
- routePolicy;
- routeRisk;
- contentTarget;
- budgetTier;
- pointBudget;
- ascendancyBudget;
- constraints;
- search preset/budgets.

For phase 1 tree runtime, keep these request fields stable:

- `className`
- `ascendancy`
- `mainSkill`
- `objective`
- `defenseFocus`
- `skillElement`
- `damageStyle`
- `pointBudget`
- `ascendancyBudget`
- `creativeMode`
- depth preset mapped to internal search values

Current endpoints:

- `POST /api/combinatorial/tree-candidates`
- `GET /api/combinatorial/readiness`
- `POST /api/feedback/build-error-report`
- `POST /api/local-pob/import`

## Response Fields

Each response should include:

- job/candidate ID;
- validation state;
- blocker and warning codes;
- model metadata;
- tree node IDs and URL status;
- skill/gem assumptions;
- item assumptions;
- XML/PoB status;
- explanation.

If model runtime exists, include:

- `model.enabled`
- `model.runtime`
- `model.modelVersion`
- `model.treeVersion`
- `model.featureSchema`
- `model.stateFeatureDim`
- `model.fallbackUsed`
- `model.status`
- `model.warnings`

For readiness/status endpoints, include:

- `ready`
- `modelReady`
- `metadata`
- required file checks for local phase-1 runtime inputs;
- optional file checks for trained artifacts;
- manifest compatibility status, not just file existence.

The current readiness payload should stay shaped like:

- `ready`: all required local files exist.
- `modelReady`: optional trained artifacts all exist.
- `metadata`: same schema used by candidate responses for runtime/fallback state.
- `checks[]`: `id`, `label`, `path`, `required`, `exists`, `status`.

Current required checks should cover at least:

- `data/passive-tree/tree-3_28.json`
- `data/passive-tree/index/nodes.json`
- `data/passive-tree/index/connections.json`
- `data/passive-tree/index/ascendancy_nodes.json`
- `knowledge/skills.json`
- `data/repoe/gems.json`

Optional model checks should cover at least:

- `exports/models/model_manifest.json`
- `exports/models/poe1_graphsage_tree_search_v001.pt`
- `exports/models/poe1_path_transformer_v001.pt`
- `exports/models/poe1_precomputed_node_embeddings_v001.pt`

Model metadata/status should distinguish:

- manifest missing;
- manifest ready but runtime pending;
- tree version mismatch;
- feature schema/state dimension mismatch;
- deterministic fallback active.

UI rule:

- render the current runtime badge/status from readiness metadata on initial load;
- do not wait for `POST /api/combinatorial/tree-candidates` to show fallback or manifest-mismatch state;
- use candidate-level `model` metadata only as run-specific confirmation.

## Feedback Loop Contract

When the dashboard captures post-import user feedback, keep it explicit and typed:

- send `feedbackIssues` with `id`, `label`, `count`, `severity`, `polarity`, `weight` and optional `lastNotes` inside `POST /api/combinatorial/tree-candidates`;
- preserve `feedbackIssues` as negative-only ranking hints; `rankingReview.improved=true` stays separate metadata and must not create positive error weights;
- keep saved report issues richer than the next-request hint payload when the UI has them available: include `category` and `reason` in `POST /api/feedback/build-error-report`;
- keep `feedbackIssues` as ranking hints only; they must not suppress deterministic blockers or promote a candidate to validated;
- save human review artifacts through `POST /api/feedback/build-error-report`;
- preserve the local report path `history/feedback/phase1-error-reports` as an operator-facing export, not as hidden model state;
- save `phase1-error-feedback.jsonl` and `phase1-error-feedback-latest.txt` immediately after the user records an issue or ranking review;
- keep the dashboard `Erros` tab focused on concrete PoB-observed failures such as wrong mastery, wrong ascendancy, elemental scaling on chaos/DoT, route spread, reservation/resource misses and missing defenses.

For local PoB handling:

- `POST /api/local-pob/import` may copy/open the current PoB code through the local helper for faster manual validation;
- helper launch is convenience only; real PoB confirmation still decides whether a candidate reaches `pob_validated`.

For operator access:

- temporary `trycloudflare` and LAN URLs are transport helpers for the local dashboard;
- show them separately from readiness/model badges;
- never treat remote reachability as proof that the generated candidate passed XML or PoB gates.

## Progress Phases

- skill contracts;
- target clusters;
- route generation;
- tree scoring;
- ascendancy scoring;
- mastery selection;
- dedupe and Pareto;
- XML build;
- XML round-trip;
- ranking.

Do not let the ranking phase invent node IDs. Ranking happens only after deterministic legal candidate generation.
