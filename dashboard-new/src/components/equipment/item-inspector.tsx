import { ArrowUpRight, BadgeCheck, X } from 'lucide-react'
import type { EquipmentItem } from '../../types/build'
import { tierForStat } from '../../data/mod-tiers'

export function ItemInspector({ item, baseMods }: { item: EquipmentItem; onSelect: (x: EquipmentItem) => void; baseMods: any }) {
  const implicits = (item.implicits || []).map(stat => tierForStat(item.raw, stat, baseMods))
  const explicits = (item.explicits || []).map(stat => tierForStat(item.raw, stat, baseMods))

  return <div className="inspector">
    <section className="panel item-detail">
      <div className="panel-title"><span>Selected Item</span><button><X /></button></div>
      <div className="item-head">
        <i>{item.sprite ? <img src={item.sprite} alt="" /> : item.name[0]}</i>
        <div><small className="unique-text">{item.rarity.toUpperCase()}</small><h2>{item.name}</h2><p>{item.baseType}</p></div>
      </div>
      <div className="item-meta"><span>Item level <b>{item.itemLevel ?? '-'}</b></span><span>Slot <b>{item.slot}</b></span></div>
      <div className="item-stats">
        {implicits.map(stat => <p className="implicit-line" key={stat.line}><b className="tier-pill implicit">Implicit</b><span>{stat.line}</span></p>)}
        {explicits.length > 0 && <hr />}
        {explicits.map(stat => <p key={stat.line}>
          <b className={stat.tier ? 'tier-pill' : 'tier-pill unknown'}>{stat.tier ? `T${stat.tier}` : '-'}</b>
          <span>{stat.line}</span>
        </p>)}
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

