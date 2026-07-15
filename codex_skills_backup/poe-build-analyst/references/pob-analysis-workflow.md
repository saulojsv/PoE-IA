# PoB Analysis Workflow

Use this reference when analyzing uploaded PoBs, poe.ninja builds, pobb.in builds, or user build ideas.

## Analysis Order

1. Source integrity
   - Confirm whether the artifact is PoB XML, PoB export code, pobb.in URL or poe.ninja URL.
   - Decode/export before interpreting.
   - If tree uses `nodes` attribute only, normalize to official PoB URL before trusting pathing.

2. Skill identity
   - Main active gem name.
   - Gem ID and skill ID.
   - Tags from local catalog.
   - Whether it is Vaal/transfigured.
   - Whether the selected skill group is enabled and used for calculations.

3. Damage pipeline
   - Base damage: weapon, gem flat, spell base, minion, item proc, corpse, ailment source.
   - Damage type: physical, chaos, fire, cold, lightning.
   - Conversion/gain-as/added-as.
   - Ailment creation: poison, ignite, bleed, shock, chill, brittle, scorch, sap.
   - More multipliers: support gems, ascendancy, keystones, item mods.
   - Increased damage buckets.
   - Enemy mitigation: resistance, penetration, exposure, wither, curses, overwhelm.
   - Rate: attack speed, cast speed, trigger rate, cooldown, projectile count, overlap.
   - Uptime: flasks, charges, totems, marks, curses, exposure, wither stacks.

4. Defense pipeline
   - Life/ES/mana pool.
   - Armour/evasion/block/spell suppression/dodge.
   - Max res, physical taken as, damage reduction, fortify, endurance charges.
   - Recovery: leech, regen, recoup, flask sustain, gain on hit, life on kill.
   - Ailment immunity and corrupted blood/bleed/freeze solutions.
   - Movement and range safety.

5. Passive tree
   - Start class and ascendancy.
   - Notables selected.
   - Masteries selected.
   - Keystones selected.
   - Jewel sockets actually allocated.
   - Cluster sockets and cluster notables.
   - Travel point efficiency.

6. Items and craftability
   - Slot by slot.
   - Base type and implicit.
   - Prefix/suffix families.
   - Influence or fracture requirements.
   - Unique dependency.
   - SSF/trade realism.
   - Craft of Exile should estimate odds/cost; PoB should calculate result.

7. Configuration audit
   - Boss type.
   - Charges.
   - Flask active.
   - Enemy cursed/exposed/poisoned/bleeding/on consecrated ground.
   - Wither/shock/ailment stack counts.
   - Minion count/totem count/projectile overlap.
   - Disable any condition the build cannot sustain.

## Local Trust Downgrades

- Preserve `TREE_MASTERY_STATS_EMPTY` when a mastery shell exists but the selectable mastery stats are absent from the local tree index.
- Preserve `REPOE_UNIQUE_MODS_INCOMPLETE` or `ITEM_UNIQUE_MODS_UNRESOLVED` when a unique's exact numeric effects are not confirmed by local trusted data.
- In both cases, keep conclusions below PoB-validated trust and state which part is evidence versus analyst inference.

## Tree Planner Evidence

When the analysis depends on passive routing, validate against the local planner surface instead of hand-waving path quality:

- `backend/passive-tree-engine/graph.go`, `planner.go`, `budget.go`, `ascendancy.go`
- `backend/passive-tree-engine/graph_test.go`, `planner_test.go`, `ascendancy_test.go`
- `scripts/build-passive-tree-index.js`
- `data/passive-tree/index/summary.json`

Treat these local rules as binding:

- planned nodes must remain connected from the class start;
- mastery nodes only count when the local graph exposes verified mastery effects;
- final confidence stays below full trust when the official passive URL is missing or cannot round-trip.

## Output Format

For each analyzed build, produce:

- `diagnosis`: concise viability judgment.
- `dps_sources`: ordered list of where damage comes from.
- `defense_sources`: ordered list of defensive layers.
- `scaling_bottlenecks`: what prevents the build from scaling.
- `transferable_patterns`: what can be reused in a new build.
- `non_transferable_assumptions`: things that only work because of expensive items, uniques, specific configs or league mechanics.
- `fixes`: concrete changes to tree, gems, items and config.

## Learning Rule

Do not "train" by copying. Learn patterns:

- which support gems appear together and why;
- which item affixes provide the largest marginal gain;
- which notables/masteries are common because they solve a bottleneck;
- which configs are legitimate for boss or mapping;
- which defensive layers are mandatory for the content target.

Always compare learned patterns against the user's budget and fantasy.
