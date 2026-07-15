#!/usr/bin/env python3
import argparse
import base64
import html
import json
import re
import time
import urllib.parse
import urllib.request
import zlib
from datetime import datetime, timezone
from xml.etree import ElementTree as ET

TYPE_MAP = {"exp": 0, "depthsolo": 1, "streamers": 2, "atlastree": 3, "racing": 4}
TYPE_QUERY = {"exp": "exp", "depthsolo": "depthsolo", "streamers": "streamers", "atlastree": "atlastree", "racing": "racing"}


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "codex-poe-ninja-build-extractor/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def fetch_bytes(url):
    req = urllib.request.Request(url, headers={"User-Agent": "codex-poe-ninja-build-extractor/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def discover_index():
    data = json.loads(fetch("https://poe.ninja/poe1/api/data/build-index-state"))
    urls = []
    for league in data.get("leagueBuilds") or []:
        league_url = league.get("leagueUrl")
        if not league_url:
            continue
        urls.append(f"https://poe.ninja/poe1/builds/{urllib.parse.quote(league_url)}")
        for stat in league.get("statistics") or []:
            q = urllib.parse.urlencode({
                "class": stat.get("class") or "",
                "skills": stat.get("skill") or "",
            })
            urls.append(f"https://poe.ninja/poe1/builds/{urllib.parse.quote(league_url)}?{q}")
    return urls


def parse_url(url):
    p = urllib.parse.urlparse(url)
    parts = [urllib.parse.unquote(x) for x in p.path.strip("/").split("/")]
    if len(parts) < 6 or parts[:3] != ["poe1", "builds", parts[2]] or parts[3] != "character":
        raise ValueError(f"not a poe.ninja PoE1 character build URL: {url}")
    return {"league": parts[2], "account": parts[4], "name": parts[5], "type": "exp"}


def unescape_page(s):
    return html.unescape(s).replace('\\"', '"')


def extract_props(page, fallback):
    text = unescape_page(page)
    m = re.search(r'component-export="CharPageWrapper"[^>]*props="([^"]+)"', page)
    if m:
        props = html.unescape(m.group(1))
        for key in ("league", "account", "name", "type"):
            hit = re.search(rf'"{key}":\[0,"([^"]+)"\]', props)
            if hit:
                fallback[key] = hit.group(1)
    return fallback


def find_version(page, league, type_value):
    text = unescape_page(page)
    pattern = (
        rf'"url":\[0,"{re.escape(league)}"\].{{0,700}}?'
        rf'"version":\[0,"([^"]+)"\].{{0,200}}?'
        rf'"snapshotName":\[0,"([^"]+)"\].{{0,200}}?'
        rf'"overviewType":\[0,{type_value}\]'
    )
    m = re.search(pattern, text, re.S)
    if not m:
        raise ValueError(f"snapshot version not found for league={league} type={type_value}")
    return {"version": m.group(1), "snapshot": m.group(2)}


def get_snapshot(league, type_name="exp"):
    page = fetch(f"https://poe.ninja/poe1/builds/{urllib.parse.quote(league)}")
    type_value = TYPE_MAP.get(type_name, 0)
    snap = find_version(page, league, type_value)
    snap["type_value"] = type_value
    snap["type_name"] = TYPE_QUERY.get(type_name, "exp")
    return snap


def search_pairs(version, snapshot, class_name=None, skill=None, type_name="exp"):
    query = {"overview": snapshot, "type": TYPE_QUERY.get(type_name, "exp")}
    if class_name:
        query["class"] = class_name
    if skill:
        query["skills"] = skill
    url = f"https://poe.ninja/poe1/api/builds/{version}/search?{urllib.parse.urlencode(query)}"
    strings = [s.decode("latin1") for s in re.findall(rb"[A-Za-z0-9_#\-]{3,}", fetch_bytes(url))]
    if "name" not in strings or "account" not in strings:
        return []
    names = []
    for s in strings[strings.index("name") + 1:]:
        if s == "account":
            break
        names.append(s)
    accounts = []
    for s in strings[strings.index("account") + 1:]:
        if s in ("level", "class", "secondascendancy"):
            break
        accounts.append(s)
    return [(a, n) for a, n in zip(accounts, names) if a and n and not a.startswith("-")]


def decode_pob(code):
    raw = code.replace("-", "+").replace("_", "/")
    raw += "=" * (-len(raw) % 4)
    return zlib.decompress(base64.b64decode(raw)).decode("utf-8")


def attr(node, name):
    return node.attrib.get(name) if node is not None else None


def normalize_skill_group(group):
    gems = []
    for gem in group.get("allGems") or []:
        item = gem.get("itemData") or {}
        gems.append({
            "name": gem.get("name"),
            "level": gem.get("level"),
            "quality": gem.get("quality"),
            "support": item.get("support"),
            "tags": [p.get("name") for p in item.get("properties") or [] if p.get("name")],
        })
    return {"item_slot": group.get("itemSlot"), "gems": gems, "dps": group.get("dps") or []}


def normalize_item(entry):
    item = entry.get("itemData") or entry
    return {
        "slot": entry.get("itemSlot"),
        "rarity": item.get("rarity") or item.get("frameTypeId"),
        "name": item.get("name"),
        "type": item.get("typeLine"),
        "base": item.get("baseType"),
        "corrupted": item.get("corrupted"),
        "sockets": item.get("sockets"),
        "implicit": item.get("implicitMods"),
        "explicit": item.get("explicitMods"),
        "crafted": item.get("craftedMods"),
        "enchant": item.get("enchantMods"),
    }


def normalize(data, source, endpoint, include_xml):
    code = data.get("pathOfBuildingExport")
    xml = decode_pob(code) if code else ""
    root = ET.fromstring(xml) if xml else None
    build = root.find("Build") if root is not None else None
    spec = root.find("./Tree/Spec") if root is not None else None
    nodes = [int(x) for x in (attr(spec, "nodes") or "").split(",") if x.strip().isdigit()]
    row = {
        "source": source,
        "endpoint": endpoint,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "character": {
            "account": data.get("account"),
            "name": data.get("name"),
            "league": data.get("league"),
            "base_class": data.get("baseClass"),
            "class": data.get("class"),
            "ascendancy": data.get("ascendancyClassName"),
            "secondary_ascendancy": data.get("secondaryAscendancyClassName"),
            "level": data.get("level") or attr(build, "level"),
        },
        "metrics": data.get("defensiveStats") or {},
        "skills": [normalize_skill_group(x) for x in data.get("skills") or []],
        "items": [normalize_item(x) for x in (data.get("items") or [])],
        "jewels": [normalize_item(x) for x in (data.get("jewels") or [])],
        "flasks": [normalize_item(x) for x in (data.get("flasks") or [])],
        "tree": {
            "passives": data.get("passiveSelection") or nodes,
            "pob_nodes": nodes,
            "masteries": data.get("masteries") or [],
            "keystones": data.get("keyStones") or [],
            "cluster_jewels": data.get("clusterJewels") or {},
            "tattoos": data.get("tattoos") or [],
            "runegrafts": data.get("runegrafts") or [],
        },
        "pob": {"code": code, "xml_len": len(xml)},
    }
    if include_xml:
        row["pob"]["xml"] = xml
    return row


def extract_direct(league, account, name, snap, include_xml, index=0):
    source = (
        f"https://poe.ninja/poe1/builds/{urllib.parse.quote(league)}/character/"
        f"{urllib.parse.quote(account)}/{urllib.parse.quote(name)}?i={index}"
    )
    q = urllib.parse.urlencode({
        "account": account,
        "name": name,
        "overview": snap["snapshot"],
        "type": snap["type_value"],
        "timeMachine": "",
    })
    endpoint = f"https://poe.ninja/poe1/api/builds/{snap['version']}/character?{q}"
    data = json.loads(fetch(endpoint))
    return normalize(data, source, endpoint, include_xml)


def extract_one(url, include_xml):
    page = fetch(url)
    meta = extract_props(page, parse_url(url))
    type_value = TYPE_MAP.get(meta.get("type", "exp"), 0)
    snap = find_version(page, meta["league"], type_value)
    q = urllib.parse.urlencode({
        "account": meta["account"],
        "name": meta["name"],
        "overview": snap["snapshot"],
        "type": type_value,
        "timeMachine": "",
    })
    endpoint = f"https://poe.ninja/poe1/api/builds/{snap['version']}/character?{q}"
    data = json.loads(fetch(endpoint))
    return normalize(data, url, endpoint, include_xml)


def extract_url_fast(url, include_xml, type_name="exp"):
    meta = parse_url(url)
    snap = get_snapshot(meta["league"], type_name)
    return extract_direct(meta["league"], meta["account"], meta["name"], snap, include_xml)


def iter_grouped(league, limit, include_xml, type_name="exp"):
    snap = get_snapshot(league, type_name)
    index = json.loads(fetch("https://poe.ninja/poe1/api/data/build-index-state"))
    league_data = next(x for x in index.get("leagueBuilds", []) if x.get("leagueUrl") == league)
    seen = set()
    count = 0
    for stat in league_data.get("statistics") or []:
        for account, name in search_pairs(snap["version"], snap["snapshot"], stat.get("class"), stat.get("skill"), type_name):
            key = (account, name)
            if key in seen:
                continue
            seen.add(key)
            try:
                yield extract_direct(league, account, name, snap, include_xml, count)
            except Exception:
                continue
            count += 1
            if limit and count >= limit:
                return


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url")
    ap.add_argument("--url-fast", action="store_true")
    ap.add_argument("--input")
    ap.add_argument("--out")
    ap.add_argument("--discover-index", action="store_true")
    ap.add_argument("--urls-out")
    ap.add_argument("--include-xml", action="store_true")
    ap.add_argument("--sleep", type=float, default=1.0)
    ap.add_argument("--league")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--strategy", choices=["grouped"], default="grouped")
    args = ap.parse_args()
    if args.discover_index:
        urls = discover_index()
        target = args.urls_out or args.out
        if not target:
            raise SystemExit("--discover-index requires --urls-out or --out")
        with open(target, "w", encoding="utf-8") as f:
            f.write("\n".join(urls) + "\n")
        return
    if not args.out:
        raise SystemExit("--out is required")
    if args.league:
        with open(args.out, "a", encoding="utf-8") as out:
            for i, row in enumerate(iter_grouped(args.league, args.limit, args.include_xml)):
                if i and args.sleep:
                    time.sleep(args.sleep)
                out.write(json.dumps(row, ensure_ascii=False) + "\n")
        return
    urls = [args.url] if args.url else []
    if args.input:
        with open(args.input, "r", encoding="utf-8") as f:
            urls += [x.strip() for x in f if x.strip() and not x.startswith("#")]
    with open(args.out, "a", encoding="utf-8") as out:
        for i, url in enumerate(urls):
            if i:
                time.sleep(args.sleep)
            extractor = extract_url_fast if args.url_fast else extract_one
            out.write(json.dumps(extractor(url, args.include_xml), ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
