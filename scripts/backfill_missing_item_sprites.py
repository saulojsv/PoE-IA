import json
import re
import unicodedata
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path
from urllib.parse import quote, urljoin

import requests


ROOT = Path(__file__).resolve().parents[1]
XML_ROOT = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "xml"
SPRITES = ROOT / "assets" / "poe1_item_sprites"
INDEX = ROOT / "dashboard" / "item_sprite_index.json"
BASE = "https://www.poewiki.net"
UA = "PoE-Agent-Dashboard/1.0"


def safe(text):
    text = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^A-Za-z0-9._-]+", "_", text).strip("_")


def parse_names():
    names = Counter()
    for path in XML_ROOT.rglob("*.xml"):
        try:
            root = ET.parse(path).getroot()
        except Exception:
            continue
        for item in root.findall(".//Item"):
            lines = [x.strip() for x in (item.text or "").splitlines() if x.strip()]
            if len(lines) < 2:
                continue
            rarity = lines[0].replace("Rarity:", "").strip().title() if lines[0].startswith("Rarity:") else ""
            name = lines[1] if rarity else lines[0]
            base = ""
            if rarity in {"Rare", "Magic"} and len(lines) > 2:
                base = lines[2]
            elif rarity == "Unique":
                base = name
            for value in [name, base]:
                if value and not value.startswith(("{", "Item Level:", "Unique ID:")):
                    names[value] += 1
    return names


def direct_download(session, name):
    candidates = [
        f"{safe(name)}_inventory_icon.png",
        f"{safe(name.replace('of the ',''))}_inventory_icon.png",
    ]
    for file_name in candidates:
        url = f"{BASE}/wiki/Special:Redirect/file/{quote(file_name)}"
        r = session.get(url, timeout=25, allow_redirects=True)
        if r.status_code == 200 and r.content.startswith(b"\x89PNG"):
            out = SPRITES / file_name
            if not out.exists():
                out.write_bytes(r.content)
            return "../assets/poe1_item_sprites/" + Path(file_name).with_suffix(".webp").name
        if r.status_code == 429:
            return None
    return None


def page_download(session, name):
    page = session.get(f"{BASE}/wiki/{quote(name.replace(' ', '_'))}", timeout=25)
    if page.status_code != 200:
        return None
    match = re.search(r'<img[^>]+src="([^"]+_inventory_icon\.png)"', page.text)
    if not match:
        return None
    img = session.get(urljoin(BASE, match.group(1)), timeout=25)
    if img.status_code == 200 and img.content.startswith(b"\x89PNG"):
        file_name = f"{safe(name)}_inventory_icon.png"
        out = SPRITES / file_name
        if not out.exists():
            out.write_bytes(img.content)
        return "../assets/poe1_item_sprites/" + Path(file_name).with_suffix(".webp").name
    return None


def main():
    SPRITES.mkdir(parents=True, exist_ok=True)
    index = json.loads(INDEX.read_text(encoding="utf-8")) if INDEX.exists() else {}
    names = parse_names()
    missing = [name for name, _ in names.most_common() if name not in index]
    session = requests.Session()
    session.headers.update({"User-Agent": UA})
    added = 0
    checked = 0
    for name in missing:
        checked += 1
        path = direct_download(session, name) or page_download(session, name)
        if path:
            index[name] = path
            added += 1
            print(f"added {name} -> {path}")
        if checked >= 120 or added >= 40:
            break
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    print({"checked": checked, "added": added, "index": len(index)})


if __name__ == "__main__":
    main()
