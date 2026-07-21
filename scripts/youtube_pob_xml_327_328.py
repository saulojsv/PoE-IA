#!/usr/bin/env python3
import argparse
import base64
import hashlib
import json
import re
import time
import urllib.request
import zlib
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree as ET

from yt_dlp import YoutubeDL

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "xml" / "youtube"
REPORT = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "youtube_pob_xml_327_328_report.json"
ERRORS = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "youtube_pob_xml_327_328_errors.jsonl"

UA = "Mozilla/5.0 (compatible; Codex PoE local dataset builder)"
QUERIES = [
    "Path of Exile 3.28 build guide pob",
    "PoE 3.28 league starter pob",
    "PoE 3.28 endgame build pob",
    "Path of Exile 3.27 build guide pob",
    "PoE 3.27 league starter pob",
    "PoE 3.27 endgame build pob",
]


def now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def append_jsonl(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", "ignore")


def decode_pob(code):
    raw = code.strip().replace("-", "+").replace("_", "/")
    raw += "=" * ((4 - len(raw) % 4) % 4)
    try:
        data = base64.b64decode(raw)
    except Exception:
        return None
    for wbits in (zlib.MAX_WBITS, -15):
        try:
            xml = zlib.decompress(data, wbits).decode("utf-8", "ignore")
            ET.fromstring(xml)
            return xml
        except Exception:
            pass
    return None


def validate(xml):
    try:
        root = ET.fromstring(xml)
    except Exception:
        return False
    if root.tag != "PathOfBuilding" or root.find("Build") is None:
        return False
    return any(root.find(p) is not None for p in [".//PlayerStat", ".//Skill", ".//Item", ".//Tree"])


def resolve_pobb(url):
    raw_url = url.rstrip("/") + "/raw"
    raw = get(raw_url)
    xml = decode_pob(raw)
    if xml and validate(xml):
        return xml
    html = get(url)
    for m in re.finditer(r"\b[A-Za-z0-9+/_-]{140,}\b", html):
        xml = decode_pob(m.group(0))
        if xml and validate(xml):
            return xml
    return None


def patch_from_text(text):
    m = re.search(r"\b3\.(27|28)\b", text)
    return f"3.{m.group(1)}" if m else "unknown"


def slug(text):
    value = re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")
    return value[:80] or "youtube_pob"


def save(xml, pob_url, video, patch):
    vid = video.get("id") or hashlib.md5((pob_url + now()).encode()).hexdigest()[:11]
    build_id = f"{patch.replace('.', '_')}_{vid}_{hashlib.md5(pob_url.encode()).hexdigest()[:8]}"
    xml_path = OUT / f"{build_id}.xml"
    meta_path = OUT / f"{build_id}.meta.json"
    if xml_path.exists():
        return None
    OUT.mkdir(parents=True, exist_ok=True)
    if not xml.startswith("<?xml"):
        xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + xml
    xml_path.write_text(xml, encoding="utf-8")
    meta = {
        "skill": "youtube",
        "normalized_name": "youtube",
        "source_url": video.get("webpage_url") or f"https://www.youtube.com/watch?v={vid}",
        "source_type": "youtube_description_or_pinned_comment",
        "pob_url": pob_url,
        "xml_path": str(xml_path),
        "patch": patch,
        "league": patch,
        "author": video.get("uploader") or "",
        "build_title": video.get("title") or "",
        "collected_at": now(),
        "status": "generated",
    }
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    return str(xml_path)


def video_text(info):
    fields = [info.get("title") or "", info.get("description") or ""]
    for lang in ("en", "pt", "pt-BR"):
        for sub in (info.get("subtitles") or {}).get(lang, [])[:1]:
            if sub.get("url"):
                try:
                    fields.append(get(sub["url"]))
                except Exception:
                    pass
        for sub in (info.get("automatic_captions") or {}).get(lang, [])[:1]:
            if sub.get("url"):
                try:
                    fields.append(get(sub["url"]))
                except Exception:
                    pass
    return "\n".join(fields)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-query", type=int, default=12)
    ap.add_argument("--limit", type=int, default=30)
    args = ap.parse_args()

    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "extract_flat": False,
        "ignoreerrors": True,
        "noplaylist": True,
    }
    seen_videos, seen_pobs, saved = set(), set(), []
    with YoutubeDL(ydl_opts) as ydl:
        for query in QUERIES:
            if len(saved) >= args.limit:
                break
            result = ydl.extract_info(f"ytsearch{args.per_query}:{query}", download=False)
            for entry in result.get("entries") or []:
                if not entry or entry.get("id") in seen_videos:
                    continue
                seen_videos.add(entry.get("id"))
                try:
                    video_url = f"https://www.youtube.com/watch?v={entry.get('id')}" if entry.get("id") else entry.get("webpage_url") or entry.get("url")
                    info = ydl.extract_info(video_url, download=False)
                    text = video_text(info)
                    if "pob" not in text.lower() and "pobb.in" not in text.lower():
                        continue
                    patch = patch_from_text(text)
                    if patch not in {"3.27", "3.28"}:
                        continue
                    for pob_url in sorted(set(re.findall(r"https?://(?:www\.)?pobb\.in/[A-Za-z0-9_-]{4,}", text))):
                        pob_url = pob_url.rstrip(").,;]")
                        if pob_url in seen_pobs:
                            continue
                        seen_pobs.add(pob_url)
                        try:
                            xml = resolve_pobb(pob_url)
                            if not xml:
                                continue
                            path = save(xml, pob_url, info, patch)
                            if path:
                                saved.append(path)
                                print(path)
                                if len(saved) >= args.limit:
                                    break
                            time.sleep(0.5)
                        except Exception as e:
                            append_jsonl(ERRORS, {"pob_url": pob_url, "video": info.get("webpage_url"), "error": str(e), "at": now()})
                except Exception as e:
                    append_jsonl(ERRORS, {"video": entry.get("url"), "error": str(e), "at": now()})

    REPORT.write_text(json.dumps({"saved": saved, "count": len(saved), "updated_at": now()}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"saved": len(saved), "report": str(REPORT)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
