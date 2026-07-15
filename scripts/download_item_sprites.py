import json
import re
import time
import unicodedata
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import quote

import requests


ROOT = Path(__file__).resolve().parents[1]
XML_ROOT = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "xml"
OUT = ROOT / "assets" / "poe_item_sprites"
MANIFEST = OUT / "manifest.json"
FAILURES = OUT / "failures.json"
DASH_INDEX = ROOT / "dashboard" / "item_sprite_index.json"
BASES_DIR = ROOT / "external" / "PathOfBuildingTesst" / "src" / "Data" / "Bases"
BASE = "https://www.poewiki.net"
API = BASE + "/w/api.php"
UA = "PoE-Agent-Dashboard/1.0"


def safe_name(name):
    text = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^A-Za-z0-9._-]+", "_", text).strip("_")
    return text[:120] or "item"


def clean_line(line):
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


def extract_items():
    counts = Counter()
    candidates = defaultdict(list)
    for path in XML_ROOT.rglob("*.xml"):
        try:
            root = ET.parse(path).getroot()
        except Exception:
            continue
        for item in root.findall(".//Item"):
            if not item.text:
                continue
            lines = [clean_line(x) for x in item.text.splitlines() if clean_line(x)]
            if not lines:
                continue
            rarity = lines[0].replace("Rarity:", "").strip() if lines[0].startswith("Rarity:") else ""
            name = lines[1] if rarity and len(lines) > 1 else lines[0]
            base = ""
            base = first_base_line(lines, 2)
            flask_match = re.search(r"((?:Divine|Eternal|Quicksilver|Silver|Topaz|Ruby|Sapphire|Granite|Jade|Quartz|Amethyst|Bismuth|Basalt|Stibnite|Sulphur|Diamond|Gold|Aquamarine|Corundum|Iron|Life|Mana|Hybrid)[A-Za-z ]* Flask)", name)
            if flask_match:
                base = flask_match.group(1)
            if not base:
                base = name
            counts[name] += 1
            ordered = (base, name) if rarity in {"Rare", "Magic"} else (name, base)
            for candidate in ordered:
                if candidate and candidate not in candidates[name]:
                    candidates[name].append(candidate)
    return [(name, candidates[name]) for name, _ in counts.most_common()]


def cargo_lookup(session, names):
    escaped = ['"' + n.replace('"', '\\"') + '"' for n in names]
    params = {
        "action": "cargoquery",
        "format": "json",
        "tables": "items",
        "fields": "name,inventory_icon,class,base_item",
        "limit": "500",
        "where": "name IN (" + ",".join(escaped) + ")",
    }
    r = session.get(API, params=params, timeout=40)
    if r.status_code == 429:
        return None, 429
    r.raise_for_status()
    found = {}
    for row in r.json().get("cargoquery", []):
        title = row.get("title", {})
        name = title.get("name")
        icon = title.get("inventory icon")
        if name and icon:
            found[name] = {
                "icon": icon.replace("File:", ""),
                "class": title.get("class"),
                "base_item": title.get("base item"),
            }
    return found, None


def load_wiki_index(session, items):
    wanted = sorted({candidate for _, candidates in items for candidate in candidates})
    index = {}
    for i in range(0, len(wanted), 100):
        batch = wanted[i:i + 100]
        found, error = cargo_lookup(session, batch)
        if error == 429:
            print("rate_limited while building index")
            return index, True
        index.update(found)
        print(f"indexed {min(i + 100, len(wanted))}/{len(wanted)} found={len(index)}")
        time.sleep(0.8)
    return index, False


def download_icon(session, icon_name, file_name):
    path = OUT / file_name
    if path.exists():
        return True, "exists"
    url = f"{BASE}/wiki/Special:Redirect/file/{quote(icon_name)}"
    r = session.get(url, timeout=40, allow_redirects=True)
    if r.status_code == 429:
        return False, 429
    if r.status_code == 200 and r.content.startswith(b"\x89PNG"):
        path.write_bytes(r.content)
        return True, r.url
    return False, f"download_{r.status_code}"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    failures = json.loads(FAILURES.read_text(encoding="utf-8")) if FAILURES.exists() else {}
    failures = {k: v for k, v in failures.items() if not (isinstance(v, dict) and v.get("error") == "not_found")}
    session = requests.Session()
    session.headers.update({"User-Agent": UA})

    items = extract_items()
    wiki, rate_limited_index = load_wiki_index(session, items)
    if rate_limited_index and not wiki:
        DASH_INDEX.write_text(json.dumps({
            name: "../assets/poe_item_sprites/" + data["file"]
            for name, data in manifest.items()
            if isinstance(data, dict) and data.get("file")
        }, ensure_ascii=False, indent=2), encoding="utf-8")
        print("rate_limited: kept existing manifest; run again later")
        return
    total = len(items)
    done = 0
    rate_limited = 0

    for item_name, candidates in items:
        if any(c in manifest and (OUT / manifest[c]["file"]).exists() for c in candidates):
            continue
        done += 1
        matched_name = next((candidate for candidate in candidates if candidate in wiki), None)
        if not matched_name:
            failures[item_name] = {"error": "not_found", "candidates": candidates}
            continue
        icon_name = wiki[matched_name]["icon"]
        file_name = safe_name(icon_name)
        ok, result = download_icon(session, icon_name, file_name)
        if ok:
            manifest[item_name] = {
                "file": file_name,
                "item_name": item_name,
                "sprite_name": icon_name,
                "matched_name": matched_name,
                "shared_from": matched_name if matched_name != item_name else None,
                "class": wiki[matched_name].get("class"),
                "base_item": wiki[matched_name].get("base_item"),
                "url": result,
            }
            manifest.setdefault(matched_name, {
                "file": file_name,
                "item_name": matched_name,
                "sprite_name": icon_name,
                "matched_name": matched_name,
                "shared_from": matched_name if matched_name != item_name else None,
                "class": wiki[matched_name].get("class"),
                "base_item": wiki[matched_name].get("base_item"),
                "url": result,
            })
            failures.pop(item_name, None)
            rate_limited = 0
        else:
            failures[item_name] = {"error": result, "matched_name": matched_name, "sprite_name": icon_name}
            rate_limited = rate_limited + 1 if result == 429 else 0
        if done % 10 == 0 or ok:
            MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
            FAILURES.write_text(json.dumps(failures, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"{done}/{total} sprites={len(manifest)} failures={len(failures)}")
        if rate_limited >= 2:
            print("rate_limited: stopped safely; run again later")
            break
        time.sleep(0.25)

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    FAILURES.write_text(json.dumps(failures, ensure_ascii=False, indent=2), encoding="utf-8")
    DASH_INDEX.write_text(json.dumps({
        name: "../assets/poe_item_sprites/" + data["file"]
        for name, data in manifest.items()
        if isinstance(data, dict) and data.get("file")
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"done sprites={len(manifest)} failures={len(failures)} out={OUT}")


if __name__ == "__main__":
    main()
