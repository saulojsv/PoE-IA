# Jewels, Uniques And Talismans

Use this when generated equipment involves jewels, unique jewels, clusters, Watcher's Eye, Timeless jewels, Forbidden jewels, unique items, amulets or talismans.

## Regular Jewels

Regular jewels require:

- an allocated passive tree jewel socket;
- legal jewel base;
- legal explicit mods;
- prefix/suffix limits;
- socket ID attached to `JewelSpec`.

Do not count jewel stats while `JEWEL_SOCKET_NOT_ALLOCATED` remains.

## Abyss Jewels

Abyss jewels require a real abyss socket source:

- Stygian Vise;
- abyssal socket item;
- other validated source.

Do not place abyss jewels into passive tree sockets unless the game/PoB format supports that specific base.

## Cluster Jewels

Cluster jewels are tree extensions:

- require outer passive tree jewel socket;
- require large/medium/small base family;
- require added passive count;
- require notables from `data/repoe/cluster_jewel_notables.json`;
- consume passive points;
- must generate connected cluster nodes before their stats count.

Default blocker remains `TREE_CLUSTER_UNSUPPORTED` until the subgraph planner exists.

## Unique Jewels

Unique jewel identity is not enough. Validate:

- one-per-build or pair constraints;
- socket radius;
- transformed node behavior;
- required class/ascendancy;
- aura requirement for Watcher's Eye;
- seed/faction for Timeless jewels;
- matched pair for Forbidden Flame/Flesh.

Block numeric trust until PoB import or curated exact-mod data exists.

## Unique Items

Treat `data/repoe/uniques.json` as identity coverage unless exact mods are present elsewhere.

Block or mark unsafe when the unique:

- grants a keystone;
- grants a skill/support;
- changes conversion, reservation, damage taken, flasks, charges or ailments;
- is build-enabling in SSF or low budget without availability evidence.

## Amulets And Talismans

Amulets can use normal anoint/craft logic only when the item state permits it.

Talismans are special/corrupted-style bases by default:

- do not assume bench crafts;
- explicit anoint/corruption/implicit state is required;
- special effects remain blocked until exact mods are known.
