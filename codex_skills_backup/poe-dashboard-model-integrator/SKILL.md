---
name: poe-dashboard-model-integrator
description: Integrate Path of Exile 1 optimizer models, combinatorial search, backend APIs, jobs, runtime manifests, readiness gates, validation states, explanations, and frontend dashboard UX for IA - PoE 1. Use when Codex works on dashboard optimization tabs, model-guided search, API response contracts, progressive candidate jobs, model metadata, runtime fallback/readiness status, validation status display, DeepSeek/Gemini guidance panels, or safe handoff from heuristic candidates to model-ranked PoB candidates.
---

# PoE Dashboard Model Integrator

## Core Rule

The dashboard must show validation truth, not model confidence theatre. A model can rank candidates, but the backend validators and PoB/XML gates decide what can be promoted.

## Project Location

Use:

```text
C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1
```

Read relevant files:

- `docs/30-dashboard-model-integration-map.md`
- `docs/34-phase-1-dashboard-training-runtime-contract.md`
- `docs/35-dashboard-error-feedback-loop.md`
- `docs/36-phase-1-feedback-learning-final-logic.md`
- `docs/40-colab-training-execution-sequence.md`
- `docs/43-dashboard-model-output-integration.md`
- `docs/44-colab-drive-execution-order.md`
- `docs/47-dashboard-item-model-runtime-error.md`
- `docs/26-colab-model-training-architecture.md`
- `docs/02-dashboard-ai-guidance-deepseek.md`
- `docs/12-phase-1-dashboard-hardening.md`
- `frontend/src/components/BuildOptimizer.tsx`
- `frontend/src/components/CombinatorialOptimizer.tsx`
- `frontend/src/services/api.ts`
- `frontend/vite.config.ts`
- `backend/passive-tree-optimizer`
- `backend/model-runtime`
- `backend/model-runtime/manifest.go`
- `backend/api`
- `data/item-rules/training-requirements.json`
- `scripts/assemble-training-output.py`

## Reference Routing

- For API/job contracts, read `references/dashboard-contract.md`.
- For model integration safety, read `references/model-safety.md`.

## Workflow

1. Normalize the dashboard request into a build/skill/tree/item/config contract.
2. Load runtime readiness before generation, use its metadata immediately in the UI, and keep project-required files separate from optional trained-model artifact status.
3. Generate candidates in backend jobs with progress snapshots.
4. Use models for ranking and search guidance only.
5. Run deterministic validators before returning final candidates.
6. Show validation state per candidate: heuristic, XML pending, XML ok, PoB pending, PoB validated, blocked.
7. Surface runtime readiness separately from candidate quality: required files, tree model artifacts, optional item model artifacts, unified-output packaging status, manifest compatibility and fallback status.
8. Interpret readiness in two layers: `ready` covers required project/runtime prerequisites, while `modelReady` covers optional trained artifacts and can still fall back deterministically.
9. Include model version, tree version, feature schema, state-feature dimension, confidence, fallback status and blocker list.
10. Keep explanations grounded in actual candidate data and validation outputs.
11. Preserve post-import error feedback as a separate local learning signal: send typed `feedbackIssues` into the next tree request, keep the error tree negative-only, save structured reports through the feedback endpoint, and never confuse this with deterministic validation truth.
12. Keep `rankingReview` as comparison metadata outside the error tree: it may say whether the new ranking improved, but it does not convert a candidate into validated or create positive error weights.
13. Treat local PoB import helpers such as `/api/local-pob/import` as operator convenience only; they do not change runtime readiness or candidate quality.
14. When `POE_MODEL_DIR` points at `exports/training_output/poe1_optimizer_v001`, treat `optimizer_training_output_manifest.json` and `contracts/item_training_requirements.json` as operator/runtime metadata, not as proof that candidates are validated.
15. Treat `POST /api/combinatorial/item-combinations` as the current tree-plus-items handoff: the backend may generate deterministic preview gear, combine it into XML, and still remain below model-validated or PoB-validated status.
16. Distinguish item-model artifacts from item-model runtime: `item_model_manifest.json` and `poe1_item_ranker_v001.pt` may exist while `metadata.runtime` is still `deterministic-fallback` and `fallbackUsed=true`.

## UI Rules

- Do not label a candidate as optimized unless it passed configured gates.
- Show blockers and warnings near the candidate, not hidden in logs.
- Prefer progressive results with clear status over waiting silently.
- Map user-facing depth controls to internal search parameters without exposing beam/search weight knobs as raw UX.
- Disable tree generation until the local readiness check and the class/ascendancy/skill/budget/preset checklist all pass.
- Show runtime fallback/manifest status from readiness metadata even before the first candidate generation.
- Distinguish `missing_required` from `missing_optional`: absent item-ranker artifacts or unified-output manifest should not be shown as the same failure class as missing passive-tree/runtime prerequisites.
- Show tree-model readiness, item-model readiness and PoB validation as separate operator signals instead of one merged health badge.
- Show item artifacts and item runtime as separate operator signals: artifacts can be `ok` while runtime still says `deterministic-fallback`.
- Keep tree/item/gem/config assumptions visible.
- Keep the error-review flow explicit: users should be able to mark wrong mastery, wrong ascendancy, bad routing, reservation/resource mistakes and similar post-PoB failures without editing hidden state.
- Treat the `Erros` tab and saved JSONL/TXT reports as ranking feedback for later generations, not as proof that a candidate already passed PoB validation.
- Keep the `Erros` tab negative-only: user clicks create error counts and weights, while `rankingReview.improved` stays separate as comparison metadata.
- Save local feedback artifacts immediately and preserve `category`, `reason`, `severity`, `polarity`, `count` and `weight` as typed fields for later training/export.
- Show unified `training_output` bundle state as packaging/operator context only; it does not upgrade candidate validation state on its own.
- In the `Itens` tab, keep the request contract explicit: rarity policy, scope, budget, modifier source, resistance policy, chaos policy, defensive base policy, affix strictness and jewel policy.
- Do not mark item generation as blocked just because the `.pt` scorer is not connected; if artifacts exist, show deterministic fallback as a runtime state and keep XML generation available.
- Keep `heuristic_roundtrip`, `deterministic_preview`, `deterministic-fallback` and `model-runtime` distinct in the UI and API so users can see what actually produced the gear.
