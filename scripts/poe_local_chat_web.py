#!/usr/bin/env python3
import json
import re
import subprocess
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KB = ROOT / "data" / "local_poe_build_knowledge"
MEMORY = ROOT / "data" / "local_poe_chat_memory"
PY = ROOT / "scripts" / "chat_poe_local.py"
OLLAMA = Path.home() / "AppData/Local/Programs/Ollama/ollama.exe"
MODEL = "llama3.2:3b"


def read_json(path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def read_jsonl(path):
    if not path.exists():
        return []
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]


def toks(text):
    return set(re.findall(r"[a-z0-9]+", text.lower()))


NOTES = read_jsonl(KB / "build_knowledge.jsonl")
RULES = read_json(KB / "forum_rules.json", {})
SKILLS = read_json(KB / "skill_rules.json", {})
FUNDAMENTALS = read_json(KB / "poe_fundamentals.json", {})
FAST = read_json(KB / "fast_answer_index.json", {})
WEB_RULES = read_jsonl(KB / "forum_learned_rules.jsonl") or read_jsonl(KB / "web_learned_rules.jsonl")
STRUCTURED_THREADS = read_jsonl(KB / "forum_threads_structured.jsonl")
LEARNING_INDEX = read_json(KB / "learning_index.json", {})


def ensure_ollama():
    try:
        urllib.request.urlopen("http://127.0.0.1:11434/api/tags", timeout=2)
    except Exception:
        if OLLAMA.exists():
            subprocess.Popen([str(OLLAMA), "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def search(question, limit=5):
    q = toks(question)
    ranked = []
    for n in NOTES:
        text = json.dumps(n, ensure_ascii=False)
        score = len(q & toks(text))
        skill = (n.get("identity", {}).get("main_skill") or "").lower()
        if skill and skill in question.lower():
            score += 8
        if score:
            ranked.append((score, n))
    return [n for _, n in sorted(ranked, key=lambda x: x[0], reverse=True)[:limit]]


def memory_text():
    rows = read_jsonl(MEMORY / "approved_answers.jsonl")
    corrections = read_jsonl(MEMORY / "corrections.jsonl")
    external = read_jsonl(MEMORY / "external_poe_builder_answers.jsonl")
    text = [f"- Pergunta: {r['question']}\n  Resposta aprovada: {r['answer']}" for r in rows[-8:]]
    text += [f"- Pergunta: {r['question']}\n  Correcao: {r['correction']}" for r in corrections[-8:]]
    text += [f"- Pergunta: {r.get('question','')}\n  PoeBuilder: {r.get('answer','')}" for r in external[-8:]]
    return "\n".join(text)


def fast_answer(question):
    q = question.lower()
    if any(x in q for x in ["fundamento", "resist", "critical", "critico", "crit", "accuracy", "defesa", "dps minimo", "limite"]):
        rt = FUNDAMENTALS.get("role_targets", {})
        return (
            "Fundamento PoE: res elemental 75% padrao; chaos ideal >=0% em mapas e 75% robusto; "
            "ataque critico precisa accuracy/hit chance, crit chance e crit multi; toda build precisa recovery, movimento, ailment plan e recurso livre. "
            f"DPS alvo: red maps {rt.get('red_maps', {}).get('dps')}, endgame {rt.get('endgame_mapper', {}).get('dps')}, uber {rt.get('uber_bosser', {}).get('dps')}."
        )
    for skill, rows in FAST.get("by_skill", {}).items():
        if skill in q:
            lines = []
            for r in rows[:5]:
                lines.append(
                    f"{r['id']}: {r['class']}/{r['ascendancy']} {r['skill']} via {r['delivery']}; "
                    f"DPS {r['dps']}; defesas {', '.join(r['defenses'])}; riscos {', '.join(r['risks']) or 'nenhum gate basico'}."
                )
            return "\n".join(lines)
    return None


def context(question):
    matches = search(question)
    q = toks(question)
    learned = []
    compact_rules = []
    for rows in LEARNING_INDEX.get("top_rules_by_taxonomy", {}).values():
        compact_rules.extend(rows)
    source_rules = compact_rules or WEB_RULES
    ordered_rules = sorted(
        source_rules,
        key=lambda r: (
            {"thread_opening_post": 0, "thread_author_reply": 1, "page": 2, "legacy": 3}.get(r.get("priority"), 4),
            -int(r.get("confidence", 0))
        )
    )
    for r in ordered_rules:
        if len(q & toks(r.get("text", ""))) >= 1 and int(r.get("confidence", 0)) >= 3:
            learned.append(r.get("text", ""))
        if len(learned) >= 6:
            break
    thread_bits = []
    for t in STRUCTURED_THREADS:
        text = json.dumps(t, ensure_ascii=False)
        if len(q & toks(text)) >= 2:
            thread_bits.append(
                f"- {t.get('title')} | skills={', '.join(t.get('skills', {}).get('mentioned', [])[:6])} | "
                f"keystones={', '.join(t.get('passive_tree', {}).get('keystones', [])[:6])} | "
                f"pob={', '.join(t.get('pob_links', [])[:2])}"
            )
        if len(thread_bits) >= 4:
            break
    units = []
    for u in LEARNING_INDEX.get("learning_units", []):
        if len(q & toks(json.dumps(u, ensure_ascii=False))) >= 2:
            units.append(f"- {u.get('mechanic')}: {u.get('reason') or u.get('evidence')} Risco: {u.get('risk_if_missing')}")
        if len(units) >= 5:
            break
    parts = ["REGRAS:", *[f"- {r}" for r in RULES.get("rules", [])[:6]], *[f"- {r}" for r in learned], "\nAPRENDIZADO:", *units, "\nTHREADS ESTRUTURADAS:", *thread_bits, "\nMEMORIA:", memory_text(), "\nBUILDS:"]
    for n in matches:
        i, m, l = n.get("identity", {}), n.get("metrics", {}), n.get("logic", {})
        parts.append(
            f"- {n.get('id')}: {i.get('class')}/{i.get('ascendancy')} {i.get('main_skill')} "
            f"({i.get('delivery')}); DPS={m.get('dps')}; defesas={', '.join(l.get('defense_layers', []))}; "
            f"supports={', '.join(l.get('main_supports', [])[:6])}; riscos={', '.join(n.get('risks', [])[:6])}"
        )
    return "\n".join(parts), matches


def ask_model(question):
    quick = fast_answer(question)
    if quick:
        return quick
    ctx, matches = context(question)
    prompt = (
        "Voce e um agente local especialista em Path of Exile 1. Responda curto. "
        "Interprete mecanicas, nao apenas liste dados. "
        "Use somente o contexto local; se faltar dado, diga que precisa de mais XMLs.\n\n"
        f"{ctx}\n\nPERGUNTA: {question}\nRESPOSTA:"
    )
    body = json.dumps({"model": MODEL, "prompt": prompt, "stream": False, "options": {"num_predict": 220, "temperature": 0.2}}).encode("utf-8")
    req = urllib.request.Request("http://127.0.0.1:11434/api/generate", data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            ans = json.loads(r.read().decode("utf-8")).get("response", "").strip()
            if ans:
                return ans
    except Exception:
        pass
    if not matches:
        return "Nao achei build local suficiente. Extraia mais XMLs e regenere a base."
    n = matches[0]
    i, m, l = n["identity"], n["metrics"], n["logic"]
    return (
        f"{i.get('main_skill')} em {i.get('class')}/{i.get('ascendancy')} usa {i.get('delivery')}. "
        f"DPS {m.get('dps')}; defesas: {', '.join(l.get('defense_layers', []))}. "
        f"Riscos: {', '.join(n.get('risks', [])) or 'nenhum gate basico falhou'}."
    )


HTML = r"""<!doctype html><html><head><meta charset="utf-8"><title>PoE Local Chat</title>
<style>
body{margin:0;font-family:Segoe UI,Arial;background:#101214;color:#e9ecef}
main{max-width:980px;margin:0 auto;padding:24px}
#chat{height:68vh;overflow:auto;border:1px solid #30363d;padding:16px;background:#161b22}
.q{color:#8ab4ff}.a{white-space:pre-wrap;margin:10px 0 22px}
textarea{width:100%;height:80px;background:#0d1117;color:#e9ecef;border:1px solid #30363d;padding:10px}
button{padding:10px 14px;margin:8px 8px 0 0;background:#238636;color:white;border:0;cursor:pointer}
button.secondary{background:#30363d}
</style></head><body><main>
<h2>PoE Local Chat</h2><div id="chat"></div>
<textarea id="q" placeholder="Pergunte sobre uma build, skill, defesa, DPS, itens..."></textarea>
<button onclick="ask()">Perguntar</button><button class="secondary" onclick="save()">Salvar resposta boa</button>
<textarea id="corr" placeholder="Correção opcional: como a resposta deveria ser?"></textarea>
<button class="secondary" onclick="correct()">Salvar correção</button>
<script>
let lastQ="", lastA="";
async function ask(){
 const q=document.getElementById('q').value.trim(); if(!q)return; lastQ=q;
 const c=document.getElementById('chat'); c.innerHTML+=`<div class=q>> ${q}</div><div class=a>...</div>`; c.scrollTop=c.scrollHeight;
 const r=await fetch('/ask',{method:'POST',body:JSON.stringify({question:q})});
 const j=await r.json(); lastA=j.answer;
 c.lastChild.textContent=j.answer; c.scrollTop=c.scrollHeight;
}
async function save(){
 if(!lastQ||!lastA)return;
 await fetch('/save',{method:'POST',body:JSON.stringify({question:lastQ,answer:lastA})});
 alert('Salvo na memória local.');
}
async function correct(){
 const correction=document.getElementById('corr').value.trim(); if(!lastQ||!correction)return;
 await fetch('/correct',{method:'POST',body:JSON.stringify({question:lastQ,answer:lastA,correction})});
 alert('Correção salva.');
}
</script></main></body></html>"""


class Handler(BaseHTTPRequestHandler):
    def reply(self, code, data, ctype="application/json"):
        raw = data.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        self.reply(200, HTML, "text/html")

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        data = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
        if self.path == "/ask":
            self.reply(200, json.dumps({"answer": ask_model(data.get("question", ""))}, ensure_ascii=False))
        elif self.path == "/save":
            MEMORY.mkdir(exist_ok=True)
            row = {"ts": datetime.now().isoformat(), "question": data.get("question", ""), "answer": data.get("answer", "")}
            with (MEMORY / "approved_answers.jsonl").open("a", encoding="utf-8") as f:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")
            self.reply(200, json.dumps({"ok": True}))
        elif self.path == "/correct":
            MEMORY.mkdir(exist_ok=True)
            row = {"ts": datetime.now().isoformat(), "question": data.get("question", ""), "answer": data.get("answer", ""), "correction": data.get("correction", "")}
            with (MEMORY / "corrections.jsonl").open("a", encoding="utf-8") as f:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")
            self.reply(200, json.dumps({"ok": True}))
        else:
            self.reply(404, json.dumps({"error": "not found"}))


if __name__ == "__main__":
    ensure_ollama()
    MEMORY.mkdir(exist_ok=True)
    print("http://localhost:7860")
    ThreadingHTTPServer(("127.0.0.1", 7860), Handler).serve_forever()
