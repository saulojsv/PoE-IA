# PoB XML local reference format

## Purpose

All generated or converted PoB XML files must match the existing functional XML files in:

```text
C:\Users\saulo\Documents\Agente - PoE\data\poe_ninja\poe_ninja_dataset\xml\absolution\
```

Reference files:

```text
Absolution - ID 1.xml
Absolution - ID 2.xml
```

Treat these files as the local working format reference.

## Required structure

Every accepted XML must:

- start with XML declaration:

```xml
<?xml version="1.0" encoding="UTF-8"?>
```

- have root:

```xml
<PathOfBuilding>
```

- include a direct `Build` element with attributes such as:
  - `viewMode`
  - `className`
  - `targetVersion`
  - `ascendClassName`
  - `bandit`
  - `level`
  - `mainSocketGroup`

- include many `PlayerStat` entries in this shape:

```xml
<PlayerStat stat="TotalDPS" value="..."/>
```

or:

```xml
<PlayerStat value="..." stat="TotalDPS"/>
```

Both attribute orders are accepted.

## Expected sections

A full useful XML should preserve PoB sections when present:

- `Build`
- `Skills`
- `Items`
- `Calcs`
- `Config`
- `TreeView`
- `Import`
- `Party`
- `Tree`
- `Notes`

Do not remove sections from decoded PoB XML.

## Validation gate

Before saving XML from any external PoB source:

1. Parse XML.
2. Confirm root is `PathOfBuilding`.
3. Confirm `Build` exists.
4. Confirm at least one useful build signal:
   - `PlayerStat`
   - `Skill`
   - `Item`
   - `Tree`
5. Confirm XML is not HTML, JSON, plain text, or error page.
6. Save only if structurally compatible with the reference files.

If validation fails:

- do not save as `.xml`;
- save metadata as `invalid` or record pending/error;
- never fabricate missing sections.

## Folder rule

Save valid XMLs only under:

```text
C:\Users\saulo\Documents\Agente - PoE\data\poe_ninja\poe_ninja_dataset\xml\{normalized_skill}\{build_id}.xml
```

Save sidecar metadata:

```text
C:\Users\saulo\Documents\Agente - PoE\data\poe_ninja\poe_ninja_dataset\xml\{normalized_skill}\{build_id}.meta.json
```

## Compatibility rule

If a converted XML differs materially from the reference shape, assume it may be wrong and mark it `needs_review`.

Do not overwrite existing working XMLs.
