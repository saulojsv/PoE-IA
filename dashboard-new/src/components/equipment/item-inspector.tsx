import { ArrowUpRight, BadgeCheck, Check, Pencil, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { EquipmentItem } from '../../types/build'
import { modOptionsForItem, tierForStat } from '../../data/mod-tiers'

function firstValue(line: string) {
  const match = line.match(/[+-]?\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : undefined
}

function previewDelta(before: string, after: string) {
  const oldValue = firstValue(before)
  const newValue = firstValue(after)
  if (oldValue === undefined || newValue === undefined || oldValue === 0 || before === after) return null
  const delta = newValue - oldValue
  return { delta, percent: Math.abs(delta / oldValue * 100), positive: delta > 0 }
}

export function ItemInspector({ item, baseMods }: { item: EquipmentItem; onSelect: (x: EquipmentItem) => void; baseMods: any }) {
  const [editing, setEditing] = useState(false)
  const [draftMods, setDraftMods] = useState(item.explicits || item.stats)
  const implicits = (item.implicits || []).map(stat => tierForStat(item.raw, stat, baseMods))
  const explicits = draftMods.map(stat => tierForStat(item.raw, stat, baseMods))
  const options = useMemo(() => modOptionsForItem(item.raw, baseMods).filter((mod, index, all) => all.findIndex(other => other.id === mod.id && other.line === mod.line) === index), [item.raw, baseMods])
  const changed = useMemo(() => draftMods.some((stat, i) => stat !== (item.explicits || item.stats)[i]) || draftMods.length !== (item.explicits || item.stats).length, [draftMods, item.explicits, item.stats])

  return <div className="inspector">
    <section className="panel item-detail">
      <div className="panel-title"><span>Selected Item</span><div className="inspector-actions"><button title="Editar modificadores" onClick={() => setEditing(value => !value)}><Pencil /></button><button><X /></button></div></div>
      <div className="item-head">
        <i>{item.sprite ? <img src={item.sprite} alt="" /> : item.name[0]}</i>
        <div><small className="unique-text">{item.rarity.toUpperCase()}</small><h2>{item.name}</h2><p>{item.baseType}</p></div>
      </div>
      <div className="item-meta"><span>Item level <b>{item.itemLevel ?? '-'}</b></span><span>Slot <b>{item.slot}</b></span></div>
      <div className="item-stats">
        {implicits.map(stat => <p className="implicit-line" key={stat.line}><b className="tier-pill implicit">Implicit</b><span>{stat.line}</span></p>)}
        {explicits.length > 0 && <hr />}
        {explicits.map((stat, i) => <p key={`${stat.line}-${i}`}>
          <b className={stat.tier ? 'tier-pill' : 'tier-pill unknown'}>{stat.tier ? `T${stat.tier}` : '—'}</b>
          <span>{stat.line}</span>
        </p>)}
        {editing && <div className="mod-editor">
          <small>Editar mods explícitos</small>
          {draftMods.map((mod, i) => { const delta = previewDelta((item.explicits || item.stats)[i] || '', mod); return <label className="mod-choice" key={i}><span>Mod {i + 1}</span><div className="mod-choice-row"><select value={mod} onChange={event => setDraftMods(current => current.map((value, index) => index === i ? event.target.value : value))}><option value={mod}>{mod} (atual)</option>{options.map(option => <option key={`${option.id}-${option.line}`} value={option.line}>{option.type || 'Mod'} · {option.line}</option>)}</select>{delta && <em className={delta.positive ? 'mod-gain' : 'mod-loss'}>{delta.positive ? '↑' : '↓'} {Math.abs(delta.delta).toLocaleString('pt-PT')} ({delta.percent.toFixed(1)}%)</em>}</div></label> })}
          <button className="add-mod-choice" onClick={() => { const next = options.find(option => !draftMods.includes(option.line)); if (next) setDraftMods(current => [...current, next.line]) }}>+ Adicionar mod compatível</button>
          <button className="save-mods" disabled={!changed} onClick={() => setEditing(false)}><Check /> Aplicar prévia</button>
          {changed && <span className="mod-preview">Alteração pendente: recalcule no PoB para confirmar DPS/EHP.</span>}
        </div>}
      </div>
      <footer><BadgeCheck /> PoE 1 XML / poe.ninja</footer>
    </section>
    <section className="panel impact">
      <div className="panel-title"><span>Manual Lab</span></div>
      <div><p><span>Mods</span><b className="gold">{item.stats.length}</b></p><p><span>Rarity</span><b>{item.rarity}</b></p><p><span>Base</span><b>{item.baseType}</b></p></div>
      <button className="text-button">Mod simulation local <ArrowUpRight /></button>
    </section>
  </div>
}

