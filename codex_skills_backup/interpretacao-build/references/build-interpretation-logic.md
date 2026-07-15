# Build Interpretation Logic

## Source Priority

Use sources in this order:

1. Local PoB XML in `local_poe_learning_dataset/xml`.
2. Local indexes in `local_poe_learning_dataset/*.json`.
3. Normalized rows in `local_poe_learning_dataset/builds.jsonl`.
4. Path of Building data/source when available locally.
5. GGG official/static/developer data.
6. RePoE, poe.ninja economy, community references.

Web sources are for missing or changed facts only. Local XML is the primary evidence for extracted builds.

## Interpretation Axes

## Core Question

For any build, answer:

```text
Why this class/ascendancy + why this skill + why this tree + why these items + what makes it functional?
```

Never stop at DPS. Treat DPS as one output of a system made from mechanics, requirements, defenses, resources, and uptime.

### Identity

Extract:

- class and ascendancy;
- level;
- main skill group;
- enabled skill gems;
- bandit and pantheon;
- target version.

Explain class formation:

- base class start position determines efficient pathing and early stat access;
- ascendancy determines the build's strongest mechanic package;
- forbidden jewels/secondary ascendancy can replace or add a missing mechanic;
- class choice is invalid if the tree pays too many points for core mechanics another class gets naturally.

### Damage

Classify:

- hit, DoT, ailment, minion, totem, trap/mine, trigger, aura/link, attribute stacker;
- damage types and conversion;
- crit vs non-crit;
- attack/cast rate;
- main supports;
- required uniques or rare affixes.

Use `PlayerStat` values as measured PoB facts, not guaranteed in-game truth.

Explain damage formation:

- active skill defines tags and therefore legal scaling buckets;
- supports should match tags and damage type, not only highest tooltip;
- tree/notables should multiply the selected buckets: projectile, attack, spell, DoT, minion, crit, elemental, physical, chaos, ailment, duration, area, aura, totem, trap/mine;
- crit builds need base crit, chance, multiplier, accuracy/hit chance, and reliable uptime;
- non-crit builds need a replacement multiplier: Elemental Overload, DoT multi, ailment scaling, attribute stack, gem levels, or reservation/aura stacking;
- conversion builds must explain source damage, conversion path, and final scaling type.

### Defense

Identify layers:

- life, energy shield, mana, ward;
- armour/evasion/suppression/block;
- max resistances and chaos resistance;
- recovery: regen, leech, recoup, flask sustain;
- mitigation: taken-as, guard skill, endurance charges, fortify, ailment avoidance.

Flag builds with high DPS but fragile max-hit/EHP.

Explain defense formation:

- elemental resistances normally need to reach 75%; max-res investment raises the target, up to hard cap 90%;
- overcap matters against curses, exposure, and map penalties;
- chaos resistance is not optional for robust endgame unless the build has another mitigation plan;
- evasion needs avoidance/recovery backup; armour needs elemental/DoT plan; suppression needs high chance and adequate life/ES;
- block needs recovery/on-block or avoidance context;
- every build needs recovery: regen, leech, recoup, life gain on hit, flask sustain, recharge, or on-block.

### Resources and Reservation

Check:

- aura stack;
- mana/life reservation;
- Enlighten/Arrogance/Divine Blessing;
- Eldritch Battery, Lifetap, Blood Magic, reduced cost;
- whether active skills are actually usable.

Explain resource formation:

- auras reserve damage/defense power but can make skills unusable if unreserved resource is too low;
- attack/cast cost must be payable during full rotation;
- reservation masteries, Enlighten, mana efficiency, EB, Lifetap, Arrogance, and reduced cost are enabling mechanics, not decoration.

### Tree and Jewels

Use passive node lists and cluster jewels to infer:

- pathing direction;
- keystones;
- masteries;
- reservation wheels;
- crit/elemental/DoT/minion/projectile/melee scaling;
- jewel socket dependency.

Cluster jewels can distort poe.ninja calculations; mark suspicious extremes.

Explain tree formation:

- pathing nodes are acceptable only when they connect to efficient notables, keystones, sockets, masteries, or required attributes;
- notable choice must map to the build's main mechanic;
- mastery choice must solve a concrete need: damage multiplier, reservation, ailment, suppression, recovery, leech, projectile behavior, strike behavior, minion behavior, etc.;
- jewel sockets are justified by high-value jewels, cluster entry, forbidden jewels, timeless jewels, Watcher's Eye, or attribute fixing;
- cluster jewels are mini-trees: explain base type, added passives, notables, jewel socket cost, and whether all allocated nodes are actually useful.

### Items

Group items by purpose:

- enabling unique;
- weapon/offhand scaling;
- defensive core;
- reservation/aura support;
- attribute/resistance filler;
- flask package;
- jewel package.

Do not assume a rare item is reproducible unless affix legality is validated.

Explain item formation:

- identify enabling items first: the item without which the build's mechanic fails or loses most power;
- weapon/offhand must match active skill requirements and scaling;
- rares should be categorized as requirement fillers, defensive rares, damage rares, reservation rares, or crafted tech;
- uniques need a reason beyond popularity: conversion, trigger, reservation, defensive layer, stat stack, gem level, charge generation, or special interaction;
- flasks are part of the build: ailment removal/avoidance, armour/evasion, movement, crit, recovery, unique flask uptime.

## Learning Pattern

For every build, produce a compact training note:

```json
{
  "archetype": "",
  "main_skill": "",
  "class": "",
  "ascendancy": "",
  "damage_scaling": [],
  "defense_layers": [],
  "required_items": [],
  "node_reasons": {},
  "mastery_reasons": {},
  "notable_reasons": {},
  "item_reasons": {},
  "support_patterns": [],
  "passive_patterns": [],
  "risks": []
}
```

Then update derived indexes instead of rereading every XML.

## Validation Gates

Before recommending or generating a build:

- PoB XML imports.
- Passive tree is connected and within budget.
- Main skill has legal supports.
- Required items exist and match sockets/stats.
- Reservation leaves usable resource.
- Defenses meet target content.
- Config assumptions are explicit.

## Explanation Template

Use this structure for a full answer:

1. `Archetype`: what the build is trying to do.
2. `Core engine`: skill + class/ascendancy + enabling item/passive.
3. `Damage logic`: tags, supports, scaling buckets, crit/non-crit, uptime.
4. `Defense logic`: res caps, max hit, avoidance/mitigation/recovery.
5. `Tree logic`: route, keystones, notables, masteries, jewel sockets.
6. `Item logic`: required uniques, rare affixes, flasks.
7. `Functionality gates`: resource, accuracy/hit, movement, ailments.
8. `Weak points`: what would break or underperform.

## Forum-Derived Study Rules

Use official forum guides as examples of reasoning, not as immutable truth. Extract the pattern behind the recommendation.

Primary forum/reference examples:

- `https://www.pathofexile.com/forum/view-thread/3275670`: defense is layered as avoidance, mitigation, and recovery; resistances, armour, suppression, guard skills, Fortify and similar mechanics must be mapped by damage type.
- `https://www.pathofexile.com/forum/view-thread/3862193`: progression logic; campaign and early maps tolerate lower structure, but level 70+ requires capped elemental resistances, chaos resistance planning, and survivability equal to damage.
- `https://www.pathofexile.com/forum/view-thread/125743`: build creation starts from damage type, survival plan, skill/support synergy, and awareness of chaos damage.
- `https://www.pathofexile.com/forum/view-thread/510084`: quick-start build logic; choose main skill, support links, weapon/item base, passive route, and defensive flask/armour/resistance plan.
- `https://www.pathofexile.com/forum/view-thread/3275018`: common correction pattern; decent life/ES pool and capped resistances come before DPS, uniques are not automatically better than rares, ailment protection matters.
- `https://www.pathofexile.com/forum/view-thread/1850206`: DPS comes from gem levels, correct gear mods, flasks, passive damage, jewels, and supports; tooltip/PoB DPS must be interpreted in context.
- `https://www.pathofexile.com/forum/view-thread/69224`: build critique starts with a plan: main attack/skill, support synergy, utility skills, survivability against chaos, shock/freeze, and critical hits.
- `https://www.pathofexile.com/forum/view-thread/3575560`: mapper and bosser are different jobs; few builds do all content equally, so role must be explicit.
- `https://github.com/PathOfBuildingCommunity/PathOfBuilding`: PoB is the calculation authority for local verification; inspect offence, defence, reservations, configs, tree, skills, items, and unsupported modifiers.

### Learning Order

Teach or evaluate builds in this order:

1. Role: mapper, bosser, sanctum, delve, simulacrum, lab, league starter, budget farmer, or all-rounder.
2. Main mechanic: skill tags, delivery method, damage type, hit/DoT/ailment/minion/totem/trap/mine/trigger.
3. Ascendancy package: why this class solves the mechanic better than nearby alternatives.
4. Functionality gates: weapon/base compatibility, legal supports, cost payment, reservation, attributes, accuracy if attack, required uniques.
5. Defense floor: elemental res cap, chaos plan, life/ES pool, recovery, ailment/bleed/corrupted blood answer, movement, flasks.
6. Scaling plan: gem levels, weapon/offhand, crit or non-crit multiplier, conversion, exposure/curse, charges, jewels/clusters, flask uptime.
7. PoB realism: boss config, full ramp assumptions, all projectiles hit, temporary buffs, flasks, shock value, enemy stationary, conditional exposure/curse.
8. Upgrade path: cheap fixes first, then enabling uniques, then rare affix quality, then clusters/jewels, then luxury corruptions.

### Role Targets

Use these as broad interpretation bands, not hard truth:

- Campaign/early maps: basic links, capped elemental resistance, movement, recovery, and enough damage to kill rares without stalling.
- Red maps: stable resists, non-negative or planned chaos resistance, real recovery, ailment answers, and about 1M+ realistic DPS for comfortable mapping.
- Endgame mapper: fast clear, movement, recovery while moving, avoidance/mitigation, curse/ailment handling, and about 3M-10M realistic DPS depending skill coverage.
- Normal bossing: higher single-target uptime, guard/recovery plan, mechanics tolerance, and about 5M-15M realistic DPS.
- Uber bossing: high sustained DPS, max-hit planning, ailment immunity, flask/charge uptime, and explicit PoB config audit; usually 15M+ realistic DPS or exceptional defenses.

### Interpretation Checklist

For every build note, store:

- role and content target;
- main skill and secondary boss/clear skill if separate;
- delivery method;
- damage buckets and reason each bucket applies;
- crit state: crit chance, multi, accuracy/hit chance, power charges, lucky/diamond/source uptime;
- non-crit state: Elemental Overload, DoT multi, gem levels, attribute stack, ailment scaling, or other replacement multiplier;
- defensive layers by damage type: physical hit, elemental hit, chaos hit, DoT, ailments, critical hits, degens;
- recovery source and whether it works while bossing;
- reservation/resource state and active skill cost;
- required item list versus replaceable rare slots;
- passive tree pathing purpose;
- notable/mastery/cluster reason;
- flask function and sustain;
- PoB assumptions and likely inflated metrics;
- weakest gate blocking functionality.

### Common Build Mistakes

Flag these aggressively:

- DPS is high but elemental resistances are not capped.
- Chaos resistance is ignored for endgame.
- No recovery layer exists.
- Attack crit build lacks hit chance/accuracy.
- Skill cost exceeds usable mana/life/ES rhythm.
- Build uses many auras but has no usable resource left.
- Unique item is included without an enabling reason.
- Rare gear has damage but no life/ES/resists/attributes.
- PoB relies on all flasks, charges, shock, exposure, curses, full ramp, or shotgun assumptions without uptime proof.
- Mapper is judged as bosser, or bosser is judged as mapper.
- Cluster jewel pathing costs more points than the value it returns.
- Defensive layers all protect the same damage type while another damage type is exposed.

### Beginner Layer

Require the build to answer:

- What skill is used to clear and what skill/interaction kills bosses?
- Which weapon/item type is mandatory?
- What stats fix early gearing: life/ES, elemental resistances, attributes, accuracy, movement speed?
- Which gems are mandatory and which are luxury?
- Which aura/reservation setup leaves enough resource to use the skill?
- Which flasks prevent common deaths: bleed, freeze, curse, shock, ignite, armour/evasion, movement?

Beginner failure modes:

- uncapped resistances;
- no recovery;
- no movement skill;
- skill cannot be paid due to reservation/cost;
- attack crit build without hit chance/accuracy;
- item requirements ignored.

### Intermediate Layer

Explain tradeoffs:

- class/ascendancy versus another class doing the same skill;
- crit versus non-crit;
- life versus ES/CI/low-life;
- armour, evasion, suppression, block, max-res, or hybrid defenses;
- clear speed versus boss DPS;
- budget item versus enabling unique;
- tree travel cost versus cluster/jewel/socket value.

A good build guide usually solves a bottleneck, not just adds damage. Examples: accuracy for crit attacks, mana recovery for expensive skills, block cap via shield/jewels, flask sustain via Pathfinder/flask nodes, or reservation efficiency for aura stacking.

### Advanced Layer

Audit:

- uptime of charges, flasks, curses, exposure, shock, brittle, scorch, wither, rage, fortify, onslaught;
- map mod compatibility;
- actual boss config versus mapping config;
- PoB assumptions: enemy stationary, all projectiles hit, full ramp, all flasks up, temporary buffs active;
- rare item reproducibility;
- cluster jewel path cost;
- whether the defensive layer works against hits, DoT, phys, elemental, chaos, and ailments.

### Common Forum Patterns

- Wander/attack crit builds need hit chance; crit chance alone is misleading when accuracy is low.
- Gear advice often starts with life/resists/attributes, then damage affixes.
- Defensive claims are credible only when tied to layers: block, ES/life recovery, max res, suppression, armour/evasion, flasks, or guard skills.
- Ascendancy choice must be justified by a mechanic package, not popularity.
- Required uniques are valid only if they solve a specific enabling problem.
- Flasks can be both offense and defense; if the build relies on them, charge sustain must be explained.
- Passive nodes are not "good" globally; they are good when they solve the build's bottleneck.

## Kinetic Fusillade Checklist

Interpret Kinetic Fusillade as a wand/projectile attack build unless XML proves another delivery method.

Check first:

- delivery: self-attack, ballista/totem, trigger, or other;
- tags/scaling: attack, projectile, wand, elemental/lightning or physical-to-elemental depending XML;
- ramp mechanic: repeated/stored projectiles reward attack rhythm, projectile count, duration handling, and correct targeting;
- class reason: Hierophant often implies ballista/totem, reservation/resource, or Iron Will/stat scaling patterns;
- crit state: read `CritChance`, `CritMultiplier`, power charges, wand base crit, diamond/lucky config, and crit supports;
- non-crit state: look for Elemental Overload, precise technique, or absence of crit investment;
- defenses: capped elemental resists, chaos resist target, armour/evasion/suppression/block/max hit, recovery;
- resources: attack cost, mana reservation, EB/Lifetap/Inspiration/clarity setup;
- required items: wand/offhand, projectile/totem uniques, Svalinn/Mageblood/stat-stack items only when present in XML;
- PoB risk: poe.ninja DPS may be inflated by config, shotgun assumptions, cluster jewels, or unrealistic uptime.

Minimum functionality gates:

- main skill enabled and legally supported;
- weapon type compatible;
- enough accuracy or hit chance near cap unless totems/other mechanics bypass the issue;
- elemental resists at cap, normally 75% unless max-res sources raise it;
- enough unreserved resource to attack;
- at least one real recovery layer;
- movement skill and flask package present.
