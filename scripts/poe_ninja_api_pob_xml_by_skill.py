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
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data" / "normalized" / "skill_catalog_az.json"
CURSOR = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "poe_ninja_api_xml_cursor.json"
OUT = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "xml"
PENDING = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "poe_ninja_api_xml_pending.jsonl"
ERRORS = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "poe_ninja_api_xml_errors.jsonl"
BATCH_SIZE = 1
TARGET_PER_SKILL = 6
MAX_PROFILE_ATTEMPTS = 6
SLEEP_SECONDS = 8
USER_AGENT = "Mozilla/5.0 (compatible; Codex PoE local XML extractor; respectful)"
TYPE_VALUE = 0
TYPE_QUERY = "exp"


def now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = r.read()
    except urllib.error.HTTPError as e:
        if e.code == 429:
            raise RuntimeError("rate_limited_429")
        raise
    return data if binary else data.decode("utf-8", "ignore")


def unescape_page(s):
    return html.unescape(s).replace('\\"', '"')


def slug(s):
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")[:120]


def load_skills():
    payload = json.loads(CATALOG.read_text(encoding="utf-8-sig"))
    return sorted(payload["skills"], key=lambda x: int(x.get("az_order", 999999)))


def ensure_skill_folder(skill):
    path = OUT / skill["normalized_name"]
    path.mkdir(parents=True, exist_ok=True)
    return path


def load_cursor():
    if CURSOR.exists():
        return json.loads(CURSOR.read_text(encoding="utf-8-sig"))
    return {"next_az_order": 1, "cycle": 1}


def save_cursor(payload):
    CURSOR.parent.mkdir(parents=True, exist_ok=True)
    CURSOR.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def append_jsonl(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")


def count_xml(skill_dir):
    return len(list(skill_dir.glob("*.xml")))


def class_key(value):
    return slug(value or "unknown")


def existing_classes(skill_dir):
    classes = set()
    for meta_path in skill_dir.glob("*.meta.json"):
        try:
            meta = json.loads(meta_path.read_text(encoding="utf-8-sig"))
        except Exception:
            continue
        cls = meta.get("class")
        if cls:
            classes.add(class_key(cls))
    return classes


def current_league():
    state = json.loads(get("https://poe.ninja/poe1/api/data/build-index-state"))
    leagues = state.get("leagueBuilds", [])
    preferred = next((x for x in leagues if x.get("status") == "current"), None)
    return (preferred or leagues[0]).get("leagueUrl", "ancestors") if leagues else "ancestors"


def find_version(page, league):
    text = unescape_page(page)
    pattern = (
        rf'"url":\[0,"{re.escape(league)}"\].{{0,900}}?'
        rf'"version":\[0,"([^"]+)"\].{{0,300}}?'
        rf'"snapshotName":\[0,"([^"]+)"\].{{0,300}}?'
        rf'"overviewType":\[0,{TYPE_VALUE}\]'
    )
    match = re.search(pattern, text, re.S)
    if not match:
        raise RuntimeError(f"snapshot_not_found:{league}")
    return {"version": match.group(1), "snapshot": match.group(2)}


def discover_snapshot(league):
    page = get(f"https://poe.ninja/poe1/builds/{urllib.parse.quote(league)}")
    return find_version(page, league)


def decode_pob(code):
    raw = code.strip().replace("-", "+").replace("_", "/")
    raw += "=" * ((4 - len(raw) % 4) % 4)
    data = base64.b64decode(raw)
    try:
        xml = zlib.decompress(data).decode("utf-8", "ignore")
    except zlib.error:
        xml = zlib.decompress(data, -15).decode("utf-8", "ignore")
    ET.fromstring(xml)
    return xml


def extract_refs(search_bytes):
    strings = [s.decode("utf-8", "ignore") for s in re.findall(rb"[ -~]{3,}", search_bytes)]
    try:
        name_i = strings.index("name")
        account_i = strings.index("account")
    except ValueError:
        return []
    names = [s for s in strings[name_i + 1:account_i] if s not in {"BuildResult", "End Search"} and not s.startswith("Apply")]
    stop = {"class", "skills", "keypassives", "level", "life", "energyshield", "ehp"}
    accounts = []
    for s in strings[account_i + 1:]:
        if s in stop:
            break
        if re.match(r"^[A-Za-z0-9_-]{3,}$", s):
            accounts.append(s.rstrip("*"))
    return list(zip(accounts, names))[:MAX_PROFILE_ATTEMPTS]


def search_refs(snapshot, skill):
    q = urllib.parse.urlencode({"overview": snapshot["snapshot"], "type": TYPE_QUERY, "skills": skill})
    version = snapshot["version"]
    url = f"https://poe.ninja/poe1/api/builds/{version}/search?{q}"
    return extract_refs(get(url, binary=True)), url


def fetch_character(league, snapshot, account, char):
    q = urllib.parse.urlencode({
        "account": account,
        "name": char,
        "overview": snapshot["snapshot"],
        "type": TYPE_VALUE,
        "timeMachine": ""
    })
    version = snapshot["version"]
    endpoint = f"https://poe.ninja/poe1/api/builds/{version}/character?{q}"
    payload = json.loads(get(endpoint))
    code = payload.get("pathOfBuildingExport") or ""
    return decode_pob(code) if code else None, endpoint, payload


def process_skill(skill, league, snapshot, target_per_skill, max_profile_attempts, sleep_seconds):
    name = skill["name"]
    normalized = skill["normalized_name"]
    skill_dir = ensure_skill_folder(skill)
    existing_count = count_xml(skill_dir)
    represented_classes = existing_classes(skill_dir)
    unique_count = len(represented_classes)
    if unique_count >= target_per_skill:
        return {
            "status": "already_complete",
            "skill": name,
            "normalized_name": normalized,
            "generated": [],
            "xml_count": existing_count,
            "unique_class_count": unique_count,
            "next_action": "advance"
        }

    refs, search_url = search_refs(snapshot, name)
    refs = refs[:max_profile_attempts]
    if not refs:
        append_jsonl(PENDING, {"skill": name, "reason": "no_profiles", "search_url": search_url, "at": now()})
        return {
            "status": "no_profiles",
            "skill": name,
            "normalized_name": normalized,
            "generated": [],
            "xml_count": existing_count,
            "unique_class_count": unique_count,
            "search_url": search_url,
            "next_action": "advance"
        }

    generated = []
    skipped_same_class = []
    for account, char in refs:
        if len(represented_classes) >= target_per_skill:
            break
        try:
            xml, endpoint, payload = fetch_character(league, snapshot, account, char)
            if not xml:
                continue
            character_class = payload.get("class") or payload.get("baseClass") or "unknown"
            cls_key = class_key(character_class)
            if cls_key in represented_classes:
                skipped_same_class.append({"account": account, "character": char, "class": character_class})
                continue
            build_id = slug(f"{account}_{char}")
            xml_path = skill_dir / f"{build_id}.xml"
            meta_path = skill_dir / f"{build_id}.meta.json"
            if xml_path.exists():
                continue
            xml_path.write_text(xml, encoding="utf-8")
            meta = {
                "skill": name,
                "normalized_name": normalized,
                "source": "poe.ninja api",
                "source_url": search_url,
                "endpoint": endpoint,
                "account": account,
                "character": char,
                "league": league,
                "version": snapshot["version"],
                "snapshot": snapshot["snapshot"],
                "class": character_class,
                "ascendancy": payload.get("ascendancyClassName") or payload.get("class"),
                "level": payload.get("level"),
                "xml_path": str(xml_path),
                "collected_at": now(),
                "status": "generated"
            }
            meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
            generated.append(build_id)
            represented_classes.add(cls_key)
            time.sleep(sleep_seconds)
        except RuntimeError as e:
            append_jsonl(ERRORS, {
                "skill": name,
                "account": account,
                "character": char,
                "error": str(e),
                "at": now()
            })
            if str(e) == "rate_limited_429":
                return {
                    "status": "rate_limited",
                    "skill": name,
                    "normalized_name": normalized,
                    "generated": generated,
                    "xml_count": count_xml(skill_dir),
                    "unique_class_count": len(represented_classes),
                    "skipped_same_class": skipped_same_class
                }
        except Exception as e:
            append_jsonl(ERRORS, {"skill": name, "account": account, "character": char, "error": str(e), "at": now()})
    final_count = count_xml(skill_dir)
    if generated:
        if len(represented_classes) >= target_per_skill:
            return {
                "status": "complete",
                "skill": name,
                "normalized_name": normalized,
                "generated": generated,
                "xml_count": final_count,
                "unique_class_count": len(represented_classes),
                "skipped_same_class": skipped_same_class,
                "next_action": "advance"
            }
        return {
            "status": "partial",
            "skill": name,
            "normalized_name": normalized,
            "generated": generated,
            "xml_count": final_count,
            "unique_class_count": len(represented_classes),
            "skipped_same_class": skipped_same_class
        }
    return {
        "status": "pending",
        "skill": name,
        "normalized_name": normalized,
        "generated": [],
        "xml_count": final_count,
        "unique_class_count": len(represented_classes),
        "skipped_same_class": skipped_same_class
    }


def parse_args():
    ap = argparse.ArgumentParser()
    ap.add_argument("--batch-size", type=int, default=BATCH_SIZE)
    ap.add_argument("--target-per-skill", type=int, default=TARGET_PER_SKILL)
    ap.add_argument("--max-profile-attempts", type=int, default=MAX_PROFILE_ATTEMPTS)
    ap.add_argument("--sleep", type=float, default=SLEEP_SECONDS)
    ap.add_argument("--league")
    ap.add_argument("--skill")
    ap.add_argument("--ensure-folders", action="store_true")
    return ap.parse_args()


def ensure_all_folders(skills):
    for skill in skills:
        ensure_skill_folder(skill)


def skill_start_index(skills, cursor, requested_skill):
    if requested_skill:
        needle = slug(requested_skill)
        return next(
            (i for i, s in enumerate(skills) if s["normalized_name"] == needle or slug(s["name"]) == needle),
            None,
        )
    start_order = int(cursor.get("next_az_order", 1))
    return next((i for i, s in enumerate(skills) if int(s.get("az_order") or 0) >= start_order), 0)


def main():
    args = parse_args()
    skills = load_skills()
    if args.ensure_folders:
        ensure_all_folders(skills)
    cursor = load_cursor()
    start_idx = skill_start_index(skills, cursor, args.skill)
    if start_idx is None:
        raise SystemExit(f"skill not found: {args.skill}")
    league = args.league or current_league()
    snapshot = discover_snapshot(league)
    results = []
    idx = start_idx
    processed = 0
    while processed < max(1, args.batch_size):
        current_skill = skills[idx]
        ensure_skill_folder(current_skill)
        result = process_skill(
            current_skill,
            league,
            snapshot,
            args.target_per_skill,
            args.max_profile_attempts,
            args.sleep,
        )
        results.append(result)
        processed += 1
        made_progress = len(result.get("generated", [])) > 0
        should_advance = (
            result.get("next_action") == "advance"
            or result.get("status") in {"already_complete", "complete", "no_profiles", "pending"}
            or (result.get("unique_class_count") or 0) >= args.target_per_skill
            or len(result.get("generated", [])) >= 2
            or not made_progress
        )
        if result.get("status") == "rate_limited":
            should_advance = False
            break
        if not should_advance:
            break
        idx = (idx + 1) % len(skills)
    next_idx = idx
    ensure_skill_folder(skills[next_idx])
    next_payload = {
        "cycle": int(cursor.get("cycle", 1)) + (1 if next_idx <= start_idx else 0),
        "last_batch": [r["skill"] for r in results],
        "next_az_order": skills[next_idx].get("az_order"),
        "next_skill": skills[next_idx].get("name"),
        "league": league,
        "version": snapshot["version"],
        "snapshot": snapshot["snapshot"],
        "updated_at": now(),
        "results": results
    }
    if results[-1].get("status") == "rate_limited":
        next_payload["status"] = "rate_limited"
    elif next_idx != start_idx:
        next_payload["status"] = "advanced"
    else:
        next_payload["status"] = "pending_current"
    save_cursor(next_payload)
    summary = {
        "skills_processed": [r["skill"] for r in results],
        "xml_generated": sum(len(r.get("generated", [])) for r in results),
        "results": [
            {
                "skill": r["skill"],
                "xml_count": r.get("xml_count"),
                "unique_class_count": r.get("unique_class_count"),
                "status": r["status"],
            }
            for r in results
        ],
        "next_skill": skills[next_idx]["name"],
        "league": league,
        "version": snapshot["version"],
        "snapshot": snapshot["snapshot"],
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
