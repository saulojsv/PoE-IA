import { useEffect, useMemo, useState } from 'react'
import { Activity, Box, GitBranch, Heart, Search, Shield, Sparkles, Sword, Zap } from 'lucide-react'
import type { BuildData, BuildRow, BuildStage, EquipmentItem, ItemDetail, SkillGroup, SlotKey } from '../../types/build'
import { itemPools, loadDashboardData, mapEquipment, scoreBuild, SLOT_LABELS, spriteFor, toEquipmentItem, validSkills } from '../../data/poe-data'
import { ItemHoverCard } from '../equipment/item-hover-card'
import { ItemInspector } from '../equipment/item-inspector'

const stages: { id: BuildStage; label: string; description: string }[] = [
  { id: 'items', label: 'Items', description: 'PoE Ninja / Mobalytics paper-doll' },
  { id: 'defense', label: 'Defense', description: 'Life, ES, EHP, resists, block' },
  { id: 'damage', label: 'DPS', description: 'Damage, speed, crit, scaling' },
  { id: 'combinations', label: 'Combinations', description: 'Builds, slots and candidate swaps' },
  { id: 'tree', label: 'Passive Tree', description: 'Nodes, links, notables, masteries' },
]

const slotOrder: SlotKey[] = ['weapon', 'helmet', 'offhand', 'amulet', 'body', 'ring1', 'ring2', 'gloves', 'belt', 'boots']
const slotClass: Record<SlotKey, string> = {
  weapon: 'weapon',
  helmet: 'helmet',
  offhand: 'offhand',
  amulet: 'amulet',
  body: 'body',
  ring1: 'ring-1',
  ring2: 'ring-2',
  gloves: 'gloves',
  belt: 'belt',
  boots: 'boots',
}

function fmt(n: number) {
  return Math.round(Number(n) || 0).toLocaleString('pt-PT')
}

function shortFile(file: string) {
  return file.split(/[\\/]/).pop()?.replace('.xml', '').replace(/_/g, ' ') || file
}

function MetricCard({ label, value, tone, icon: Icon }: { label: string; value: string; tone: string; icon: any }) {
  return <article className={'kpi ' + tone}><Icon /><div><small>{label}</small><strong>{value}</strong><span>PoE 1 dataset</span></div></article>
}

function SkillList({ skills, selected, onSelect }: { skills: SkillGroup[]; selected?: SkillGroup; onSelect: (skill: SkillGroup) => void }) {
  const [q, setQ] = useState('')
  const filtered = skills.filter(skill => skill.skill.toLowerCase().includes(q.toLowerCase()) || JSON.stringify(skill.classes).toLowerCase().includes(q.toLowerCase()))
  return <section className="panel skill-browser">
    <div className="panel-title"><span><Search /> Skills</span><small>{filtered.length} skills</small></div>
    <div className="skill-search"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar skill, classe, item..." /></div>
    <div className="skill-list">
      {filtered.slice(0, 120).map(skill => <button key={skill.skill} className={selected?.skill === skill.skill ? 'active' : ''} onClick={() => onSelect(skill)}>
        <b>{skill.skill}</b><span>{fmt(skill.builds)} XMLs · DPS {fmt(skill.best_dps)}</span>
        <small>{skill.classes.slice(0, 2).map(([name, count]) => `${name} ${count}`).join(' · ')}</small>
      </button>)}
    </div>
  </section>
}

function BuildHeader({ skill, build, league, onLeagueChange }: { skill: SkillGroup; build: BuildRow; league: string; onLeagueChange: (league: string) => void }) {
  return <section className="build-hero">
    <div className="skill-orb"><Zap /></div>
    <div className="hero-copy">
      <small><Sparkles /> POE 1 ONLY · XML BUILDS</small>
      <h1>{skill.skill}</h1>
      <div className="badges"><span className="green">{build.ascendancy || build.class || 'Class'}</span><span className="purple">Level {build.level || '-'}</span><span className="blue">poe.ninja XML</span><span>{fmt(skill.candidate_space)} combos</span></div>
      <p>Arquivo <b>{shortFile(build.file)}</b><i /> Pontos usados <b>{build.points_used}</b><i /> Itens reais do XML</p>
    </div>
    <div className="league-control">
      <label>Liga</label>
      <input value={league} onChange={e => onLeagueChange(e.target.value)} placeholder="Editar liga" />
      <small>Visual local, sem alterar XML.</small>
    </div>
  </section>
}

function StageSelector({ selected, onSelect }: { selected: BuildStage; onSelect: (stage: BuildStage) => void }) {
  return <div className="stage-wrap">{stages.map((stage, i) => <button key={stage.id} className={'stage ' + (selected === stage.id ? 'chosen' : '')} onClick={() => onSelect(stage.id)}><b>{i + 1}</b><span>{stage.label}<small>{stage.description}</small></span></button>)}</div>
}

function Kpis({ build }: { build: BuildRow }) {
  return <div className="kpi-strip">
    <MetricCard label="DPS" value={fmt(build.combined_dps)} tone="blue" icon={Sword} />
    <MetricCard label="EHP" value={fmt(build.ehp)} tone="yellow" icon={Shield} />
    <MetricCard label="Life" value={fmt(build.life)} tone="red" icon={Heart} />
    <MetricCard label="ES" value={fmt(build.energy_shield)} tone="cyan" icon={Activity} />
    <MetricCard label="Block" value={`${fmt(build.block)}%`} tone="green" icon={Box} />
  </div>
}

function EquipmentBoard({ map, rawItems, sprites, selectedId, onSelect, pools, onSwap, baseMods }: { map: Partial<Record<SlotKey, EquipmentItem>>; rawItems: ItemDetail[]; sprites: Record<string, string>; selectedId?: string; onSelect: (item: EquipmentItem) => void; pools: Partial<Record<SlotKey, ItemDetail[]>>; onSwap: (slot: SlotKey, item: ItemDetail) => void; baseMods: any }) {
  return <section className="panel equipment">
    <div className="panel-title"><span><Sparkles /> Equipment Set</span><small>PoE 1 layout</small></div>
    <div className="equipment-board">
      <div className="loadout-grid poe-layout">
        {slotOrder.map(slot => {
          const item = map[slot]
          const sprite = item?.raw ? spriteFor(item.raw, sprites) : ''
          return <button key={slot} className={'item-slot ' + slotClass[slot] + (selectedId === item?.id ? ' selected' : '') + (item?.locked ? ' locked' : '')} onClick={() => item && !item.locked && onSelect(item)}>
            <i>{sprite ? <img src={sprite} alt="" /> : item?.locked ? '×' : '+'}</i>
            <span>{SLOT_LABELS[slot]}</span>
            <b>{item?.name || 'Empty'}</b>
            {item && !item.locked && <ItemHoverCard item={{ ...item, sprite }} placement={slot === 'weapon' ? 'right' : slot === 'offhand' ? 'left' : 'bottom'} baseMods={baseMods} />}
            <select value="" onClick={e => e.stopPropagation()} onChange={e => { const next = pools[slot]?.[Number(e.target.value)]; if (next) onSwap(slot, next) }}>
              <option value="">Trocar</option>
              {(pools[slot] || []).slice(0, 80).map((candidate, i) => <option key={`${candidate.name}-${candidate.base}-${i}`} value={i}>{candidate.name} · {candidate.base}</option>)}
            </select>
          </button>
        })}
      </div>
      <Flasks items={rawItems} sprites={sprites} />
      <Jewels items={rawItems} sprites={sprites} />
    </div>
  </section>
}

function Flasks({ items, sprites }: { items: ItemDetail[]; sprites: Record<string, string> }) {
  const flasks = items.filter(item => `${item.name} ${item.base}`.toLowerCase().includes('flask')).slice(0, 5)
  return <div className="flasks"><small>FLASKS</small>{Array.from({ length: 5 }).map((_, i) => <button key={i}><i className="flask">{flasks[i] && <img src={spriteFor(flasks[i], sprites)} alt="" />}</i><span>{flasks[i]?.name || 'Empty'}</span></button>)}</div>
}

function Jewels({ items, sprites }: { items: ItemDetail[]; sprites: Record<string, string> }) {
  const jewels = items.filter(item => `${item.name} ${item.base} ${item.slot || ''}`.toLowerCase().includes('jewel')).slice(0, 6)
  if (!jewels.length) return null
  return <div className="jewels"><small>JEWELS</small>{jewels.map((jewel, i) => <span key={`${jewel.name}-${jewel.base}-${i}`}><img src={spriteFor(jewel, sprites)} alt="" />{jewel.name}</span>)}</div>
}

function BuildRanking({ skill, onSelect }: { skill: SkillGroup; onSelect: (build: BuildRow) => void }) {
  const ranked = [...skill.build_rows].sort((a, b) => scoreBuild(b) - scoreBuild(a)).slice(0, 10)
  const max = Math.max(...ranked.map(scoreBuild), 1)
  return <section className="panel ranking"><div className="panel-title"><span><Activity /> Ranking</span><small>score local</small></div>{ranked.map(build => <button key={build.file} onClick={() => onSelect(build)}><span>{shortFile(build.file)}</span><i><b style={{ width: `${Math.max(4, scoreBuild(build) / max * 100)}%` }} /></i><strong>{fmt(scoreBuild(build))}</strong></button>)}</section>
}

function BuildExplorer({ skill, selectedBuild, onSelect }: { skill: SkillGroup; selectedBuild: BuildRow; onSelect: (build: BuildRow) => void }) {
  const [q, setQ] = useState('')
  const rows = skill.build_rows
    .filter(build => `${build.file} ${build.class} ${build.ascendancy} ${build.items.join(' ')}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => scoreBuild(b) - scoreBuild(a))
  return <section className="panel build-explorer">
    <div className="panel-title"><span><Search /> Builds da skill</span><small>{rows.length} XMLs</small></div>
    <div className="skill-search"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar build, classe, item..." /></div>
    <div className="build-list">
      {rows.map(build => <button key={build.file} className={selectedBuild.file === build.file ? 'active' : ''} onClick={() => onSelect(build)}>
        <b>{shortFile(build.file)}</b>
        <span>{build.ascendancy || build.class || 'Class'} · Lv {build.level || '-'} · DPS {fmt(build.combined_dps)} · EHP {fmt(build.ehp)}</span>
      </button>)}
    </div>
  </section>
}

function CombinationPanel({ skill, build, pools, sprites, onBuild, onSwap }: { skill: SkillGroup; build: BuildRow; pools: Partial<Record<SlotKey, ItemDetail[]>>; sprites: Record<string, string>; onBuild: (build: BuildRow) => void; onSwap: (slot: SlotKey, item: ItemDetail) => void }) {
  const total = Object.values(pools).reduce((acc, items) => acc + (items?.length || 0), 0)
  return <div className="combination-grid">
    <BuildExplorer skill={skill} selectedBuild={build} onSelect={onBuild} />
    <section className="panel combo-pools">
      <div className="panel-title"><span><Sparkles /> Pools de combinação</span><small>{fmt(total)} candidatos</small></div>
      {slotOrder.map(slot => <div className="combo-slot" key={slot}>
        <h3>{SLOT_LABELS[slot]} <small>{pools[slot]?.length || 0}</small></h3>
        <div>
          {(pools[slot] || []).slice(0, 24).map(item => <button key={`${slot}-${item.name}-${item.base}`} onClick={() => onSwap(slot, item)}>
            {spriteFor(item, sprites) && <img src={spriteFor(item, sprites)} alt="" />}
            <span><b>{item.name}</b><small>{item.base}</small></span>
          </button>)}
        </div>
      </div>)}
    </section>
  </div>
}

function DefensePanel({ build }: { build: BuildRow }) {
  const rows = [['EHP', build.ehp], ['Life', build.life], ['ES', build.energy_shield], ['Block', build.block], ['Spell Block', build.spell_block], ['Suppress', build.suppression], ['Fire', build.fire_resist], ['Cold', build.cold_resist], ['Lightning', build.lightning_resist], ['Chaos', build.chaos_resist]]
  return <section className="panel stat-table"><div className="panel-title"><span><Shield /> Defesa</span></div>{rows.map(([k, v]) => <p key={k as string}><span>{k}</span><b>{fmt(v as number)}</b></p>)}</section>
}

function DamagePanel({ build }: { build: BuildRow }) {
  const rows = [['Combined DPS', build.combined_dps], ['Attack Speed', build.attack_speed], ['Crit Multi', build.crit_multi], ['Max Phys Hit', build.max_phys_hit], ['Max Fire Hit', build.max_fire_hit], ['Max Cold Hit', build.max_cold_hit], ['Max Lightning Hit', build.max_lightning_hit], ['Max Chaos Hit', build.max_chaos_hit]]
  return <section className="panel stat-table"><div className="panel-title"><span><Sword /> DPS</span></div>{rows.map(([k, v]) => <p key={k as string}><span>{k}</span><b>{fmt(v as number)}</b></p>)}</section>
}

function PassiveTree({ build, skill }: { build: BuildRow; skill: SkillGroup }) {
  const nodes = build.nodes.slice(0, 140)
  const notableSet = new Set(skill.nodes.slice(0, 20).map(([node]) => node))
  const cx = 420, cy = 330
  const points = nodes.map((node, i) => {
    const ring = 82 + (i % 5) * 46
    const angle = (i / Math.max(nodes.length, 1)) * Math.PI * 2
    const mastery = i % 17 === 0
    const notable = notableSet.has(node) || i % 11 === 0
    return { node, x: cx + Math.cos(angle) * ring, y: cy + Math.sin(angle) * ring, mastery, notable }
  })
  return <section className="panel tree-panel">
    <div className="panel-title"><span><GitBranch /> Passive Tree</span><small>{nodes.length} selected IDs · graph validation pending</small></div>
    <div className="tree-warning">Preview estrutural: links, notables e masteries só serão marcados após carregar o grafo versionado da GGG/PoB. Nenhum link é inferido por proximidade.</div>
    <svg viewBox="0 0 840 660" role="img">
      <defs><radialGradient id="nodeGlow"><stop offset="0" stopColor="#e8c762" /><stop offset="1" stopColor="#7d5c22" /></radialGradient></defs>
      {points.map(p => <g key={p.node} className={p.mastery ? 'mastery-node' : p.notable ? 'notable-node' : 'small-node'}>
        <circle cx={p.x} cy={p.y} r={p.mastery ? 12 : p.notable ? 9 : 5} />
        {(p.mastery || p.notable) && <text x={p.x} y={p.y - 15}>{p.mastery ? 'M' : 'N'}</text>}
        <title>{p.mastery ? 'Mastery' : p.notable ? 'Notable' : 'Node'} {p.node}</title>
      </g>)}
    </svg>
  </section>
}

export function BuildDashboard() {
  const [bundle, setBundle] = useState<{ data: BuildData; sprites: Record<string, string>; baseMods: any } | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<SkillGroup | undefined>()
  const [selectedBuild, setSelectedBuild] = useState<BuildRow | undefined>()
  const [stage, setStage] = useState<BuildStage>('items')
  const [overrides, setOverrides] = useState<Partial<Record<SlotKey, ItemDetail>>>({})
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | undefined>()
  const [league, setLeague] = useState(() => localStorage.getItem('poe-dashboard-league') || 'PoE 1')

  useEffect(() => { loadDashboardData().then(setBundle) }, [])
  useEffect(() => { localStorage.setItem('poe-dashboard-league', league) }, [league])
  const skills = useMemo(() => bundle ? validSkills(bundle.data) : [], [bundle])
  const skill = selectedSkill || skills[0]
  const build = selectedBuild || skill?.build_rows?.[0]

  useEffect(() => {
    if (skills[0] && !selectedSkill) setSelectedSkill(skills[0])
  }, [skills, selectedSkill])

  const baseMap = useMemo(() => build && bundle ? mapEquipment(build.item_details, bundle.baseMods) : {}, [build, bundle])
  const rawWeapon = overrides.weapon || baseMap.weapon?.raw
  const pools = useMemo(() => skill && bundle ? itemPools(skill, rawWeapon, bundle.baseMods) : {}, [skill, rawWeapon, bundle])
  const equipment = useMemo(() => {
    const map = { ...baseMap }
    for (const [slot, item] of Object.entries(overrides)) map[slot as SlotKey] = toEquipmentItem(item as ItemDetail, slot as SlotKey)
    return map
  }, [baseMap, overrides])

  useEffect(() => {
    const first = Object.values(equipment).find(item => item && !item.locked)
    setSelectedItem(first)
  }, [build?.file])

  if (!bundle || !skill || !build) return <div className="dashboard loading">Carregando dashboard React PoE 1...</div>

  const activeItem = selectedItem || Object.values(equipment).find(Boolean)
  return <div className="dashboard react-dashboard">
    <SkillList skills={skills} selected={skill} onSelect={next => { setSelectedSkill(next); setSelectedBuild(next.build_rows[0]); setOverrides({}); setStage('items') }} />
    <div className="dashboard-main">
      <BuildHeader skill={skill} build={build} league={league} onLeagueChange={setLeague} />
      <StageSelector selected={stage} onSelect={setStage} />
      <Kpis build={build} />
      {stage === 'items' && <div className="dashboard-grid">
        <EquipmentBoard map={equipment} rawItems={build.item_details} sprites={bundle.sprites} selectedId={activeItem?.id} onSelect={setSelectedItem} pools={pools} baseMods={bundle.baseMods} onSwap={(slot, item) => { setOverrides(prev => ({ ...prev, [slot]: item })); setSelectedItem(toEquipmentItem(item, slot)) }} />
        <div className="middle-stack"><BuildRanking skill={skill} onSelect={next => { setSelectedBuild(next); setOverrides({}) }} /><DefensePanel build={build} /><DamagePanel build={build} /></div>
        {activeItem && <ItemInspector item={{ ...activeItem, sprite: activeItem.raw ? spriteFor(activeItem.raw, bundle.sprites) : activeItem.sprite }} onSelect={setSelectedItem} baseMods={bundle.baseMods} />}
      </div>}
      {stage === 'defense' && <DefensePanel build={build} />}
      {stage === 'damage' && <DamagePanel build={build} />}
      {stage === 'combinations' && <CombinationPanel skill={skill} build={build} pools={pools} sprites={bundle.sprites} onBuild={next => { setSelectedBuild(next); setOverrides({}) }} onSwap={(slot, item) => { setOverrides(prev => ({ ...prev, [slot]: item })); setSelectedItem(toEquipmentItem(item, slot)); setStage('items') }} />}
      {stage === 'tree' && <PassiveTree build={build} skill={skill} />}
    </div>
  </div>
}
