import type { EquipmentItem } from '../../types/build'
import { affixTypeCode, tierForStat, tierLabel } from '../../data/mod-tiers'

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

  const rarity = item.rarity.toLowerCase().replace(' ', '-')
  const implicits = (item.implicits || []).map(stat => tierForStat(item.raw, stat, baseMods))

  return <aside className={'item-hover-card ' + placement + ' rarity-' + rarity} role="tooltip">
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
    {implicits.length > 0 && <div className="hover-card-stats implicit-stats">
      {implicits.map(stat => <p key={stat.line}><span>{stat.line}</span></p>)}
    </div>}
    {implicits.length > 0 && explicitStats.length > 0 && <hr className="hover-mod-divider" />}
    <div className="hover-card-stats explicit-stats">
      {explicitStats.map(stat => <p key={stat.line}>
        <b className={stat.tier ? 'tier-pill affix-code' : 'tier-pill unknown'}>{affixTypeCode(stat)}</b><b className={stat.tier ? 'tier-pill tier-code' : 'tier-pill unknown'}>{tierLabel(stat)}</b>
        <span>{stat.line}</span>
      </p>)}
    </div>
    {(explicitStats.some(stat => stat.affix || stat.group || stat.minItemLevel) || implicits.some(stat => stat.source)) && <div className="hover-mod-meta">
      {explicitStats.some(stat => stat.affix) && <span>{[...new Set(explicitStats.map(stat => stat.affix).filter(Boolean))].join(' / ')}</span>}
      {explicitStats.some(stat => stat.group) && <span>Grupo: {[...new Set(explicitStats.map(stat => stat.group).filter(Boolean))].join(', ')}</span>}
      {explicitStats.some(stat => stat.minItemLevel) && <span>Base mínima: ilvl {Math.max(...explicitStats.map(stat => stat.minItemLevel || 0))}</span>}
    </div>}
    <footer>Source: PoE 1 XML / poe.ninja</footer>
  </aside>
}

