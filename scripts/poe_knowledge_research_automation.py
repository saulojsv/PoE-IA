#!/usr/bin/env python3
import csv
import json
import re
from typing import Dict, List, Tuple
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
BATCH_SIZE = 10

DATA_NORMALIZED = ROOT / "data" / "normalized" / "skills"
CATALOG = ROOT / "data" / "normalized" / "skill_catalog_az.json"
CURSOR = ROOT / "data" / "normalized" / "skill_research_cursor.json"
DATA_EXPORTS = ROOT / "data" / "exports" / "skills"
REPORTS = ROOT / "data" / "exports" / "reports"
RAG_CHUNKS = ROOT / "data" / "exports" / "rag"
LOGS = ROOT / "logs" / "poe_knowledge_research"
LOCK = ROOT / "logs" / "poe_knowledge_research.lock"

PATCH_NOTES_URL = "https://www.pathofexile.com/forum/view-forum/patch-notes"
LEAGUES_API_URL = "https://api.pathofexile.com/leagues?type=main&compact=1"

PILOT_SKILLS: List[Tuple[str, str]] = [
    ("Fireball", "skill"),
    ("Cyclone", "skill"),
    ("Arc", "skill"),
    ("Summon Skeleton", "skill"),
    ("Arctic Armour", "aura"),
    ("Vaal Haste", "vaal"),
    ("Storm Brand", "brand"),
    ("Rolling Magma", "mine"),
    ("Ancestral Warchief", "totem"),
    ("Added Cold Damage", "support"),
]

SKILL_SOURCE_HINTS = {
    "Fireball": ["https://www.poewiki.net/wiki/Fireball", "https://poedb.tw/us/Fireball"],
    "Cyclone": ["https://www.poewiki.net/wiki/Cyclone", "https://poedb.tw/us/Cyclone"],
    "Detonate Dead": ["https://www.poewiki.net/wiki/Detonate_Dead", "https://poedb.tw/us/Detonate_Dead"],
    "Summon Skeleton": ["https://www.poewiki.net/wiki/Summon_Skeleton", "https://poedb.tw/us/Summon_Skeleton"],
    "Arctic Armour": ["https://www.poewiki.net/wiki/Arctic_Armour", "https://poedb.tw/us/Arctic_Armour"],
    "Vaal Haste": ["https://www.poewiki.net/wiki/Vaal_Haste", "https://poedb.tw/us/Vaal_Haste"],
    "Spellslinger": ["https://www.poewiki.net/wiki/Spellslinger", "https://poedb.tw/us/Spellslinger"],
    "Added Cold Damage": ["https://www.poewiki.net/wiki/Added_Cold_Damage", "https://poedb.tw/us/Added_Cold_Damage"],
    "Summon Phantasm": ["https://www.poewiki.net/wiki/Summon_Phantasm_Support", "https://poedb.tw/us/Summon_Phantasm_Support"],
    "Summon Phantasm Support": ["https://www.poewiki.net/wiki/Summon_Phantasm_Support", "https://poedb.tw/us/Summon_Phantasm_Support"],
    "Rolling Magma": ["https://www.poewiki.net/wiki/Rolling_Magma", "https://poedb.tw/us/Rolling_Magma"],
    "Ancestral Warchief": ["https://www.poewiki.net/wiki/Ancestral_Warchief", "https://poedb.tw/us/Ancestral_Warchief"],
    "Storm Brand": ["https://www.poewiki.net/wiki/Storm_Brand", "https://poedb.tw/us/Storm_Brand"],
    "Arc": ["https://www.poewiki.net/wiki/Arc", "https://poedb.tw/us/Arc"],
    "Summon Skeleton": ["https://www.poewiki.net/wiki/Summon_Skeleton", "https://poedb.tw/us/Summon_Skeleton"],
}

CYCLE_FOCUS = {
    1: {
        "name": "official_basics",
        "fields": ["identity", "tags", "requirements", "levels", "quality_effects", "sources"],
        "queries": ["official", "PoE Wiki", "PoEDB", "patch notes"],
    },
    2: {
        "name": "supports_and_links",
        "fields": ["support_relationships", "gem_links", "incompatibilities"],
        "queries": ["support gems", "best links", "4-link", "5-link", "6-link"],
    },
    3: {
        "name": "items_mods_jewels_flasks",
        "fields": ["item_synergies", "jewels", "cluster_jewels", "flasks", "modifiers"],
        "queries": ["unique items", "mods", "cluster jewel", "flasks", "crafting"],
    },
    4: {
        "name": "tree_ascendancy_masteries",
        "fields": ["passives_ascendancies", "keystones", "masteries", "cluster_notables"],
        "queries": ["passive tree", "masteries", "ascendancy", "keystones"],
    },
    5: {
        "name": "builds_guides_pob_ninja",
        "fields": ["builds", "guides", "pob_links", "poe_ninja", "videos"],
        "queries": ["poe.ninja", "Path of Building", "build guide", "league starter"],
    },
    6: {
        "name": "market_conflicts_updates",
        "fields": ["market_usage", "patch_changes", "conflicts", "bugs", "stale_sources"],
        "queries": ["price", "popularity", "bug", "interaction", "current patch"],
    },
}

REQUIRED_FIELDS = [
    "identity",
    "tags",
    "requirements",
    "levels",
    "quality_effects",
    "mechanics",
    "formulas",
    "limits_breakpoints",
    "support_relationships",
    "gem_links",
    "item_synergies",
    "passives_ascendancies",
    "builds",
    "guides",
    "market_usage",
    "patch_changes",
    "sources",
]


def focus_for_cycle(cycle: int):
    if cycle <= 6:
        return CYCLE_FOCUS[cycle]
    focus = dict(CYCLE_FOCUS[6])
    focus["name"] = "refinement_missing_fields"
    focus["fields"] = REQUIRED_FIELDS
    focus["queries"] = CYCLE_FOCUS[6]["queries"] + ["missing fields", "updated source", "new build"]
    return focus


def missing_fields(record):
    missing = []
    data = record.get("data", {})
    focus_fields = (record.get("research_focus") or {}).get("fields") or REQUIRED_FIELDS
    for field in focus_fields:
        value = record.get(field, data.get(field))
        if value in (None, "", [], {}):
            missing.append(field)
    return missing


def now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def acquire_lock():
    LOCK.parent.mkdir(parents=True, exist_ok=True)
    if LOCK.exists():
        try:
            raw = json.loads(LOCK.read_text(encoding="utf-8"))
            created = datetime.fromisoformat(raw.get("created_at", "").replace("Z", "+00:00"))
            if (datetime.now(timezone.utc) - created).total_seconds() < 240:
                raise RuntimeError("automation already running")
        except RuntimeError:
            raise
        except Exception:
            pass
    LOCK.write_text(json.dumps({"created_at": now_iso()}, ensure_ascii=False), encoding="utf-8")


def release_lock():
    try:
        LOCK.unlink()
    except FileNotFoundError:
        pass


def normalize_skill_id(name: str) -> str:
    return "skill:" + re.sub(r"[^a-z0-9]+", "_", name.strip().lower()).strip("_")


def safe_fetch(url: str, timeout: int = 15) -> str:
    try:
        req = Request(url, headers={"User-Agent": "curl/8.0", "Accept": "*/*"})
        with urlopen(req, timeout=timeout) as r:
            return r.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return ""


def safe_fetch_with_meta(url: str, timeout: int = 15) -> Tuple[str, Dict[str, str]]:
    try:
        req = Request(url, headers={"User-Agent": "curl/8.0", "Accept": "application/json,*/*"})
        with urlopen(req, timeout=timeout) as r:
            html = r.read().decode("utf-8", errors="ignore")
            headers = {
                "last-modified": r.headers.get("Last-Modified", ""),
                "date": r.headers.get("Date", ""),
                "content-type": r.headers.get("Content-Type", ""),
            }
            return html, headers
    except Exception:
        return "", {}


def parse_date(raw: str) -> str:
    if not raw:
        return ""
    for fmt in (
        "%a, %d %b %Y %H:%M:%S %Z",
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S GMT",
    ):
        try:
            return datetime.strptime(raw, fmt).replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
        except Exception:
            pass
    return raw.strip()


def extract_patch_from_patch_notes(html: str):
    if not html:
        return "", ""
    m = re.search(r'(\d+\.\d+\.\d+[a-z])\s+(Hotfix\s+\d+|Patch\s+Notes|Maintenance)', html)
    if not m:
        return "", ""
    patch = m.group(1)
    date_match = re.search(r',\s([A-Za-z]{3}\s+\d{1,2},\s+\d{4})', html[:2000])
    source_date = date_match.group(1) if date_match else ""
    return patch, source_date


def detect_patch_and_date() -> Tuple[str, str]:
    patch_html = safe_fetch(PATCH_NOTES_URL)
    return extract_patch_from_patch_notes(patch_html)


def detect_current_league():
    try:
        api, _ = safe_fetch_with_meta(LEAGUES_API_URL)
        if not api:
            return "unresolved", []
        payload = json.loads(api)
        active: List[dict] = payload if isinstance(payload, list) else payload.get("value", [])
        valid = []
        now = datetime.now(timezone.utc)
        for league in active:
            end_at = league.get("endAt")
            start_at = league.get("startAt")
            try:
                end_dt = datetime.fromisoformat(end_at.replace("Z", "+00:00")) if end_at else None
                start_dt = datetime.fromisoformat(start_at.replace("Z", "+00:00")) if start_at else None
            except Exception:
                end_dt = None
                start_dt = None
            if start_dt and start_dt <= now and (end_dt is None or now <= end_dt):
                valid.append(league)
        if not valid:
            return "unresolved", active
        core = next((x for x in valid if x.get("id") == "Mirage"), None)
        if core:
            return core.get("id", "unresolved"), valid
        return valid[0].get("id", "unresolved"), valid
    except Exception:
        return "unresolved", []


def infer_fields_from_html(name: str, html: str):
    # Extração mínima e conservadora para evitar inferências.
    text = re.sub(r"<[^>]+>", " ", html or "")
    text = re.sub(r"\s+", " ", text)
    fields = {
        "identity": {
            "name": name,
        },
        "raw_excerpt": text[:500] if text else "",
        "tags": [],
        "requirements": {},
        "gems": {},
        "supports": [],
        "incompatibilities": [],
        "sources": [],
    }
    if " Tags " in text:
        tags_match = re.search(r"Tags?\s*:?\s*([A-Za-z ,]+)", text)
        if tags_match:
            tags = [x.strip() for x in tags_match.group(1).split(",") if x.strip()]
            fields["tags"] = tags
    return fields


def build_record(skill_name, entity_type, patch, league, collected_at, catalog_entry=None, cycle=1):
    catalog_entry = catalog_entry or {}
    skill_id = catalog_entry.get("id") or normalize_skill_id(skill_name)
    sources = [
        s.get("source_url", "")
        for s in catalog_entry.get("sources", [])
        if isinstance(s, dict) and s.get("source_url")
    ] or SKILL_SOURCE_HINTS.get(skill_name, [])
    sources = sorted(sources, key=lambda u: 0 if "/wiki/List_of_" not in u else 1)
    data = {}
    verification_errors = []
    primary = sources[0] if sources else ""
    html, meta = safe_fetch_with_meta(primary) if primary else ("", {})
    source_date = parse_date(meta.get("last-modified") or meta.get("date", ""))
    if not html:
        verification_errors.append(f"fetch_failed:{primary or 'no_source_url'}")
    fields = infer_fields_from_html(skill_name, html)
    fields["sources"] = sources
    focus = focus_for_cycle(cycle)
    fields["research_focus"] = focus
    fields.setdefault("levels", [])
    fields.setdefault("quality_effects", [])
    fields.setdefault("support_relationships", [])
    fields.setdefault("gem_links", [])
    fields.setdefault("item_synergies", [])
    fields.setdefault("passives_ascendancies", [])
    fields.setdefault("builds", [])
    fields.setdefault("guides", [])
    fields.setdefault("market_usage", [])
    fields.setdefault("patch_changes", [])
    status = "needs_review" if verification_errors else "likely_current"
    confidence = 0.22 if verification_errors else 0.48
    data.update(fields)
    record = {
        "id": skill_id,
        "entity_type": entity_type,
        "name": skill_name,
        "normalized_name": catalog_entry.get("normalized_name") or skill_id.split(":", 1)[-1],
        "az_order": catalog_entry.get("az_order"),
        "category": catalog_entry.get("category", entity_type),
        "variant_type": catalog_entry.get("variant_type"),
        "base_skill_id": catalog_entry.get("base_skill_id"),
        "patch": patch or "unresolved",
        "league": league or "unresolved",
        "source_url": primary,
        "source_type": "poewiki" if "poewiki" in primary else ("poedb" if primary else "unknown"),
        "source_date": source_date,
        "collected_at": collected_at,
        "last_verified_at": "",
        "classification": "community",
        "confidence": confidence,
        "status": status,
        "data": data,
        "conflicts": [],
        "validation_errors": verification_errors,
        "xml_status": "needs_source",
        "research_cycle": cycle,
        "research_focus": focus,
    }
    record["missing_fields"] = missing_fields(record)
    record["all_missing_fields"] = [
        field for field in REQUIRED_FIELDS
        if record.get(field, record.get("data", {}).get(field)) in (None, "", [], {})
    ]
    record["next_research_priority"] = record["missing_fields"][:8] or record["all_missing_fields"][:8]
    return record


def load_catalog():
    if not CATALOG.exists():
        raise FileNotFoundError(f"missing catalog: {CATALOG}")
    payload = json.loads(CATALOG.read_text(encoding="utf-8"))
    skills = payload.get("skills", [])
    if not skills:
        raise ValueError("skill catalog is empty")
    return sorted(skills, key=lambda x: (x.get("az_order") or 999999, x.get("name", "")))


def load_cursor(skills):
    if CURSOR.exists():
        try:
            return json.loads(CURSOR.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {
        "cycle": 1,
        "last_processed_id": None,
        "next_id": skills[0]["id"],
        "next_az_order": skills[0].get("az_order", 1),
        "status": "ready",
        "errors": [],
    }


def pick_next_skill(skills, cursor):
    next_id = cursor.get("next_id")
    if next_id:
        for i, skill in enumerate(skills):
            if skill.get("id") == next_id:
                return i, skill
    last = cursor.get("last_processed_id")
    if last:
        for i, skill in enumerate(skills):
            if skill.get("id") == last:
                return (i + 1) % len(skills), skills[(i + 1) % len(skills)]
    return 0, skills[0]


def pick_next_batch(skills, cursor, size=BATCH_SIZE):
    start_index, _ = pick_next_skill(skills, cursor)
    batch = []
    for offset in range(min(size, len(skills))):
        idx = (start_index + offset) % len(skills)
        batch.append((idx, skills[idx]))
    return batch


def write_cursor(skills, last_index, records, run_end):
    next_index = (last_index + 1) % len(skills)
    old = load_cursor(skills)
    cycle = int(old.get("cycle", 1))
    if next_index <= last_index:
        cycle += 1
    last = records[-1]
    payload = {
        "cycle": cycle,
        "last_processed_id": last["id"],
        "last_processed_name": last["name"],
        "last_batch_count": len(records),
        "last_batch_ids": [r["id"] for r in records],
        "last_batch_names": [r["name"] for r in records],
        "next_id": skills[next_index]["id"],
        "next_name": skills[next_index]["name"],
        "next_az_order": skills[next_index].get("az_order"),
        "status": "ready",
        "updated_at": run_end,
        "errors": [e for r in records for e in r.get("validation_errors", [])],
        "last_research_focus": last.get("research_focus", {}).get("name"),
        "last_missing_fields": {r["id"]: r.get("missing_fields", []) for r in records},
        "all_missing_fields": {r["id"]: r.get("all_missing_fields", []) for r in records},
        "next_research_priority": {r["id"]: r.get("next_research_priority", []) for r in records},
    }
    write_json(CURSOR, payload)


def write_json(path: Path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_md(path: Path, record):
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        f"# {record['name']}",
        f"- id: {record['id']}",
        f"- entity_type: {record['entity_type']}",
        f"- patch: {record['patch']}",
        f"- league: {record['league']}",
        f"- status: {record['status']}",
        f"- research_cycle: {record.get('research_cycle')}",
        f"- research_focus: {record.get('research_focus', {}).get('name')}",
        f"- confidence: {record['confidence']}",
        f"- source: {record['source_url']}",
        f"- source_type: {record['source_type']}",
        f"- source_date: {record['source_date']}",
        "",
        "## Campos normalizados",
        f"- tags: {', '.join(record['data'].get('tags', [])) or 'unverified'}",
        f"- requirements: {json.dumps(record['data'].get('requirements', {}), ensure_ascii=False)}",
        f"- supports: {', '.join(record['data'].get('supports', [])) or 'unverified'}",
        f"- incompatibilidades: {', '.join(record['data'].get('incompatibilities', [])) or 'unverified'}",
        "",
        "## Validação",
        f"- errors: {json.dumps(record.get('validation_errors', []), ensure_ascii=False)}",
        f"- conflicts: {json.dumps(record.get('conflicts', []), ensure_ascii=False)}",
        f"- missing_fields: {json.dumps(record.get('missing_fields', []), ensure_ascii=False)}",
        f"- next_research_priority: {json.dumps(record.get('next_research_priority', []), ensure_ascii=False)}",
    ]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_reports(run_start, run_end, patch, patch_source_date, league, records, outputs):
    REPORTS.mkdir(parents=True, exist_ok=True)
    errors = [e for r in records for e in r.get("validation_errors", [])]
    latest_update = {
        "execution": "poe-knowledge-research-automation",
        "start": run_start,
        "end": run_end,
        "patch_detected": patch,
        "league_detected": league,
        "status": "completed_with_errors" if errors else "completed",
        "discovered": len(records),
        "updated": len(records),
        "builds_found": 0,
        "sources": [r["source_url"] for r in records if r["source_url"]],
        "errors": errors,
        "missing_fields": {r["id"]: r.get("missing_fields", []) for r in records},
        "next_research_priority": {r["id"]: r.get("next_research_priority", []) for r in records},
    }
    write_json(REPORTS / "latest_update.json", latest_update)
    (REPORTS / "latest_update.md").write_text(
        "\n".join([
            "# Relatório da automação",
            "",
            "## Estado",
            f"- Execução: completed",
            f"- Início: {run_start}",
            f"- Fim: {run_end}",
            f"- Patch detectado: {patch}",
            f"- Liga detectada: {league}",
            f"- Status: {latest_update['status']}",
            "",
            "## Resultados",
            f"- Skills descobertas: {latest_update['discovered']}",
            f"- Skills atualizadas: {latest_update['updated']}",
            "- Builds encontradas: 0",
            f"- Fontes consultadas: {len(latest_update['sources'])}",
            f"- Conflitos: 0",
            f"- Erros: {len(latest_update['errors'])}",
            "",
            "## Arquivos gerados",
            *(f"- {p}" for p in outputs),
        ]),
        encoding="utf-8",
    )
    write_json(REPORTS / "patch_diff.json", {"patch": patch, "source_date": patch_source_date, "raw_entries": []})
    write_json(REPORTS / "broken_builds.json", {"count": 0, "items": []})
    write_json(REPORTS / "unresolved_conflicts.json", {"count": 0, "items": []})
    write_json(REPORTS / "stale_sources.json", {"count": 0, "items": []})
    write_json(REPORTS / "new_skills.json", {"count": 0, "items": [r["name"] for r in records]})
    write_json(REPORTS / "removed_skills.json", {"count": 0, "items": []})
    write_json(REPORTS / "changed_mechanics.json", {"count": 0, "items": []})


def write_outputs(records, run_start, run_end, patch, patch_source_date, league):
    DATA_NORMALIZED.mkdir(parents=True, exist_ok=True)
    DATA_EXPORTS.mkdir(parents=True, exist_ok=True)
    RAG_CHUNKS.mkdir(parents=True, exist_ok=True)
    LOGS.mkdir(parents=True, exist_ok=True)

    records_path = DATA_EXPORTS / "skills.jsonl"
    csv_paths = {
        "skills": DATA_EXPORTS / "skills.csv",
        "supports": DATA_EXPORTS / "supports.csv",
        "items": DATA_EXPORTS / "items.csv",
        "builds": DATA_EXPORTS / "builds.csv",
        "sources": DATA_EXPORTS / "sources.csv",
    }

    outputs = []

    with records_path.open("w", encoding="utf-8") as out:
        rag_records: List[str] = []
        for rec in records:
            out.write(json.dumps(rec, ensure_ascii=False) + "\n")
            filename = rec.get("normalized_name") or rec["id"].split(":", 1)[-1]
            write_json(DATA_NORMALIZED / f"{filename}.json", rec)
            write_md(DATA_EXPORTS / f"{filename}.md", rec)
            rag_line = {
                "patch": rec["patch"],
                "league": rec["league"],
                "skill": rec["name"],
                "type": rec["entity_type"],
                "source": rec["source_url"],
                "source_type": rec["source_type"],
                "source_date": rec["source_date"],
                "collected_at": rec["collected_at"],
                "last_verified_at": rec["last_verified_at"],
                "confidence": rec["confidence"],
                "status": rec["status"],
                "text": rec["data"].get("raw_excerpt", "")[:280],
            }
            rag_records.append(json.dumps(rag_line, ensure_ascii=False))
            outputs.append(str(DATA_NORMALIZED / f"{filename}.json"))
            outputs.append(str(DATA_EXPORTS / f"{filename}.md"))

    with csv_paths["skills"].open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=[
            "id", "entity_type", "name", "patch", "league", "status", "source_url", "source_type",
            "source_date", "collected_at", "last_verified_at", "classification", "confidence"
        ])
        w.writeheader()
        for rec in records:
            w.writerow({k: rec.get(k, "") for k in w.fieldnames})
    outputs.append(str(csv_paths["skills"]))

    with csv_paths["supports"].open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["skill_id", "support_name", "status"])
        w.writeheader()
        for rec in records:
            if rec["entity_type"] == "support":
                w.writerow({"skill_id": rec["id"], "support_name": rec["name"], "status": rec["status"]})
    outputs.append(str(csv_paths["supports"]))

    with csv_paths["items"].open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["skill_id", "item_hint", "status"])
        w.writeheader()
    outputs.append(str(csv_paths["items"]))

    with csv_paths["builds"].open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["skill_id", "build_id", "status"])
        w.writeheader()
    outputs.append(str(csv_paths["builds"]))

    with (RAG_CHUNKS / "skills.jsonl").open("w", encoding="utf-8") as f:
        f.write("\n".join(rag_records) + ("\n" if rag_records else ""))

    with csv_paths["sources"].open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["skill_id", "source_url", "source_type", "source_date"])
        w.writeheader()
        for rec in records:
            for source in rec["data"].get("sources", []):
                src_type = "poewiki" if "poewiki" in source else "poedb" if "poedb" in source else "unknown"
                w.writerow({"skill_id": rec["id"], "source_url": source, "source_type": src_type, "source_date": rec["source_date"]})
    outputs.append(str(csv_paths["sources"]))

    write_reports(run_start, run_end, patch, patch_source_date, league, records, outputs)

    log = {
        "run_start": run_start,
        "run_end": run_end,
        "patch": patch,
        "league": league,
        "patch_source_date": patch_source_date,
        "records": len(records),
        "errors": [e for rec in records for e in rec.get("validation_errors", [])],
        "files": outputs,
    }
    logs = LOGS / f"{run_start[:19].replace(':', '-')}.jsonl"
    logs.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    acquire_lock()
    try:
        run_start = now_iso()
        skills = load_catalog()
        cursor = load_cursor(skills)
        cycle = int(cursor.get("cycle", 1))
        batch = pick_next_batch(skills, cursor)
        patch_notes_html = safe_fetch(PATCH_NOTES_URL)
        patch, patch_date = extract_patch_from_patch_notes(patch_notes_html)
        patch = patch or "unresolved"
        league, _ = detect_current_league()
        if league == "unresolved" and patch:
            league = f"unresolved_{patch}"
        records = []
        for _, skill in batch:
            entity_type = skill.get("category") or skill.get("variant_type") or "skill"
            records.append(build_record(skill["name"], entity_type, patch, league, run_start, skill, cycle))
        run_end = now_iso()
        write_outputs(records, run_start, run_end, patch, patch_date, league)
        write_cursor(skills, batch[-1][0], records, run_end)
    finally:
        release_lock()


if __name__ == "__main__":
    main()
