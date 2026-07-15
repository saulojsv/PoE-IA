---
name: poe-api-cli-system
description: Implement or maintain Path of Exile 1 knowledge API endpoints, CLI commands, scheduler hooks, tests, Docker setup, and reproducible local operation.
---

# PoE API CLI System

Expected API:
`GET /health`, `/patches`, `/leagues`, `/skills`, `/skills/{skill_id}`, `/skills/{skill_id}/supports`, `/items`, `/builds`, `/sources`, `/search`, `/admin/jobs`; `POST /admin/update`, `/admin/reindex`.

Expected CLI:
`poe-knowledge discover-skills`, `research-skill`, `refresh-skill`, `refresh-patch`, `validate`, `export-jsonl`, `build-embeddings`, `generate-report`, `run-scheduler`.

Never claim Docker, tests, API, or CLI work unless actually run.
