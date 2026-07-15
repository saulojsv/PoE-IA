#!/usr/bin/env python3
import argparse
import json
import sys
import time
import urllib.parse
from pathlib import Path
from urllib.error import HTTPError

SKILL_DIR = Path.home() / ".codex" / "skills" / "poe-ninja-build-extractor" / "scripts"
sys.path.insert(0, str(SKILL_DIR))

import extract_poe_ninja_builds as ninja


def load_json(path, default):
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return default


def append_jsonl(path, row):
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


def safe_name(text):
    return "".join(c if c.isalnum() or c in "._-" else "_" for c in text)[:120]


def retry(call, attempts=2, sleep=10):
    for i in range(attempts):
        try:
            return call()
        except HTTPError as e:
            if e.code != 429 or i == attempts - 1:
                raise
            time.sleep(sleep * (i + 1))


def build_plan(league):
    index = json.loads(retry(lambda: ninja.fetch("https://poe.ninja/poe1/api/data/build-index-state")))
    league_data = next(x for x in index["leagueBuilds"] if x["leagueUrl"] == league)
    by_skill = {}
    for stat in league_data.get("statistics", []):
        by_skill.setdefault(stat["skill"], []).append(stat)
    plan = []
    for skill in sorted(by_skill):
        stats = by_skill[skill]
        stats.sort(key=lambda x: x.get("percentage", 0), reverse=True)
        for stat in stats:
            plan.append(stat)
    return plan


def run(args):
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    builds_path = out_dir / f"{args.league}_builds.jsonl"
    state_path = out_dir / f"{args.league}_state.json"
    plan_path = out_dir / f"{args.league}_plan.json"
    pending_path = out_dir / f"{args.league}_pending.jsonl"
    completed_path = out_dir / f"{args.league}_completed.jsonl"
    xml_dir = out_dir / "xml" / args.league
    xml_dir.mkdir(parents=True, exist_ok=True)

    state = load_json(state_path, {"done": [], "queued": [], "completed": [], "count": 0})
    if "seen" in state and "completed" not in state:
        state["completed"] = state["seen"]
    state.setdefault("queued", [])
    state.setdefault("completed", [])
    state.setdefault("done", [])
    state.setdefault("count", 0)
    queued = set(map(tuple, state.get("queued", [])))
    completed = set(map(tuple, state.get("completed", [])))
    done = set(state.get("done", []))

    snap = retry(lambda: ninja.get_snapshot(args.league))
    plan = build_plan(args.league)
    plan_path.write_text(json.dumps(plan, ensure_ascii=False, indent=2), encoding="utf-8")

    for stat in plan:
        key = f"{stat['skill']}::{stat['class']}"
        if key in done:
            continue

        extracted_in_group = 0
        pairs = retry(lambda: ninja.search_pairs(snap["version"], snap["snapshot"], stat["class"], stat["skill"]))
        for account, name in pairs:
            pair = (account, name)
            if pair in queued or pair in completed:
                continue
            source = (
                f"https://poe.ninja/poe1/builds/{urllib.parse.quote(args.league)}/character/"
                f"{urllib.parse.quote(account)}/{urllib.parse.quote(name)}?i=0"
            )
            pending = {
                "league": args.league,
                "account": account,
                "name": name,
                "source": source,
                "group": {"skill": stat["skill"], "class": stat["class"], "percentage": stat.get("percentage")},
            }
            append_jsonl(pending_path, pending)
            queued.add(pair)
            state["queued"] = [list(x) for x in queued]
            state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")

            if args.queue_only:
                continue

            try:
                row = retry(lambda: ninja.extract_direct(args.league, account, name, snap, args.include_xml, state["count"]))
            except Exception as e:
                append_jsonl(out_dir / f"{args.league}_errors.jsonl", {
                    "group": key,
                    "account": account,
                    "name": name,
                    "error": str(e),
                })
                continue

            row["group"] = {"skill": stat["skill"], "class": stat["class"], "percentage": stat.get("percentage")}
            if row.get("pob", {}).get("xml"):
                xml_path = xml_dir / f"{state['count']:08d}_{safe_name(account)}_{safe_name(name)}.xml"
                xml_path.write_text(row["pob"]["xml"], encoding="utf-8")
                row["pob"]["xml_path"] = str(xml_path)
                if args.strip_xml_from_jsonl:
                    row["pob"].pop("xml", None)
            append_jsonl(builds_path, row)
            append_jsonl(completed_path, pending)
            completed.add(pair)
            state["completed"] = [list(x) for x in completed]
            state["count"] += 1
            extracted_in_group += 1
            state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")

            if args.limit and state["count"] >= args.limit:
                return
            if args.per_group and extracted_in_group >= args.per_group:
                break
            if args.sleep:
                time.sleep(args.sleep)

        done.add(key)
        state["done"] = sorted(done)
        state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--league", default="mirage")
    ap.add_argument("--out-dir", default="poe_ninja_dataset")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--per-group", type=int, default=0)
    ap.add_argument("--sleep", type=float, default=1.0)
    ap.add_argument("--include-xml", action="store_true")
    ap.add_argument("--queue-only", action="store_true")
    ap.add_argument("--strip-xml-from-jsonl", action="store_true")
    ap.add_argument("--retry-attempts", type=int, default=2)
    ap.add_argument("--retry-sleep", type=float, default=10)
    run(ap.parse_args())


if __name__ == "__main__":
    try:
        main()
    except HTTPError as e:
        if e.code == 429:
            print("rate_limited=1")
            raise SystemExit(0)
        raise
