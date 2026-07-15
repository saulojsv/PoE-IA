#!/usr/bin/env python3
import json
import re
import shutil
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data" / "external_agents" / "poe_builder" / "inbox"
DONE = ROOT / "data" / "external_agents" / "poe_builder" / "processed"
OUT = ROOT / "data" / "local_poe_chat_memory" / "external_poe_builder_answers.jsonl"


def chunks(text):
    parts = re.split(r"(?im)^\s*(?:pergunta|question)\s*:\s*", text)
    if len(parts) <= 1:
        return [{"question": "", "answer": text.strip()}] if text.strip() else []
    rows = []
    for part in parts[1:]:
        m = re.split(r"(?im)^\s*(?:resposta|answer)\s*:\s*", part, maxsplit=1)
        if len(m) == 2:
            rows.append({"question": m[0].strip(), "answer": m[1].strip()})
    return rows


def main():
    SRC.mkdir(parents=True, exist_ok=True)
    DONE.mkdir(parents=True, exist_ok=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with OUT.open("a", encoding="utf-8") as out:
        for path in SRC.glob("*.txt"):
            text = path.read_text(encoding="utf-8", errors="ignore")
            for row in chunks(text):
                row.update({
                    "ts": datetime.now().isoformat(),
                    "source_agent": "chatgpt.com/g/g-EyjII73hc-poe-builder",
                    "source_file": str(path)
                })
                out.write(json.dumps(row, ensure_ascii=False) + "\n")
                count += 1
            shutil.move(str(path), DONE / path.name)
    print(json.dumps({"ingested": count, "out": str(OUT)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
