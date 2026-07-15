import json
import re
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPRITES = ROOT / "assets" / "poe1_item_sprites"
DASH_INDEX = ROOT / "dashboard" / "item_sprite_index.json"
OUT = ROOT / "data" / "items"
POB_DATA = ROOT / "external" / "PathOfBuildingTesst" / "src" / "Data"


def safe_key(text):
    return re.sub(r"\s+", " ", (text or "").replace("_", " ")).strip()


def build_sprite_aliases():
    manifest_path = SPRITES / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    aliases = defaultdict(list)
    index = {}

    for item, meta in manifest.items():
        if not isinstance(meta, dict) or not meta.get("file"):
            continue
        file_name = Path(meta["file"]).with_suffix(".webp").name
        if not (SPRITES / file_name).exists():
            continue
        rel = "../assets/poe1_item_sprites/" + file_name
        keys = {
            item,
            meta.get("item_name"),
            meta.get("base_item"),
            meta.get("matched_name"),
            meta.get("shared_from"),
            (meta.get("sprite_name") or "").replace(" inventory icon.png", ""),
        }
        for key in filter(None, keys):
            index.setdefault(safe_key(key), rel)
            aliases[rel].append(safe_key(key))

    for webp in SPRITES.glob("*.webp"):
        rel = "../assets/poe1_item_sprites/" + webp.name
        stem = webp.stem.replace("_inventory_icon", "")
        keys = {safe_key(stem), safe_key(stem.title())}
        for key in keys:
            index.setdefault(key, rel)
            aliases[rel].append(key)

    OUT.mkdir(parents=True, exist_ok=True)
    DASH_INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "sprite_aliases.json").write_text(
        json.dumps({k: sorted(set(v)) for k, v in aliases.items()}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return {"sprite_files": len(list(SPRITES.glob("*.webp"))), "sprite_keys": len(index), "sprite_groups": len(aliases)}


def build_modifier_manifest():
    OUT.mkdir(parents=True, exist_ok=True)
    mod_files = sorted(POB_DATA.glob("Mod*.lua")) if POB_DATA.exists() else []
    manifest = []
    for path in mod_files:
        text = path.read_text(encoding="utf-8", errors="ignore")
        manifest.append({
            "category": path.stem.replace("Mod", "") or "General",
            "source": str(path.relative_to(ROOT)),
            "bytes": path.stat().st_size,
            "estimated_entries": len(re.findall(r'\["[^"]+"\]\s*=', text)),
        })
    (OUT / "modifier_sources.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"modifier_sources": len(manifest), "estimated_entries": sum(x["estimated_entries"] for x in manifest)}


def main():
    result = {}
    result.update(build_sprite_aliases())
    result.update(build_modifier_manifest())
    (OUT / "item_asset_index_summary.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(result)


if __name__ == "__main__":
    main()
