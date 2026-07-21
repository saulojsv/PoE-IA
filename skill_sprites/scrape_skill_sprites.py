"""Build a complete PoE Wiki skill -> skill icon catalog."""

from __future__ import annotations

import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote, unquote

from html.parser import HTMLParser
from urllib.error import HTTPError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
SPRITES = ROOT / "sprites"
BASE = "https://www.poewiki.net"
API = f"{BASE}/w/api.php"
LIST_URL = f"{BASE}/wiki/Skill_gem"
CATEGORY = "Category:Skill_icons"
HEADERS = {"User-Agent": "PoE-IA skill sprite catalog/1.0 (local research)"}


def safe_filename(value: str) -> str:
    value = unquote(value).replace("File:", "")
    value = re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("._")
    return value or "missing"


class SkillLinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_table = False
        self.href = None
        self.text = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "table":
            self.in_table = True
        if self.in_table and tag == "a" and (attrs.get("href") or "").startswith("/wiki/"):
            self.href = attrs["href"]
            self.text = []

    def handle_data(self, data):
        if self.href is not None:
            self.text.append(data)

    def handle_endtag(self, tag):
        if tag == "a" and self.href is not None:
            self.links.append((self.href, " ".join("".join(self.text).split())))
            self.href = None
        elif tag == "table":
            self.in_table = False


def get_text(url: str) -> str:
    request = Request(url, headers=HEADERS)
    for attempt in range(6):
        try:
            with urlopen(request, timeout=45) as response:
                return response.read().decode("utf-8", "replace")
        except HTTPError as exc:
            if exc.code != 429 or attempt == 5:
                raise
            time.sleep(2 ** attempt)


def request_json(params: dict) -> dict:
    query = "&".join(f"{quote(str(key))}={quote(str(value))}" for key, value in params.items())
    return json.loads(get_text(f"{API}?{query}"))


def discover_skills() -> list[dict]:
    parser = SkillLinkParser()
    parser.feed(get_text(LIST_URL))
    found: dict[str, dict] = {}
    for href, name in parser.links:
        if not name or ":" in href or href.startswith("/wiki/Skill_gem"):
            continue
        title = unquote(href.removeprefix("/wiki/")).replace("_", " ")
        found.setdefault(title, {"name": name, "title": title, "href": href})
    return sorted(found.values(), key=lambda item: item["name"].casefold())


def category_skill_icons() -> list[str]:
    """Read the skill-icon category in a few paginated aggregate requests."""
    files = []
    params = {
        "action": "query", "format": "json", "formatversion": "2",
        "list": "categorymembers", "cmtitle": CATEGORY,
        "cmnamespace": "6", "cmlimit": "max",
    }
    while True:
        payload = request_json(params)
        files.extend(item["title"] for item in payload.get("query", {}).get("categorymembers", []))
        if "continue" not in payload:
            break
        params.update(payload["continue"])
        time.sleep(1.0)
    return sorted(set(files))


def file_info(file_titles: list[str]) -> dict[str, dict]:
    # The redirect endpoint avoids a second, rate-limited API fan-out.
    return {
        title: {
            "file": title.removeprefix("File:"),
            "url": f"{BASE}/wiki/Special:Redirect/file/{quote(title.removeprefix('File:'), safe='')}",
            "mime": "image/png",
        }
        for title in file_titles
    }


def is_sprite(file_title: str) -> bool:
    return bool(re.search(r"skill[ _-]*icon", file_title, re.I))


def main() -> None:
    SPRITES.mkdir(parents=True, exist_ok=True)
    category_files = [image for image in category_skill_icons() if is_sprite(image)]
    # The category is the authoritative one-request index of skill sprites;
    # using it also avoids repeatedly fetching the 394 individual skill pages.
    skills = []
    for image in category_files:
        file_name = image.removeprefix("File:")
        name = re.sub(r"\s+skill icon(?:\.png)?$", "", file_name, flags=re.I)
        skills.append({"name": name, "title": name, "href": f"/wiki/{quote(name.replace(' ', '_'))}"})
    by_name = {
        image.removeprefix("File:").rsplit(" skill icon", 1)[0].casefold(): image
        for image in category_files
    }
    images_by_title = {
        skill["title"]: ([by_name[skill["name"].casefold()]] if skill["name"].casefold() in by_name else [])
        for skill in skills
    }
    candidate_titles = category_files
    infos = file_info(candidate_titles)
    checked_at = datetime.now(timezone.utc).isoformat()
    records = []
    for skill in skills:
        all_candidates = [infos[image] for image in images_by_title.get(skill["title"], []) if image in infos]
        primary = next((item for item in all_candidates if item["file"].lower().endswith("_skill_icon.png")), None)
        if primary is None and all_candidates:
            primary = all_candidates[0]
        local = None
        error = None
        if primary:
            local = f"sprites/{safe_filename(primary['file'])}"
            try:
                target = ROOT / local
                if not target.exists():
                    target.write_bytes(urlopen(Request(primary["url"], headers=HEADERS), timeout=45).read())
                    time.sleep(0.2)
            except HTTPError as exc:  # preserve per-skill failure in the catalog
                error = f"HTTP {exc.code}"
            except Exception as exc:  # preserve per-skill failure in the catalog
                error = f"{type(exc).__name__}: {exc}"
        records.append({
            "name": skill["name"], "wiki_title": skill["title"],
            "source_page": f"{BASE}{skill['href']}",
            "api_page": f"{API}?action=query&prop=images&titles={quote(skill['title'])}&format=json",
            "sprite": primary, "local_file": local, "status": "ok" if primary and not error else "missing" if not primary else "error",
            "file_page": f"{BASE}/wiki/File:{quote(primary['file'])}" if primary else None,
            "all_images": category_files,
            "all_sprite_candidates": all_candidates, "error": error,
            "checked_at": checked_at,
        })
    output = {"source": LIST_URL, "count": len(records), "records": records}
    (ROOT / "skill_sprite_index.json").write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    ok = sum(record["status"] == "ok" for record in records)
    print(f"skills={len(records)} ok={ok} missing={len(records)-ok} candidates={len(candidate_titles)}")


if __name__ == "__main__":
    main()
