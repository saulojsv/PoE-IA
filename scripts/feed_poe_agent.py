#!/usr/bin/env python3
import argparse
import html
import json
import re
import subprocess
import sys
import time
import urllib.request
import urllib.parse
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CFG = ROOT / "config" / "poe_knowledge_sources.json"
CACHE = ROOT / "data" / "forum_knowledge_cache"
KB = ROOT / "data" / "local_poe_build_knowledge"
LOG = ROOT / "logs" / "alimentador_poe.log"
PY = Path(sys.executable)

SECTION_KEYS = {
    "defense": ["defense", "defence", "survivability", "mitigation", "evasion", "armour", "suppression", "block"],
    "damage": ["damage", "dps", "critical", "crit", "scaling", "conversion"],
    "items": ["gear", "item", "unique", "weapon", "shield", "helmet", "body armour", "gloves", "boots", "belt", "ring", "amulet"],
    "skills": ["gem", "skill", "support", "aura", "reservation", "link"],
    "passive_tree": ["tree", "passive", "keystone", "notable", "mastery", "cluster", "jewel"],
    "leveling": ["leveling", "levelling", "campaign", "acts"],
    "pob": ["pob", "path of building", "pastebin", "pobb.in"],
    "budget": ["budget", "cheap", "expensive", "upgrade", "cost"]
}

KNOWN_SKILL_WORDS = [
    "Kinetic Fusillade", "Kinetic Blast", "Ballista Totem", "Elemental Hit", "Cyclone", "Molten Strike",
    "Lightning Strike", "Righteous Fire", "Spark", "Arc", "Boneshatter", "Tornado Shot", "Explosive Arrow",
    "Detonate Dead", "Raise Spectre", "Summon Raging Spirit", "Frostblink", "Flame Dash", "Grace",
    "Determination", "Discipline", "Wrath", "Anger", "Hatred", "Zealotry", "Malevolence", "Tempest Shield"
]

PASSIVE_WORDS = [
    "Elemental Overload", "Resolute Technique", "Pain Attunement", "Ghost Dance", "Iron Reflexes",
    "Mind Over Matter", "Eldritch Battery", "Chaos Inoculation", "Point Blank", "Precise Technique",
    "Ancestral Bond", "Magebane", "Lethe Shade", "Unwavering Stance"
]

NOISE_PATTERNS = [
    "Log In", "Create Account", "Contact Support", "Quote this Post", "Posted by",
    "Last edited by", "Forum Index", "View Staff Posts", "Post Reply", "Buy Packs",
    "Microtransactions", "Mystery Box", "League Ladders", "Code of Conduct"
]

TAXONOMY = {
    "rule": ["must", "should", "need", "required", "minimum", "cap", "important"],
    "item": ["item", "unique", "rare", "weapon", "shield", "helmet", "boots", "gloves", "belt", "ring", "amulet", "flask"],
    "node": ["node", "notable", "keystone", "passive", "tree", "pathing"],
    "mastery": ["mastery"],
    "gem": ["gem", "support", "aura", "skill", "link"],
    "defense": ["defense", "defence", "resist", "armour", "evasion", "suppression", "block", "recovery", "leech", "regen", "ailment"],
    "damage": ["damage", "dps", "crit", "critical", "accuracy", "conversion", "penetration", "exposure"],
    "mistake": ["without", "avoid", "problem", "mistake", "bad", "wrong", "can't", "cannot", "die"]
}


def log(msg):
    LOG.parent.mkdir(exist_ok=True)
    line = f"{datetime.now().isoformat(timespec='seconds')} {msg}"
    print(line)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def read_json(path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def fetch(url, sleep=1.0):
    CACHE.mkdir(parents=True, exist_ok=True)
    name = re.sub(r"[^a-zA-Z0-9._-]+", "_", url)[:180] + ".html"
    path = CACHE / name
    if path.exists():
        return path.read_text(encoding="utf-8", errors="ignore")
    req = urllib.request.Request(url, headers={"User-Agent": "PoE-local-learning-agent/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        text = r.read().decode("utf-8", errors="ignore")
    path.write_text(text, encoding="utf-8")
    time.sleep(sleep)
    return text


def discover_forum_threads(max_pages, sleep):
    seeds = [
        "https://www.pathofexile.com/forum/view-forum/40",
        "https://www.pathofexile.com/forum/view-forum/41",
        "https://www.pathofexile.com/forum/view-forum/22",
        "https://www.pathofexile.com/forum/view-forum/gameplay-discussion",
    ]
    urls = []
    seen = set()
    for seed in seeds:
        for page in range(1, max_pages + 1):
            url = seed if page == 1 else f"{seed}/page/{page}"
            try:
                log(f"DISCOVER {url}")
                raw = fetch(url, sleep)
            except Exception as e:
                log(f"DISCOVER_ERROR {url} {e}")
                continue
            for m in re.findall(r'href="(/forum/view-thread/\d+[^"]*)"', raw):
                full = urllib.parse.urljoin("https://www.pathofexile.com", m.split("#", 1)[0])
                if full not in seen:
                    seen.add(full)
                    urls.append(full)
    return urls


def discover_mobalytics_builds(url, max_builds, sleep):
    raw = fetch(url, sleep)
    urls = []
    seen = set()
    for href in re.findall(r'href="([^"]+)"', raw):
        href = html.unescape(href)
        if "/poe/builds/" not in href or href.rstrip("/") == "/poe/builds":
            continue
        full = urllib.parse.urljoin("https://mobalytics.gg", href.split("?", 1)[0])
        if full not in seen:
            seen.add(full)
            urls.append(full)
    return urls[:max_builds]


def discover_maxroll_builds(url, max_builds, sleep):
    raw = fetch(url, sleep)
    urls = []
    seen = set()
    for href in re.findall(r'href="([^"]+)"', raw):
        href = html.unescape(href)
        if "/poe/build-guides/" not in href:
            continue
        full = urllib.parse.urljoin("https://maxroll.gg", href.split("?", 1)[0])
        if full not in seen:
            seen.add(full)
            urls.append(full)
    return urls[:max_builds]


def clean_text(raw):
    raw = re.sub(r"(?is)<script.*?</script>|<style.*?</style>", " ", raw)
    raw = re.sub(r"(?s)<[^>]+>", " ", raw)
    raw = html.unescape(raw)
    raw = re.sub(r"\s+", " ", raw).strip()
    return raw


def denoise(text):
    for pat in NOISE_PATTERNS:
        text = text.replace(pat, " ")
    text = re.sub(r"(?i)\b(?:am|pm)\s+quote\b.*?(?=[A-Z][a-z]+|\Z)", " ", text)
    text = re.sub(r"https?://\S+", lambda m: m.group(0).rstrip(".,)"), text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def classify_taxonomy(text):
    low = text.lower()
    labels = [name for name, keys in TAXONOMY.items() if any(k in low for k in keys)]
    return labels or ["general"]


def confidence(priority, text, url):
    score = 1
    if priority == "thread_opening_post":
        score += 4
    elif priority == "thread_author_reply":
        score += 3
    elif priority == "page":
        score += 1
    low = text.lower()
    for key in ["pob", "path of building", "gear", "defense", "defence", "tree", "passive", "gem", "flask", "dps"]:
        if key in low:
            score += 1
    if "pathofexile.com/forum" in url:
        score += 1
    return min(score, 10)


def extract_forum_author_posts(raw):
    blocks = re.findall(r'(?is)<div[^>]+class="[^"]*forum-post[^"]*"[^>]*>.*?</div>\s*</div>\s*</div>', raw)
    posts = []
    if not blocks:
        return []
    for i, block in enumerate(blocks):
        author = ""
        m = re.search(r'(?is)class="[^"]*(?:profile-link|account-name|author)[^"]*"[^>]*>(.*?)</', block)
        if m:
            author = clean_text(m.group(1))
        text = clean_text(block)
        posts.append({"index": i, "author": author, "text": text})
    main_author = posts[0]["author"] if posts else ""
    selected = []
    for post in posts:
        if post["index"] == 0:
            post["priority"] = "thread_opening_post"
            selected.append(post)
        elif main_author and post["author"] == main_author:
            post["priority"] = "thread_author_reply"
            selected.append(post)
    return selected


def title_of(raw):
    m = re.search(r"(?is)<title>(.*?)</title>", raw)
    return clean_text(m.group(1)) if m else ""


def links(raw, pattern):
    found = []
    for m in re.findall(r'href="([^"]+)"', raw):
        if pattern in m:
            found.append(urllib.parse.urljoin("https://www.pathofexile.com", html.unescape(m)))
    return sorted(set(found))


def terms(text, words):
    low = text.lower()
    return sorted({w for w in words if w.lower() in low})


def item_terms(text):
    found = set()
    for pat in [
        r"\b[A-Z][A-Za-z']+(?:\s+[A-Z][A-Za-z']+){1,4}\b",
        r"\+\d+%? to [A-Za-z ]+",
        r"\d+% increased [A-Za-z ]+",
        r"\d+% chance to [A-Za-z ]+",
    ]:
        for m in re.findall(pat, text):
            if len(m) <= 80:
                found.add(m.strip())
    return sorted(found)[:80]


def classify_sections(text):
    chunks = re.split(r"(?i)(?:\n|\. )(?=(?:gear|items|defen[cs]e|damage|dps|skills?|gems?|passive|tree|cluster|leveling|budget|pob|faq)\b)", text)
    sections = {k: [] for k in SECTION_KEYS}
    for chunk in chunks:
        low = chunk.lower()
        for name, keys in SECTION_KEYS.items():
            if any(k in low for k in keys):
                sections[name].append(chunk[:1200])
                break
    return {k: v[:10] for k, v in sections.items() if v}


def learning_units(text, url):
    rows = []
    sentences = re.split(r"(?<=[.!?])\s+", text)
    reason_markers = ["because", "since", "so that", "to get", "for ", "allows", "enables", "need", "required", "must", "should"]
    risk_markers = ["without", "if you don't", "problem", "risk", "weak", "bad", "avoid", "can't", "cannot"]
    for s in sentences:
        low = s.lower()
        if 60 <= len(s) <= 500 and any(x in low for x in reason_markers + risk_markers):
            rows.append({
                "source": url,
                "mechanic": ", ".join(terms(s, KNOWN_SKILL_WORDS + PASSIVE_WORDS)) or "general",
                "evidence": s,
                "reason": s if any(x in low for x in reason_markers) else "",
                "risk_if_missing": s if any(x in low for x in risk_markers) else "",
                "alternatives": []
            })
    return rows[:120]


def structured_thread(raw, url):
    posts = extract_forum_author_posts(raw)
    text = denoise("\n".join(p["text"] for p in posts) if posts else clean_text(raw))
    pob_links = sorted(set(re.findall(r"https?://(?:pobb\.in|pastebin\.com|poe\.ninja|pathofbuilding)[^\s\"'<)]+", raw, flags=re.I)))
    tree_links = links(raw, "passive-skill-tree")
    return {
        "url": url,
        "title": title_of(raw),
        "author_priority": [p.get("priority") for p in posts],
        "opening_post": denoise(posts[0]["text"])[:12000] if posts else text[:12000],
        "author_replies": [denoise(p["text"])[:8000] for p in posts[1:8]],
        "sections": classify_sections(text),
        "pob_links": pob_links,
        "skills": {
            "mentioned": terms(text, KNOWN_SKILL_WORDS),
            "supports": sorted(set(re.findall(r"\b[A-Z][A-Za-z ]+ Support\b", text)))[:80],
            "auras": terms(text, ["Grace", "Determination", "Discipline", "Wrath", "Anger", "Hatred", "Zealotry", "Malevolence", "Tempest Shield", "Purity of Elements", "Precision", "Clarity", "Vitality"]),
            "movement": terms(text, ["Frostblink", "Flame Dash", "Dash", "Leap Slam", "Shield Charge", "Whirling Blades", "Blink Arrow"])
        },
        "passive_tree": {
            "tree_links": tree_links,
            "keystones": terms(text, PASSIVE_WORDS),
            "notables": [],
            "masteries": sorted(set(re.findall(r"\b[A-Z][A-Za-z ]+ Mastery\b", text)))[:80],
            "cluster_jewels": sorted(set(re.findall(r"\b(?:Large|Medium|Small) Cluster Jewel\b[^.]{0,120}", text)))[:80],
            "jewel_sockets": terms(text, ["Watcher's Eye", "Forbidden Flame", "Forbidden Flesh", "Thread of Hope", "Timeless Jewel", "Lethal Pride", "Impossible Escape"]),
            "pathing_reason": [x["evidence"] for x in learning_units(text, url) if "tree" in x["evidence"].lower() or "passive" in x["evidence"].lower()][:20]
        },
        "items": {
            "mentioned": item_terms(text),
            "required_uniques": [],
            "rare_affixes": sorted(set(re.findall(r"(?:\+\d+%? to [A-Za-z ]+|\d+% increased [A-Za-z ]+|Adds \d+ to \d+ [A-Za-z ]+)", text)))[:80],
            "flasks": sorted(set(re.findall(r"\b[A-Z][A-Za-z ]+ Flask\b", text)))[:80],
            "budget_options": [s for s in re.split(r"(?<=[.!?])\s+", text) if "budget" in s.lower()][:20],
            "upgrade_priority": [s for s in re.split(r"(?<=[.!?])\s+", text) if "upgrade" in s.lower()][:20]
        },
        "learning_units": [
            {**u, "taxonomy": classify_taxonomy(u.get("evidence", "")), "confidence": confidence("structured", u.get("evidence", ""), url)}
            for u in learning_units(text, url)
        ]
    }


def update_structured_threads(rows):
    out = KB / "forum_threads_structured.jsonl"
    by_url = {}
    if out.exists():
        for line in out.read_text(encoding="utf-8").splitlines():
            if line.strip():
                row = json.loads(line)
                by_url[row["url"]] = row
    for row in rows:
        by_url[row["url"]] = row
    out.write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in by_url.values()) + "\n", encoding="utf-8")
    return len(by_url)


def extract_rules(text, url, priority="page"):
    keys = [
        "resist", "resistance", "chaos", "critical", "crit", "accuracy",
        "defence", "defense", "armour", "evasion", "suppression", "block",
        "recovery", "leech", "regeneration", "flask", "ailment", "mana",
        "reservation", "support", "damage", "DPS", "Path of Building", "PoB"
    ]
    sentences = re.split(r"(?<=[.!?])\s+", text)
    hits = []
    for s in sentences:
        low = s.lower()
        if any(k.lower() in low for k in keys) and 50 <= len(s) <= 500:
            s = denoise(s)
            if len(s) >= 50 and not any(noise.lower() in s.lower() for noise in NOISE_PATTERNS):
                hits.append(s)
    return [
        {
            "source": url,
            "priority": priority,
            "confidence": confidence(priority, s, url),
            "taxonomy": classify_taxonomy(s),
            "text": s
        }
        for s in hits[:80]
    ]


def extract_rules_from_page(raw, url):
    posts = extract_forum_author_posts(raw)
    if posts:
        rows = []
        for post in posts:
            rows.extend(extract_rules(post["text"], url, post["priority"]))
        return rows
    return extract_rules(clean_text(raw), url, "page")


def update_web_rules(rows):
    out = KB / "forum_learned_rules.jsonl"
    seen = set()
    existing = []
    if out.exists():
        for line in out.read_text(encoding="utf-8").splitlines():
            if line.strip():
                row = json.loads(line)
                row.setdefault("priority", "legacy")
                row.setdefault("confidence", confidence(row.get("priority", "legacy"), row.get("text", ""), row.get("source", "")))
                row.setdefault("taxonomy", classify_taxonomy(row.get("text", "")))
                seen.add(row["text"])
                existing.append(row)
    for row in rows:
        if row["text"] not in seen:
            existing.append(row)
            seen.add(row["text"])
    out.write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in existing) + "\n", encoding="utf-8")
    return len(existing)


def run_step(args):
    log("RUN " + " ".join(str(x) for x in args))
    subprocess.run([str(PY), *args], cwd=ROOT, check=False)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-web", action="store_true")
    parser.add_argument("--skip-ninja", action="store_true", default=True)
    parser.add_argument("--include-ninja", action="store_true")
    parser.add_argument("--crawl-forum", action="store_true", default=True)
    parser.add_argument("--forum-pages", type=int, default=3)
    parser.add_argument("--max-threads", type=int, default=120)
    parser.add_argument("--sleep", type=float, default=1.5)
    args = parser.parse_args()

    if not args.skip_web:
        cfg = read_json(CFG, {"sources": []})
        rows = []
        structured = []
        for src in cfg.get("sources", []):
            if not src.get("enabled"):
                continue
            if src.get("type") == "mobalytics_build_index":
                for url in discover_mobalytics_builds(src["url"], src.get("max_builds", 80), args.sleep):
                    try:
                        log(f"MOBALYTICS_BUILD {url}")
                        raw = fetch(url, args.sleep)
                        rows.extend(extract_rules_from_page(raw, url))
                        structured.append(structured_thread(raw, url))
                    except Exception as e:
                        log(f"MOBALYTICS_ERROR {url} {e}")
                continue
            if src.get("type") == "maxroll_build_index":
                for url in discover_maxroll_builds(src["url"], src.get("max_builds", 80), args.sleep):
                    try:
                        log(f"MAXROLL_BUILD {url}")
                        raw = fetch(url, args.sleep)
                        rows.extend(extract_rules_from_page(raw, url))
                        structured.append(structured_thread(raw, url))
                    except Exception as e:
                        log(f"MAXROLL_ERROR {url} {e}")
                continue
            if src.get("type") != "pages":
                continue
            for url in src.get("urls", []):
                try:
                    log(f"WEB {url}")
                    raw = fetch(url, args.sleep)
                    rows.extend(extract_rules_from_page(raw, url))
                    structured.append(structured_thread(raw, url))
                except Exception as e:
                    log(f"WEB_ERROR {url} {e}")
        if args.crawl_forum:
            for url in discover_forum_threads(args.forum_pages, args.sleep)[:args.max_threads]:
                try:
                    log(f"FORUM_THREAD {url}")
                    raw = fetch(url, args.sleep)
                    rows.extend(extract_rules_from_page(raw, url))
                    structured.append(structured_thread(raw, url))
                except Exception as e:
                    log(f"FORUM_THREAD_ERROR {url} {e}")
        log(f"WEB_RULES total={update_web_rules(rows)}")
        log(f"STRUCTURED_THREADS total={update_structured_threads(structured)}")

    if args.include_ninja and not args.skip_ninja:
        run_step(["scripts/automate_poe_ninja_by_skill_class.py", "--league", "mirage", "--out-dir", "data/poe_ninja/poe_ninja_dataset", "--limit", "0", "--per-group", "200", "--sleep", "1", "--include-xml", "--strip-xml-from-jsonl"])
    run_step(["scripts/build_local_poe_learning_dataset.py"])
    run_step(["scripts/generate_poe_build_knowledge_base.py"])
    run_step(["scripts/build_fast_answer_index.py"])
    log("DONE")


if __name__ == "__main__":
    main()
