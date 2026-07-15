import json
import re
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
POB_DATA = ROOT / "external" / "PathOfBuildingTesst" / "src" / "Data"
OUT = ROOT / "data" / "items" / "item_type_mods.json"


SOURCES = [
    "ModExplicit.lua",
    "ModImplicit.lua",
    "ModMaster.lua",
    "ModVeiled.lua",
    "ModEldritch.lua",
    "ModCorrupted.lua",
    "ModSynthesis.lua",
    "ModJewel.lua",
    "ModJewelAbyss.lua",
    "ModJewelCluster.lua",
    "ModFlask.lua",
    "ModDelve.lua",
    "ModScourge.lua",
    "ModFoulborn.lua",
    "ModGraft.lua",
    "ModItemExclusive.lua",
    "ModJewelCharm.lua",
    "ModNecropolis.lua",
    "ModTincture.lua",
]


def strings_in_array(body, key):
    match = re.search(rf"{key}\s*=\s*\{{(.*?)\}}", body)
    if not match:
        return []
    return re.findall(r'"([^"]+)"', match.group(1))


def numbers_in_array(body, key):
    match = re.search(rf"{key}\s*=\s*\{{(.*?)\}}", body)
    if not match:
        return []
    return [int(x) for x in re.findall(r"-?\d+", match.group(1))]


def first_string_fields(body):
    fields = []
    for part in body.split(","):
        part = part.strip()
        if part.startswith(("type =", "affix =", "group =", "level =", "statOrder", "weightKey", "weightVal", "modTags", "tradeHashes")):
            continue
        if part.startswith('"') and part.endswith('"'):
            fields.append(part.strip('"'))
    return fields


def parse_file(path):
    text = path.read_text(encoding="utf-8", errors="ignore")
    category = path.stem.replace("Mod", "") or "General"
    for match in re.finditer(r'\["([^"]+)"\]\s*=\s*\{(.*?)\},\n', text, re.S):
        mod_id, body = match.groups()
        mtype = re.search(r'type\s*=\s*"([^"]+)"', body)
        affix = re.search(r'affix\s*=\s*"([^"]+)"', body)
        group = re.search(r'group\s*=\s*"([^"]+)"', body)
        level = re.search(r'level\s*=\s*(\d+)', body)
        keys = strings_in_array(body, "weightKey")
        vals = numbers_in_array(body, "weightVal")
        tags = strings_in_array(body, "modTags")
        lines = first_string_fields(body)
        weighted = []
        for i, key in enumerate(keys):
            val = vals[i] if i < len(vals) else 0
            if key != "default" and val > 0:
                weighted.append({"item_type": key, "weight": val})
        if not weighted:
            continue
        yield {
            "id": mod_id,
            "source": category,
            "type": mtype.group(1) if mtype else "",
            "affix": affix.group(1) if affix else "",
            "group": group.group(1) if group else "",
            "level": int(level.group(1)) if level else 0,
            "tags": tags,
            "lines": lines,
            "weights": weighted,
        }


def main():
    by_type = defaultdict(list)
    source_counts = defaultdict(int)
    for name in SOURCES:
        path = POB_DATA / name
        if not path.exists():
            continue
        for mod in parse_file(path):
            source_counts[mod["source"]] += 1
            for weight in mod["weights"]:
                entry = {k: v for k, v in mod.items() if k != "weights"}
                entry["weight"] = weight["weight"]
                by_type[weight["item_type"]].append(entry)
    result = {
        "summary": {
            "item_types": len(by_type),
            "mods_by_source": dict(sorted(source_counts.items())),
            "total_type_mod_links": sum(len(v) for v in by_type.values()),
        },
        "item_types": dict(sorted(by_type.items())),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(result["summary"])


if __name__ == "__main__":
    main()
