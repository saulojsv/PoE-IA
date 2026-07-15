# Compact Export Checklist

Use this before generating or trusting PoB XML:

- Required sections for the current full golden contract: `PathOfBuilding`, `Build`, `Skills`, `Items`, `Calcs`, `Config`, `TreeView`, `Import`, `Party`, `Tree`, `Notes`.
- Active tree spec: keep the generated `Tree.activeSpec` aligned to the audited local golden contract.
- Tree: valid class ID, ascendancy ID, connected node IDs and official URL when available.
- Skills: enabled main group, active skill first, support gems valid and compatible.
- Items: valid slot, rarity, base type, sockets and separated mod buckets.
- Mods: no unsupported generated prose as real item mods.
- Config: no fake charges, shock, exposure, curses, wither, flask uptime or ailments without sources.
- XML: UTF-8, escaped special characters, no invalid control chars.
- Round-trip: encode, decode and parse before delivery.
- Local helper is optional: `scripts/open-pob-local-import.ps1` and the `pob-local-import://` protocol only speed up manual PoB opening; they do not prove the build imported cleanly.

Prioritize importability over theoretical strength.
