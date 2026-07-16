import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "dashboard" / "build_dashboard_data.json"
INDEX = ROOT / "dashboard-new" / "public" / "poe-data" / "dashboard" / "item_sprite_index.json"
OUT = ROOT / "data" / "items" / "dashboard_sprite_validation.json"
FINAL = ROOT / "data" / "items" / "sprite_final_missing.json"
IGNORED = {"xml", "extraction samples", "root"}


def normalize(value):
    return " ".join(str(value or "").lower().split()).removesuffix(" (replica)").strip()


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    sprites = json.loads(INDEX.read_text(encoding="utf-8"))
    aliases = {normalize(key): value for key, value in sprites.items()}
    missing, non_webp, poe2_refs, broken = [], set(), set(), set()

    for skill in data.get("skills", []):
        if str(skill.get("skill", "")).lower() in IGNORED:
            continue
        for build in skill.get("build_rows", []):
            for item in build.get("item_details", []):
                rarity = item.get("rarity")
                key = item.get("base") if rarity in {"Rare", "Magic", "Normal"} else item.get("name")
                src = sprites.get(key) or aliases.get(normalize(key)) or sprites.get(item.get("base")) or aliases.get(normalize(item.get("base")))
                if not src:
                    missing.append({"skill": skill.get("skill"), "item": item.get("name"), "base": item.get("base"), "key": key})
                    continue
                if not src.endswith(".webp"):
                    non_webp.add(src)
                if "poe2_item_sprites" in src:
                    poe2_refs.add(src)
                if not (ROOT / src.replace("../", "")).exists():
                    broken.add(src)

    summary = {
        "dashboard_missing": len(missing),
        "unique_missing": len({x["key"] for x in missing}),
        "non_webp_refs": len(non_webp),
        "poe2_refs": len(poe2_refs),
        "broken_file_refs": len(broken),
    }
    OUT.write_text(json.dumps({
        "summary": summary,
        "missing": missing,
        "non_webp_refs": sorted(non_webp),
        "poe2_refs": sorted(poe2_refs),
        "broken_file_refs": sorted(broken),
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    FINAL.write_text(json.dumps({
        "rule": "dashboard_uses_poe1_webp_only_rare_magic_normal_use_base_unique_use_name_then_base_no_fallback",
        "missing_items": len(missing),
        "missing_unique": sorted({x["key"] for x in missing}),
        "non_webp_refs": sorted(non_webp),
        "poe2_refs": sorted(poe2_refs),
        "broken_file_refs": sorted(broken),
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print(summary)


if __name__ == "__main__":
    main()
