#!/usr/bin/env python3
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "data" / "local_poe_learning_dataset"
OUT = ROOT / "data" / "local_poe_build_knowledge"
BUILD_NOTES = OUT / "build_notes"

MOVEMENT = {
    "Frostblink", "Flame Dash", "Dash", "Leap Slam", "Shield Charge",
    "Whirling Blades", "Blink Arrow", "Withering Step", "Lightning Warp"
}
AURAS = {
    "Grace", "Determination", "Discipline", "Purity of Elements", "Wrath",
    "Anger", "Hatred", "Zealotry", "Malevolence", "Pride", "Haste",
    "Herald of Ice", "Herald of Thunder", "Herald of Ash", "Tempest Shield",
    "Clarity", "Vitality", "Precision", "Defiance Banner"
}


def num(value, default=0.0):
    try:
        if value == "inf":
            return float("inf")
        return float(value)
    except Exception:
        return default


def gem_name(gem):
    return gem.get("nameSpec") or gem.get("name") or gem.get("skillId") or ""


def item_name(item):
    lines = item.get("lines", [])
    if len(lines) > 1 and lines[0].startswith("Rarity:"):
        return lines[1]
    return lines[0] if lines else ""


def item_rarity(item):
    lines = item.get("lines", [])
    if lines and lines[0].startswith("Rarity:"):
        return lines[0].split(":", 1)[1].strip()
    return ""


def active_skill_groups(row):
    groups = []
    for group in row.get("skills", []):
        gems = [gem_name(g) for g in group.get("gems", []) if gem_name(g)]
        if not gems:
            continue
        active = [g for g in gems if not g.startswith("Support")]
        main = active[0] if active else gems[0]
        supports = [g for g in gems if g != main]
        groups.append({"slot": group.get("attrs", {}).get("slot", ""), "main": main, "supports": supports, "gems": gems})
    return groups


def choose_main_skill(groups, row):
    selected = None
    best = -1
    for group in groups:
        score = len(group["supports"])
        if group["main"] in MOVEMENT or group["main"] in AURAS:
            score -= 10
        if group["slot"] in {"Weapon 1", "Weapon 2", "Body Armour", "Gloves", "Helmet"}:
            score += 1
        if score > best:
            best = score
            selected = group
    return selected or (groups[0] if groups else {"main": "unknown", "supports": [], "slot": "", "gems": []})


def infer_delivery(main, supports):
    text = " ".join([main] + supports).lower()
    if "ballista" in text or "totem" in text:
        return "totem/ballista"
    if "trap" in text:
        return "trap"
    if "mine" in text:
        return "mine"
    if "minion" in text or main.lower().startswith(("summon", "raise")):
        return "minion"
    if "cast on" in text or "trigger" in text or "spellslinger" in text:
        return "trigger"
    return "self-cast/self-attack"


def infer_damage(stats, main, supports):
    labels = []
    text = " ".join([main] + supports).lower()
    if num(stats.get("CritChance")) >= 40 or num(stats.get("CritMultiplier")) >= 3:
        labels.append("crit")
    else:
        labels.append("non-crit/low-crit")
    if "poison" in text or num(stats.get("WithPoisonDPS")) > num(stats.get("TotalDPS")) * 1.2:
        labels.append("poison")
    if "ignite" in text or num(stats.get("IgniteDPS")) > 100000:
        labels.append("ignite")
    if num(stats.get("TotalDot")) > 0 or num(stats.get("TotalDotDPS")) > 0:
        labels.append("dot")
    for key in ["projectile", "melee", "spell", "attack", "elemental", "chaos", "physical", "lightning", "cold", "fire"]:
        if key in text:
            labels.append(key)
    return sorted(set(labels))


def infer_defenses(stats):
    layers = []
    if num(stats.get("Life")) >= 3000:
        layers.append("life pool")
    if num(stats.get("EnergyShield")) >= 2500:
        layers.append("energy shield")
    if num(stats.get("Armour")) >= 15000:
        layers.append("armour")
    if num(stats.get("Evasion")) >= 15000:
        layers.append("evasion")
    if num(stats.get("EffectiveSpellSuppressionChance")) >= 80:
        layers.append("spell suppression")
    if num(stats.get("EffectiveBlockChance")) >= 50:
        layers.append("block")
    if num(stats.get("EffectiveSpellBlockChance")) >= 50:
        layers.append("spell block")
    if num(stats.get("LifeRegenRecovery")) + num(stats.get("LifeLeechGainRate")) > 0:
        layers.append("life recovery")
    if num(stats.get("EnergyShieldRegenRecovery")) + num(stats.get("EnergyShieldLeechGainRate")) > 0:
        layers.append("ES recovery")
    return layers


def gates(stats, groups):
    checks = {
        "fire_res_cap": num(stats.get("FireResist")) >= 75,
        "cold_res_cap": num(stats.get("ColdResist")) >= 75,
        "lightning_res_cap": num(stats.get("LightningResist")) >= 75,
        "chaos_res_non_negative": num(stats.get("ChaosResist")) >= 0,
        "has_recovery": any(num(stats.get(k)) > 0 for k in ("LifeRegenRecovery", "LifeLeechGainRate", "EnergyShieldRegenRecovery", "EnergyShieldLeechGainRate", "ManaLeechGainRate")),
        "mana_usable": num(stats.get("ManaUnreserved")) > max(1, num(stats.get("ManaCost"))),
        "movement_skill": any(g in MOVEMENT for group in groups for g in group["gems"]),
        "attack_hit_capped_if_relevant": num(stats.get("HitChance"), 100) >= 95,
    }
    return checks


def forum_rules():
    return {
        "sources": [
            "https://www.pathofexile.com/forum/view-thread/3884075",
            "https://www.pathofexile.com/forum/view-thread/1162760/page/5",
            "https://www.pathofexile.com/forum/view-thread/1840648",
            "https://github.com/PathOfBuildingCommunity/PathOfBuilding"
        ],
        "rules": [
            "Nao avaliar build so por DPS; checar defesa, recurso, uptime e configuracao do PoB.",
            "Build de ataque critico precisa de hit chance/accuracy, crit chance, crit multi e uptime.",
            "Rares normalmente corrigem vida/ES, resistencias, atributos e custo antes de dano puro.",
            "Unico obrigatorio precisa habilitar uma mecanica clara: trigger, conversao, defesa, reserva, charges ou scaling especial.",
            "Auras e reserva so sao validas se sobrar recurso para usar a skill principal.",
            "Flasks contam como defesa/ofensa, mas precisam de sustain se forem parte central da build.",
            "Nodos, masteries e clusters precisam resolver gargalo real: dano, defesa, recurso, atributo, ailment, recovery ou pathing."
        ]
    }


def build_note(row):
    stats = row.get("stats", {})
    groups = active_skill_groups(row)
    main_group = choose_main_skill(groups, row)
    items = row.get("items", [])
    uniques = [item_name(i) for i in items if item_rarity(i).upper() == "UNIQUE"]
    clusters = [item_name(i) for i in items if "Cluster Jewel" in " ".join(i.get("lines", []))]
    flasks = [item_name(i) for i in items if "Flask" in " ".join(i.get("lines", []))]
    note = {
        "id": row.get("id"),
        "xml": row.get("xml"),
        "identity": {
            "class": row.get("build", {}).get("className"),
            "ascendancy": row.get("build", {}).get("ascendClassName"),
            "level": row.get("build", {}).get("level"),
            "main_skill": main_group["main"],
            "delivery": infer_delivery(main_group["main"], main_group["supports"]),
        },
        "metrics": {
            "dps": stats.get("TotalDPS") or stats.get("CombinedDPS"),
            "combined_dps": stats.get("CombinedDPS"),
            "crit_chance": stats.get("CritChance"),
            "crit_multiplier": stats.get("CritMultiplier"),
            "hit_chance": stats.get("HitChance"),
            "ehp": stats.get("TotalEHP"),
            "life": stats.get("Life"),
            "energy_shield": stats.get("EnergyShield"),
            "fire_res": stats.get("FireResist"),
            "cold_res": stats.get("ColdResist"),
            "lightning_res": stats.get("LightningResist"),
            "chaos_res": stats.get("ChaosResist"),
            "mana_unreserved": stats.get("ManaUnreserved"),
            "mana_cost": stats.get("ManaCost"),
        },
        "logic": {
            "damage_scaling": infer_damage(stats, main_group["main"], main_group["supports"]),
            "defense_layers": infer_defenses(stats),
            "main_supports": main_group["supports"],
            "auras_utility": sorted({g for group in groups for g in group["gems"] if g in AURAS}),
            "movement": sorted({g for group in groups for g in group["gems"] if g in MOVEMENT}),
            "required_or_enabling_uniques": uniques,
            "cluster_jewels": clusters,
            "flasks": flasks,
            "passive_node_count": len(row.get("passive_nodes", [])),
        },
        "functionality_gates": gates(stats, groups),
        "learning_summary": {
            "why_class": "Ascendencia deve justificar mecanica principal, defesa, recurso ou pathing eficiente.",
            "why_skill": "Skill define tags e buckets de scaling; supports e itens precisam conversar com essas tags.",
            "why_items": "Itens sao classificados como habilitadores, dano, defesa, recurso, atributos/resistencias ou flasks.",
            "why_tree": "Nodos/masteries/clusters devem resolver gargalos de dano, defesa, recurso, atributos, ailment, recovery ou pathing."
        }
    }
    note["risks"] = [k for k, ok in note["functionality_gates"].items() if not ok]
    return note


def main():
    OUT.mkdir(exist_ok=True)
    BUILD_NOTES.mkdir(parents=True, exist_ok=True)
    rows = []
    with (DATASET / "builds.jsonl").open("r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                rows.append(json.loads(line))

    by_skill = defaultdict(list)
    by_class = defaultdict(list)
    by_asc = defaultdict(list)
    support_counter = defaultdict(Counter)
    all_notes = []

    for row in rows:
        note = build_note(row)
        all_notes.append(note)
        build_id = note["id"]
        skill = note["identity"]["main_skill"] or "unknown"
        cls = note["identity"]["class"] or "unknown"
        asc = note["identity"]["ascendancy"] or "unknown"
        by_skill[skill].append(build_id)
        by_class[cls].append(build_id)
        by_asc[asc].append(build_id)
        for support in note["logic"]["main_supports"]:
            support_counter[skill][support] += 1
        (BUILD_NOTES / f"{build_id}.json").write_text(json.dumps(note, ensure_ascii=False, indent=2), encoding="utf-8")
        md = [
            f"# {build_id}",
            f"- Skill: {skill}",
            f"- Classe: {cls} / {asc}",
            f"- Entrega: {note['identity']['delivery']}",
            f"- DPS: {note['metrics']['dps']}",
            f"- Defesas: {', '.join(note['logic']['defense_layers']) or 'nenhuma inferida'}",
            f"- Riscos: {', '.join(note['risks']) or 'nenhum gate basico falhou'}",
            f"- XML: {note['xml']}",
        ]
        (BUILD_NOTES / f"{build_id}.md").write_text("\n".join(md) + "\n", encoding="utf-8")

    skill_rules = {}
    for skill, ids in by_skill.items():
        notes = [n for n in all_notes if n["id"] in ids]
        skill_rules[skill] = {
            "build_count": len(ids),
            "classes": sorted({n["identity"]["class"] for n in notes if n["identity"]["class"]}),
            "ascendancies": sorted({n["identity"]["ascendancy"] for n in notes if n["identity"]["ascendancy"]}),
            "deliveries": Counter(n["identity"]["delivery"] for n in notes).most_common(),
            "common_supports": support_counter[skill].most_common(20),
            "common_defenses": Counter(d for n in notes for d in n["logic"]["defense_layers"]).most_common(20),
            "common_uniques": Counter(u for n in notes for u in n["logic"]["required_or_enabling_uniques"]).most_common(20),
            "builds": sorted(ids),
        }

    (OUT / "forum_rules.json").write_text(json.dumps(forum_rules(), ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "build_knowledge.jsonl").write_text("\n".join(json.dumps(n, ensure_ascii=False) for n in all_notes) + "\n", encoding="utf-8")
    (OUT / "skill_rules.json").write_text(json.dumps(skill_rules, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "class_index.json").write_text(json.dumps({k: sorted(v) for k, v in by_class.items()}, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "ascendancy_index.json").write_text(json.dumps({k: sorted(v) for k, v in by_asc.items()}, ensure_ascii=False, indent=2), encoding="utf-8")
    summary = {
        "builds": len(all_notes),
        "skills": len(skill_rules),
        "folder": str(OUT),
        "notes": str(BUILD_NOTES),
        "source_dataset": str(DATASET),
    }
    (OUT / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "README.md").write_text(
        "# Local PoE Build Knowledge\n\n"
        "Base local para o agente entender como builds funcionam a partir de XMLs do PoB/poe.ninja e regras extraidas de forum.\n\n"
        "- `build_notes/`: nota JSON e Markdown por build.\n"
        "- `build_knowledge.jsonl`: todas as notas em JSONL para treino/RAG.\n"
        "- `skill_rules.json`: padroes por skill.\n"
        "- `class_index.json`: builds por classe.\n"
        "- `ascendancy_index.json`: builds por ascendencia.\n"
        "- `forum_rules.json`: regras gerais de interpretacao vindas do forum.\n",
        encoding="utf-8",
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
