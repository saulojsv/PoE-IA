#!/usr/bin/env python3
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KB = ROOT / "data" / "local_poe_build_knowledge"


def read_jsonl(path):
    if not path.exists():
        return []
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]


def main():
    notes = read_jsonl(KB / "build_knowledge.jsonl")
    by_skill = defaultdict(list)
    by_class = defaultdict(list)
    by_asc = defaultdict(list)
    summaries = {}
    for n in notes:
        i, m, l = n.get("identity", {}), n.get("metrics", {}), n.get("logic", {})
        row = {
            "id": n.get("id"),
            "skill": i.get("main_skill"),
            "class": i.get("class"),
            "ascendancy": i.get("ascendancy"),
            "delivery": i.get("delivery"),
            "dps": m.get("dps"),
            "crit": m.get("crit_chance"),
            "hit": m.get("hit_chance"),
            "defenses": l.get("defense_layers", []),
            "supports": l.get("main_supports", [])[:8],
            "risks": n.get("risks", []),
        }
        summaries[n.get("id")] = row
        if row["skill"]:
            by_skill[row["skill"].lower()].append(row)
        if row["class"]:
            by_class[row["class"].lower()].append(row)
        if row["ascendancy"]:
            by_asc[row["ascendancy"].lower()].append(row)
    out = {
        "builds": len(notes),
        "by_skill": by_skill,
        "by_class": by_class,
        "by_ascendancy": by_asc,
        "summaries": summaries,
    }
    (KB / "fast_answer_index.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"builds": len(notes), "skills": len(by_skill), "file": str(KB / "fast_answer_index.json")}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
