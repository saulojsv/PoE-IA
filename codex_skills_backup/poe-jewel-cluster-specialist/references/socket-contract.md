# Socket Contract

Use local socket and cluster sources first:

- `data/passive-tree/index/jewel_sockets.json`
- `data/repoe/cluster_jewels.json`
- `data/repoe/cluster_jewel_notables.json`
- `docs/22-phase-9-item-affix-jewel-resolver.md`

## Regular Jewel

Requires:

- passive tree socket allocated;
- jewel item linked to socket node ID;
- legal jewel explicit mods;
- no one-per-build conflict.

## Abyss Jewel

Requires:

- Stygian belt or other abyss socket source;
- abyss jewel base;
- abyss-legal mods.

## Cluster Jewel

Requires:

- outer passive-tree jewel socket;
- cluster base size;
- added passive count;
- selected notables from local cluster notable data;
- passive point budget reserved;
- connected cluster subgraph.

Do not count cluster stats until the subgraph is represented. If any step is missing, keep `TREE_CLUSTER_UNSUPPORTED`.

## Unique Jewel

Requires exact behavior evidence from local curated data or PoB import when it changes:

- radius;
- keystone;
- transformed passives;
- forbidden pair;
- aura-specific modifiers;
- class or ascendancy restrictions.

Keep blockers visible instead of silently counting unsafe effects:

- `JEWEL_SOCKET_NOT_ALLOCATED`
- `ABYSS_JEWEL_SOCKET_MISSING`
- `TREE_CLUSTER_UNSUPPORTED`
- `ITEM_JEWEL_RADIUS_UNVALIDATED`
- `ITEM_UNIQUE_MODS_UNRESOLVED`
