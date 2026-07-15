# Item asset and modifier base

This folder is the local item data layer for the dashboard.

## Sprites

- `sprite_aliases.json`: groups item names, bases and shared names by sprite file.
- `../../dashboard/item_sprite_index.json`: direct lookup used by the dashboard.
- Source images live in `../../assets/poe_item_sprites/`.

Some items intentionally share sprites:

- rare and magic items use their base item sprite;
- many jewels use the base jewel sprite;
- replicas/foulborn/variants may use the base or original item sprite when the wiki exposes that relation.

## Modifiers

- `modifier_sources.json`: inventory of local Path of Building modifier databases.
- `item_type_mods.json`: normalized catalog of modifiers associated to PoB item types by `weightKey/weightVal`.
- `item_base_mods.json`: base-level catalog. Each real PoB base stores slot, base type, requirements, tags, implicit and eligible mods by minimum item level.
- Current source: `external/PathOfBuildingTesst/src/Data/Mod*.lua`.

`item_type_mods.json` includes:

- source category: explicit, implicit, crafted, eldritch, veiled, flask, jewel, cluster, abyss, corrupted, synthesis, scourge;
- item class/base restrictions;
- required item level;
- affix type/prefix/suffix when available;
- stat lines;
- generation weight/tags when available;
- exclusive groups;
- max allowed affixes per item type.

## Item limits

The generator must not assume every item can be duplicated or stacked:

- one body armour, gloves, boots, belt, amulet, helmet;
- two rings;
- one weapon plus offhand, unless weapon is two-handed;
- jewels depend on socket count and unique jewel-specific limits;
- unique item duplication rules must be validated by item description/mod rules before generation.
