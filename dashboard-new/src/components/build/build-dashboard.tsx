import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, Box, Dices, GitBranch, Heart, Search, Shield, Sparkles, Sword, Zap } from 'lucide-react'
import type { BuildData, BuildRow, BuildStage, EquipmentItem, ItemDetail, SkillGroup, SlotKey } from '../../types/build'
import { catalogBasesForSlot, itemPools, loadDashboardData, loadGenerationCatalog, mapEquipment, scoreBuild, SLOT_LABELS, spriteFor, toEquipmentItem, validSkills } from '../../data/poe-data'
import { loadPassiveTree } from '../../data/passive-tree'
import { generateRandomTreeResult } from '../../data/passive-tree'
import { ItemHoverCard } from '../equipment/item-hover-card'
import { ItemInspector } from '../equipment/item-inspector'
import { affixLimits, modOptionsForItem, tierForStat, tierLabel as formatTier, validateItem } from '../../data/mod-tiers'

const stages: { id: BuildStage; label: string; description: string }[] = [
  { id: 'items', label: 'Items', description: 'PoE Ninja / Mobalytics paper-doll' },
  { id: 'defense', label: 'Defense', description: 'Life, ES, EHP, resists, block' },
  { id: 'damage', label: 'DPS', description: 'Damage, speed, crit, scaling' },
  { id: 'combinations', label: 'Combinations', description: 'Builds, slots and candidate swaps' },
  { id: 'smart-combination', label: 'Smart Combination', description: 'Random items and valid modifiers' },
  { id: 'tree', label: 'Passive Tree', description: 'Nodes, links, notables, masteries' },
]

const slotOrder: SlotKey[] = ['weapon', 'helmet', 'offhand', 'amulet', 'body', 'ring1', 'ring2', 'gloves', 'belt', 'boots']
const passiveClasses = ['Marauder', 'Ranger', 'Witch', 'Duelist', 'Templar', 'Shadow', 'Scion']
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

function AscendancyMiniCard({ name, count }: { name: string; count: number }) {
  const Icon = /guardian|hierophant|champion|gladiator|chieftain/i.test(name) ? Shield : /deadeye|slayer|berserker|raider|pathfinder/i.test(name) ? Sword : Sparkles
  return <span className="asc-mini-card"><i><Icon /></i><span><b>{name}</b><small>{count} build{count === 1 ? '' : 's'}</small></span></span>
}

function SkillList({ skills, selected, onSelect }: { skills: SkillGroup[]; selected?: SkillGroup; onSelect: (skill: SkillGroup) => void }) {
  const [q, setQ] = useState('')
  const filtered = skills.filter(skill => skill.skill.toLowerCase().includes(q.toLowerCase()) || JSON.stringify(skill.classes).toLowerCase().includes(q.toLowerCase()))
  return <section className="panel skill-browser">
    <div className="panel-title"><span><Search /> Skills</span><small>{filtered.length} skills</small></div>
    <div className="skill-search"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar skill, classe, item..." /></div>
    <div className="skill-list">
      {filtered.slice(0, 120).map(skill => <button key={skill.skill} className={selected?.skill === skill.skill ? 'active' : ''} onClick={() => onSelect(skill)}>
        <b>{skill.skill}</b><span>{fmt(skill.builds)} builds · DPS {fmt(skill.best_dps)}</span>
        <div className="asc-mini-grid">{skill.classes.slice(0, 2).map(([name, count]) => <AscendancyMiniCard key={name} name={name} count={count} />)}</div>
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

function socketCapacity(item: EquipmentItem) {
  const text = `${item.slot} ${item.baseType}`.toLowerCase()
  const level = Math.max(0, Number(item.itemLevel || 0))
  if (/(belt|amulet|ring|quiver|flask|jewel)/.test(text)) return 0
  const maximum = /(body|body armour|bow|twohand|two-handed|staff|quarterstaff|two handed)/.test(text) ? 6
    : /(helmet|gloves|boots)/.test(text) ? 4
      : /(offhand|shield|wand|sceptre|scepter|dagger|claw|onehand|one-handed|sword|mace|axe)/.test(text) ? 3 : 0
  if (maximum === 0 || level < 1) return 0
  const byLevel = level >= 50 ? 6 : level >= 35 ? 5 : level >= 25 ? 4 : level >= 2 ? 3 : 2
  return Math.min(maximum, byLevel)
}

function SocketOverlay({ item }: { item: EquipmentItem }) {
  const count = socketCapacity(item)
  if (!count) return null
  return <span className="socket-overlay" aria-label={`capacidade de até ${count} sockets pela base e item level`}>
    {Array.from({ length: count }, (_, index) => <i key={index} className="socket-dot" aria-hidden="true" />)}
  </span>
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
            {item && !item.locked && <SocketOverlay item={item} />}
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
      <Jewels items={rawItems} sprites={sprites} baseMods={baseMods} onSelect={onSelect} />
    </div>
  </section>
}

function Flasks({ items, sprites, baseMods }: { items: ItemDetail[]; sprites: Record<string, string>; baseMods: any }) {
  const flasks = items.filter(item => `${item.name} ${item.base}`.toLowerCase().includes('flask')).slice(0, 5)
  return <div className="flasks"><small>FLASKS</small>{Array.from({ length: 5 }).map((_, i) => { const item = flasks[i]; const equipment = item ? toEquipmentItem(item, 'belt') : undefined; return <button key={i}>{<i className="flask">{item && <img src={spriteFor(item, sprites)} alt="" />}</i>}<span>{item?.name || 'Empty'}</span>{equipment && <ItemHoverCard item={{ ...equipment, sprite: spriteFor(item, sprites) }} placement="bottom" baseMods={baseMods} />}</button> })}</div>
}

function Jewels({ items, sprites, baseMods, onSelect }: { items: ItemDetail[]; sprites: Record<string, string>; baseMods: any; onSelect: (item: EquipmentItem) => void }) {
  const jewels = items.filter(item => `${item.name} ${item.base} ${item.slot || ''}`.toLowerCase().includes('jewel')).slice(0, 6)
  if (!jewels.length) return null
  return <div className="jewels"><small>JEWELS</small>{jewels.map((jewel, i) => { const equipment = toEquipmentItem(jewel, `jewel${i + 1}` as SlotKey); const sprite = spriteFor(jewel, sprites); return <button type="button" className="jewel-slot" key={`${jewel.name}-${jewel.base}-${i}`} aria-label={`Selecionar jewel ${jewel.name}`} onClick={() => onSelect(equipment)}><img src={sprite} alt="" />{equipment.stats.length ? <ItemHoverCard item={{ ...equipment, sprite }} placement="bottom" baseMods={baseMods} /> : <span className="jewel-missing-mods">Mods ausentes</span>}</button> })}</div>
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

type SmartSlot = SlotKey | `flask${1 | 2 | 3 | 4 | 5}` | `jewel${1 | 2 | 3 | 4 | 5 | 6}`
const smartSlots: SmartSlot[] = ['weapon', 'helmet', 'body', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand', 'flask1', 'flask2', 'flask3', 'flask4', 'flask5', 'jewel1', 'jewel2', 'jewel3', 'jewel4', 'jewel5', 'jewel6']
function solveAffixDistribution(options: any[], category: string, limits: { prefixes: number; suffixes: number }) {
  const count = (type: string) => new Set(options.filter(mod => mod.type === type).map(mod => mod.group || mod.id || mod.line)).size
  const maxP = Math.min(3, limits.prefixes, count('Prefix'))
  const maxS = Math.min(3, limits.suffixes, count('Suffix'))
  const pairs = category === 'flask' ? [[1, 1], [1, 0], [0, 1]] : category === 'jewel' ? [[2, 2]] : [[3, 3]]
  return pairs.filter(([prefixes, suffixes]) => prefixes <= maxP && suffixes <= maxS)
}
function selectAffixes(options: any[], kind: 'Prefix' | 'Suffix', target: number) {
  const candidates = options.filter(mod => mod.type === kind).sort(() => Math.random() - .5)
  const search = (start: number, selected: any[], groups: Set<string>): any[] | undefined => {
    if (selected.length === target) return selected
    for (let index = start; index < candidates.length; index += 1) {
      const mod = candidates[index]; const group = mod.group || mod.id || mod.line
      if (groups.has(group)) continue
      const next = new Set(groups); next.add(group)
      const result = search(index + 1, [...selected, mod], next)
      if (result) return result
    }
    return undefined
  }
  return search(0, [], new Set()) || []
}
function SmartCombinationPanel({ build, skill, sprites, baseMods, onApply, onTreeApply }: { build: BuildRow; skill: SkillGroup; sprites: Record<string, string>; baseMods: any; onApply: (items: Partial<Record<SlotKey, ItemDetail>>) => void; onTreeApply: (nodes: string[]) => void }) {
  const [result, setResult] = useState<Record<string, ItemDetail>>({})
  const [seed, setSeed] = useState(0)
  const [characterLevel, setCharacterLevel] = useState(85)
  const [treePoints, setTreePoints] = useState(100)
  const [routeClassMode, setRouteClassMode] = useState('random')
  const [treeNodes, setTreeNodes] = useState<string[]>(build.nodes.map(String))
  const [treeStats, setTreeStats] = useState<{ generated: number; connected: boolean; maxDepth: number; frontierRemaining: number; travel: number; travelRatio: number; regions: number; paidPoints?: number; travelByReason?: number; investment?: number; touchedClusters?: number; completedClusters?: number; travelOnlyClusters?: number; incompleteClusters?: number; badLeaves?: number; redundantNodes?: number; prunedNodes?: number; proposalsAccepted?: number; proposalsRejected?: number; proposals?: number; beamWidth?: number; seed?: number; requestedClass?: string; resolvedClass?: string; startNodeId?: string; fallbackUsed?: boolean } | null>(null)
  const [treeVersion, setTreeVersion] = useState(0)
  const [failures, setFailures] = useState<{ slot: string; category: string; stage: string; candidates: number }[]>([])
  const [history, setHistory] = useState(() => Number(localStorage.getItem('poe-smart-combination-count') || 0))
  const randomizeRanges = (line: string) => line.replace(/\((-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)\)/g, (_, a, b) => {
    const lo = Number(a), hi = Number(b)
    const value = Number.isInteger(lo) && Number.isInteger(hi) ? Math.floor(Math.random() * (hi - lo + 1)) + lo : lo + Math.random() * (hi - lo)
    return Number.isInteger(value) ? String(value) : value.toFixed(1)
  })
  const generate = () => {
    const bases = Object.entries(baseMods?.bases || {}) as [string, any][]
    const next: Record<string, ItemDetail> = {}
    const failed: { slot: string; category: string; stage: string; candidates: number }[] = []
    for (const slot of smartSlots) {
      const category = slot.startsWith('flask') ? 'flask' : slot.startsWith('jewel') ? 'jewel' : slot === 'ring1' || slot === 'ring2' ? 'ring' : slot === 'weapon' ? 'weapon' : slot
      const candidates = bases.filter(([name, base]) => {
        const baseSlot = String(base.slot || '').toLowerCase()
        const normalized = category === 'ring' ? 'ring' : category
        return baseSlot === normalized && !base.special && !/cluster jewel|small cluster|medium cluster|large cluster|timeless jewel|charm|talisman|breach ring|ratcheting ring|capricious spiritblade|implicit modifiers cannot be changed|has elder, shaper|left ring slot|right ring slot|can be anointed/i.test(`${name} ${base.base_type || ''} ${base.implicit || ''}`)
      })
      const shuffledCandidates = [...candidates].sort(() => Math.random() - .5)
      let selected: [string, any] | undefined
      for (const candidate of shuffledCandidates) {
        const probe: ItemDetail = { name: `Smart ${candidate[0]}`, base: candidate[0], rarity: category === 'flask' ? 'Magic' : 'Rare', item_level: Math.max(Number(candidate[1].required_level || 1), Math.min(characterLevel, 86)), slot: category, implicits: [], explicits: [] }
        const viable = modOptionsForItem(probe, baseMods).filter(mod => (tierForStat(probe, mod.line, baseMods).tierModel === 'tierless' || (Number(mod.min_item_level || 1) <= probe.item_level && tierForStat(probe, mod.line, baseMods).tier !== null)))
        const probeLimits = affixLimits(probe, baseMods)
        if (category === 'flask' || category === 'jewel' || (probeLimits.prefixes === 3 && probeLimits.suffixes === 3)) {
          if (solveAffixDistribution(viable, category, probeLimits).length > 0) { selected = candidate; break }
        }
      }
      const [baseName, base] = selected || []
      if (!baseName) continue
      const isFlask = category === 'flask'
      const draft: ItemDetail = { name: `Smart ${baseName}`, base: baseName, rarity: isFlask ? 'Magic' : 'Rare', item_level: Math.max(Number(base.required_level || 1), Math.min(characterLevel, 86)), slot: category, implicits: base.implicit ? String(base.implicit).split('\\n').filter(Boolean).map(randomizeRanges) : [], explicits: [] }
      const options = modOptionsForItem(draft, baseMods).filter(mod => (tierForStat(draft, mod.line, baseMods).tierModel === 'tierless' || (Number(mod.min_item_level || 1) <= draft.item_level && tierForStat(draft, mod.line, baseMods).tier !== null)))
      const implicit = String(base.implicit || '')
      const limits = affixLimits(draft, baseMods)
      const targetPairs = solveAffixDistribution(options, category, limits)
      const [prefixTarget, suffixTarget] = targetPairs[Math.floor(Math.random() * targetPairs.length)] || [0, 0]
      const prefixes = selectAffixes(options, 'Prefix', prefixTarget)
      const suffixes = selectAffixes(options, 'Suffix', suffixTarget)
      const jewelLimit = category === 'jewel' ? 2 : 3
      const selectedPrefixes = category === 'jewel' ? prefixes.slice(0, jewelLimit) : prefixes
      const selectedSuffixes = category === 'jewel' ? suffixes.slice(0, jewelLimit) : suffixes
      draft.explicits = [...selectedPrefixes, ...selectedSuffixes].map(mod => randomizeRanges(mod.line))
      draft.capacity = { prefixes: limits.prefixes, suffixes: limits.suffixes }
      draft.target = { prefixes: prefixTarget, suffixes: suffixTarget }
      draft.generated = { prefixes: selectedPrefixes.length, suffixes: selectedSuffixes.length }
      draft.affix_meta = [...selectedPrefixes, ...selectedSuffixes].map(mod => { const tier = tierForStat(draft, mod.line, baseMods); return { modId: mod.id || '', tier: tier.tier, tierModel: tier.tierModel, requiredItemLevel: tier.tierModel === 'tierless' ? null : Number(mod.min_item_level || 1), group: mod.group || '', generationType: mod.type as 'Prefix' | 'Suffix', source: 'natural' as const } })
      const validation = validateItem(draft, baseMods)
      if (!validation.valid || (prefixes.length + suffixes.length) < (isFlask ? 1 : category === 'jewel' ? 2 : 3)) continue
      if ((draft.rarity === 'Rare' || draft.rarity === 'Magic') && draft.explicits.length === 0) continue
      if (slot in slotClass) next[slot as SlotKey] = draft
      else next[slot] = draft
    }
    for (const slot of smartSlots) if (!next[slot]) {
      const category = slot.startsWith('flask') ? 'flask' : slot.startsWith('jewel') ? 'basic_jewel' : slot
      const candidates = bases.filter(([, base]) => base.slot === (category === 'basic_jewel' ? 'jewel' : category)).length
      const stage = candidates === 0 ? 'no_base_candidates' : category === 'flask' ? 'no_suffix_candidates' : 'no_base_supports_full_3p3s'
      failed.push({ slot, category, stage, candidates })
      next[slot] = { name: 'Generation failed', base: 'No valid item generated', rarity: 'Rare', item_level: characterLevel, slot: category, implicits: [], explicits: [], failure: stage }
    }
    const count = history + 1
    setHistory(count); localStorage.setItem('poe-smart-combination-count', String(count)); setSeed(Date.now()); setFailures(failed); setResult(next)
  }
  const generateTree = async () => {
    const tree = await loadPassiveTree()
    const routeSeed = Math.random()
    const routeClass = routeClassMode === 'build' ? build.class : routeClassMode === 'random' ? passiveClasses[Math.floor(routeSeed * passiveClasses.length)] : routeClassMode
    const generated = generateRandomTreeResult(tree, routeClass, treePoints, routeSeed)
    setTreeNodes(generated.nodes)
    setTreeStats(generated.stats)
    setTreeVersion(value => value + 1)
  }
  const rows = Object.entries(result) as [SmartSlot, ItemDetail][]
  const tierLabel = (item: ItemDetail, line: string) => {
    const index = item.explicits.indexOf(line)
    const meta = index >= 0 ? item.affix_meta?.[index] : undefined
    if (meta?.tierModel === 'tierless') return 'Sem tier'
    if (meta?.tier != null) return `T${meta.tier}`
    return formatTier(tierForStat(item, line, baseMods))
  }
  return <section className="panel smart-generator">
    <div className="panel-title"><span><Dices /> Smart Combination</span><small>PoE 1 · tentativa #{history}</small></div>
    <div className="smart-pipeline"><span>1 Slot</span><span>2 Classe/base</span><span>3 Item level</span><span>4 Raridade</span><span>5 Mods elegíveis</span><span>6 Tier + valor</span><span>7 Validação</span></div>
    <p className="smart-description">Gera equipamentos e rotas conectadas à classe. A rota usa grafo oficial 3.28, shortest path, propostas por cluster e beam search.</p>
    <div className="smart-controls"><label>Nível / ilvl máximo <input type="number" min="1" max="100" value={characterLevel} onChange={event => setCharacterLevel(Math.max(1, Math.min(100, Number(event.target.value) || 1)))} /></label><label>Pontos da árvore <input type="number" min="1" max="123" value={treePoints} onChange={event => setTreePoints(Math.max(1, Math.min(123, Number(event.target.value) || 1)))} /></label><label>Origem <select value={routeClassMode} onChange={event => setRouteClassMode(event.target.value)}><option value="random">Aleatória balanceada</option><option value="build">Classe da build ({build.class})</option>{passiveClasses.map(name => <option key={name} value={name}>{name}</option>)}</select></label><button className="smart-generate" onClick={generateTree}><GitBranch /> Gerar rota otimizada</button><button className="smart-generate" onClick={generate}><Dices /> Gerar itens</button></div>
    {treeVersion > 0 && <><div className="smart-tree-result"><div className="route-result-head"><b>Rota gerada</b><strong>{treeStats?.paidPoints ?? treeNodes.length}/{treePoints}</strong><button disabled={!treeStats?.connected} onClick={() => onTreeApply(treeNodes)}>Aplicar rota à build</button></div><div className="route-result-grid"><article><small>Origem</small><b>{treeStats?.resolvedClass || 'n/a'}</b><span>solicitada {treeStats?.requestedClass || 'n/a'} · start {treeStats?.startNodeId || 'n/a'} · fallback {treeStats?.fallbackUsed ? 'sim' : 'não'}</span></article><article><small>Conectividade</small><b>{treeStats?.connected ? '1 componente' : 'inválida'}</b><span>seed {treeStats?.seed?.toFixed(5) ?? 'n/a'}</span></article><article><small>Eficiência</small><b>{treeStats?.travelByReason ?? treeStats?.travel ?? 0} travel</b><span>{Math.round((treeStats?.travelRatio ?? 0) * 100)}% · investimento {treeStats?.investment ?? 0} · regiões {treeStats?.regions ?? 0}</span></article><article><small>Clusters</small><b>{treeStats?.completedClusters ?? 0} concluídos</b><span>{treeStats?.travelOnlyClusters ?? 0} passagem · {treeStats?.incompleteClusters ?? 0} incompletos · {treeStats?.touchedClusters ?? 0} tocados</span></article><article><small>Auditoria</small><b>{treeStats?.badLeaves ?? 0} folhas ruins</b><span>{treeStats?.redundantNodes ?? 0} redundantes · {treeStats?.prunedNodes ?? 0} podados</span></article><article><small>Propostas</small><b>{treeStats?.proposalsAccepted ?? treeStats?.proposals ?? 0} aceitas</b><span>{treeStats?.proposalsRejected ?? 0} rejeitadas</span></article></div></div><PassiveTree build={{ ...build, class: treeStats?.resolvedClass || build.class, nodes: treeNodes, points_used: treeNodes.length }} skill={skill} /></>}
    {!!seed && <div className="smart-result"><header><b>Resultado da tentativa · {rows.length}/{smartSlots.length} slots gerados</b><span className={rows.length === smartSlots.length ? 'valid' : 'invalid'}>{rows.length === smartSlots.length ? 'Itens completos validados' : 'Falha: existe slot sem pool válido'}</span><button disabled={rows.length !== smartSlots.length} onClick={() => onApply(Object.fromEntries(Object.entries(result).filter(([slot]) => slot in slotClass)) as Partial<Record<SlotKey, ItemDetail>>)}>Aplicar equipamentos</button></header>{failures.length > 0 && <div className="smart-failures"><b>Diagnóstico por slot</b>{failures.map(failure => <span key={failure.slot}>{failure.slot}: {failure.stage} · {failure.candidates} bases candidatas</span>)}</div>}<div className="smart-grid">{rows.map(([slot, item]) => { const limits = item.capacity || affixLimits(item, baseMods); const generated = item.generated || { prefixes: (item.affix_meta || []).filter(mod => mod.generationType === 'Prefix').length, suffixes: (item.affix_meta || []).filter(mod => mod.generationType === 'Suffix').length }; return <article key={slot} className="smart-card"><div className="smart-card-head"><b>{slot.startsWith('flask') ? `Flask ${slot.slice(5)}` : slot.startsWith('jewel') ? `Jewel ${slot.slice(5)}` : SLOT_LABELS[slot as SlotKey]}</b><small>{item.rarity} · ilvl {item.item_level} · P {generated.prefixes}/{limits.prefixes} · S {generated.suffixes}/{limits.suffixes}</small></div>{spriteFor(item, sprites) ? <img src={spriteFor(item, sprites)} alt="" /> : <div className="smart-missing">Sprite ausente</div>}<strong>{item.base}</strong>{item.implicits.map(mod => <p className="implicit" key={mod}>{mod}</p>)}{item.explicits.map(mod => <p key={mod}>{mod} <em>{tierLabel(item, mod)}</em></p>)}</article> })}</div></div>}
    <small className="smart-learning">Histórico local: {history} tentativa{history === 1 ? '' : 's'} guardada{history === 1 ? '' : 's'} para ranking futuro.</small>
  </section>
}

function PassiveTree({ build }: { build: BuildRow; skill: SkillGroup }) {
  const ref = useRef<HTMLObjectElement>(null)
  const [tree, setTree] = useState<any>(null)
  const nodes = useMemo(() => build.nodes.map(String), [build.nodes])
  const selected = useMemo(() => new Set(nodes), [nodes])
  useEffect(() => { loadPassiveTree().then(setTree).catch(() => setTree(null)) }, [])
  const routeCss = useMemo(() => {
    if (!tree) return ''
    const validNodes = [...new Set(nodes)].filter(id => tree.nodes[id])
    const edgeRules = validNodes.flatMap(id => (tree.nodes[id]?.neighbors || [])
      .filter((next: string) => selected.has(next) && Number(id) < Number(next))
      .flatMap((next: string) => [`#c${id}-${next}`, `#c${next}-${id}`]))
    const nodeRules = validNodes.map(id => `#n${id}`)
    return `${nodeRules.join(',')}{color:var(--active-color)!important;stroke-opacity:1!important}${edgeRules.join(',')}{color:var(--active-color)!important;stroke-opacity:1!important}`
  }, [nodes, selected, tree])
  useEffect(() => {
    const object = ref.current
    if (!object || !routeCss) return
    let cancelled = false
    let attempts = 0
    const apply = () => {
      const doc = object.contentDocument
      if (doc?.documentElement) {
        doc.getElementById('dashboard-route-highlight')?.remove()
        const style = doc.createElementNS('http://www.w3.org/2000/svg', 'style')
        style.setAttribute('id', 'dashboard-route-highlight')
        style.textContent = routeCss
        doc.documentElement.appendChild(style)
        return
      }
      if (!cancelled && attempts < 80) {
        attempts += 1
        window.setTimeout(apply, 50)
      }
    }
    object.addEventListener('load', apply)
    apply()
    return () => { cancelled = true; object.removeEventListener('load', apply) }
  }, [routeCss])
  return <section className="panel tree-panel">
    <div className="panel-title"><span><GitBranch /> Passive Tree</span><small>{nodes.length} selected IDs - versioned SVG graph</small></div>
    <object ref={ref} className="pob-tree-svg" data="/poe-tree/skilltree-3.28.svg" type="image/svg+xml" title="Passive Tree" />
  </section>
}

export function BuildDashboard() {
  const [bundle, setBundle] = useState<{ data: BuildData; sprites: Record<string, string>; baseMods: any } | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<SkillGroup | undefined>()
  const [selectedBuild, setSelectedBuild] = useState<BuildRow | undefined>()
  const [stage, setStage] = useState<BuildStage>('items')
  const [overrides, setOverrides] = useState<Partial<Record<SlotKey, ItemDetail>>>({})
  const [treeOverride, setTreeOverride] = useState<string[] | undefined>()
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | undefined>()
  const [league, setLeague] = useState(() => localStorage.getItem('poe-dashboard-league') || 'PoE 1')
  const [generationCatalog, setGenerationCatalog] = useState<any>()

  useEffect(() => { loadDashboardData().then(setBundle) }, [])
  useEffect(() => { localStorage.setItem('poe-dashboard-league', league) }, [league])
  useEffect(() => {
    if (stage !== 'smart-combination' || generationCatalog || !bundle) return
    loadGenerationCatalog(bundle.baseMods).then(setGenerationCatalog)
  }, [stage, generationCatalog, bundle])
  const skills = useMemo(() => bundle ? validSkills(bundle.data) : [], [bundle])
  const skill = selectedSkill || skills[0]
  const baseBuild = selectedBuild || skill?.build_rows?.[0]
  const build = baseBuild && treeOverride ? { ...baseBuild, nodes: treeOverride, points_used: treeOverride.length } : baseBuild

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
      {stage === 'smart-combination' && (generationCatalog ? <SmartCombinationPanel build={build} skill={skill} sprites={bundle.sprites} baseMods={generationCatalog} onApply={items => { setOverrides(items); setStage('items') }} onTreeApply={nodes => { setTreeOverride(nodes); setStage('tree') }} /> : <section className="panel loading">Carregando catálogo de modificadores apenas para o gerador...</section>)}
      {stage === 'tree' && <PassiveTree build={build} skill={skill} />}
    </div>
  </div>
}




