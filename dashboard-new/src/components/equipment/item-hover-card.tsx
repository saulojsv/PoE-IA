import type { EquipmentItem } from '../../types/build'

export function ItemHoverCard({ item, placement }: { item: EquipmentItem; placement: 'left' | 'right' | 'bottom' }) {
  return <aside className={'item-hover-card '+placement} role="tooltip">
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
    <div className="hover-card-stats">{item.stats.map(stat => <p key={stat}>• <span>{stat}</span></p>)}</div>
    <footer>Source: poe.ninja fixture</footer>
  </aside>
}
