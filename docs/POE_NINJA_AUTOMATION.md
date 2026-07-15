# PoE Ninja Automation

Extrai builds por `skill -> class`, em ordem alfabetica de skill.

Preparar fila sem baixar XML:

```bash
python scripts/automate_poe_ninja_by_skill_class.py --league mirage --out-dir data/poe_ninja/poe_ninja_dataset --per-group 500 --queue-only
```

Extrair XMLs completos:

```bash
python scripts/automate_poe_ninja_by_skill_class.py --league mirage --out-dir data/poe_ninja/poe_ninja_dataset --per-group 200 --sleep 1 --include-xml --strip-xml-from-jsonl
```

Saidas:

- `{league}_plan.json`: plano por skill/classe.
- `{league}_pending.jsonl`: fila descoberta para puxar depois.
- `{league}_builds.jsonl`: builds normalizadas.
- `xml/{league}/*.xml`: XMLs completos.
- `{league}_completed.jsonl`: builds finalizadas.
- `{league}_state.json`: progresso para retomar.
- `{league}_errors.jsonl`: falhas/404/429.

Se ocorrer `429`, rode o mesmo comando depois; o estado evita repetir builds ja coletadas.
