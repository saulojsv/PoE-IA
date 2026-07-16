import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, Box, Dices, GitBranch, Heart, Search, Shield, Sparkles, Sword, Zap } from 'lucide-react'
import type { BuildData, BuildRow, BuildStage, EquipmentItem, ItemDetail, SkillGroup, SlotKey } from '../../types/build'
import { catalogBasesForSlot, itemPools, loadDashboardData, mapEquipment, scoreBuild, SLOT_LABELS, spriteFor, toEquipmentItem, validSkills } from '../../data/poe-data'
import { loadPassiveTree } from '../../data/passive-tree'
import { ItemHoverCard } from '../equipment/item-hover-card'
import { ItemInspector } from '../equipment/item-inspector'
import { modOptionsForItem } from '../../data/mod-tiers'

const stages: { id: BuildStage; label: string; description: string }[] = [
  { id: 'items', label: 'Items', description: 'PoE Ninja / Mobalytics paper-doll' },
  { id: 'defense', label: 'Defense', description: 'Life, ES, EHP, resists, block' },
  { id: 'damage', label: 'DPS', description: 'Damage, speed, crit, scaling' },
  { id: 'combinations', label: 'Combinations', description: 'Builds, slots and candidate swaps' },
  { id: 'smart-combination', label: 'Smart Combination', description: 'Random items and valid modifiers' },
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
        <b>{skill.skill}</b><span>{fmt(skill.builds)} XMLs Â· DPS {fmt(skill.best_dps)}</span>
        <small>{skill.classes.slice(0, 2).map(([name, count]) => `${name} ${count}`).join(' Â· ')}</small>
      </button>)}
    </div>
  </section>
}

function BuildHeader({ skill, build, league, onLeagueChange }: { skill: SkillGroup; build: BuildRow; league: string; onLeagueChange: (league: string) => void }) {
  return <section className="build-hero">
    <div className="skill-orb"><Zap /></div>
    <div className="hero-copy">
      <small><Sparkles /> POE 1 ONLY Â· XML BUILDS</small>
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
  const [activeSlot, setActiveSlot] = useState<SlotKey>()
  const candidates = activeSlot ? [...(pools[activeSlot] || []), ...catalogBasesForSlot(activeSlot, baseMods)].filter((item, i, all) => all.findIndex(other => other.name === item.name && other.base === item.base) === i) : []
  return <section className="panel equipment">
    <div className="panel-title"><span><Sparkles /> Equipment Set</span><small>PoE 1 layout</small></div>
    <div className="equipment-board">
      <div className="loadout-grid poe-layout">
        {slotOrder.map(slot => {
          const item = map[slot]
          const sprite = item?.raw ? spriteFor(item.raw, sprites) : ''
          return <button key={slot} className={'item-slot ' + slotClass[slot] + (selectedId === item?.id ? ' selected' : '') + (item?.locked ? ' locked' : '')} onClick={() => { if (item && !item.locked) onSelect(item); setActiveSlot(slot) }}>
            <i>{sprite ? <img src={sprite} alt="" /> : item?.locked ? 'Ã—' : '+'}</i>
            <span>{SLOT_LABELS[slot]}</span>
            <b>{item?.name || 'Empty'}</b>
            {item && !item.locked && <ItemHoverCard item={{ ...item, sprite }} placement={slot === 'weapon' ? 'right' : slot === 'offhand' ? 'left' : 'bottom'} baseMods={baseMods} />}
            <select value="" onClick={e => e.stopPropagation()} onChange={e => { const next = pools[slot]?.[Number(e.target.value)]; if (next) onSwap(slot, next) }}>
              <option value="">Trocar</option>
              {(pools[slot] || []).slice(0, 80).map((candidate, i) => <option key={`${candidate.name}-${candidate.base}-${i}`} value={i}>{candidate.name} Â· {candidate.base}</option>)}
            </select>
          </button>
        })}
      </div>
      {activeSlot && <aside className="slot-browser"><header><b>{SLOT_LABELS[activeSlot]}</b><button onClick={() => setActiveSlot(undefined)} aria-label="Fechar">×</button></header><p>{candidates.length} opções: itens dos XMLs e bases PoE 1 disponíveis.</p><div className="slot-browser-list">{candidates.map((candidate, i) => <button key={`${candidate.name}-${candidate.base}-${i}`} onClick={event => { event.stopPropagation(); onSwap(activeSlot, candidate); setActiveSlot(undefined) }}>{spriteFor(candidate, sprites) && <img src={spriteFor(candidate, sprites)} alt="" />}<span><b>{candidate.name}</b><small>{candidate.base} · Base mínima {candidate.item_level}</small></span></button>)}</div></aside>}
      <Flasks items={rawItems} sprites={sprites} baseMods={baseMods} />
      <Jewels items={rawItems} sprites={sprites} baseMods={baseMods} />
    </div>
  </section>
}

function Flasks({ items, sprites, baseMods }: { items: ItemDetail[]; sprites: Record<string, string>; baseMods: any }) {
  const flasks = items.filter(item => `${item.name} ${item.base}`.toLowerCase().includes('flask')).slice(0, 5)
  return <div className="flasks"><small>FLASKS</small>{Array.from({ length: 5 }).map((_, i) => { const item = flasks[i]; const equipment = item ? toEquipmentItem(item, 'belt') : undefined; return <button key={i}>{<i className="flask">{item && <img src={spriteFor(item, sprites)} alt="" />}</i>}<span>{item?.name || 'Empty'}</span>{equipment && <ItemHoverCard item={{ ...equipment, sprite: spriteFor(item, sprites) }} placement="bottom" baseMods={baseMods} />}</button> })}</div>
}

function Jewels({ items, sprites, baseMods }: { items: ItemDetail[]; sprites: Record<string, string>; baseMods: any }) {
  const jewels = items.filter(item => `${item.name} ${item.base} ${item.slot || ''}`.toLowerCase().includes('jewel')).slice(0, 6)
  if (!jewels.length) return null
  return <div className="jewels"><small>JEWELS</small>{jewels.map((jewel, i) => { const equipment = toEquipmentItem(jewel, 'ring1'); return <span className="jewel-slot" key={`${jewel.name}-${jewel.base}-${i}`}><img src={spriteFor(jewel, sprites)} alt="" /><ItemHoverCard item={{ ...equipment, sprite: spriteFor(jewel, sprites) }} placement="bottom" baseMods={baseMods} /></span> })}</div>
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
        <span>{build.ascendancy || build.class || 'Class'} Â· Lv {build.level || '-'} Â· DPS {fmt(build.combined_dps)} Â· EHP {fmt(build.ehp)}</span>
      </button>)}
    </div>
  </section>
}

function CombinationPanel({ skill, build, pools, sprites, onBuild, onSwap }: { skill: SkillGroup; build: BuildRow; pools: Partial<Record<SlotKey, ItemDetail[]>>; sprites: Record<string, string>; onBuild: (build: BuildRow) => void; onSwap: (slot: SlotKey, item: ItemDetail) => void }) {
  const total = Object.values(pools).reduce((acc, items) => acc + (items?.length || 0), 0)
  return <div className="combination-grid">
    <BuildExplorer skill={skill} selectedBuild={build} onSelect={onBuild} />
    <section className="panel combo-pools">
      <div className="panel-title"><span><Sparkles /> Pools de combinaÃ§Ã£o</span><small>{fmt(total)} candidatos</small></div>
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

type TreeCardNode = { id: string; name: string; stats: string[]; kind: 'Keystone' | 'Mastery' | 'Notable' | 'Node'; known: boolean }

function TreeNodeCards({ nodes }: { nodes: string[] }) {
  const [cards, setCards] = useState<TreeCardNode[]>([])
  useEffect(() => {
    let alive = true
    loadPassiveTree().then(tree => {
      if (!alive) return
      setCards(nodes.map(id => {
        const node = tree.nodes[id]
        const kind = node?.isKeystone ? 'Keystone' : node?.isMastery ? 'Mastery' : node?.isNotable ? 'Notable' : 'Node'
        return { id, name: node?.name || 'Dados do nodo indisponíveis', stats: node?.stats || [], kind, known: Boolean(node) }
      }))
    }).catch(() => setCards([]))
    return () => { alive = false }
  }, [nodes])
  const groups = [
    ['Keystones', cards.filter(node => node.kind === 'Keystone')],
    ['Masteries', cards.filter(node => node.kind === 'Mastery')],
    ['Notables', cards.filter(node => node.kind === 'Notable')],
    ['Nodes', cards.filter(node => node.kind === 'Node')],
  ] as const
  return <div className="tree-card-groups" aria-label="Pontos escolhidos na árvore"><div className="tree-selection-summary"><b>Pontos escolhidos</b><span>{cards.length} selecionados</span></div>{groups.filter(([, items]) => items.length > 0).map(([label, items]) => <section className="tree-card-group" key={label}>
    <header><b>{label}</b><small>{items.length}</small></header>
    <div>{items.map(node => <article className={'tree-info-card ' + node.kind.toLowerCase()} key={node.id}>
      <span className="tree-node-sprite">{node.kind === 'Keystone' ? 'K' : node.kind === 'Mastery' ? 'M' : node.kind === 'Notable' ? 'N' : '•'}</span><div className="tree-info-copy"><strong>{node.name}</strong><small>{node.kind} · ID {node.id}</small></div>
      <div className="tree-node-impact">{node.known && node.stats.length ? node.stats.map(stat => <p key={stat}>{stat}</p>) : <p className="missing">Impacto não disponível no catálogo</p>}</div>
    </article>)}</div>
  </section>)}</div>
}

type SmartSlot = SlotKey | `flask${1 | 2 | 3 | 4 | 5}` | `jewel${1 | 2 | 3 | 4 | 5 | 6}`
const smartSlots: SmartSlot[] = ['weapon', 'helmet', 'body', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand', 'flask1', 'flask2', 'flask3', 'flask4', 'flask5', 'jewel1', 'jewel2', 'jewel3', 'jewel4', 'jewel5', 'jewel6']
function SmartCombinationPanel({ build, sprites, baseMods, onApply }: { build: BuildRow; sprites: Record<string, string>; baseMods: any; onApply: (items: Partial<Record<SlotKey, ItemDetail>>) => void }) {
  const [result, setResult] = useState<Record<string, ItemDetail>>({})
  const [seed, setSeed] = useState(0)
  const [history, setHistory] = useState(() => Number(localStorage.getItem('poe-smart-combination-count') || 0))
  const generate = () => {
    const bases = Object.entries(baseMods?.bases || {}) as [string, any][]
    const next: Record<string, ItemDetail> = {}
    for (const slot of smartSlots) {
      const category = slot.startsWith('flask') ? 'flask' : slot.startsWith('jewel') ? 'jewel' : slot === 'ring1' || slot === 'ring2' ? 'ring' : slot === 'weapon' ? 'weapon' : slot
      const candidates = bases.filter(([, base]) => base.slot === category)
      const [baseName, base] = candidates[Math.floor(Math.random() * candidates.length)] || []
      if (!baseName) continue
      const isFlask = category === 'flask'
      const draft: ItemDetail = { name: `Smart ${baseName}`, base: baseName, rarity: isFlask ? 'Magic' : 'Rare', item_level: Math.max(1, Number(base.required_level || 1)), slot: category, implicits: base.implicit ? [base.implicit] : [], explicits: [] }
      const options = modOptionsForItem(draft, baseMods).filter(mod => Number(mod.min_item_level || 1) <= draft.item_level)
      const implicit = String(base.implicit || '')
      const limit = (kind: 'Prefix' | 'Suffix') => {
        const match = implicit.match(new RegExp('([+-]\\d+)\\s+' + kind + ' Modifiers? allowed', 'i'))
        return Math.max(0, 3 + (match ? Number(match[1]) : 0))
      }
      const pick = (kind: 'Prefix' | 'Suffix', max: number) => {
        const used = new Set<string>()
        return options.filter(mod => new RegExp(kind, 'i').test(mod.type || '')).sort(() => Math.random() - .5).filter(mod => {
          if (used.has(mod.group || mod.id || mod.line)) return false
          used.add(mod.group || mod.id || mod.line)
          return true
        }).slice(0, max)
      }
      const prefixes = pick('Prefix', isFlask ? 1 : limit('Prefix'))
      const suffixes = pick('Suffix', isFlask ? 1 : limit('Suffix'))
      draft.explicits = [...prefixes, ...suffixes].map(mod => mod.line)
      if (slot in slotClass) next[slot as SlotKey] = draft
      else next[slot] = draft
    }
    const count = history + 1
    setHistory(count); localStorage.setItem('poe-smart-combination-count', String(count)); setSeed(Date.now()); setResult(next)
  }
  const rows = Object.entries(result) as [SmartSlot, ItemDetail][]
  return <section className="panel smart-generator">
    <div className="panel-title"><span><Dices /> Smart Combination</span><small>PoE 1 · tentativa #{history}</small></div>
    <p className="smart-description">Gera todos os slots: 10 equipamentos, 5 flasks e 6 jewels. Usa limites de prefixo/sufixo da base; flasks mágicas recebem 1 prefixo + 1 sufixo. A combinação fica dentro do resultado e não altera a árvore.</p>
    <button className="smart-generate" onClick={generate}><Dices /> Gerar combinação aleatória</button>
    {!!seed && <div className="smart-result"><header><b>Resultado da tentativa · {rows.length}/{smartSlots.length} slots gerados</b><button onClick={() => onApply(Object.fromEntries(Object.entries(result).filter(([slot]) => slot in slotClass)) as Partial<Record<SlotKey, ItemDetail>>)}>Aplicar equipamentos</button></header><div className="smart-grid">{rows.map(([slot, item]) => <article key={slot} className="smart-card"><div className="smart-card-head"><b>{slot.startsWith('flask') ? `Flask ${slot.slice(5)}` : slot.startsWith('jewel') ? `Jewel ${slot.slice(5)}` : SLOT_LABELS[slot as SlotKey]}</b><small>{item.rarity} · ilvl {item.item_level}</small></div>{spriteFor(item, sprites) ? <img src={spriteFor(item, sprites)} alt="" /> : <div className="smart-missing">Sprite ausente</div>}<strong>{item.base}</strong>{item.implicits.map(mod => <p className="implicit" key={mod}>{mod}</p>)}{item.explicits.map(mod => <p key={mod}>{mod}</p>)}</article>)}</div></div>}
    <small className="smart-learning">Histórico local: {history} tentativa{history === 1 ? '' : 's'} guardada{history === 1 ? '' : 's'} para ranking futuro.</small>
  </section>
}

function PassiveTree({ build }: { build: BuildRow; skill: SkillGroup }) {
  const ref = useRef<HTMLObjectElement>(null)
  const nodes = useMemo(() => build.nodes.map(String), [build.nodes])
  useEffect(() => {
    const object = ref.current
    if (!object) return
    const apply = () => {
      const win = object.contentWindow as (Window & { tree_load?: (data: unknown) => void }) | null
      win?.tree_load?.({ nodes: nodes.map(Number), classId: 0, ascendancyId: 0, alternateAscendancyId: 'nil' })
    }
    object.addEventListener('load', apply)
    apply()
    return () => object.removeEventListener('load', apply)
  }, [nodes])
  return <section className="panel tree-panel">
    <div className="panel-title"><span><GitBranch /> Passive Tree</span><small>{nodes.length} selected IDs - versioned SVG graph</small></div>
    <object ref={ref} className="pob-tree-svg" data="/poe-tree/skilltree-3.28.svg" type="image/svg+xml" title="Passive Tree" />
    <TreeNodeCards nodes={nodes} />
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
      {stage === 'items' && <div className="dashboard-grid items-dashboard-grid">
        <EquipmentBoard map={equipment} rawItems={build.item_details} sprites={bundle.sprites} selectedId={activeItem?.id} onSelect={setSelectedItem} pools={pools} baseMods={bundle.baseMods} onSwap={(slot, item) => { setOverrides(prev => ({ ...prev, [slot]: item })); setSelectedItem(toEquipmentItem(item, slot)) }} />
        <div className="middle-stack"><BuildRanking skill={skill} onSelect={next => { setSelectedBuild(next); setOverrides({}) }} /><DefensePanel build={build} /><DamagePanel build={build} /></div>
        {activeItem && <ItemInspector item={{ ...activeItem, sprite: activeItem.raw ? spriteFor(activeItem.raw, bundle.sprites) : activeItem.sprite }} onSelect={setSelectedItem} baseMods={bundle.baseMods} />}
      </div>}
      {stage === 'defense' && <DefensePanel build={build} />}
      {stage === 'damage' && <DamagePanel build={build} />}
      {stage === 'combinations' && <CombinationPanel skill={skill} build={build} pools={pools} sprites={bundle.sprites} onBuild={next => { setSelectedBuild(next); setOverrides({}) }} onSwap={(slot, item) => { setOverrides(prev => ({ ...prev, [slot]: item })); setSelectedItem(toEquipmentItem(item, slot)); setStage('items') }} />}
      {stage === 'smart-combination' && <SmartCombinationPanel build={build} sprites={bundle.sprites} baseMods={bundle.baseMods} onApply={items => { setOverrides(items); setStage('items') }} />}
      {stage === 'tree' && <PassiveTree build={build} skill={skill} />}
    </div>
  </div>
}

