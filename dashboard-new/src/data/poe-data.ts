import type { BuildData, BuildRow, EquipmentItem, ItemDetail, SlotKey } from '../types/build'

export const SLOT_LABELS: Record<SlotKey, string> = {
  weapon: 'Weapon',
  helmet: 'Helmet',
  offhand: 'Offhand',
  amulet: 'Amulet',
  body: 'Body Armour',
  ring1: 'Ring I',
  ring2: 'Ring II',
  gloves: 'Gloves',
  belt: 'Belt',
  boots: 'Boots',
}

const ignored = new Set(['xml', 'extraction samples', 'root'])
const bowUniques = /\b(widowhail|voltaxic rift|windripper|lioneye's glare|death's opus|chin sol|darkscorn|doomfletch)\b/i

export async function loadDashboardData() {
  const [data, sprites, baseMods] = await Promise.all([
    fetch('/dashboard/build_dashboard_data.json').then(r => r.json()),
    fetch('/dashboard/item_sprite_index.json').then(r => r.json()),
    fetch('/dashboard/item_base_mod_summary.json').then(r => r.json()).catch(() => ({ bases: {} })),
  ])
  return { data: data as BuildData, sprites: sprites as Record<string, string>, baseMods }
}

export function validSkills(data: BuildData) {
  return data.skills.filter(s => s.skill && !ignored.has(s.skill.toLowerCase()))
}

function itemText(item?: ItemDetail) {
  return `${item?.base ?? ''} ${item?.name ?? ''}`
}

export function isBow(item?: ItemDetail) {
  return /\bbow\b/i.test(itemText(item)) || bowUniques.test(itemText(item))
}

export function isQuiver(item?: ItemDetail) {
  return /quiver/i.test(itemText(item))
}

export function isTwoHand(item?: ItemDetail) {
  return isBow(item) || /\b(staff|warstaff|maul|greatsword|two hand|two-handed)\b/i.test(itemText(item))
}

export function slotForItem(item: ItemDetail, baseMods?: any): SlotKey | 'ring' | 'jewel' | 'flask' | 'other' {
  const text = itemText(item).toLowerCase()
  const baseInfo = baseMods?.bases?.[item.base] || baseMods?.bases?.[item.name]
  if (text.includes('flask') || baseInfo?.slot === 'flask') return 'flask'
  if (isQuiver(item)) return 'offhand'
  const slot = baseInfo?.slot || item.slot
  if (slot === 'ring') return 'ring'
  if (slot === 'twohand') return 'weapon'
  return slot || 'other'
}

export function compatibleOffhand(weapon?: ItemDetail, offhand?: ItemDetail) {
  if (!offhand) return true
  if (isQuiver(offhand)) return !!weapon && isBow(weapon)
  if (!weapon) return true
  return !isTwoHand(weapon)
}

export function spriteFor(item: ItemDetail, sprites: Record<string, string>) {
  const rare = ['Rare', 'Magic', 'Normal'].includes(item.rarity)
  const src = rare ? sprites[item.base] : (sprites[item.name] || sprites[item.base])
  return src ? src.replace('../', '/') : ''
}

export function mapEquipment(items: ItemDetail[], baseMods?: any): Partial<Record<SlotKey, EquipmentItem>> {
  const rings: ItemDetail[] = []
  const offhands: ItemDetail[] = []
  const map: Partial<Record<SlotKey, ItemDetail>> = {}
  for (const item of items) {
    const slot = slotForItem(item, baseMods)
    if (slot === 'ring') rings.push(item)
    else if (slot === 'offhand') offhands.push(item)
    else if (slot === 'weapon' && !map.weapon) map.weapon = item
    else if (!['flask', 'jewel', 'other'].includes(slot) && !map[slot as SlotKey]) map[slot as SlotKey] = item
  }
  if (rings[0]) map.ring1 = rings[0]
  if (rings[1]) map.ring2 = rings[1]
  const offhand = offhands.find(item => compatibleOffhand(map.weapon, item))
  if (offhand) map.offhand = offhand
  else if (map.weapon && isTwoHand(map.weapon) && !isBow(map.weapon)) {
    map.offhand = { name: 'Two-handed weapon', base: 'Offhand locked', rarity: 'Normal', item_level: 0, slot: 'offhand', implicits: [], explicits: [], locked: true }
  }
  return Object.fromEntries(Object.entries(map).map(([slot, item]) => [slot, toEquipmentItem(item as ItemDetail, slot as SlotKey)]))
}

export function toEquipmentItem(item: ItemDetail, slot: SlotKey): EquipmentItem {
  return {
    id: `${slot}-${item.name}-${item.base}`,
    name: item.name,
    baseType: item.base,
    slot,
    rarity: item.rarity.toLowerCase() as EquipmentItem['rarity'],
    itemLevel: item.item_level,
    stats: [...(item.implicits || []), ...(item.explicits || [])],
    implicits: item.implicits || [],
    explicits: item.explicits || [],
    raw: item,
    locked: item.locked,
  }
}

export function itemPools(skill: BuildData['skills'][number], weapon?: ItemDetail, baseMods?: any) {
  const pools: Partial<Record<SlotKey, ItemDetail[]>> = {}
  const seen: Record<string, Set<string>> = {}
  for (const build of skill.build_rows) {
    for (const item of build.item_details || []) {
      const slot = slotForItem(item, baseMods)
      const targets: SlotKey[] = slot === 'ring' ? ['ring1', 'ring2'] : slot === 'jewel' || slot === 'flask' || slot === 'other' ? [] : [slot]
      for (const target of targets) {
        if (target === 'offhand' && !compatibleOffhand(weapon, item)) continue
        const key = `${item.name}|${item.base}`
        seen[target] ||= new Set()
        if (seen[target].has(key)) continue
        seen[target].add(key)
        pools[target] ||= []
        pools[target]!.push(item)
      }
    }
  }
  return pools
}

export function scoreBuild(build: BuildRow) {
  return (build.combined_dps || 0) * 3 + (build.ehp || 0) * 3 + (build.life || 0) * 2 + (build.energy_shield || 0) + (build.block || 0) * 2000 + (build.suppression || 0) * 1500
}
