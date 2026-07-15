import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data" / "items" / "item_base_mods.json"
OUT = ROOT / "dashboard" / "item_base_mod_summary.json"


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    mods = data.get("mods", {})
    out = {"summary": data.get("summary", {}), "bases": {}}
    for name, base in data.get("bases", {}).items():
        eligible = []
        prefix = suffix = other = 0
        for mod_id, weight in base.get("eligible_mods", []):
            mod = mods.get(mod_id)
            if not mod:
                continue
            if mod.get("type") == "Prefix":
                prefix += 1
            elif mod.get("type") == "Suffix":
                suffix += 1
            else:
                other += 1
            if len(eligible) < 40:
                eligible.append({
                    "id": mod_id,
                    "type": mod.get("type", ""),
                    "group": mod.get("group", ""),
                    "min_item_level": mod.get("min_item_level", 0),
                    "line": (mod.get("lines") or [""])[0],
                    "weight": weight,
                })
        out["bases"][name] = {
            "slot": base.get("slot", ""),
            "base_type": base.get("base_type", ""),
            "required_level": base.get("required_level", 0),
            "implicit": base.get("implicit", ""),
            "mod_count": base.get("mod_count", 0),
            "prefix_count": prefix,
            "suffix_count": suffix,
            "other_count": other,
            "sample_mods": eligible,
        }
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print({"bases": len(out["bases"]), "out": str(OUT), "bytes": OUT.stat().st_size})


if __name__ == "__main__":
    main()
