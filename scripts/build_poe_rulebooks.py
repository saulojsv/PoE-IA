#!/usr/bin/env python3
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KB = ROOT / "data" / "local_poe_build_knowledge"
RULEBOOK = KB / "rulebooks"


def read_json(path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def read_jsonl(path):
    if not path.exists():
        return []
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]


def main():
    RULEBOOK.mkdir(parents=True, exist_ok=True)
    fundamentals = read_json(KB / "poe_fundamentals.json", {})
    learning = read_json(KB / "learning_index.json", {})
    rules = read_jsonl(KB / "forum_rules_compact.jsonl")
    builds = read_jsonl(KB / "build_knowledge.jsonl")

    by_tax = defaultdict(list)
    for r in rules:
        for tax in r.get("taxonomy", ["general"]):
            by_tax[tax].append({
                "source": r.get("source"),
                "confidence": r.get("confidence"),
                "priority": r.get("priority"),
                "text": r.get("text")
            })

    build_checklist = {
        "identity": ["role", "main_skill", "class", "ascendancy", "delivery_method", "content_target"],
        "minimum_functionality": [
            "main skill enabled",
            "legal supports",
            "compatible weapon/base",
            "attribute requirements met",
            "mana/life/ES cost payable",
            "movement skill",
            "flask setup"
        ],
        "defense_gates": [
            "elemental resistances at 75% minimum",
            "chaos resistance plan",
            "life or ES pool appropriate for content",
            "recovery layer",
            "physical hit mitigation",
            "elemental hit mitigation",
            "DoT mitigation/recovery",
            "ailment handling",
            "bleed/corrupted blood answer",
            "curse/map mod awareness"
        ],
        "damage_gates": [
            "skill tags identified",
            "scaling buckets match tags",
            "crit or non-crit plan",
            "accuracy/hit chance if attack",
            "single target plan",
            "clear plan",
            "uptime of charges/flasks/curses/exposure",
            "PoB config audited"
        ],
        "item_gates": [
            "required uniques identified",
            "rare affixes categorized",
            "weapon/offhand matches skill",
            "resist/attribute fillers",
            "jewel/cluster dependency",
            "budget and upgrade path"
        ],
        "tree_gates": [
            "connected passive tree",
            "efficient pathing",
            "keystones justified",
            "notables solve bottlenecks",
            "masteries solve concrete needs",
            "cluster jewel point cost justified",
            "jewel sockets have value"
        ]
    }

    combination_logic = {
        "build_formula": "skill tags + delivery + ascendancy package + item enablers + tree pathing + defenses + resource solution + PoB realism",
        "rules": [
            "Never optimize DPS before functionality gates.",
            "Class choice must reduce pathing cost or provide a mechanic package.",
            "Ascendancy must solve damage, defense, resource, uptime, minions, totems, traps/mines, flasks, charges, or ailments.",
            "Supports must match skill tags and damage type.",
            "Required uniques must enable a mechanic, not just add popularity.",
            "Rare items first fix resists, attributes, life/ES, cost, accuracy, suppression, or damage gaps.",
            "Passive nodes are valid only when they solve a bottleneck or unlock efficient pathing.",
            "PoB DPS is not accepted until config assumptions are explicit."
        ]
    }

    observed_patterns = defaultdict(lambda: {"count": 0, "classes": defaultdict(int), "ascendancies": defaultdict(int), "supports": defaultdict(int), "defenses": defaultdict(int), "risks": defaultdict(int)})
    for b in builds:
        ident = b.get("identity", {})
        logic = b.get("logic", {})
        skill = ident.get("main_skill") or "unknown"
        row = observed_patterns[skill]
        row["count"] += 1
        row["classes"][ident.get("class") or "unknown"] += 1
        row["ascendancies"][ident.get("ascendancy") or "unknown"] += 1
        for x in logic.get("main_supports", []):
            row["supports"][x] += 1
        for x in logic.get("defense_layers", []):
            row["defenses"][x] += 1
        for x in b.get("risks", []):
            row["risks"][x] += 1

    observed = {}
    for skill, row in observed_patterns.items():
        observed[skill] = {
            "count": row["count"],
            "classes": sorted(row["classes"].items(), key=lambda x: -x[1]),
            "ascendancies": sorted(row["ascendancies"].items(), key=lambda x: -x[1]),
            "supports": sorted(row["supports"].items(), key=lambda x: -x[1])[:20],
            "defenses": sorted(row["defenses"].items(), key=lambda x: -x[1])[:20],
            "risks": sorted(row["risks"].items(), key=lambda x: -x[1])[:20]
        }

    files = {
        "base_rules.json": fundamentals,
        "build_construction_checklist.json": build_checklist,
        "combination_logic.json": combination_logic,
        "learned_rules_by_taxonomy.json": {k: v[:300] for k, v in by_tax.items()},
        "observed_build_patterns.json": observed,
        "learning_units.json": learning.get("learning_units", [])
    }
    for name, data in files.items():
        (RULEBOOK / name).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    index = {
        "folder": str(RULEBOOK),
        "files": sorted(files),
        "rules": len(rules),
        "builds": len(builds),
        "learning_units": len(files["learning_units.json"])
    }
    (RULEBOOK / "README.json").write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(index, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
