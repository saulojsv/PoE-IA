# Items, Support Gems And PoB Config Combinations

Use this when item parameters, support gems, or PoB config assumptions are part of the dataset.

## Item Parameters

Represent item candidates structurally:

- slot;
- base type and base ID;
- item level;
- rarity;
- influence/eldritch/fracture/corruption state;
- implicit mods;
- explicit prefixes;
- explicit suffixes;
- crafted mods;
- enchant/corrupted mods;
- affix families;
- mod IDs when trusted;
- source and validation state.

Never train items as fantasy text only. Text is export format; training features must be structured.

## Item Hard Gates

- legal slot/base;
- item level supports selected mods;
- prefix/suffix capacity;
- mod group conflicts;
- influence/craft/corruption requirements;
- unique exact mods known or PoB imported;
- requirements/resistances/mana blockers evaluated.

## Support Gem Parameters

Support setup rows should include:

- active skill;
- active skill tags;
- support gem list;
- support gem tags;
- link count;
- gem levels and quality;
- compatibility labels;
- contradiction labels.

Block or penalize:

- minion supports on non-minion skills;
- melee supports on non-melee skills;
- projectile supports without projectile behavior;
- poison/ignite/bleed supports without ailment plan;
- duplicate supports;
- unsupported or unknown gems.

## PoB Config Parameters

Config assumptions must have source evidence:

- boss type;
- charges;
- flask uptime;
- curses;
- exposure;
- wither;
- shock/chill/scorch/brittle/sap;
- minion/totem/trap/mine count;
- enemy condition;
- ailment chance and effect.

Do not train fake config as positive. Unsupported config should become a warning/blocker and negative or low-score label.

## Combined Candidate Score

Recommended visible decomposition:

```text
final_score =
  tree_score
+ support_score
+ item_feasibility_score
+ config_realism_score
+ xml_roundtrip_score
+ defense_gate_score
+ budget_score
- blocker_penalty
- overfit_signature_penalty
```

Final PoB DPS/EHP labels require PoB validation. Otherwise use draft metrics with `pob_app_metrics_pending`.

## Full Golden XML Join

Use the project full-golden contract before complete-build training:

- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\33-full-pob-xml-golden-dataset-contract.md`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\pob_full_xml_golden_contract.json`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\pob_full_xml_golden_summary.json`

The final row must join tree, item, gem and Config phases. Keep separate labels for `treeLegal`, `itemLegal`, `gemsCompatible`, `configSourcesPresent`, `xmlStructureCompatible`, `roundTripOk` and `pobValidated`.

Do not activate PoB Config inputs just because they increase DPS. Each enabled charge, ailment, exposure, curse, flask uptime, brand count, enemy override or placeholder must cite a source from tree, ascendancy, items, gems, flasks or explicit user intent.
