#!/usr/bin/env python3
import json, hashlib
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TREE = ROOT / 'dashboard-new' / 'public' / 'poe-tree' / 'skilltree-3.28.json'
OUT = ROOT / 'PoE - Combinacoes para Treino Futuro' / 'analysis' / 'tree-structure'

def now(): return datetime.now(timezone.utc).replace(microsecond=0).isoformat()
def classify(node):
    text = f"{node.get('name','')} {' '.join(node.get('stats', []))}".lower()
    rules = {'life':['life'], 'energyShield':['energy shield'], 'armour':['armour'], 'evasion':['evasion'], 'spellSuppression':['suppress spell','spell suppression'], 'block':['block'], 'recovery':['recover','regener','recovery','recharge','leech'], 'resistance':['resistance'], 'ailmentDefense':['ailment','bleed','poison','curse','avoid'], 'attribute':['strength','dexterity','intelligence'], 'offense':['damage','attack','spell','critical','projectile'], 'utility':['mana','reservation','movement','flask']}
    tags = [key for key, words in rules.items() if any(word in text for word in words)]
    return tags, {key: round(1 / len(tags), 3) for key in tags}
def main():
    raw = json.loads(TREE.read_text(encoding='utf-8-sig')); nodes = raw.get('nodes', {}); OUT.mkdir(parents=True, exist_ok=True)
    records=[]; types={}; tags={}; unknown=[]; edges=0; starts=[]
    for key, node in nodes.items():
        tags_for_node, weights = classify(node); is_start = isinstance(node.get('classStartIndex'), int)
        kind = 'class_start' if is_start else 'jewel_socket' if node.get('isJewelSocket') else 'mastery' if node.get('isMastery') else 'keystone' if node.get('isKeystone') else 'notable' if node.get('isNotable') else 'normal'
        record={'treeVersion':'3.28','nodeId':str(key),'name':node.get('name',''),'type':kind,'stats':node.get('stats',[]),'connections':node.get('out',[]),'groupId':str(node.get('group','')),'requirements':{'level':node.get('grantedPassivePoints'), 'strength':node.get('reqStr'), 'dexterity':node.get('reqDex'), 'intelligence':node.get('reqInt')},'masteryEffects':node.get('masteryEffects',[]),'expansionJewel':node.get('expansionJewel'),'semanticTags':tags_for_node,'defenseWeights':weights,'unknownFields':[]}
        records.append(record); types[kind]=types.get(kind,0)+1; edges += len(node.get('out',[]))
        for tag in tags_for_node: tags[tag]=tags.get(tag,0)+1
        if is_start: starts.append({'nodeId':str(key),'classIndex':node.get('classStartIndex')})
    known=set(nodes); invalid=[{'from':r['nodeId'],'to':to} for r in records for to in r['connections'] if str(to) not in known]
    coverage={'treeVersion':'3.28','createdAt':now(),'nodes':len(records),'edges':edges,'starts':len(starts),'types':types,'semanticTags':tags,'invalidEdges':len(invalid),'unknownRequirements':sum(1 for r in records if not any(r['requirements'].values())),'classifierVersion':'semantic-tree-v2','trainingExamples':len(records),'status':'valid' if not invalid else 'blocked'}
    (OUT/'tree-schema.json').write_text(json.dumps({'schemaVersion':'tree-structure-v1','required':['nodeId','type','connections','requirements','semanticTags','defenseWeights']},indent=2),encoding='utf-8')
    (OUT/'node-records.jsonl').write_text('\n'.join(json.dumps(r,ensure_ascii=False) for r in records)+'\n',encoding='utf-8')
    (OUT/'semantic-classification.jsonl').write_text('\n'.join(json.dumps({'nodeId':r['nodeId'],'tags':r['semanticTags'],'weights':r['defenseWeights']}) for r in records)+'\n',encoding='utf-8')
    (OUT/'attribute-requirements.json').write_text(json.dumps([r for r in records if any(r['requirements'].values())],indent=2),encoding='utf-8')
    (OUT/'mastery-index.json').write_text(json.dumps([r for r in records if r['type']=='mastery'],indent=2),encoding='utf-8')
    (OUT/'jewel-socket-index.json').write_text(json.dumps([r for r in records if r['type']=='jewel_socket'],indent=2),encoding='utf-8')
    cluster_groups={}
    for r in records:
        if r.get('expansionJewel') or 'cluster' in r.get('name','').lower(): cluster_groups.setdefault(r['groupId'],[]).append(r['nodeId'])
    (OUT/'cluster-index.json').write_text(json.dumps([{'groupId':k,'nodeIds':v,'source':'expansionJewel_or_name'} for k,v in cluster_groups.items()],indent=2),encoding='utf-8')
    (OUT.parent.parent/'reports'/'global').mkdir(parents=True,exist_ok=True)
    (OUT.parent.parent/'reports'/'global'/'tree-coverage.json').write_text(json.dumps(coverage,indent=2),encoding='utf-8')
    (OUT.parent.parent/'reports'/'global'/'tree-validation.json').write_text(json.dumps({'invalidEdges':invalid,'status':coverage['status']},indent=2),encoding='utf-8')
    print(json.dumps(coverage,indent=2))
if __name__ == '__main__': main()
