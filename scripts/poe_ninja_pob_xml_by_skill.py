#!/usr/bin/env python3
import base64
import hashlib
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
CURSOR = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "pob_xml_cursor.json"
OUT = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "xml"
PENDING = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "pob_xml_pending.jsonl"
ERRORS = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "pob_xml_errors.jsonl"
CONFIG = ROOT / "config" / "pob_xml_web_source_rules.json"

REQUEST_SLEEP_SECONDS = 0.5
USER_AGENT = "Mozilla/5.0 (compatible; Codex PoE local dataset builder; respectful)"


def now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=12) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "ignore")


def clean_url(url):
    return url.split("#", 1)[0].strip().rstrip("/")


def load_rules():
    return json.loads(CONFIG.read_text(encoding="utf-8"))


def load_skills():
    payload = json.loads(CATALOG.read_text(encoding="utf-8"))
    return sorted(payload["skills"], key=lambda x: (x.get("az_order") or 999999, x["name"]))


def load_cursor(skills):
    if CURSOR.exists():
        return json.loads(CURSOR.read_text(encoding="utf-8"))
    return {"next_az_order": 1, "cycle": 1, "updated_at": now()}


def save_cursor(payload):
    CURSOR.parent.mkdir(parents=True, exist_ok=True)
    CURSOR.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def append_jsonl(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")


def decode_pob_export(code):
    raw = code.strip().replace("-", "+").replace("_", "/")
    raw += "=" * ((4 - len(raw) % 4) % 4)
    data = base64.b64decode(raw)
    for wbits in (zlib.MAX_WBITS, -15):
        try:
            xml = zlib.decompress(data, wbits).decode("utf-8", "ignore")
            ET.fromstring(xml)
            return xml
        except Exception:
            continue
    return None


def source_type(url):
    h = urllib.parse.urlparse(url).hostname or ""
    if "pobb.in" in h:
        return "pobb_in"
    if "pathofexile.com/forum" in url:
        return "official_forum_build_guide"
    if "mobalytics.gg" in h:
        return "mobalytics_build"
    if "youtube.com" in h or "youtu.be" in h:
        return "youtube_description_or_pinned_comment"
    if "maxroll.gg" in h:
        return "maxroll_guide"
    if "poe-vault.com" in h:
        return "poe_vault_guide"
    if "reddit.com" in h:
        return "reddit_build_post"
    if "github.com" in h:
        return "github_build_repo"
    if "docs.google.com" in h:
        return "creator_google_doc"
    if any(x in h for x in ["forum", "build", "guide"]):
        return "global_forum_or_guide_site"
    return "global_forum_or_guide_site"


def language_region(text):
    if re.search(r"[\u4e00-\u9fff]", text):
        return {"language": "zh", "region": "cn"}
    if re.search(r"[\u3040-\u30ff]", text):
        return {"language": "ja", "region": "jp"}
    if re.search(r"[\uac00-\ud7a3]", text):
        return {"language": "ko", "region": "kr"}
    if re.search(r"[\u0400-\u04ff]", text):
        return {"language": "ru", "region": "ru"}
    return {"language": "en", "region": "global"}


def collect_search_urls(skill_name, rules):
    urls = []
    for q in rules.get("search_queries_per_skill", [])[:12]:
        if len(urls) >= 50:
            break
        query = q.replace("{skill}", skill_name)
        try:
            html = get(f"https://duckduckgo.com/html/?q={urllib.parse.quote(query)}")
        except Exception:
            continue
        for m in re.finditer(r'href=\"(/l/\\?kh=-1&uddg=[^\"]+)\"', html):
            raw = m.group(1)
            match = re.search(r"uddg=([^&]+)", raw)
            if not match:
                continue
            dest = urllib.parse.unquote(match.group(1))
            if not dest or "poe.ninja" in dest.lower():
                continue
            if "pobb.in" in dest or any(k in dest.lower() for k in ["forum", "mobalytics.gg", "youtube.com", "maxroll", "poe-vault", "reddit", "github", "docs.google"]):
                dest = clean_url(dest)
                if dest not in urls:
                    urls.append(dest)
                if len(urls) >= 20:
                    break
        time.sleep(REQUEST_SLEEP_SECONDS)
        if len(urls) >= 20:
            break
    return urls


def extract_candidates(text, source_url):
    cands = []
    for m in re.finditer(r"(https?://(?:www\.)?pobb\.in/[A-Za-z0-9_-]{4,})", text):
        cands.append(("pobb_url", clean_url(m.group(1)), source_url))
    for m in re.finditer(r"\b(?:poe\s*building|pob|code)\s*[:=]\s*([A-Za-z0-9+/_-]{100,})\b", text, re.IGNORECASE):
        cands.append(("inline_code", m.group(1), source_url))
    return cands


def resolve_pobb_url(pobb_url):
    html = get(pobb_url)
    if html:
        for m in re.finditer(r'"(?:build|pob|code|pobCode)"\\s*:\\s*"([A-Za-z0-9+/_-]{90,})"', html):
            xml = decode_pob_export(m.group(1))
            if xml:
                return xml, m.group(1)
        for m in re.finditer(r"\b([A-Za-z0-9+/_-]{140,})\b", html):
            xml = decode_pob_export(m.group(1))
            if xml:
                return xml, m.group(1)
    raw = get(f"{pobb_url}/raw")
    if raw:
        xml = decode_pob_export(raw)
        if xml:
            return xml, raw[:40]
    return None, None


def validate_local_reference_shape(xml_content):
    try:
        root = ET.fromstring(xml_content)
    except Exception:
        return False, "xml_parse_failed"
    if root.tag != "PathOfBuilding":
        return False, "root_not_pathofbuilding"
    build = root.find("Build")
    if build is None:
        return False, "missing_build"
    has_signal = (
        build.find("PlayerStat") is not None
        or root.find(".//Skill") is not None
        or root.find(".//Item") is not None
        or root.find(".//Tree") is not None
    )
    if not has_signal:
        return False, "missing_build_signal"
    return True, "ok"


def save_meta(skill, normalized, source_url, source_kind, langinfo, pob_url, build_id, xml_content):
    build_dir = OUT / normalized
    build_dir.mkdir(parents=True, exist_ok=True)
    xml_path = build_dir / f"{build_id}.xml"
    meta_path = build_dir / f"{build_id}.meta.json"
    if xml_path.exists():
        return None

    shape_ok, shape_reason = validate_local_reference_shape(xml_content)
    if not shape_ok:
        append_jsonl(ERRORS, {
            "skill": skill,
            "normalized_name": normalized,
            "source_url": source_url,
            "pob_url": pob_url,
            "error": "local_reference_shape_failed",
            "reason": shape_reason,
            "at": now(),
        })
        return None

    xml_path.write_text(xml_content, encoding="utf-8")

    xml = ET.fromstring(xml_content)
    build_node = xml.find("Build") or xml
    meta = {
        "skill": skill,
        "normalized_name": normalized,
        "source_url": source_url,
        "source_type": source_kind,
        "language": langinfo["language"],
        "region": langinfo["region"],
        "pob_url": pob_url,
        "patch": build_node.attrib.get("targetVersion", "unknown"),
        "league": build_node.attrib.get("league", "global"),
        "author": build_node.attrib.get("author", ""),
        "build_title": build_node.attrib.get("title", ""),
        "collected_at": now(),
        "status": "generated",
        "local_reference_shape": shape_reason,
    }
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    return str(xml_path)


def process_skill(skill, rules):
    name = skill["name"]
    normalized = skill["normalized_name"]
    skill_dir = OUT / normalized
    skill_dir.mkdir(parents=True, exist_ok=True)

    target = int(rules.get("target_xml_per_skill", 5))
    existing = list(skill_dir.glob("*.xml"))
    if len(existing) >= target:
        return {"skill": name, "status": "already_complete", "new_xml": 0, "xml_count": len(existing)}

    search_urls = collect_search_urls(name, rules)
    if not search_urls:
        append_jsonl(PENDING, {"skill": name, "normalized_name": normalized, "status": "no_search_results", "at": now()})
        return {"skill": name, "status": "pending", "new_xml": 0, "xml_count": len(existing)}

    made = 0
    tried = set()
    for source_url in search_urls:
        if len(list(skill_dir.glob("*.xml"))) >= target:
            break
        kind = source_type(source_url)
        lang = language_region(f"{name} {source_url}")
        if "poe.ninja" in source_url.lower():
            continue
        try:
            page = get(source_url)
        except Exception as e:
            append_jsonl(ERRORS, {"skill": name, "normalized_name": normalized, "source_url": source_url, "error": str(e), "at": now()})
            continue
        candidates = extract_candidates(page, source_url)
        if kind == "pobb_in":
            candidates.append(("pobb_url", source_url, source_url))
        for kind2, code, origin in candidates:
            if made >= target:
                break
            if code in tried:
                continue
            tried.add(code)
            try:
                if kind2 == "pobb_url":
                    xml, detected = resolve_pobb_url(code)
                else:
                    xml = decode_pob_export(code)
                    detected = code
                if not xml:
                    continue
                build_id = hashlib.md5((normalized + code).encode("utf-8")).hexdigest()[:10]
                if save_meta(name, normalized, origin, kind, lang, detected or code, f"{build_id}_{made+1}", xml):
                    made += 1
                    time.sleep(REQUEST_SLEEP_SECONDS)
            except Exception as e:
                append_jsonl(ERRORS, {"skill": name, "normalized_name": normalized, "pob_url": code, "error": str(e), "at": now()})
        time.sleep(REQUEST_SLEEP_SECONDS)

    if made == 0:
        append_jsonl(PENDING, {"skill": name, "normalized_name": normalized, "status": "insufficient_valid_xml", "at": now()})
    return {"skill": name, "status": "generated" if made else "pending", "new_xml": made, "xml_count": len(list(skill_dir.glob("*.xml")))}


def main():
    rules = load_rules()
    skills = load_skills()
    cursor = load_cursor(skills)
    start_order = int(cursor.get("next_az_order", 1))
    start_idx = next((i for i, s in enumerate(skills) if int(s.get("az_order") or 0) >= start_order), 0)
    batch_size = int(rules.get("batch_size", 10))
    batch = [skills[(start_idx + i) % len(skills)] for i in range(min(batch_size, len(skills)))]

    results = []
    for skill in batch:
        results.append(process_skill(skill, rules))

    next_idx = (start_idx + len(batch)) % len(skills)
    next_skill = skills[next_idx]
    next_cycle = int(cursor.get("cycle", 1)) + (1 if next_idx <= start_idx else 0)
    save_cursor({
        "cycle": next_cycle,
        "batch_size": len(batch),
        "last_batch": [s["name"] for s in batch],
        "next_az_order": next_skill.get("az_order"),
        "next_skill": next_skill.get("name"),
        "updated_at": now(),
        "results": results
    })
    print(json.dumps({"results": results, "next_cursor": {"next_az_order": next_skill.get("az_order"), "next_skill": next_skill.get("name")}}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
