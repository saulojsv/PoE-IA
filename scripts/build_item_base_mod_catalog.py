import json
import re
from collections import defaultdict
from pathlib import Path

from build_item_type_mod_catalog import SOURCES, parse_file


ROOT = Path(__file__).resolve().parents[1]
POB_DATA = ROOT / "external" / "PathOfBuildingTesst" / "src" / "Data"
BASES_DIR = POB_DATA / "Bases"
OUT = ROOT / "data" / "items" / "item_base_mods.json"


SLOT_MAP = {
    "Body Armour": "body",
    "Helmet": "helmet",
    "Gloves": "gloves",
    "Boots": "boots",
    "Belt": "belt",
    "Ring": "ring",
    "Amulet": "amulet",
    "Shield": "offhand",
    "Quiver": "offhand",
    "Jewel": "jewel",
    "Abyss Jewel": "jewel",
    "Flask": "flask",
    "Staff": "twohand",
    "Bow": "twohand",
    "Two Handed Sword": "twohand",
    "Two Handed Axe": "twohand",
    "Two Handed Mace": "twohand",
}


def block_at(text, start):
    depth = 0
    for i in range(start, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                return text[start:i + 1]
    return ""


def pairs(body, key):
    m = re.search(rf"{key}\s*=\s*\{{(.*?)\}}", body, re.S)
    if not m:
        return {}
    return dict(re.findall(r'(\w+)\s*=\s*"?([^,"\s}]+)"?', m.group(1)))


def parse_bases():
    bases = {}
    for path in BASES_DIR.glob("*.lua"):
        text = path.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r'itemBases\["([^"]+)"\]\s*=\s*\{', text):
            name = m.group(1)
            body = block_at(text, m.end() - 1)
            typ = re.search(r'type\s*=\s*"([^"]+)"', body)
            subtype = re.search(r'subType\s*=\s*"([^"]+)"', body)
            implicit = re.search(r'implicit\s*=\s*"([^"]+)"', body)
            req = pairs(body, "req")
            tags = set(pairs(body, "tags"))
            influence = set(re.findall(r'=\s*"([^"]+)"', re.search(r'influenceTags\s*=\s*\{(.*?)\}', body, re.S).group(1))) if "influenceTags" in body else set()
            base_type = typ.group(1) if typ else path.stem.title()
            all_tags = set(tags) | influence | {base_type.lower().replace(" ", "_"), path.stem}
            bases[name] = {
                "base": name,
                "base_type": base_type,
                "sub_type": subtype.group(1) if subtype else "",
                "slot": SLOT_MAP.get(base_type, "weapon" if "weapon" in tags else "other"),
                "socket_limit": int(re.search(r"socketLimit\s*=\s*(\d+)", body).group(1)) if "socketLimit" in body else 0,
                "required_level": int(req.get("level", 0)),
                "requirements": {k: int(v) for k, v in req.items() if str(v).isdigit()},
                "tags": sorted(all_tags),
                "implicit": implicit.group(1) if implicit else "",
            }
    return bases


def main():
    bases = parse_bases()
    mods = []
    for source in SOURCES:
        path = POB_DATA / source
        if path.exists():
            mods.extend(parse_file(path))

    by_base = {}
    mod_index = {}
    slot_counts = defaultdict(int)
    for base, meta in bases.items():
        tagset = set(meta["tags"])
        eligible = []
        for mod in mods:
            matches = [w for w in mod["weights"] if w["item_type"] in tagset]
            if not matches:
                continue
            mod_id = mod["id"]
            mod_index.setdefault(mod_id, {
                "id": mod_id,
                "source": mod["source"],
                "type": mod["type"],
                "affix": mod["affix"],
                "group": mod["group"],
                "min_item_level": mod["level"],
                "tags": mod["tags"],
                "lines": mod["lines"],
            })
            eligible.append([mod_id, max(w["weight"] for w in matches)])
        eligible.sort(key=lambda x: (mod_index[x[0]]["min_item_level"], x[0]))
        by_base[base] = {**meta, "eligible_mods": eligible, "mod_count": len(eligible)}
        slot_counts[meta["slot"]] += 1

    result = {
        "summary": {
            "bases": len(by_base),
            "source_mods": len(mods),
            "unique_mods": len(mod_index),
            "slots": dict(sorted(slot_counts.items())),
        },
        "mods": dict(sorted(mod_index.items())),
        "bases": dict(sorted(by_base.items())),
    }
    OUT.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(result["summary"])


if __name__ == "__main__":
    main()
