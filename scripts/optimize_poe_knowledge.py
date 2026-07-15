#!/usr/bin/env python3
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KB = ROOT / "data" / "local_poe_build_knowledge"


def read_jsonl(path):
    if not path.exists():
        return []
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]


def norm(text):
    text = text.lower()
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"[^a-z0-9%+ ]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def key(text):
    words = [w for w in norm(text).split() if len(w) > 3]
    return " ".join(words[:32])


def main():
    rules = read_jsonl(KB / "forum_learned_rules.jsonl")
    threads = read_jsonl(KB / "forum_threads_structured.jsonl")
    best = {}
    for r in rules:
        k = key(r.get("text", ""))
        if not k:
            continue
        old = best.get(k)
        if old is None or int(r.get("confidence", 0)) > int(old.get("confidence", 0)):
            best[k] = r
    compact = sorted(best.values(), key=lambda r: (-int(r.get("confidence", 0)), r.get("priority", ""), r.get("text", "")))

    by_tax = defaultdict(list)
    for r in compact:
        for t in r.get("taxonomy", ["general"]):
            by_tax[t].append(r)

    structured_units = []
    for t in threads:
        for u in t.get("learning_units", []):
            structured_units.append({
                "source": t.get("url"),
                "title": t.get("title"),
                "mechanic": u.get("mechanic"),
                "taxonomy": u.get("taxonomy", ["general"]),
                "confidence": u.get("confidence", 0),
                "evidence": u.get("evidence"),
                "reason": u.get("reason"),
                "risk_if_missing": u.get("risk_if_missing"),
                "alternatives": u.get("alternatives", [])
            })

    learning_index = {
        "counts": {
            "raw_rules": len(rules),
            "compact_rules": len(compact),
            "structured_threads": len(threads),
            "learning_units": len(structured_units)
        },
        "top_rules_by_taxonomy": {
            tax: rows[:80] for tax, rows in by_tax.items()
        },
        "learning_units": sorted(structured_units, key=lambda x: -int(x.get("confidence", 0)))[:2000],
        "taxonomy_counts": {k: len(v) for k, v in by_tax.items()}
    }
    (KB / "forum_rules_compact.jsonl").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in compact) + "\n", encoding="utf-8")
    (KB / "learning_index.json").write_text(json.dumps(learning_index, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(learning_index["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
