import { ArrowUpRight, BadgeCheck, Check, Pencil, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { EquipmentItem } from '../../types/build'
import { affixTypeCode, modOptionsForItem, tierForStat, tierLabel } from '../../data/mod-tiers'

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

function impactOf(line: string) {
  const text = line.toLowerCase()
  const impacts: string[] = []
  if (/maximum life|life regeneration|life recovery/.test(text)) impacts.push('Life/EHP')
  if (/energy shield/.test(text)) impacts.push('ES/EHP')
  if (/fire resistance/.test(text)) impacts.push('Fire res')
  if (/cold resistance/.test(text)) impacts.push('Cold res')
  if (/lightning resistance/.test(text)) impacts.push('Lightning res')
  if (/chaos resistance/.test(text)) impacts.push('Chaos res')
  if (/armour|evasion|spell suppression|block/.test(text)) impacts.push('Defesa')
  if (/damage|critical|attack speed|cast speed|projectile|penetration|gem level/.test(text)) impacts.push('DPS')
  if (/strength|dexterity|intelligence|attribute/.test(text)) impacts.push('Atributos/requisitos')
  return impacts.length ? impacts.join(' · ') : 'Efeito especial'
}

export function ItemInspector({ item, baseMods }: { item: EquipmentItem; onSelect: (x: EquipmentItem) => void; baseMods: any }) {
  const [editing, setEditing] = useState(false)
  const [auditIndex, setAuditIndex] = useState<number | null>(null)
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
        {explicits.map((stat, i) => <button className="audit-mod-line" key={`${stat.line}-${i}`} onClick={() => setAuditIndex(i)}>
          <b className={stat.tier ? 'tier-pill affix-code' : 'tier-pill unknown'}>{affixTypeCode(stat)}</b><b className={stat.tier ? 'tier-pill tier-code' : 'tier-pill unknown'}>{tierLabel(stat)}</b>
          <span>{stat.line}</span>
        </button>)}
        {auditIndex !== null && explicits[auditIndex] && <div className="affix-audit"><b>Auditoria do afixo</b><span>Texto: {explicits[auditIndex].line}</span><span>Mod ID: {explicits[auditIndex].modId || 'não identificado'}</span><span>Tier: {tierLabel(explicits[auditIndex])} · Tipo: {explicits[auditIndex].affix || 'não identificado'}</span><span>Grupo: {explicits[auditIndex].group || 'não identificado'}</span><span>Origem: {explicits[auditIndex].source || 'natural'}</span><span>Item level mínimo: {explicits[auditIndex].minItemLevel ?? '—'}</span><span>Tags: {explicits[auditIndex].tags?.join(', ') || '—'}</span></div>}
        {editing && <div className="mod-editor">
          <small>Editar mods explícitos</small>
          {draftMods.map((mod, i) => { const delta = previewDelta((item.explicits || item.stats)[i] || '', mod); return <label className="mod-choice" key={i}><span>Mod {i + 1} · {impactOf(mod)}</span><div className="mod-choice-row"><select value={mod} onChange={event => setDraftMods(current => current.map((value, index) => index === i ? event.target.value : value))}><option value={mod}>{mod} (atual)</option>{options.map(option => <option key={`${option.id}-${option.line}`} value={option.line}>{option.type || 'Mod'} · {option.line} · {impactOf(option.line)}</option>)}</select>{delta && <em className={delta.positive ? 'mod-gain' : 'mod-loss'}>{delta.positive ? '↑' : '↓'} {Math.abs(delta.delta).toLocaleString('pt-PT')} ({delta.percent.toFixed(1)}%)</em>}</div></label> })}
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

