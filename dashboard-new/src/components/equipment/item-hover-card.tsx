import type { EquipmentItem } from '../../types/build'
import { tierForStat } from '../../data/mod-tiers'

export function ItemHoverCard({
  item,
  placement,
  baseMods,
}: {
  item: EquipmentItem
  placement: 'left' | 'right' | 'bottom'
  baseMods: any
}) {
  const explicitStats = (item.explicits?.length ? item.explicits : item.stats).map(stat => tierForStat(item.raw, stat, baseMods))

  return <aside className={'item-hover-card ' + placement} role="tooltip">
    <div className="hover-card-heading">
      {item.sprite && <img src={item.sprite} alt="" />}
      <div><small>{item.rarity}</small><strong>{item.name}</strong><span>{item.baseType}</span></div>
    </div>
    <div className="hover-card-meta">
      {item.quality !== undefined && <p>Quality <b>+{item.quality}%</b></p>}
      {item.itemLevel !== undefined && <p>Item Level <b>{item.itemLevel}</b></p>}
      {item.armour !== undefined && <p>Armour <b>{item.armour.toLocaleString()}</b></p>}
      {item.properties?.map(property => <p key={property.label}>{property.label} <b>{property.value}</b></p>)}
    </div>
    {(item.requiredLevel || item.requiredStrength) && <p className="hover-requirements">Requires: {item.requiredLevel && <b>Level {item.requiredLevel}</b>}{item.requiredLevel && item.requiredStrength && ', '}{item.requiredStrength && <b>{item.requiredStrength} Str</b>}</p>}
    <div className="hover-card-stats">
      {explicitStats.map(stat => <p key={stat.line}>
        <b className={stat.tier ? 'tier-pill' : 'tier-pill unknown'}>{stat.tier ? `T${stat.tier}` : '-'}</b>
        <span>{stat.line}</span>
      </p>)}
    </div>
    <footer>Source: PoE 1 XML / poe.ninja</footer>
  </aside>
}

