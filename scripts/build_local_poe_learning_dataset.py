#!/usr/bin/env python3
import json
import shutil
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "local_poe_learning_dataset"
XML_OUT = OUT / "xml"


def safe(text):
    text = text or "unknown"
    return "".join(c if c.isalnum() or c in "._-" else "_" for c in text)[:100]


def parse_xml(path):
    tree = ET.parse(path)
    root = tree.getroot()
    build = root.find("Build")
    spec = root.find("./Tree/Spec")
    skills = []
    for skill in root.findall(".//Skill"):
        gems = [gem.attrib for gem in skill.findall(".//Gem")]
        if gems:
            skills.append({"attrs": skill.attrib, "gems": gems})
    items = []
    for item in root.findall("./Items/Item"):
        text = (item.text or "").strip()
        lines = [x.strip() for x in text.splitlines() if x.strip()]
        items.append({"attrs": item.attrib, "lines": lines})
    stats = {x.attrib.get("stat"): x.attrib.get("value") for x in build.findall("PlayerStat")} if build is not None else {}
    nodes = []
    if spec is not None:
        nodes = [int(x) for x in spec.attrib.get("nodes", "").split(",") if x.isdigit()]
    return {
        "source_xml": str(path),
        "build": build.attrib if build is not None else {},
        "stats": stats,
        "skills": skills,
        "items": items,
        "passive_nodes": nodes,
    }


def main():
    OUT.mkdir(exist_ok=True)
    XML_OUT.mkdir(parents=True, exist_ok=True)
    seen = set()
    rows = []
    indexes = {
        "skill_to_builds": defaultdict(list),
        "class_to_builds": defaultdict(list),
        "ascendancy_to_builds": defaultdict(list),
        "item_to_builds": defaultdict(list),
        "passive_to_builds": defaultdict(list),
        "support_to_main_skills": defaultdict(list),
    }
    xml_paths = (
        list((ROOT / "archive" / "extraction_samples").glob("*.xml"))
        + list((ROOT / "data" / "xml_inbox").glob("*.xml"))
        + list((ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "xml").rglob("*.xml"))
    )
    for src in xml_paths:
        try:
            row = parse_xml(src)
        except Exception:
            continue
        key = json.dumps({"build": row["build"], "stats": row["stats"], "nodes": row["passive_nodes"]}, sort_keys=True)
        if key in seen:
            continue
        seen.add(key)
        build_id = f"{len(rows):06d}_{safe(row['build'].get('className'))}_{safe(row['build'].get('ascendClassName'))}"
        dst = XML_OUT / f"{build_id}.xml"
        shutil.copy2(src, dst)
        row["id"] = build_id
        row["xml"] = str(dst)
        rows.append(row)
        cls = row["build"].get("className")
        asc = row["build"].get("ascendClassName")
        if cls:
            indexes["class_to_builds"][cls].append(build_id)
        if asc:
            indexes["ascendancy_to_builds"][asc].append(build_id)
        for group in row["skills"]:
            gems = group["gems"]
            if not gems:
                continue
            main = gems[0].get("nameSpec") or gems[0].get("name") or gems[0].get("skillId")
            if main:
                indexes["skill_to_builds"][main].append(build_id)
            for gem in gems[1:]:
                support = gem.get("nameSpec") or gem.get("name") or gem.get("skillId")
                if support and main:
                    indexes["support_to_main_skills"][support].append(main)
        for item in row["items"]:
            lines = item["lines"]
            name = lines[1] if lines and lines[0].startswith("Rarity:") and len(lines) > 1 else (lines[0] if lines else None)
            if name:
                indexes["item_to_builds"][name].append(build_id)
        for node in row["passive_nodes"]:
            indexes["passive_to_builds"][str(node)].append(build_id)
    with (OUT / "builds.jsonl").open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
    for name, data in indexes.items():
        compact = {k: sorted(set(v)) for k, v in data.items()}
        (OUT / f"{name}.json").write_text(json.dumps(compact, ensure_ascii=False, indent=2), encoding="utf-8")
    summary = {"builds": len(rows), "xml_dir": str(XML_OUT), "indexes": list(indexes)}
    (OUT / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
