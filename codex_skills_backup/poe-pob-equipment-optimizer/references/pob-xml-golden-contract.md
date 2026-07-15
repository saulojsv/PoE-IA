# PoB XML Golden Contract

Use this when creating, repairing, or auditing PoB XML export logic.

## Golden Files

Project references:

- `docs/pob_tree_only_xml_template.xml`
- `docs/pob_tree_only_xml_template.contract.json`
- `docs/pob_tree_only_xml_reference_summary.json`
- `docs/pob_3_28_reference_xmls.zip`
- `backend/xml-engine/exporter.go`
- `backend/xml-engine/parser.go`
- `backend/xml-engine/codec.go`

## Required XML Sections

Generated XML should preserve the expected PoB structure:

- `PathOfBuilding`
- `Build`
- `Tree`
- `Skills`
- `Items`
- `Calcs`
- `TreeView`
- `Notes`

Items must serialize through model fields and exporter helpers. Avoid constructing final XML item text by ad hoc string concatenation outside the exporter.

## Item Text Safety

PoB item text must be conservative:

1. Rarity line.
2. Item name.
3. Base type.
4. Separator lines where exporter expects them.
5. Requirements/properties only when valid.
6. Implicits.
7. Explicits.
8. Crafted/fractured/enchant/corrupted lines with correct markers if supported.

Escape XML characters: `&`, `<`, `>`, `"`, `'`.

Remove or downgrade unknown mods. Put uncertain descriptions in notes.

## Round-Trip Gate

Before presenting a generated PoB code/XML as usable:

```powershell
go test ./...
node scripts\audit-pob-data.js
```

For generator paths, also decode the generated code and parse it with the local parser. PoB application import remains the final authority for calculated DPS/EHP/requirements.

## Fallback Rule

A weaker build that imports cleanly is better than a stronger build that breaks PoB import.

Safe fallback bases include simple low-risk white items such as Simple Robe, Iron Ring, Leather Belt, Driftwood Wand, Short Bow, Plate Vest and Wool Shoes.
