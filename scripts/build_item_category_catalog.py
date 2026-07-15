import json
import re
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path

from generate_build_dashboard import item_slot


ROOT = Path(__file__).resolve().parents[1]
XML_ROOT = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "xml"
OUT = ROOT / "data" / "items" / "item_category_catalog.json"


SLOT_TO_CATEGORY = {
    "body": "Armor",
    "helmet": "Helmet",
    "gloves": "Gloves",
    "boots": "Boots",
    "belt": "Belt",
    "ring": "Ring",
    "amulet": "Amulet",
    "weapon": "Weapon",
    "twohand": "Two-Hand Weapon",
    "offhand": "Offhand",
    "jewel": "Jewel",
    "other": "Other",
}


def clean(line):
    return re.sub(r"<[^>]+>", "", line).strip()


def parse_item(text):
    lines = [clean(x) for x in (text or "").splitlines() if clean(x)]
    if len(lines) < 2:
        return None
    rarity = lines[0].replace("Rarity:", "").strip().title() if lines[0].startswith("Rarity:") else ""
    name = lines[1] if rarity else lines[0]
    base = name
    if rarity in {"Rare", "Magic"} and len(lines) > 2:
        base = lines[2]
    return {"name": name, "base": base, "rarity": rarity, "slot": item_slot(name, base)}


def main():
    by_base = {}
    by_category = defaultdict(Counter)
    examples = defaultdict(list)
    for path in XML_ROOT.rglob("*.xml"):
        try:
            root = ET.parse(path).getroot()
        except Exception:
            continue
        for node in root.findall(".//Item"):
            item = parse_item(node.text)
            if not item:
                continue
            category = SLOT_TO_CATEGORY.get(item["slot"], "Other")
            by_category[category][item["base"]] += 1
            by_base[item["base"]] = {
                "category": category,
                "slot": item["slot"],
                "base": item["base"],
            }
            if len(examples[category]) < 30:
                examples[category].append(item)

    catalog = {
        "categories": {
            category: {
                "bases": [{"base": base, "uses": uses} for base, uses in counter.most_common()],
                "examples": examples[category],
            }
            for category, counter in sorted(by_category.items())
        },
        "base_to_category": by_base,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
    print({"categories": len(catalog["categories"]), "bases": len(by_base), "out": str(OUT)})


if __name__ == "__main__":
    main()
