import csv
import json
import math
import re
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
XML_ROOT = ROOT / "data" / "poe_ninja" / "poe_ninja_dataset" / "xml"
EXPORTS = ROOT / "data" / "exports"
DASH = ROOT / "dashboard"


def slug_to_name(slug):
    return slug.replace("_", " ").title()


def read_csv(name):
    path = EXPORTS / name
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def finite(value):
    try:
        value = float(value or 0)
    except (TypeError, ValueError):
        return 0
    return value if math.isfinite(value) else 0


def first_item_name(text):
    lines = [x.strip() for x in text.splitlines() if x.strip()]
    if len(lines) >= 2 and not lines[0].startswith(("Rarity:", "Item Class:")):
        return lines[0]
    for i, line in enumerate(lines):
        if line.startswith("Rarity:") and i + 1 < len(lines):
            return lines[i + 1]
    return lines[0] if lines else "Unknown item"


def parse_item(text):
    lines = [x.strip() for x in text.splitlines() if x.strip()]
    rarity = lines[0].replace("Rarity:", "").strip().title() if lines and lines[0].startswith("Rarity:") else ""
    name = first_item_name(text)
    base = ""
    if rarity in {"Rare", "Magic"} and len(lines) > 2:
        base = lines[2]
    elif len(lines) > 1 and not lines[1].startswith(("Unique ID:", "Item Level:", "LevelReq:", "Implicits:")):
        base = lines[1]
    item_level = 0
    implicit_lines = []
    for line in lines:
        if line.startswith("Item Level:"):
            try:
                item_level = int(line.split(":", 1)[1].strip())
            except ValueError:
                pass
    for idx, line in enumerate(lines):
        if line.startswith("Implicits:"):
            try:
                count = int(line.split(":", 1)[1].strip())
            except ValueError:
                count = 0
            implicit_lines = [x for x in lines[idx + 1:idx + 1 + count] if not x.startswith("{crafted}")]
            break
    return {
        "name": name,
        "base": base or name,
        "rarity": rarity,
        "item_level": item_level,
        "slot": item_slot(name, base or name),
        "implicits": implicit_lines[:4],
    }


def item_slot(name, base):
    text = f"{name} {base}".lower()
    if "jewel" in text:
        return "jewel"
    two_hand = ("two hand" in text or "bow" in text or "staff" in text or "warstaff" in text or
                "maul" in text or "greatsword" in text or "long bow" in text)
    if any(x in text for x in ["body armour", "plate", "robe", "regalia", "garb", "vestment", "jacket", "armour"]):
        return "body"
    if any(x in text for x in ["gloves", "gauntlets", "mitts"]):
        return "gloves"
    if any(x in text for x in ["boots", "greaves", "slippers"]):
        return "boots"
    if "belt" in text or "sash" in text:
        return "belt"
    if "ring" in text:
        return "ring"
    if "amulet" in text or "talisman" in text:
        return "amulet"
    if any(x in text for x in ["helmet", "helm", "mask", "crown", "pelt", "hood", "circlet"]):
        return "helmet"
    if "shield" in text or "quiver" in text:
        return "offhand"
    if any(x in text for x in ["sword", "axe", "mace", "wand", "dagger", "claw", "staff", "bow", "sceptre", "rod"]):
        return "twohand" if two_hand else "weapon"
    return "other"


def parse_xml(path):
    try:
        root = ET.parse(path).getroot()
    except Exception as exc:
        return {"file": str(path), "error": str(exc)}

    build = root.find("Build")
    stats = {}
    if build is not None:
        for stat in build.findall("PlayerStat"):
            key = stat.attrib.get("stat")
            val = stat.attrib.get("value")
            if key and val:
                try:
                    stats[key] = float(val)
                except ValueError:
                    pass

    gems = []
    for gem in root.findall(".//Gem"):
        name = gem.attrib.get("nameSpec") or gem.attrib.get("skillId") or gem.attrib.get("name")
        if name:
            gems.append(name)

    items = []
    item_details = []
    for item in root.findall(".//Item"):
        if item.text:
            detail = parse_item(item.text)
            items.append(detail["name"])
            item_details.append(detail)

    spec = root.find(".//Spec")
    nodes = []
    if spec is not None:
        nodes_attr = spec.attrib.get("nodes", "")
        nodes = re.findall(r"\d+", nodes_attr)

    skill_slug = path.parent.name if path.parent != XML_ROOT else "root"
    return {
        "file": str(path.relative_to(ROOT)),
        "skill_slug": skill_slug,
        "skill": slug_to_name(skill_slug),
        "class": build.attrib.get("className", "") if build is not None else "",
        "ascendancy": build.attrib.get("ascendClassName", "") if build is not None else "",
        "level": int(build.attrib.get("level", 0)) if build is not None and build.attrib.get("level", "0").isdigit() else 0,
        "combined_dps": finite(stats.get("CombinedDPS") or stats.get("TotalDPS")),
        "ehp": finite(stats.get("TotalEHP") or stats.get("EffectiveHitPool")),
        "life": finite(stats.get("Life")),
        "energy_shield": finite(stats.get("EnergyShield")),
        "fire_resist": finite(stats.get("FireResist")),
        "cold_resist": finite(stats.get("ColdResist")),
        "lightning_resist": finite(stats.get("LightningResist")),
        "chaos_resist": finite(stats.get("ChaosResist")),
        "block": finite(stats.get("EffectiveBlockChance") or stats.get("BlockChance")),
        "spell_block": finite(stats.get("EffectiveSpellBlockChance") or stats.get("SpellBlockChance")),
        "suppression": finite(stats.get("EffectiveSpellSuppressionChance") or stats.get("SpellSuppressionChance")),
        "attack_speed": finite(stats.get("HitSpeed") or stats.get("Speed")),
        "crit_multi": finite(stats.get("CritMultiplier")),
        "max_phys_hit": finite(stats.get("PhysicalMaximumHitTaken")),
        "max_fire_hit": finite(stats.get("FireMaximumHitTaken")),
        "max_cold_hit": finite(stats.get("ColdMaximumHitTaken")),
        "max_lightning_hit": finite(stats.get("LightningMaximumHitTaken")),
        "max_chaos_hit": finite(stats.get("ChaosMaximumHitTaken")),
        "points_used": len(nodes),
        "gems": sorted(set(gems)),
        "items": sorted(set(items)),
        "item_details": item_details,
        "nodes": nodes,
    }


def main():
    DASH.mkdir(exist_ok=True)
    xml_files = list(XML_ROOT.rglob("*.xml")) if XML_ROOT.exists() else []
    builds = [parse_xml(p) for p in xml_files]
    builds = [b for b in builds if "error" not in b]

    by_skill = defaultdict(list)
    gem_counts = Counter()
    item_counts = Counter()
    node_counts = Counter()
    for b in builds:
        by_skill[b["skill"]].append(b)
        gem_counts.update(b["gems"])
        item_counts.update(b["items"])
        node_counts.update(b["nodes"])

    skills = []
    for skill, rows in sorted(by_skill.items()):
        best = max(rows, key=lambda x: x["combined_dps"])
        metric_rows = sorted(rows, key=lambda x: x["combined_dps"], reverse=True)
        common_gems = Counter(g for r in rows for g in r["gems"]).most_common(10)
        common_items = Counter(i for r in rows for i in r["items"]).most_common(10)
        common_nodes = Counter(n for r in rows for n in r["nodes"]).most_common(20)
        combos = int(math.prod([max(1, min(8, len(common_gems))), max(1, min(8, len(common_items))), max(1, min(12, len(common_nodes)))]))
        skills.append({
            "skill": skill,
            "builds": len(rows),
            "best_dps": round(best["combined_dps"], 2),
            "best_file": best["file"],
            "classes": Counter(r["ascendancy"] or r["class"] for r in rows).most_common(5),
            "build_rows": metric_rows,
            "gems": common_gems,
            "items": common_items,
            "nodes": common_nodes,
            "candidate_space": combos,
        })

    data = {
        "summary": {
            "xml_builds": len(builds),
            "skills_with_xml": len(skills),
            "unique_gems": len(gem_counts),
            "unique_items": len(item_counts),
            "unique_nodes": len(node_counts),
            "csv_skill_rows": len(read_csv("skills.csv")),
            "csv_support_rows": len(read_csv("skill_supports.csv")),
            "csv_item_rows": len(read_csv("skill_items.csv")),
        },
        "skills": sorted(skills, key=lambda x: (-x["builds"], x["skill"])),
        "builds": sorted(builds, key=lambda x: (-x["combined_dps"], x["skill"])),
        "top_gems": gem_counts.most_common(50),
        "top_items": item_counts.most_common(50),
        "top_nodes": node_counts.most_common(80),
    }

    (DASH / "build_dashboard_data.json").write_text(json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")
    if not (DASH / "index.html").exists():
        (DASH / "index.html").write_text(HTML, encoding="utf-8")
    print(DASH / "index.html")


HTML = r"""<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PoE Build Lab</title>
<style>
:root{--bg:#0f1114;--panel:#171a1f;--panel2:#1d2228;--line:#2a3139;--text:#eef1f3;--muted:#9aa4ad;--gold:#caa45d;--blue:#7db7dd;--green:#7fca9a;--red:#d47d7d}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.45 Inter,Segoe UI,Arial,sans-serif}
.app{display:grid;grid-template-columns:260px minmax(0,1fr);min-height:100vh}.side{background:#14171b;border-right:1px solid var(--line);padding:22px;position:sticky;top:0;height:100vh}.brand{font-size:21px;font-weight:750;margin-bottom:4px}.sub{color:var(--muted);font-size:12px;margin-bottom:24px}
.nav{display:grid;gap:6px}.nav button{width:100%;text-align:left;background:transparent;color:var(--muted);border:1px solid transparent;border-radius:7px;padding:10px 12px;cursor:pointer}.nav button.active,.nav button:hover{background:var(--panel2);border-color:var(--line);color:var(--text)}
.main{padding:24px 30px;max-width:1680px;width:100%}.hero{display:flex;justify-content:space-between;gap:18px;align-items:end;margin-bottom:18px}.hero h1{font-size:26px;line-height:1.1;margin:0 0 6px}.hero p{margin:0;color:var(--muted)}
.toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.search,.select{background:#111419;color:var(--text);border:1px solid var(--line);border-radius:7px;padding:10px 12px;height:40px}.search{min-width:340px;width:420px}
.stats{display:grid;grid-template-columns:repeat(6,minmax(120px,1fr));gap:12px;margin-bottom:18px}.stat{background:linear-gradient(180deg,#1b2026,#15191e);border:1px solid var(--line);border-radius:8px;padding:14px}.stat span{display:block;color:var(--muted);font-size:12px}.stat b{font-size:24px;font-variant-numeric:tabular-nums}
.layout{display:grid;grid-template-columns:360px minmax(0,1fr);gap:16px}.table,.detail,.panel{background:var(--panel);border:1px solid var(--line);border-radius:8px;overflow:hidden}.table-head,.detail-head{padding:14px 16px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:10px;align-items:center}
.table-scroll{max-height:640px;overflow:auto}table{width:100%;border-collapse:collapse}th,td{padding:11px 14px;border-bottom:1px solid #242a31;text-align:left;vertical-align:middle}th{color:var(--muted);font-weight:650;font-size:12px;background:#171b20;position:sticky;top:0}tr{cursor:pointer}tr:hover{background:#1b2026}.num{text-align:right;font-variant-numeric:tabular-nums}.skill-name{font-weight:700;color:#f5f0e7}
.pill{display:inline-flex;align-items:center;border:1px solid #39424c;background:#20262d;border-radius:999px;padding:3px 8px;margin:3px 4px 3px 0;font-size:12px;color:#dce3e8;max-width:100%;white-space:nowrap}.pill small{color:var(--gold);margin-left:5px}.warn{color:var(--gold)}
.detail-body{padding:16px}.metric{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid #242a31;padding:9px 0}.metric span{color:var(--muted)}.section{margin-top:16px}.section h3{font-size:12px;color:var(--muted);text-transform:uppercase;margin:0 0 8px;letter-spacing:.04em}.bar{height:7px;background:#242b32;border-radius:99px;overflow:hidden;margin:5px 0 10px}.bar i{display:block;height:100%;background:linear-gradient(90deg,var(--gold),var(--blue))}
.panels{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:16px}.panel{padding:14px}.panel h2{font-size:15px;margin:0 0 10px}.empty{color:var(--muted);padding:30px;text-align:center}.chart{display:grid;gap:10px}.chart-row{display:grid;grid-template-columns:170px 1fr 90px;gap:10px;align-items:center}.chart-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.delta{font-size:12px}.good{color:var(--green)}.bad{color:var(--red)}.build-card{padding:12px 14px;border-bottom:1px solid #242a31;cursor:pointer}.build-card:hover,.build-card.active{background:#20262d}.tabs{display:flex;gap:8px;margin:0 0 14px}.tabs button{background:#111419;color:var(--muted);border:1px solid var(--line);border-radius:7px;padding:8px 10px;cursor:pointer}.tabs button.active{color:var(--text);border-color:var(--gold)}
@media(max-width:1050px){.app{grid-template-columns:1fr}.side{position:relative;height:auto}.stats,.layout,.panels{grid-template-columns:1fr}.search{min-width:0}}
</style>
</head>
<body>
<div class="app">
<aside class="side"><div class="brand">PoE Build Lab</div><div class="sub">XML intelligence, combinations and node testing</div><nav class="nav"><button class="active" data-view="skills">Skills</button><button data-view="gems">Gems</button><button data-view="items">Items</button><button data-view="nodes">Nodes</button></nav></aside>
<main class="main">
<div class="hero"><div><h1>Build Intelligence</h1><p>Inventario de XMLs, pools de troca e candidatos para validação no PoB.</p></div><div class="toolbar"><input class="search" id="q" placeholder="Search skill, class, item, gem or node"><select class="select" id="sort"><option value="builds">Most builds</option><option value="dps">Best DPS</option><option value="space">Largest candidate space</option><option value="name">Name</option></select></div></div>
<section class="stats" id="stats"></section>
<section class="layout"><div class="table"><div class="table-head"><b id="title">Skills</b><span class="sub" id="count"></span></div><div id="table"></div></div><aside class="detail" id="detail"></aside></section>
<section class="panels"><div class="panel"><h2>Top Gems</h2><div id="topGems"></div></div><div class="panel"><h2>Top Items</h2><div id="topItems"></div></div><div class="panel"><h2>Top Nodes</h2><div id="topNodes"></div></div></section>
</main></div>
<script>
let data, view="skills", selected=null, selectedBuild=null, metric="combined_dps";
const fmt=n=>(Math.round(n||0)).toLocaleString("pt-PT");
const el=id=>document.getElementById(id);
const short=s=>(s||"").split(/[\\/]/).pop().replace(".xml","");
fetch("build_dashboard_data.json").then(r=>r.json()).then(j=>{data=j;selected=data.skills[0];selectedBuild=selected.build_rows[0];render()});
document.querySelectorAll(".nav button").forEach(b=>b.onclick=()=>{document.querySelector(".nav .active").classList.remove("active");b.classList.add("active");view=b.dataset.view;render()});
el("q").oninput=render;el("sort").onchange=render;
function chips(xs,n=8){return (xs||[]).slice(0,n).map(x=>`<span class="pill">${x[0]} <small>${x[1]}</small></span>`).join("")}
function stats(){let s=data.summary,total=data.skills.reduce((a,x)=>a+x.candidate_space,0);el("stats").innerHTML=[["XML builds",s.xml_builds],["Skills",s.skills_with_xml],["Gems",s.unique_gems],["Items",s.unique_items],["Nodes",s.unique_nodes],["Candidates",total]].map(x=>`<div class=stat><span>${x[0]}</span><b>${fmt(x[1])}</b></div>`).join("")}
function rows(){let q=el("q").value.toLowerCase(),r=[...data.skills].filter(x=>(x.skill+" "+JSON.stringify(x.classes)+" "+JSON.stringify(x.gems)+" "+JSON.stringify(x.items)+" "+x.build_rows.map(short).join(" ")).toLowerCase().includes(q));let s=el("sort").value;r.sort((a,b)=>s=="dps"?b.best_dps-a.best_dps:s=="space"?b.candidate_space-a.candidate_space:s=="name"?a.skill.localeCompare(b.skill):b.builds-a.builds);return r}
function table(){let r=rows();el("title").textContent=view[0].toUpperCase()+view.slice(1);el("count").textContent=`${r.length} records`;if(view!="skills"){let src=view=="gems"?data.top_gems:view=="items"?data.top_items:data.top_nodes;let q=el("q").value.toLowerCase();el("table").innerHTML=`<div class=table-scroll><table><tr><th>Name</th><th class=num>Uses</th></tr>${src.filter(x=>x[0].toLowerCase().includes(q)).map(x=>`<tr><td><span class=skill-name>${x[0]}</span></td><td class=num>${fmt(x[1])}</td></tr>`).join("")}</table></div>`;return}
el("table").innerHTML=`<div class=table-scroll>${r.map(x=>`<div class="build-card ${selected&&selected.skill==x.skill?'active':''}" onclick="pick(${data.skills.indexOf(x)})"><div class=skill-name>${x.skill}</div><div class=sub>${fmt(x.builds)} XMLs | best DPS ${fmt(x.best_dps)}</div><div>${chips(x.classes,2)}</div></div>`).join("")}</div>`}
function pick(i){selected=data.skills[i];selectedBuild=selected.build_rows[0];render()}
function pickBuild(i){selectedBuild=selected.build_rows[i];renderDetail()}
function metricTabs(){return [["combined_dps","DPS"],["ehp","EHP"],["life","Life"],["energy_shield","ES"]].map(x=>`<button class="${metric==x[0]?'active':''}" onclick="metric='${x[0]}';renderDetail()">${x[1]}</button>`).join("")}
function chart(rows,key){let vals=rows.map(x=>x[key]||0),max=Math.max(...vals,1),best=Math.max(...vals),worst=Math.min(...vals),base=vals[0]||1;return `<div class=chart>${rows.map((x,i)=>{let v=x[key]||0,p=v/max*100,d=base?((v-base)/base*100):0,c=v==best?'good':v==worst?'bad':'';return `<div class=chart-row onclick="pickBuild(${i})"><div class=chart-label title="${short(x.file)}">${short(x.file)}</div><div class=bar><i style="width:${p}%"></i></div><div class="num ${c}">${fmt(v)}<div class="delta ${d>=0?'good':'bad'}">${i?`${d>0?'+':''}${d.toFixed(1)}%`:''}</div></div></div>`}).join("")}</div>`}
function renderDetail(){let x=selected;if(!x){el("detail").innerHTML='<div class=empty>No selection</div>';return}let b=selectedBuild||x.build_rows[0];el("detail").innerHTML=`<div class=detail-head><b>${x.skill}</b><span class="warn">${fmt(x.candidate_space)} candidates</span></div><div class=detail-body><div class=tabs>${metricTabs()}</div>${chart(x.build_rows,metric)}<div class=section><h3>Build selecionada</h3><div class=metric><span>Arquivo</span><a href="../${b.file}">${short(b.file)}</a></div><div class=metric><span>DPS</span><b>${fmt(b.combined_dps)}</b></div><div class=metric><span>EHP</span><b>${fmt(b.ehp)}</b></div><div class=metric><span>Life / ES</span><b>${fmt(b.life)} / ${fmt(b.energy_shield)}</b></div><div class=metric><span>Classe</span><b>${b.ascendancy||b.class}</b></div></div><div class=section><h3>Gems</h3>${chips(b.gems,14)}</div><div class=section><h3>Itens</h3>${chips(b.items,14)}</div><div class=section><h3>Nodos</h3>${chips(b.nodes.map(n=>[n,1]),24)}</div></div>`}
function top(id,src){let max=Math.max(...src.map(x=>x[1]),1);el(id).innerHTML=src.slice(0,10).map(x=>`<div class=metric><span>${x[0]}</span><b>${fmt(x[1])}</b></div><div class=bar><i style="width:${x[1]/max*100}%"></i></div>`).join("")}
function render(){if(!data)return;stats();table();renderDetail();top("topGems",data.top_gems);top("topItems",data.top_items);top("topNodes",data.top_nodes)}
</script>
</body>
</html>
"""


if __name__ == "__main__":
    main()
