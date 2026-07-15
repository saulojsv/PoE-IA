#!/usr/bin/env python3
import argparse
import json
import re
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KB = ROOT / "data" / "local_poe_build_knowledge"


def load_json(path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def load_jsonl(path):
    rows = []
    if not path.exists():
        return rows
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def tokens(text):
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def note_text(note):
    parts = [
        note.get("id", ""),
        json.dumps(note.get("identity", {}), ensure_ascii=False),
        json.dumps(note.get("logic", {}), ensure_ascii=False),
        json.dumps(note.get("metrics", {}), ensure_ascii=False),
        " ".join(note.get("risks", [])),
    ]
    return " ".join(parts)


def search(notes, question, limit=6):
    q = tokens(question)
    ranked = []
    for note in notes:
        text = note_text(note)
        score = len(q & tokens(text))
        skill = (note.get("identity", {}).get("main_skill") or "").lower()
        if skill and skill in question.lower():
            score += 8
        if score:
            ranked.append((score, note))
    ranked.sort(key=lambda x: x[0], reverse=True)
    return [n for _, n in ranked[:limit]]


def compact_context(notes, skill_rules, forum_rules):
    lines = ["REGRAS GERAIS:"]
    for rule in forum_rules.get("rules", [])[:8]:
        lines.append(f"- {rule}")
    lines.append("\nBUILDS RELEVANTES:")
    for n in notes:
        ident = n.get("identity", {})
        metrics = n.get("metrics", {})
        logic = n.get("logic", {})
        lines.append(
            f"- {n.get('id')}: {ident.get('class')}/{ident.get('ascendancy')} "
            f"{ident.get('main_skill')} via {ident.get('delivery')}; "
            f"DPS={metrics.get('dps')}; defesas={', '.join(logic.get('defense_layers', []))}; "
            f"supports={', '.join(logic.get('main_supports', [])[:6])}; "
            f"riscos={', '.join(n.get('risks', [])[:6])}"
        )
    if skill_rules and len(notes) < 3:
        lines.append("\nSKILLS INDEXADAS:")
        for skill in sorted(skill_rules)[:30]:
            data = skill_rules[skill]
            lines.append(f"- {skill}: {data.get('build_count')} builds; classes={', '.join(data.get('classes', [])[:6])}")
    return "\n".join(lines)


def ollama_answer(model, question, context):
    prompt = (
        "Voce e um especialista local de Path of Exile 1. "
        "Responda em portugues, curto, usando apenas o contexto local. "
        "Se faltar dado, diga que precisa de mais XMLs.\n\n"
        f"CONTEXTO:\n{context}\n\nPERGUNTA: {question}\nRESPOSTA:"
    )
    body = json.dumps({"model": model, "prompt": prompt, "stream": False}, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request("http://127.0.0.1:11434/api/generate", data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as resp:
        return json.loads(resp.read().decode("utf-8")).get("response", "").strip()


def fallback_answer(question, matches, skill_rules, forum_rules):
    q = question.lower()
    if not matches:
        return "Nao achei builds locais suficientes. Extraia mais XMLs e regenere a base."
    if "skill" in q or "classe" in q or "ascend" in q:
        rows = []
        for n in matches:
            i = n["identity"]
            rows.append(f"{n['id']}: {i.get('main_skill')} | {i.get('class')}/{i.get('ascendancy')} | {i.get('delivery')}")
        return "\n".join(rows)
    n = matches[0]
    i, m, l = n["identity"], n["metrics"], n["logic"]
    gates_bad = ", ".join(n.get("risks", [])) or "nenhum gate basico falhou"
    return (
        f"{n['id']}: {i.get('class')}/{i.get('ascendancy')} usando {i.get('main_skill')} ({i.get('delivery')}).\n"
        f"DPS: {m.get('dps')} | crit: {m.get('crit_chance')} | hit: {m.get('hit_chance')}.\n"
        f"Defesas: {', '.join(l.get('defense_layers', [])) or 'nao inferidas'}.\n"
        f"Supports: {', '.join(l.get('main_supports', [])[:10])}.\n"
        f"Riscos: {gates_bad}."
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="llama3.2:3b")
    parser.add_argument("--no-ollama", action="store_true")
    args = parser.parse_args()

    notes = load_jsonl(KB / "build_knowledge.jsonl")
    skill_rules = load_json(KB / "skill_rules.json", {})
    forum_rules = load_json(KB / "forum_rules.json", {})
    print(f"Chat PoE local. Builds: {len(notes)}. Digite 'sair' para fechar.")
    while True:
        question = input("\n> ").strip()
        if question.lower() in {"sair", "exit", "quit"}:
            break
        matches = search(notes, question)
        context = compact_context(matches, skill_rules, forum_rules)
        if not args.no_ollama:
            try:
                print(ollama_answer(args.model, question, context))
                continue
            except (urllib.error.URLError, TimeoutError, ConnectionError):
                pass
        print(fallback_answer(question, matches, skill_rules, forum_rules))


if __name__ == "__main__":
    main()
