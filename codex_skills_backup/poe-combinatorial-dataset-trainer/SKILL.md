---
name: poe-combinatorial-dataset-trainer
description: Design, validate, or refine Path of Exile 1 combinatorial training datasets for IA - PoE 1, including passive tree/ascendancy point combinations, item parameter combinations, support gem combinations, training/runtime manifests, and general Path of Building configuration parameters. Use when Codex works on dataset generation, model training, Colab pipelines, candidate JSONL schemas, runtime artifact contracts, combinatorial optimizer training, feature schemas, labels, hard gates, or ranking targets for PoE/PoB builds.
---

# PoE Combinatorial Dataset Trainer

## Core Rule

Train combinations, not hallucinations. Every dataset row must separate candidate generation from deterministic legality and final PoB validation. The model may rank or explore; it must never learn to override hard blockers.

## Project Location

Use:

```text
C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1
```

Before editing dataset/training logic, read only the relevant local docs/data/scripts:

- `docs/26-colab-model-training-architecture.md`
- `docs/28-tree-dataset-stateful-generation-rules.md`
- `docs/30-colab-dataset-to-model-training-automation.md`
- `docs/34-phase-1-dashboard-training-runtime-contract.md` for tree-only runtime handoff and model manifest shape.
- `docs/36-phase-1-feedback-learning-final-logic.md` for dashboard error-report JSONL fields and `rankingReview` behavior.
- `docs/40-colab-training-execution-sequence.md` for the current Drive layout, training order and unified `training_output` handoff.
- `docs/42-item-tree-training-integration.md` for the split between item-only and tree-aware item training.
- `docs/44-colab-drive-execution-order.md` for the current Colab execution order.
- `docs/45-item-dataset-generator-rules.md` for equipment dataset inputs, row shape and label fields.
- `docs/46-rota-correta-treino-equipamentos-tree.md` when the validated Colab route depends on copying the tree dataset to local `/content` before item generation.
- `docs/31-pre-pob-xml-export-checklist.md`
- `docs/33-full-pob-xml-golden-dataset-contract.md` when joining tree, equipment, gems and Config into full PoB XML.
- `docs/32-phase-10-equipment-catalog-and-optimizer-plan.md` when item parameters enter the dataset.
- `data/item-rules/training-requirements.json` for current required files, hard gates, training modes and recommended next blockers.
- `scripts/generate-equipment-training-dataset.py` when item-only or tree-aware equipment rows are part of the dataset change.
- `scripts/assemble-training-output.py` when the task packages runtime artifacts for the dashboard.

## Reference Routing

- For required JSONL fields and validation labels, read `references/dataset-contract.md`.
- For tree/ascendancy combinations, read `references/tree-combinations.md`.
- For item/gem/config combinations, read `references/items-gems-config.md`.

## Combination Layers

Generate and score these layers separately, then combine with a final ranker:

1. Passive tree and ascendancy combinations.
2. Active skill and support gem combinations.
3. Item shell and affix-family combinations.
4. General PoB configuration assumptions.
5. Final full PoB candidate that joins tree + items + gems + sourced Config with validation state and blockers.

Do not train a monolithic early model that mixes all layers without provenance.

## Mandatory Dataset Gates

Every candidate must carry:

- source data versions;
- feature schema version;
- rules version;
- request/build contract;
- runtime handoff metadata when the row feeds a dashboard/runtime path;
- feedback-report metadata when the row comes from dashboard error review;
- validation labels;
- blockers and warnings;
- PoB/XML status;
- deterministic score components.

Critical blockers must force final training score to zero or near-zero. Keep invalid candidates as negative examples instead of deleting all of them.
When the row is sourced from the dashboard `Erros` flow, keep issue weights negative-only and store `rankingReview` as separate comparison metadata rather than turning it into a positive error label.

## Current Packaging Contract

- Keep item dataset provenance explicit: `scripts/generate-equipment-training-dataset.py` currently supports `treeContextMode` `none`, `summary` and `required`, and generated rows must preserve which mode produced them.
- Keep the current Colab route explicit: organize the Drive layout first, optionally validate isolated item training, then run the combined tree + item notebook that produces the final dashboard bundle.
- Treat tree-aware item training as the canonical dashboard handoff path: `summary` adds passive-tree context to item rows, while `none` is still useful for isolated item-ranker validation.
- If the mounted Drive tree dataset is empty or too slow for the current run, prefer the validated local-copy route documented in `docs/46-rota-correta-treino-equipamentos-tree.md` instead of assuming the canonical Drive path is populated.
- When packaging runtime artifacts, treat `exports/training_output/poe1_optimizer_v001` as a distinct handoff bundle produced by `scripts/assemble-training-output.py`, not as a replacement for raw dataset manifests.
- Preserve the unified output manifest and contract files: `optimizer_training_output_manifest.json` plus `contracts/item_training_requirements.json`.
- Treat `data/item-rules/training-requirements.json` as the current source for `currentHardGates`, training-mode expectations and `recommendedAdditions`.
- Do not promote `recommendedAdditions` into enforced blockers or positive labels until the local generator, validators or runtime actually implement them.

## Validation

Run project checks after changing generation rules:

```powershell
node scripts\build-item-catalog-index.js
node scripts\audit-pob-data.js
Push-Location backend
go test ./...
Pop-Location
```

If the real Path of Building app was not used, keep metrics labeled as `pob_app_metrics_pending`.
