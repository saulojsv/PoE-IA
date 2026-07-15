---
name: poe-local-knowledge-storage
description: Create and maintain local Path of Exile 1 knowledge folders, schemas, snapshots, raw data, normalized JSON, exports, reports, quarantine, and logs.
---

# PoE Local Knowledge Storage

Maintain:
```text
poe-knowledge-system/
config/
data/raw/
data/normalized/
data/snapshots/
data/reports/
data/exports/
data/quarantine/
database/
src/
prompts/
tests/
logs/
scripts/
```

Do not overwrite valid old data. Snapshot before patch migrations. Quarantine failed parser outputs with raw source and error details.
