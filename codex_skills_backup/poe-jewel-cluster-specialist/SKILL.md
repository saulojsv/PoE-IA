---
name: poe-jewel-cluster-specialist
description: Validate, design, or block Path of Exile 1 jewels, abyss jewels, cluster jewels, Timeless jewels, Watcher's Eye, Forbidden Flame/Flesh, talismans, amulets, and unique item dependencies for IA - PoE 1 builds. Use when equipment depends on passive-tree sockets, cluster subgraphs, jewel radius, special unique behavior, talisman corruption/anoint state, or PoB-safe XML item formatting.
---

# PoE Jewel Cluster Specialist

## Core Rule

Jewels are not ordinary gear. Count their stats only when the socket source, tree coupling, item base, mod legality and PoB formatting are validated.

## Project Files

Use:

- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\data\repoe\cluster_jewels.json`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\data\repoe\cluster_jewel_notables.json`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\data\passive-tree\index\jewel_sockets.json`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\32-phase-10-equipment-catalog-and-optimizer-plan.md`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\22-phase-9-item-affix-jewel-resolver.md`

Read `references/socket-contract.md` for the compact socket rules.

## Rules

- Regular jewels require allocated passive tree socket.
- Abyss jewels require abyss socket source.
- Cluster jewels require outer socket, added passive budget and generated connected cluster subgraph.
- Unique jewels require radius/limit/pair/class/aura validation as applicable.
- Timeless jewels require seed/faction/transformed-node handling before node effects count.
- Watcher's Eye mods require enabled aura evidence.
- Talismans are special/corrupted-style amulet bases by default and must not assume bench crafting.

## Blockers

Use blockers instead of pretending the stats are active:

- `JEWEL_SOCKET_NOT_ALLOCATED`
- `ABYSS_JEWEL_SOCKET_MISSING`
- `TREE_CLUSTER_UNSUPPORTED`
- `ITEM_UNIQUE_MODS_UNRESOLVED`
- `ITEM_TALISMAN_STATE_UNRESOLVED`
- `ITEM_JEWEL_RADIUS_UNVALIDATED`
