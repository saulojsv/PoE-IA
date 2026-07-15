# Import Evidence Workflow

Use this reference when the build source is `pobb.in`, `poe.ninja`, a public GGG character URL, or a saved learning artifact.

## Source Order

1. PoB XML or PoB code already present in the artifact.
2. `pobb.in` raw export code fetched through the project importer.
3. Public GGG character-window data resolved from a `poe.ninja` or official profile link.
4. `data/pob-learning` notes and fixture metadata as supporting evidence.

## Current Project Path

- `POST /api/builds/import` starts the import flow in `backend/handlers/import.go`.
- Raw XML and PoB codes are parsed through `backend/services/pob_parser.go` and `backend/services/pob_codec.go`.
- `pobb.in` URLs are fetched and decoded in `backend/services/importer.go`.
- `poe.ninja` account/character extraction is normalized in `backend/poe-ninja-adapter/extract.go`.
- `poe.ninja` and official profile links resolve through `backend/poe-ninja-adapter/ninja.go`, which fetches public GGG character-window items and passive data, assigns validation states and blocker codes, and only promotes to `ggg_data_resolved` when the generated XML self-check passes.
- Keep `backend/poe-ninja-adapter/ninja_test.go` as the local proof that the importer path still parses representative links and character payloads the way the skill assumes.

## Analysis Rules

- Prefer the imported PoB code when it exists; it preserves more real build state than anonymous meta pages.
- Treat `poe.ninja` as meta and discovery evidence, never as viability proof by itself.
- Treat public GGG imports as partial truth: items, gems and passive hashes may exist while PoB-only config assumptions still do not.
- Preserve blocker codes such as missing tree, missing enabled skill, XML self-check failures or unresolved import structure.
- If the build came from a public character import, state that dashboard metrics remain heuristic until PoB desktop validation.

## Learning Storage Rule

Before saving to `data/pob-learning/`, capture:

- exact source URL or file;
- import path used;
- validation state;
- blocker codes and warnings;
- what is real PoB evidence versus analyst inference.

Do not promote an imported build into a "known-good" lesson just because the fetch worked. The lesson becomes strong only after local parser checks and, when possible, real PoB import confirmation.
