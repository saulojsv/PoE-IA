import base64, hashlib, json, re, urllib.request, zlib, pathlib, datetime
from xml.etree import ElementTree as ET

ROOT = pathlib.Path(r'C:\Users\saulo\Documents\Agente - PoE')
CATALOG = ROOT / 'data' / 'normalized' / 'skill_catalog_az.json'
CURSOR = ROOT / 'data' / 'poe_ninja' / 'poe_ninja_dataset' / 'pob_xml_cursor.json'
OUT = ROOT / 'data' / 'poe_ninja' / 'poe_ninja_dataset' / 'xml'
ERRORS = ROOT / 'data' / 'poe_ninja' / 'poe_ninja_dataset' / 'pob_xml_errors.jsonl'
PENDING = ROOT / 'data' / 'poe_ninja' / 'poe_ninja_dataset' / 'pob_xml_pending.jsonl'

TARGET = 5

def now():
    return datetime.datetime.utcnow().replace(microsecond=0).isoformat() + 'Z'

def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Codex PoE local collector', 'Accept': '*/*'})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode('utf-8', 'ignore')

def decode(code):
    raw = code.strip().replace('-', '+').replace('_', '/')
    raw += '=' * ((4 - len(raw) % 4) % 4)
    data = base64.b64decode(raw)
    for wbits in (zlib.MAX_WBITS, -15):
        try:
            xml = zlib.decompress(data, wbits).decode('utf-8', 'ignore')
            ET.fromstring(xml)
            return xml
        except Exception:
            continue
    return None

def parse_catalog():
    payload = json.loads(CATALOG.read_text(encoding='utf-8'))
    skills = sorted(payload['skills'], key=lambda s: int(s.get('az_order', 0) or 0))
    cursor = json.loads(CURSOR.read_text(encoding='utf-8')) if CURSOR.exists() else {'next_az_order':1}
    start_order = int(cursor.get('next_az_order', 1))
    # 1-based az_order
    batch = [s for s in skills if int(s['az_order']) >= start_order][:10]
    if len(batch)<10:
        batch = skills[:10]
    return skills, batch

def validate(xml):
    try:
        root = ET.fromstring(xml)
    except Exception as e:
        return False, 'xml_parse_failed', None
    if root.tag != 'PathOfBuilding':
        return False, 'root_not_pathofbuilding', None
    build = root.find('Build')
    if build is None:
        return False, 'missing_build', None
    has_signal = (
        build.find('PlayerStat') is not None
        or root.find('.//Skill') is not None
        or root.find('.//Item') is not None
        or root.find('.//Tree') is not None
    )
    if not has_signal:
        return False, 'missing_build_signal', None
    skills = [s.attrib.get('name','').lower() for s in root.findall('.//Skill')]
    skill_ids = [s.attrib.get('skillId','').lower() for s in root.findall('.//Skill')]
    return True, 'ok', {'skills':skills, 'skill_ids':skill_ids, 'build':build}

def append(path,p):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('a', encoding='utf-8') as f:
        f.write(json.dumps(p, ensure_ascii=False) + '\n')

def save(skill, normalized, source_url, source_type, pob_url, xml_content, build_node):
    out_dir = OUT/normalized
    out_dir.mkdir(parents=True, exist_ok=True)
    # existing keep
    if any((out_dir/glob(f'{x}')).__iter__() for x in []):
        pass
    existing = sorted(out_dir.glob('*.xml'))
    build_id = hashlib.md5((normalized+source_url).encode('utf-8')).hexdigest()[:10]
    candidate = out_dir/f'{build_id}_candidate.xml'
    # keep id stable if already exists
    if candidate.exists():
        return False, 'already_exists'
    candidate.write_text(xml_content, encoding='utf-8')
    meta = {
        'skill': skill['name'],
        'normalized_name': normalized,
        'source_url': source_url,
        'source_type': source_type,
        'language': 'en',
        'region': 'global',
        'pob_url': pob_url,
        'xml_path': str(candidate),
        'patch': build_node.attrib.get('targetVersion', 'unknown'),
        'league': build_node.attrib.get('league', 'global'),
        'author': build_node.attrib.get('author', ''),
        'build_title': build_node.attrib.get('title', ''),
        'collected_at': now(),
        'status': 'generated'
    }
    (out_dir/f'{build_id}_candidate.meta.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding='utf-8')
    return True, str(candidate)

batch_skills, batch = parse_catalog()
skill_map = {s['name'].lower(): s for s in batch}

# links discovered in web pass
candidates = [
    'https://pobb.in/YcHcfEFDebvm',
    'https://pobb.in/qYFgf8fMaVfM',
    'https://pobb.in/9DZlPLzUyoiE',
    'https://pobb.in/v5gHAKuQHFg3',
    'https://pobb.in/JYqCCAt5eIxh',
    'https://pobb.in/RqXK8_EVgENr',
    'https://pobb.in/61R9o0D0dtAg',
    'https://pobb.in/A-0U71KZN98U',
    'https://pobb.in/XHUU48lVhdVT',
    'https://pobb.in/P96p4TIsBR6v',
    'https://pobb.in/CLsNiVxSIRts',
    'https://pobb.in/5G8gqmLIOxaO',
    'https://pobb.in/nR9URvu6UPko',
    'https://pobb.in/hu8IIzmhGDTS',
    'https://pobb.in/Fjj6nfvJGW3T'
]

seen = {}
# normalize per-skill counts
stats = {s['name']: {'status':'pending','new_xml':0,'xml_count':0,'notes':[]} for s in batch}

# existing xml counts
for s in batch:
    d = OUT / s['normalized_name']
    if d.exists():
        stats[s['name']]['xml_count'] = len(list(d.glob('*.xml')))

for url in candidates:
    try:
        html = get(url)
    except Exception as e:
        append(ERRORS, {'skill': None, 'normalized_name': None, 'source_url': url, 'error': str(e), 'at': now()})
        continue
    # pobb page may directly embed code in script; attempt extract obvious code
    m = re.search(r'\b([A-Za-z0-9_]{3,}_[A-Za-z0-9]{10,})\b', html)
    # fallback: maybe raw page not code
    code = None
    if 'pobb.in is' not in html.lower() and m:
        code = m.group(1)
    # direct from URL path likely code
    path_code = url.rstrip('/').split('/')[-1]
    if not code:
        code = path_code
    try:
        xml = decode(code)
    except Exception:
        xml = None
    if not xml:
        # try raw endpoint
        try:
            raw = get(url + '/raw')
            xml = decode(raw)
        except Exception as e:
            xml = None
    if not xml:
        append(ERRORS, {'skill':None, 'normalized_name':None, 'source_url':url, 'error':'decode_failed', 'at': now()})
        continue
    ok, reason, info = validate(xml)
    if not ok:
        append(ERRORS, {'skill':None, 'normalized_name':None, 'source_url':url, 'error':reason, 'at': now()})
        continue
    build_node = info['build']
    textskills = [x for x in info['skills'] if x]
    lower = ' '.join(textskills).lower()
    # match skills in batch
    matched = []
    for s in batch:
        key = s['name'].lower()
        if key in lower or any(tok in lower for tok in key.split()):
            matched.append(s)
    if not matched:
        # fallback maybe this is branch skill containing token 'destructive link' etc not split exact
        for s in batch:
            if s['name'].lower().replace(' ', '') in lower.replace(' ', ''):
                matched.append(s)
    if not matched:
        # keep minimal record for pending reason
        append(PENDING, {'skill': 'batch-wide', 'source_url': url, 'status': 'unmatched_to_batch', 'at': now(), 'raw': path_code})
        continue

    for s in matched:
        if stats[s['name']]['new_xml'] >= TARGET:
            continue
        norm = s['normalized_name']
        build_dir = OUT / norm
        build_dir.mkdir(parents=True, exist_ok=True)
        existing = len(list(build_dir.glob('*.xml')))
        if existing >= TARGET:
            stats[s['name']]['status'] = 'already_complete'
            continue
        # avoid duplicates by source or md5 path
        candidate_name = hashlib.md5((norm + code + path_code).encode('utf-8')).hexdigest()[:10]
        xml_path = build_dir / f'{candidate_name}.xml'
        if xml_path.exists():
            continue
        xml_path.write_text(xml, encoding='utf-8')
        build = ET.fromstring(xml)
        b = build.find('Build') or build
        status = 'generated'
        seen[(s['name'], candidate_name)] = True
        meta = {
            'skill': s['name'],
            'normalized_name': norm,
            'source_url': url,
            'source_type':'pobb_in',
            'language':'en',
            'region':'global',
            'pob_url': url,
            'xml_path': str(xml_path),
            'patch': b.attrib.get('targetVersion','unknown'),
            'league': b.attrib.get('league','global'),
            'author': b.attrib.get('author',''),
            'build_title': b.attrib.get('title',''),
            'collected_at': now(),
            'status': status,
        }
        (build_dir / f'{candidate_name}.meta.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding='utf-8')
        stats[s['name']]['new_xml'] += 1
        stats[s['name']]['status'] = 'generated'
        # refresh xml_count
        stats[s['name']]['xml_count'] = existing + 1

# prepare next cursor
skills = sorted([s for s in batch], key=lambda x:int(x['az_order']))
all_sk = json.loads(CATALOG.read_text(encoding='utf-8'))['skills']
all_sk = sorted(all_sk, key=lambda x:int(x.get('az_order',0)))
start = int(CURSOR.exists() and json.loads(CURSOR.read_text(encoding='utf-8')).get('next_az_order',1) or 1)
start_idx = next((i for i,x in enumerate(all_sk) if int(x['az_order'])>=start),0)
next_idx = (start_idx + 10) % len(all_sk)
next_skill = all_sk[next_idx]
summary = {
    'batch': [s['name'] for s in skills],
    'results': [ {'skill':k,'status':v['status'],'new_xml':v['new_xml'],'xml_count':v['xml_count']} for k,v in stats.items()],
    'next_cursor': {'next_az_order': int(next_skill['az_order']), 'next_skill': next_skill['name']}
}
print(json.dumps(summary, indent=2, ensure_ascii=False))

# update cursor file
CURSOR.write_text(json.dumps({'batch_size':10,'last_batch':[s['name'] for s in skills],'next_az_order':int(next_skill['az_order']),'next_skill':next_skill['name'],'updated_at':now(),'results':summary['results'],'cycle': json.loads(CURSOR.read_text(encoding='utf-8')).get('cycle',1) if CURSOR.exists() else 1}, ensure_ascii=False, indent=2), encoding='utf-8')
