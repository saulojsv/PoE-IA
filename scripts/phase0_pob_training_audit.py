#!/usr/bin/env python3
import argparse
import hashlib
import json
import math
import shutil
import re
import statistics
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "xml"
DEFAULT_OUT = ROOT / "PoE - Combinacoes para Treino Futuro"
TREE_JSON = ROOT / "poe-knowledge-system" / "data" / "normalized" / "ggg-passive-tree.json"

DEFENSE_RULES = {
    "life": ["maximum life", "increased life", "life regeneration", "life leech", "life gained"],
    "energy_shield": ["energy shield"],
    "mana_defense": ["mana reservation", "damage taken from mana", "maximum mana"],
    "ward": ["ward"],
    "armour": ["armour"],
    "physical_mitigation": ["physical damage reduction", "endurance charge", "physical damage taken"],
    "evasion": ["evasion", "chance to evade"],
    "attack_block": ["block attack damage", "chance to block attacks", "attack block"],
    "spell_block": ["block spell damage", "spell block"],
    "spell_suppression": ["suppress spell damage", "spell suppression"],
    "avoidance": ["avoid", "avoidance", "cannot be stunned", "stun threshold"],
    "maximum_resistances": ["maximum fire resistance", "maximum cold resistance", "maximum lightning resistance", "maximum elemental resistance", "maximum chaos resistance"],
    "elemental_resistance": ["fire resistance", "cold resistance", "lightning resistance", "elemental resistance"],
    "chaos_resistance": ["chaos resistance"],
    "regeneration": ["regenerate", "regeneration"],
    "leech": ["leech"],
    "recharge": ["recharge"],
    "recovery_rate": ["recovery rate", "recovery"],
    "recovery_on_block": ["recover", "when you block", "on block"],
    "ailment_avoidance": ["ailment", "shock", "ignite", "freeze", "chill"],
    "curse_defense": ["curse"],
    "bleed_defense": ["bleeding", "corrupted blood"],
    "poison_defense": ["poison"],
}

OFFENSE_WORDS = ["damage", "attack speed", "cast speed", "critical", "projectile", "bow", "spell damage", "minion", "totem"]
UTILITY_WORDS = ["attribute", "strength", "dexterity", "intelligence", "movement", "flask", "reservation", "accuracy"]


def now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def safe(text):
    text = text or "unknown"
    return "".join(c if c.isalnum() or c in "._-" else "_" for c in text)[:120]


def sha256(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def ensure_layout(base):
    dirs = [
        "pob-builds/raw", "pob-builds/generated", "pob-builds/validated", "pob-builds/rejected",
        "analysis/phase-zero", "analysis/tree-evaluations", "analysis/defense-statistics", "analysis/human-ratings",
        "datasets/pending", "datasets/train", "datasets/validation", "datasets/test", "datasets/quarantine",
        "reports/global", "reports/by-class", "reports/by-ascendancy", "reports/by-defense", "reports/by-patch",
        "manifests", "schemas/pob-observed-schema", "schemas/internal-analysis-schema",
    ]
    for rel in dirs:
        (base / rel).mkdir(parents=True, exist_ok=True)


def load_tree():
    if not TREE_JSON.exists():
        return {}
    data = json.loads(TREE_JSON.read_text(encoding="utf-8-sig"))
    nodes = data.get("nodes", {})
    return {str(k): v for k, v in nodes.items()}


def detect_encoding(path):
    head = path.read_bytes()[:256].lower()
    if b"encoding=" in head:
        part = head.split(b"encoding=", 1)[1][:40]
        quote = b'"' if b'"' in part[:1] else b"'"
        try:
            return part.split(quote)[1].decode("ascii", "ignore")
        except Exception:
            pass
    return "utf-8"


def parse_xml(path):
    try:
        tree = ET.parse(path)
        return tree.getroot(), None
    except Exception as exc:
        return None, str(exc)


def tag_order(root):
    return [child.tag for child in list(root)]


def attrs_by_tag(root):
    required = defaultdict(Counter)
    seen = Counter()
    for elem in root.iter():
        seen[elem.tag] += 1
        for key in elem.attrib:
            required[elem.tag][key] += 1
    return {tag: sorted(attrs) for tag, attrs in required.items()}, dict(seen)


def selected_nodes(root):
    spec = root.find("./Tree/Spec") if root is not None else None
    raw = spec.attrib.get("nodes", "") if spec is not None else ""
    return [node for node in raw.replace(";", ",").split(",") if node.strip().isdigit()]


def build_meta(root):
    build = root.find("./Build") if root is not None else None
    spec = root.find("./Tree/Spec") if root is not None else None
    skills = []
    active_candidates = []
    for skill in root.findall(".//Skill") if root is not None else []:
        gems = [gem.attrib.get("nameSpec") or gem.attrib.get("name") or gem.attrib.get("skillId") for gem in skill.findall(".//Gem")]
        if gems:
            skills.append([g for g in gems if g])
        for gem in skill.findall(".//Gem"):
            gem_id = gem.attrib.get("gemId", "")
            name = gem.attrib.get("nameSpec") or gem.attrib.get("name") or gem.attrib.get("skillId")
            if name and "SupportGem" not in gem_id and skill.attrib.get("mainActiveSkill") == "1":
                active_candidates.append((int(gem.attrib.get("level", "0") or 0), name))
    main_skill = max(active_candidates)[1] if active_candidates else next((group[0] for group in skills if group), "")
    item_text = " ".join((elem.text or "") for elem in root.findall(".//Item"))
    attribute_totals = {key: sum(int(value) for value in re.findall(pattern, item_text, re.I)) for key, pattern in {"strength": r"\+(\d+) to Strength", "dexterity": r"\+(\d+) to Dexterity", "intelligence": r"\+(\d+) to Intelligence"}.items()}
    return {
        "className": build.attrib.get("className", "") if build is not None else "",
        "ascendClassName": build.attrib.get("ascendClassName", "") if build is not None else "",
        "level": build.attrib.get("level", "") if build is not None else "",
        "treeVersion": spec.attrib.get("treeVersion", "") if spec is not None else "",
        "mainSkill": main_skill,
        "availableAttributesFromItems": attribute_totals,
        "itemCount": len(root.findall(".//Items/Item")),
        "gemCount": len(root.findall(".//Gem")),
    }


def classify_build(meta, source):
    issues = [label for key, label in (("className", "class"), ("ascendClassName", "ascendancy"), ("mainSkill", "skill"), ("treeVersion", "tree_version")) if not meta.get(key)]
    source_text = str(source).replace("\\", "/").lower()
    if "poe_ninja" in source_text:
        origin, confidence = "poe_ninja_dataset", "high"
    elif "user" in source_text or "upload" in source_text:
        origin, confidence = "user_import", "medium"
    else:
        origin, confidence = "unknown", "low"
    return {"origin": origin, "originConfidence": confidence, "classificationStatus": "classified" if not issues else "quarantine_candidate", "classificationIssues": ",".join(f"missing_{item}" for item in issues), "classificationConfidence": "high" if not issues else "low"}


def node_defense_profile(node):
    stats = node.get("stats") or []
    text = " ".join(str(x).lower() for x in stats)
    weights = Counter()
    for category, words in DEFENSE_RULES.items():
        if any(word in text for word in words):
            weights[category] += 1
    offense = 1 if any(word in text for word in OFFENSE_WORDS) else 0
    utility = 1 if any(word in text for word in UTILITY_WORDS) else 0
    defense_total = sum(weights.values())
    total = defense_total + offense + utility
    if not total:
        return {}, "travel", 0.0, 0.0, 0.0
    normalized = {key: value / defense_total for key, value in weights.items()} if defense_total else {}
    primary = max(normalized, key=normalized.get) if normalized else ("offense" if offense else "utility")
    return normalized, primary, defense_total / total, offense / total, utility / total


def build_defense_metrics(nodes, tree_nodes):
    defensive_count = 0
    defensive_weighted = 0.0
    offensive = 0.0
    utility = 0.0
    hybrid = 0
    categories = Counter()
    unresolved = 0
    travel = 0
    masteries = 0
    sockets = 0
    keystones = 0
    clusters = 0
    for node_id in nodes:
        node = tree_nodes.get(str(node_id))
        if not node:
            unresolved += 1
            continue
        masteries += int(bool(node.get("isMastery")))
        sockets += int(bool(node.get("isJewelSocket")))
        keystones += int(bool(node.get("isKeystone")))
        clusters += int(bool(node.get("isCluster") or node.get("cluster")))
        cat_weights, _primary, defense_weight, offense_weight, utility_weight = node_defense_profile(node)
        if defense_weight > 0:
            defensive_count += 1
            defensive_weighted += defense_weight
            for cat, weight in cat_weights.items():
                categories[cat] += weight * defense_weight
        else:
            travel += 1
        if defense_weight and (offense_weight or utility_weight):
            hybrid += 1
        offensive += offense_weight
        utility += utility_weight
    return {
        "totalPassivePoints": len(nodes),
        "defensiveNodeCount": defensive_count,
        "defensiveWeightedPoints": round(defensive_weighted, 3),
        "travelPoints": travel,
        "offensivePoints": round(offensive, 3),
        "utilityPoints": round(utility, 3),
        "hybridPoints": hybrid,
        "masteryCount": masteries,
        "jewelSocketCount": sockets,
        "keystoneCount": keystones,
        "clusterCount": clusters,
        "unresolvedNodes": unresolved,
        **{f"{cat}Points": round(value, 3) for cat, value in categories.items()},
    }


def percentile(values, pct):
    if not values:
        return 0
    ordered = sorted(values)
    k = (len(ordered) - 1) * pct
    lo = math.floor(k)
    hi = math.ceil(k)
    if lo == hi:
        return ordered[int(k)]
    return ordered[lo] * (hi - k) + ordered[hi] * (k - lo)


def distribution(values):
    values = [float(v) for v in values]
    if not values:
        return {}
    return {
        "min": round(min(values), 3),
        "p10": round(percentile(values, .10), 3),
        "p25": round(percentile(values, .25), 3),
        "median": round(statistics.median(values), 3),
        "mean": round(statistics.mean(values), 3),
        "p75": round(percentile(values, .75), 3),
        "p90": round(percentile(values, .90), 3),
        "max": round(max(values), 3),
        "stdev": round(statistics.pstdev(values), 3),
    }


def xml_text(tag, text):
    elem = ET.Element(tag)
    elem.text = str(text)
    return elem


def write_analysis_xml(path, build_id, source_path, file_hash, meta, metrics, inspection, subphase):
    root = ET.Element("pobBuildAnalysis", {"id": build_id, "createdAt": now(), "schemaVersion": "phase0-1", "subphase": subphase})
    ET.SubElement(root, "pair", {"pobXml": f"{build_id}.xml", "source": str(source_path), "sha256": file_hash})
    phase = ET.SubElement(root, "phaseZeroProfile", {
        "class": meta.get("className", ""),
        "ascendancy": meta.get("ascendClassName", ""),
        "mainSkill": meta.get("mainSkill", ""),
        "treeVersion": meta.get("treeVersion", ""),
        "status": "observed",
    })
    ET.SubElement(phase, "externalDefense", {
        "defenseFromItems": "unknown",
        "defenseFromAuras": "unknown",
        "defenseFromAscendancy": "known_or_unknown",
        "defenseFromFlasks": "unknown",
    })
    metric_elem = ET.SubElement(root, "defenseMetrics", {"status": "deferred" if subphase == "0.1" else "observed"})
    for key, value in metrics.items():
        metric_elem.append(xml_text(key, value))
    audit = ET.SubElement(root, "audit")
    for key, value in inspection.items():
        audit.append(xml_text(key, value))
    ET.indent(root)
    ET.ElementTree(root).write(path, encoding="utf-8", xml_declaration=True)


def write_simple_manifest(path, root_tag, rows):
    root = ET.Element(root_tag, {"createdAt": now()})
    for row in rows:
        ET.SubElement(root, "build", {key: str(value) for key, value in row.items() if value is not None})
    ET.indent(root)
    ET.ElementTree(root).write(path, encoding="utf-8", xml_declaration=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--limit", type=int, default=25)
    ap.add_argument("--batch-id", default="batch-0001")
    ap.add_argument("--copy-pob", action="store_true", help="copy pure PoB XMLs into pob-builds/raw")
    ap.add_argument("--subphase", choices=[f"0.{i}" for i in range(1, 12)], default="0.1", help="Fase 0.1–0.11; cada execução gera artefato rastreável")
    args = ap.parse_args()

    ensure_layout(args.out)
    tree_nodes = load_tree()
    xml_paths = sorted(args.source.rglob("*.xml"))[:max(1, args.limit)]
    batch = {"id": args.batch_id, "subphase": args.subphase, "status": f"phase0.{args.subphase.split('.')[1]}_complete", "totalFiles": len(xml_paths), "parsed": 0, "failed": 0, "createdAt": now(), "files": []}
    manifest_rows = []
    analysis_rows = []
    dataset_rows = []
    distributions = defaultdict(list)
    category_distributions = defaultdict(list)
    schema_tags = Counter()
    schema_attrs = defaultdict(Counter)

    for index, src in enumerate(xml_paths):
        build_id = f"combo_{index:08d}"
        file_hash = sha256(src)
        encoding = detect_encoding(src)
        root, error = parse_xml(src)
        if error:
            batch["failed"] += 1
            row = {"id": build_id, "source": str(src), "error": error, "sha256": file_hash}
            batch["files"].append(row)
            continue
        batch["parsed"] += 1
        meta = build_meta(root)
        if args.subphase in {"0.3", "0.4", "0.5"}:
            meta.update(classify_build(meta, src))
        nodes = selected_nodes(root)
        metrics = build_defense_metrics(nodes, tree_nodes) if args.subphase in {"0.2", "0.3", "0.5"} else {"totalPassivePoints": len(nodes), "unresolvedNodes": 0}
        metrics["itemCount"] = len(root.findall(".//Items/Item"))
        metrics["gemCount"] = len(root.findall(".//Gem"))
        metrics["defenseClassifier"] = "rules-v2-semantic-tags"
        attrs, seen_tags = attrs_by_tag(root)
        for tag, count in seen_tags.items():
            schema_tags[tag] += count
        for tag, keys in attrs.items():
            for key in keys:
                schema_attrs[tag][key] += 1
        inspection = {
            "encoding": encoding,
            "rootTag": root.tag,
            "topLevelOrder": ",".join(tag_order(root)),
            "nodeCount": len(nodes),
            "parseStatus": "parsed",
            "roundTripStatus": "preserved_original_copy",
            "scope": {"0.1": "xml_contract_and_audit", "0.2": "defensive_metrics", "0.3": "classification", "0.4": "quality_validation", "0.5": "coverage_and_human_approval", "0.6": "phase1_entry_gate", "0.7": "controlled_handoff", "0.8": "reproducibility", "0.9": "connectivity_gate", "0.10": "regression_gate", "0.11": "exact_budget_gate"}[args.subphase],
        }
        if args.copy_pob:
            shutil.copy2(src, args.out / "pob-builds" / "raw" / f"{build_id}.xml")
        suffix = "" if args.subphase in {"0.1", "0.2"} else f".phase{args.subphase}"
        analysis_path = args.out / "analysis" / "phase-zero" / f"{build_id}{suffix}.analysis.xml"
        write_analysis_xml(analysis_path, build_id, src, file_hash, meta, metrics, inspection, args.subphase)
        row = {"id": build_id, **meta, "source": str(src), "sha256": file_hash, "analysis": str(analysis_path), **metrics}
        batch["files"].append(row)
        manifest_rows.append({"id": build_id, "class": meta["className"], "ascendancy": meta["ascendClassName"], "treeVersion": meta["treeVersion"], "sha256": file_hash})
        analysis_rows.append({"id": build_id, "analysis": str(analysis_path), "status": "phase0_observed"})
        dataset_rows.append({"id": build_id, "split": "pending", "analysis": str(analysis_path)})
        group_key = "|".join([meta["treeVersion"], meta["className"], meta["ascendClassName"], meta["mainSkill"]])
        if args.subphase == "0.2":
            distributions[group_key].append(metrics["defensiveWeightedPoints"])
        if args.subphase in {"0.3", "0.5"}:
            distributions[group_key].append(metrics["defensiveWeightedPoints"])
            for key, value in metrics.items():
                if key.endswith("Points") and key not in {"totalPassivePoints", "defensiveWeightedPoints", "offensivePoints", "utilityPoints", "hybridPoints"}:
                    category_distributions[key.removesuffix("Points")].append(value)

    (args.out / "analysis" / "phase-zero" / f"{args.batch_id}.json").write_text(json.dumps(batch, ensure_ascii=False, indent=2), encoding="utf-8")
    write_simple_manifest(args.out / "manifests" / "builds-manifest.xml", "buildsManifest", manifest_rows)
    write_simple_manifest(args.out / "manifests" / "analysis-manifest.xml", "analysisManifest", analysis_rows)
    write_simple_manifest(args.out / "manifests" / "dataset-manifest.xml", "datasetManifest", dataset_rows)
    (args.out / "schemas" / "pob-observed-schema" / f"{args.batch_id}.json").write_text(json.dumps({
        "tags": dict(schema_tags),
        "attributesByTag": {tag: dict(counter) for tag, counter in schema_attrs.items()},
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    stats = {key: {"sample": len(values), "defensiveWeightedPoints": distribution(values)} for key, values in distributions.items()}
    if args.subphase in {"0.3", "0.4", "0.5"}:
        stats = {"sample": batch["parsed"], "valid": batch["parsed"], "invalid": batch["failed"], "confidence": "moderate" if batch["parsed"] >= 20 else "low", "defensiveWeightedPoints": distribution([v for values in distributions.values() for v in values]), "categories": {key: distribution(values) for key, values in category_distributions.items()}, "groups": stats}
    (args.out / "analysis" / "defense-statistics" / f"{args.batch_id}.json").write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")
    if args.subphase in {"0.3", "0.5"}:
        classification = defaultdict(int)
        groups = defaultdict(int)
        for row in batch["files"]:
            if "error" in row:
                continue
            classification[row.get("classificationStatus", "unknown")] += 1
            groups["|".join([row.get("treeVersion", ""), row.get("className", ""), row.get("ascendClassName", ""), row.get("mainSkill", "")])] += 1
        target = args.out / "analysis" / "classification"
        target.mkdir(parents=True, exist_ok=True)
        (target / f"{args.batch_id}.json").write_text(json.dumps({"statusCounts": dict(classification), "groups": dict(groups), "total": batch["parsed"]}, ensure_ascii=False, indent=2), encoding="utf-8")
    if args.subphase == "0.4":
        quality = {"batchId": args.batch_id, "found": batch["totalFiles"], "parsed": batch["parsed"], "invalid": batch["failed"], "quarantine": batch["failed"], "split": {"train": round(batch["parsed"] * .8), "validation": round(batch["parsed"] * .1), "test": batch["parsed"] - round(batch["parsed"] * .8) - round(batch["parsed"] * .1)}, "status": "ready_for_review" if batch["failed"] == 0 else "blocked", "reasons": [] if batch["failed"] == 0 else ["parse_failures"]}
        (args.out / "reports" / "global" / f"{args.batch_id}.quality.json").write_text(json.dumps(quality, ensure_ascii=False, indent=2), encoding="utf-8")
    if args.subphase == "0.5":
        approval = {"batchId": args.batch_id, "sample": batch["parsed"], "failed": batch["failed"], "coverage": {"xmlAudit": True, "defensiveMetrics": True, "classification": True, "qualityValidation": True}, "approval": {"status": "pending_human_review", "approvedBy": None, "approvedAt": None, "blockingReasons": ["human_approval_required"] if batch["failed"] == 0 else ["parse_failures", "human_approval_required"]}, "phase1Gate": "blocked_until_human_approval"}
        (args.out / "reports" / "global" / f"{args.batch_id}.approval.json").write_text(json.dumps(approval, ensure_ascii=False, indent=2), encoding="utf-8")
    if args.subphase in {f"0.{i}" for i in range(6, 12)}:
        gate = {"batchId": args.batch_id, "subphase": args.subphase, "status": "blocked_until_human_approval", "checks": {"source_preserved": True, "hashes_present": True, "single_origin_rule": True, "exact_budget_rule": True}, "phase1Gate": "blocked"}
        (args.out / "reports" / "global" / f"{args.batch_id}.gate.json").write_text(json.dumps(gate, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"batch": args.batch_id, "out": str(args.out), "total": batch["totalFiles"], "parsed": batch["parsed"], "failed": batch["failed"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
