---
name: poe-ninja-build-extractor
description: Extract public Path of Exile 1 poe.ninja build data, internal character JSON, Path of Building export codes, decoded PoB XML, metrics, classes, ascendancies, items, flasks, jewels, gems, links, passive nodes, masteries, cluster jewels, pantheons, bandits, and normalized JSONL datasets. Use when Codex needs to scrape or parse poe.ninja build pages, build overview pages, PoB exports from poe.ninja, or prepare local training data from public PoE builds.
---

# PoE Ninja Build Extractor

For XML collection while poe.ninja is unstable, do not access poe.ninja. Use forums, Mobalytics, YouTube descriptions/comments, pobb.in, Maxroll, PoE Vault, Reddit, GitHub repos, and creator docs when they expose PoB/export/XML.

Required paths:
- XML folder: `C:\Users\saulo\Documents\Agente - PoE\data\poe_ninja\poe_ninja_dataset\xml\{normalized_name}\`
- Meta beside each XML: `{build_id}.meta.json`

Rules:
- Do not fabricate XML from incomplete data.
- Never access poe.ninja for this XML task.
- Prefer decoded Path of Building XML from external PoB links or pobb.in.
- Collect up to 10 valid XML examples per skill when available.
- Validate XML parseability before marking `xml_status: generated`.
- If no PoB/XML source exists, set `xml_status: needs_source` in the skill JSON.
- Use `poe-pob-xml-golden-exporter` rules before writing generated XML.

# PoE Ninja Build Extractor

## Workflow

1. Read `references/poe-ninja-build-contract.md` before changing endpoint logic.
2. Prefer `scripts/extract_poe_ninja_builds.py` for repeatable extraction.
3. Start discovery at `https://poe.ninja/poe1/builds`, then expand league/search pages into character URLs.
4. For speed, batch by one class/skill filter until exhausted, then move to the next filter.
5. Use cached snapshot metadata and direct character API URLs; avoid opening each character page after account/name/version are known.
6. Use low request rates, cache outputs, and only extract public pages/exports.
7. Normalize each build to one JSONL row: source URL, endpoint URL, character metadata, metrics, skills, items, jewels, passive nodes, masteries, raw PoB code, and optional decoded XML.

## Quick Start

Single build:

```bash
python scripts/extract_poe_ninja_builds.py --url "https://poe.ninja/poe1/builds/ancestors/character/account/name?i=0" --out builds.jsonl
```

Single build without opening character HTML:

```bash
python scripts/extract_poe_ninja_builds.py --url "https://poe.ninja/poe1/builds/ancestors/character/account/name?i=0" --url-fast --out builds.jsonl
```

Multiple builds:

```bash
python scripts/extract_poe_ninja_builds.py --input urls.txt --out builds.jsonl --sleep 1.5
```

Discover current league/category overview:

```bash
python scripts/extract_poe_ninja_builds.py --discover-index --urls-out build_search_pages.txt
```

Include decoded PoB XML:

```bash
python scripts/extract_poe_ninja_builds.py --input urls.txt --out builds.jsonl --include-xml
```

Fast batch from one league:

```bash
python scripts/extract_poe_ninja_builds.py --league mirage --limit 200 --out builds.jsonl --strategy grouped
```

## Extraction Order

1. Fetch `/poe1/builds` or `/poe1/api/data/build-index-state` to discover build leagues and top class/skill combinations.
2. Build search URLs like `/poe1/builds/{league}?class={class}&skills={skill}`.
3. Fetch the league page once to get `version`, `snapshotName`, and `overviewType`.
4. Query `/poe1/api/builds/{version}/search?overview=...&type=exp&class=...&skills=...`.
5. Extract `name` and `account` value lists from the binary search result.
6. Build character URLs and direct character API URLs from those pairs. For pasted URLs, parse `/poe1/builds/{league}/character/{account}/{name}` and use `--url-fast`.
7. Call `/poe1/api/builds/{version}/character?account=...&name=...&overview=...&type=...&timeMachine=`.
8. Read `pathOfBuildingExport`.
9. Decode PoB export as `base64url -> zlib inflate -> XML`.
10. Parse/normalize build JSON and XML.

## Fast Strategy

Use `--strategy grouped` by default:

1. Sort index statistics by popularity.
2. Select one class/skill pair.
3. Extract as many valid builds as possible from that pair.
4. Continue to the next pair only when the target count is not met.
5. Prefer this over forced diversity; diversity costs extra failed validations and requests.

For skill-centered datasets, use one `skills={skill}` filter and let classes vary inside the search results.

## Output Shape

Keep one row per build with:

- `source`, `endpoint`, `fetched_at`
- `character`: account, name, league, class, ascendancy, level
- `metrics`: life, ES, mana, armour, evasion, EHP, max hits, resistances, suppression, block, charges
- `skills`: item slot, gem names, levels, qualities, supports, DPS blocks
- `items`: slot, rarity, name, base type, mods, sockets
- `tree`: passive IDs, masteries, keystones, cluster jewels, tattoos, runegrafts
- `pob`: export code, XML length, optional XML

## Safety

Respect poe.ninja/PoE rate limits, robots/ToS, and public visibility. Do not bypass auth, Cloudflare, private profiles, or unpublished account data.
