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
CATEGORY_URL = f"{BASE}/wiki/Category:Skill_icons"
REQUEST_DELAY = 0.35
HEADERS = {"User-Agent": "PoE-IA skill sprite catalog/1.0 (local research)"}


def safe_filename(value: str) -> str:
    value = unquote(value).replace("File:", "")
    value = re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("._")
    return value or "missing"


class CategoryParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.files = []
        self.next_page = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        href = attrs.get("href") or ""
        if tag == "a" and re.search(r"/wiki/File:.+skill_icon\.png$", href, re.I):
            self.files.append(href)
        if tag == "a" and ((attrs.get("title") or "").lower() == "next page" or "filefrom=" in href):
            self.next_page = href


class FilePageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.direct = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ("href", "src"):
            value = attrs.get(key) or ""
            if "/images/" in value and re.search(r"skill_icon\.png(?:\?|$)", value, re.I):
                value = value.split("?", 1)[0]
                if "/thumb/" not in value:
                    self.direct.append(value)


def get_text(url: str, retry_429: bool = True) -> str:
    request = Request(url, headers=HEADERS)
    for attempt in range(6):
        try:
            with urlopen(request, timeout=45) as response:
                return response.read().decode("utf-8", "replace")
        except HTTPError as exc:
            if exc.code != 429 or not retry_429 or attempt == 5:
                raise
            time.sleep(2 ** attempt)


def category_skill_icons() -> list[str]:
    """Discover files by parsing paginated category HTML only."""
    files = set()
    url = CATEGORY_URL
    while url:
        parser = CategoryParser()
        parser.feed(get_text(url))
        files.update(parser.files)
        url = parser.next_page
        if url and url.startswith("/"):
            url = BASE + url
        time.sleep(REQUEST_DELAY)
    return sorted(files)


def file_info(file_titles: list[str]) -> dict[str, dict]:
    """Open each file page and parse its original /images/ link."""
    output = {}
    for title in file_titles:
        file_name = title.rsplit("/", 1)[-1]
        page_url = BASE + title
        parser = FilePageParser()
        page_error = None
        try:
            parser.feed(get_text(page_url, retry_429=False))
        except HTTPError as exc:
            page_error = f"HTTP {exc.code}"
        direct = next(iter(parser.direct), None)
        output[title] = {
            "file": unquote(file_name), "url": direct,
            "file_page": page_url, "error": page_error,
        }
        time.sleep(REQUEST_DELAY)
    return output


def is_sprite(file_title: str) -> bool:
    return bool(re.search(r"skill[ _-]*icon", file_title, re.I))


def main() -> None:
    SPRITES.mkdir(parents=True, exist_ok=True)
    category_files = [image for image in category_skill_icons() if is_sprite(image)]
    # The category is the authoritative one-request index of skill sprites;
    # using it also avoids repeatedly fetching the 394 individual skill pages.
    skills = []
    for image in category_files:
        file_name = unquote(image.rsplit("/", 1)[-1])
        name = re.sub(r"\s+skill icon(?:\.png)?$", "", file_name, flags=re.I)
        skills.append({"name": name, "title": name, "href": f"/wiki/{quote(name.replace(' ', '_'))}"})
    by_name = {
        unquote(image.rsplit("/", 1)[-1]).rsplit(" skill icon", 1)[0].casefold(): image
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
            "source_page": CATEGORY_URL,
            "sprite": primary, "local_file": local, "status": "ok" if primary and not error and not primary.get("error") else "missing" if not primary else "error",
            "file_page": primary.get("file_page") if primary else None,
            "all_images": category_files,
            "all_sprite_candidates": all_candidates, "error": error,
            "checked_at": checked_at,
        })
    output = {"source": CATEGORY_URL, "count": len(records), "records": records}
    (ROOT / "skill_sprite_index.json").write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    ok = sum(record["status"] == "ok" for record in records)
    print(f"skills={len(records)} ok={ok} missing={len(records)-ok} candidates={len(candidate_titles)}")


if __name__ == "__main__":
    main()
