import html
import json
import re
from pathlib import Path

import requests


ROOT = Path(__file__).resolve().parents[1]
TREE_ROOT = ROOT / "external" / "PathOfBuildingTesst" / "src" / "TreeData"
OUT = ROOT / "data" / "items" / "amulet_anointments.json"
OIL_RE = re.compile(r"^(?:Clear|Sepia|Amber|Verdant|Teal|Azure|Indigo|Violet|Crimson|Black|Opalescent|Silver|Golden) Oil - ")
OIL_NAMES = ["Clear Oil", "Sepia Oil", "Amber Oil", "Verdant Oil", "Teal Oil", "Azure Oil", "Indigo Oil", "Violet Oil", "Crimson Oil", "Black Oil", "Opalescent Oil", "Silver Oil", "Golden Oil", "Prismatic Oil"]
WIKI = "https://www.poewiki.net/wiki/List_of_passive_skill_anointments"


def latest_tree():
    trees = [
        p for p in TREE_ROOT.glob("*/tree.lua")
        if "ruthless" not in p.parent.name and "alternate" not in p.parent.name and re.match(r"^\d+_\d+$", p.parent.name)
    ]
    trees = sorted(trees, key=lambda p: [int(x) for x in re.findall(r"\d+", str(p.parent.name))] or [0])
    return trees[-1] if trees else None


def split_nodes(text):
    for match in re.finditer(r"\[(\d+)\]=\{", text):
        start = match.end() - 1
        depth = 0
        for i in range(start, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    yield match.group(1), text[start:i + 1]
                    break


def strings_in_sd(body):
    m = re.search(r'\["sd"\]=\{(.*?)\}', body, re.S)
    return [] if not m else [s.replace("\\n", "\n") for s in re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(1))]


def first(body, key):
    m = re.search(rf'\["{key}"\]="([^"]*)"', body)
    return m.group(1) if m else ""


def main():
    rows = parse_wiki()
    if rows:
        result = {
            "summary": {
                "anointments": len(rows),
                "source": WIKI,
                "note": "Extracted from PoE Wiki rendered passive skill anointment page.",
            },
            "anointments": rows,
        }
        OUT.parent.mkdir(parents=True, exist_ok=True)
        OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(result["summary"])
        return

    tree = latest_tree()
    if not tree:
        raise SystemExit("tree.lua not found")
    text = tree.read_text(encoding="utf-8", errors="ignore")
    rows = []
    for node_id, body in split_nodes(text):
        if '["not"]=true' not in body:
            continue
        lines = strings_in_sd(body)
        if not lines or not OIL_RE.match(lines[0]):
            continue
        oils = [x.strip() for x in lines[0].split(" - ")]
        rows.append({
            "node_id": int(node_id),
            "name": first(body, "dn"),
            "oils": oils,
            "recipe": lines[0],
            "modifier_lines": lines[1:],
            "icon": first(body, "icon"),
            "source": str(tree.relative_to(ROOT)),
            "applies_to": ["amulet"],
        })
    rows.sort(key=lambda x: (x["oils"], x["name"]))
    result = {
        "summary": {
            "anointments": len(rows),
            "source": str(tree.relative_to(ROOT)),
            "note": "Extracted from local Path of Building passive tree notable nodes with oil recipes.",
        },
        "anointments": rows,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(result["summary"])


def clean_html(text):
    text = re.sub(r"<sup[^>]*>.*?</sup>", "", text, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    return html.unescape(re.sub(r"\s+", " ", text)).strip()


def parse_wiki():
    try:
        page = requests.get(WIKI, headers={"User-Agent": "PoE-Agent-Dashboard/1.0"}, timeout=60).text
    except Exception:
        return []
    rows = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", page, re.S):
        cells = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, re.S)
        if len(cells) < 4:
            continue
        oils = [clean_html(c) for c in cells[:3]]
        if not all(o in OIL_NAMES for o in oils):
            continue
        outcome = clean_html(cells[3])
        if not outcome or outcome == "Outcome":
            continue
        effects = []
        if len(cells) > 4:
            effects = [x.strip() for x in re.split(r"\s{2,}|(?:\.\s+)", clean_html(" ".join(cells[4:]))) if x.strip()]
        rows.append({
            "name": outcome,
            "oils": oils,
            "recipe": " - ".join(oils),
            "modifier_lines": effects,
            "source": WIKI,
            "applies_to": ["amulet", "blight_unique"],
        })
    dedup = {}
    for row in rows:
        dedup[(row["name"], row["recipe"])] = row
    return sorted(dedup.values(), key=lambda x: (x["oils"], x["name"]))


if __name__ == "__main__":
    main()
