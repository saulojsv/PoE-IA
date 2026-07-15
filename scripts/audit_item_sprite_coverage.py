import json
import re
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
XML_ROOT = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "xml"
INDEX = ROOT / "dashboard" / "item_sprite_index.json"
OUT = ROOT / "data" / "items" / "missing_sprite_bases.json"
BASES_DIR = ROOT / "external" / "PathOfBuildingTesst" / "src" / "Data" / "Bases"


def clean(line):
    return re.sub(r"<[^>]+>", "", line).strip()


def load_base_names():
    names = set()
    if BASES_DIR.exists():
        for path in BASES_DIR.glob("*.lua"):
            names.update(re.findall(r'itemBases\["([^"]+)"\]', path.read_text(encoding="utf-8", errors="ignore")))
    return names


BASE_NAMES = load_base_names()


def first_base_line(lines, start=2):
    for line in lines[start:14]:
        if line in BASE_NAMES:
            return line
    return ""


def parse_item(text):
    lines = [clean(x) for x in text.splitlines() if clean(x)]
    if not lines:
        return None
    rarity = lines[0].replace("Rarity:", "").strip().title() if lines[0].startswith("Rarity:") else ""
    name = lines[1] if rarity and len(lines) > 1 else lines[0]
    base = ""
    if rarity in {"Rare", "Magic"} and len(lines) > 2:
        base = first_base_line(lines, 2)
    elif len(lines) > 1 and not lines[1].startswith(("Unique ID:", "Item Level:", "LevelReq:", "Implicits:")):
        base = lines[1]
    return {"name": name, "base": base or name, "rarity": rarity}


def main():
    sprites = json.loads(INDEX.read_text(encoding="utf-8")) if INDEX.exists() else {}
    missing = Counter()
    covered = Counter()
    for path in XML_ROOT.rglob("*.xml"):
        try:
            root = ET.parse(path).getroot()
        except Exception:
            continue
        for node in root.findall(".//Item"):
            if not node.text:
                continue
            item = parse_item(node.text)
            if not item:
                continue
            key = item["base"] if item["rarity"] in {"Rare", "Magic", "Normal"} else item["name"]
            if sprites.get(key) or sprites.get(item["base"]):
                covered[key] += 1
            else:
                missing[key] += 1
    result = {
        "covered_keys": len(covered),
        "missing_keys": len(missing),
        "missing": [{"name_or_base": k, "uses": v} for k, v in missing.most_common()],
    }
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print({"covered_keys": result["covered_keys"], "missing_keys": result["missing_keys"], "out": str(OUT)})


if __name__ == "__main__":
    main()
