---
name: poe-pob-xml-golden-exporter
description: Validate, repair, or implement Path of Exile 1 Path of Building XML export using the IA - PoE 1 golden template and local XML parser/exporter. Use when Codex works on PoB code generation, XML item formatting, Items/Skills/Tree sections, encode/decode round-trips, golden template alignment, or importability blockers before opening a generated build in Path of Building.
---

# PoE PoB XML Golden Exporter

## Core Rule

Generated PoB XML is a contract, not presentation. Keep output aligned to the golden template, local parser, and Path of Building import behavior before optimizing power.

## Project Files

Use:

- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\pob_tree_only_xml_template.xml`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\pob_tree_only_xml_template.contract.json`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\pob_full_xml_golden_contract.json`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\pob_full_xml_golden_summary.json`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\pob_full_xml_golden_filled_template.xml`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\pob_full_xml_golden_clean_template.xml`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\33-full-pob-xml-golden-dataset-contract.md`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\31-pre-pob-xml-export-checklist.md`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\backend\xml-engine\exporter.go`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\backend\xml-engine\exporter_test.go`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\backend\xml-engine\parser.go`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\backend\xml-engine\codec.go`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\backend\api\handlers.go`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\scripts\open-pob-local-import.ps1`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\scripts\install-pob-local-import-protocol.ps1`

Read `references/export-checklist.md` for the compact gate.
Read `references/full-golden-xml-contract.md` when working on complete builds that join tree, equipment, gems and Config.

## Export Gate

Before presenting PoB output:

1. Validate class, ascendancy, tree, skills, items and config.
2. Format item data through model/exporter helpers.
3. Activate PoB Config effects only when tree, ascendancy, items, gems, flasks or explicit user intent source them.
4. Escape XML special characters.
5. Encode and decode PoB code locally.
6. Parse decoded XML locally.
7. When items are equipped, serialize them through `<ItemSet>` with per-slot `<Slot ... itemId="...">` bindings aligned to the golden template; do not leave equipped slots floating directly under `<Items>`.
8. If the task includes local desktop validation, use the project helper or endpoint to open Import from Clipboard in Path of Building without retyping the code.
9. Keep build blocked until real PoB import confirms usable calculations.

Use the filled golden template as the known-good reference example and the clean golden template as the fill target for new generated complete builds.
Treat the current local golden contract as section-complete only when it preserves `Build -> Skills -> Items -> Calcs -> Config -> TreeView -> Import -> Party -> Tree -> Notes` and the active spec remains aligned to the audited local contract.
Treat combined tree-plus-items exports as structurally useful when they reach local round-trip, but keep them below final validation if the response still signals `pob_app_metrics_pending` or equivalent structural-only warnings.

## Required Test

Run from the project:

```powershell
Push-Location backend
go test ./...
Pop-Location
node scripts\audit-pob-data.js
```

State explicitly when the real PoB desktop import was not performed.
