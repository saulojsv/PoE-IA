import { ArrowUpRight, BadgeCheck, X } from 'lucide-react'
import type { EquipmentItem } from '../../types/build'

export function ItemInspector({ item }: { item: EquipmentItem; onSelect: (x: EquipmentItem) => void }) {
  return <div className="inspector">
    <section className="panel item-detail">
      <div className="panel-title"><span>Selected Item</span><button><X /></button></div>
      <div className="item-head">
        <i>{item.sprite ? <img src={item.sprite} alt="" /> : item.name[0]}</i>
        <div><small className="unique-text">{item.rarity.toUpperCase()}</small><h2>{item.name}</h2><p>{item.baseType}</p></div>
      </div>
      <div className="item-meta"><span>Item level <b>{item.itemLevel ?? '-'}</b></span><span>Slot <b>{item.slot}</b></span></div>
      <div className="item-stats">
        {(item.implicits || []).map(stat => <p className="implicit-line" key={stat}>{stat}</p>)}
        {(item.explicits || []).length > 0 && <hr />}
        {(item.explicits || []).map(stat => <p key={stat}>{stat}</p>)}
      </div>
      <footer><BadgeCheck /> PoE 1 XML · sprite/base real</footer>
    </section>
    <section className="panel impact">
      <div className="panel-title"><span>Manual Lab</span></div>
      <div><p><span>Mods</span><b className="gold">{item.stats.length}</b></p><p><span>Rarity</span><b>{item.rarity}</b></p><p><span>Base</span><b>{item.baseType}</b></p></div>
      <button className="text-button">Use API for mod simulation <ArrowUpRight /></button>
    </section>
  </div>
}
