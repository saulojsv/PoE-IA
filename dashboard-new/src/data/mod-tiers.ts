import type { ItemDetail } from '../types/build'

type ModEntry = {
  id?: string
  type?: string
  group?: string
  min_item_level?: number
  line?: string
  lines?: string[]
  tags?: string[]
}

export type TierInfo = {
  line: string
  affix: string
  group: string
  tier: number | null
  source?: string
  tags?: string[]
  minItemLevel?: number
  modId?: string
  tierModel: 'tiered' | 'tierless'
}

export type ModOption = ModEntry & { line: string }

export function affixLimits(item: ItemDetail, baseMods: any) {
  const implicit = String(baseMods?.bases?.[item.base]?.implicit || '')
  const read = (kind: 'prefix' | 'suffix') => {
    const match = implicit.match(new RegExp('([+-]\\d+)\\s+' + kind + ' modifiers? allowed', 'i'))
    return Math.max(0, (item.slot === 'jewel' ? 2 : item.rarity === 'Magic' ? 1 : 3) + (match ? Number(match[1]) : 0))
  }
  return { prefixes: read('prefix'), suffixes: read('suffix') }
}

export function validateItem(item: ItemDetail, baseMods: any) {
  const errors: string[] = [], groups = new Set<string>(), stats = new Set<string>()
  const limits = affixLimits(item, baseMods); let prefixes = 0; let suffixes = 0
  for (const [index, line] of item.explicits.entries()) {
    const meta = item.affix_meta?.[index]; const info = tierForStat(item, line, baseMods); const type = meta?.generationType || info.affix
    if (!meta?.modId && !info.modId) errors.push(`Mod sem ID: ${line}`)
    if (type === 'Prefix') prefixes += 1; else if (type === 'Suffix') suffixes += 1; else errors.push(`Tipo inválido: ${line}`)
    const group = meta?.group || info.group; if (group && groups.has(`${type}:${group}`)) errors.push(`Grupo duplicado: ${group}`); if (group) groups.add(`${type}:${group}`)
    const family = line.toLowerCase().replace(/[+-]?\d+(?:\.\d+)?/g, '#').replace(/\([^)]*\)/g, '#').replace(/\s+/g, ' ').trim(); if (stats.has(family)) errors.push(`Estatística duplicada: ${family}`); stats.add(family)
    if (item.slot !== 'jewel' && info.tier === null) errors.push(`Tier inexistente: ${line}`)
    if (item.slot !== 'jewel' && Number(meta?.requiredItemLevel ?? info.minItemLevel ?? 1) > item.item_level) errors.push(`Ilvl insuficiente: ${line}`)
  }
  if (prefixes > limits.prefixes) errors.push(`Prefixos excedidos: ${prefixes}/${limits.prefixes}`)
  if (suffixes > limits.suffixes) errors.push(`Sufixos excedidos: ${suffixes}/${limits.suffixes}`)
  return { valid: errors.length === 0, errors, prefixes, suffixes, limits }
}

export function affixTypeCode(info: TierInfo) {
  return info.affix.toLowerCase().startsWith('prefix') ? 'P' : info.affix.toLowerCase().startsWith('suffix') ? 'S' : '—'
}

export function tierLabel(info: TierInfo) {
  return info.tierModel === 'tierless' ? 'Sem tier' : info.tier ? `T${info.tier}` : 'Tier desconhecido'
}

const optionCache = new WeakMap<object, Map<string, ModOption[]>>()

function optionFitsSlot(mod: ModOption, slot: string) {
  const line = mod.line.toLowerCase()
  const tags = (mod.tags || []).map(tag => tag.toLowerCase())
  const specialOrigin = /(influence_mod|delve|incursion|essence|veiled|crafted|fractured|eldritch|corruption|synthesis|abyss)/i
  if (!['prefix', 'suffix'].includes((mod.type || '').toLowerCase())) return false
  if (specialOrigin.test(tags.join(' ')) || specialOrigin.test(mod.id || '')) return false
  if (/^(default|str_int_armour|str_animal_charm|[a-z]+_[a-z_]+)$/.test(line.trim())) return false
  if (line.includes('default') || /(?:^|\s)[a-z]+_[a-z_]+(?:\s|$)/.test(line)) return false
  const isJewel = slot === 'jewel'
  const isFlask = slot === 'flask'
  const isCluster = /cluster jewel|added small passive|added passive skills grant/i.test(line)
  const needsSocket = /socketed|socket/i.test(line)
  const isSocketBase = /unset ring/i.test(slot) || /body|helmet|gloves|boots|weapon|shield|offhand|bow|twohand/i.test(slot)
  if (isCluster && !/cluster/i.test(slot)) return false
  if (needsSocket && !isSocketBase) return false
  if (isFlask) return !/(socketed|claw|bow|sword|axe|mace|dagger|wand|sceptre|staff|cluster|jewel|melee gem|spell skill gem|attack damage)/i.test(line)
  if (isJewel) return !/(socketed|flask|with this weapon|cluster|fishing|armour|evasion rating|energy shield|ward|attack speed with|damage with (?:claw|bow|sword|axe|mace|dagger|wand|sceptre|staff))/i.test(line)
  if (['weapon', 'twohand'].includes(slot)) return !/(flask|cluster jewel|fishing|added small passive)/i.test(line)
  if (slot === 'boots' || slot === 'gloves' || slot === 'helmet' || slot === 'body') {
    return !/(with this weapon|socketed attacks|attack skills|claw|bow|sword|axe|mace|dagger|wand|sceptre|weapon damage)/i.test(line)
  }
  if (slot === 'ring1' || slot === 'ring2' || slot === 'amulet' || slot === 'belt') {
    return !/(with this weapon|socketed|cluster|fishing|flask|claw|bow|sword|axe|mace|dagger|wand|sceptre|staff|attack speed with)/i.test(line)
  }
  return true
}

export function modOptionsForItem(item: ItemDetail | undefined, baseMods: any): ModOption[] {
  const base = baseMods?.bases?.[item?.base || '']
  const fullMods = baseMods?.mods || {}
  if (!baseMods || typeof baseMods !== 'object') return []
  const key = `${item?.base || ''}|${item?.slot || base?.slot || ''}`
  let cached = optionCache.get(baseMods)?.get(key)
  if (cached) return cached
  const ids = (base?.eligible_mods || []).map((entry: string | [string, number]) => Array.isArray(entry) ? entry[0] : entry)
  const source = ids.length ? ids.map((id: string) => fullMods[id]).filter(Boolean) : []
  const result = (source as ModEntry[]).flatMap(mod => (mod.lines || [mod.line]).filter((line): line is string => Boolean(line)).map(line => ({ ...mod, line })))
    .filter(mod => optionFitsSlot(mod, item?.slot || base?.slot || ''))
  if (!optionCache.has(baseMods)) optionCache.set(baseMods, new Map())
  optionCache.get(baseMods)!.set(key, result)
  return result
}

function nums(text: string) {
  return [...text.matchAll(/[+-]?\d+(?:\.\d+)?/g)].map(x => Number(x[0]))
}

function shape(text: string) {
  return text
    .toLowerCase()
    .replace(/[+-]?\d+(?:\.\d+)?/g, '#')
    .replace(/[()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function inRanges(stat: string, template: string) {
  const values = nums(stat)
  const parts = [...template.matchAll(/\(([-+]?\d+(?:\.\d+)?)\s*-\s*([-+]?\d+(?:\.\d+)?)\)|[-+]?\d+(?:\.\d+)?/g)]
  if (!values.length || !parts.length) return shape(stat) === shape(template)
  let i = 0
  for (const part of parts) {
    if (i >= values.length) break
    const raw = part[0]
    const value = values[i++]
    if (part[1] !== undefined && part[2] !== undefined) {
      const lo = Number(part[1])
      const hi = Number(part[2])
      if (value < Math.min(lo, hi) || value > Math.max(lo, hi)) return false
    } else if (Number(raw) !== value) {
      return false
    }
  }
  return true
}

function modPower(mod: ModEntry) {
  return nums(mod.line || '').reduce((acc, n) => acc + Math.abs(n), 0)
}

export function tierForStat(item: ItemDetail | undefined, stat: string, baseMods: any): TierInfo {
  const clean = stat.replace(/^â€¢\s*/, '').replace(/^•\s*/, '').trim()
  const base = baseMods?.bases?.[item?.base || '']
  const fullMods = baseMods?.mods || {}
  const eligible = (base?.eligible_mods || [])
    .map((entry: string | [string, number]) => Array.isArray(entry) ? entry[0] : entry)
    .map((id: string) => fullMods[id])
    .filter(Boolean)
    .flatMap((mod: ModEntry) => (mod.lines || [mod.line]).filter(Boolean).map(line => ({ ...mod, line })))
  // The complete catalog may omit per-base expansion to keep the browser
  // payload small. Exact line matching against all PoE 1 mods remains
  // deterministic; it never invents a tier when no source line matches.
  const mods: ModEntry[] = eligible.length
    ? eligible
    : Object.values(fullMods) as ModEntry[]
  const exact = mods.find(mod => mod.line && shape(mod.line) === shape(clean) && inRanges(clean, mod.line))
  const matched = exact || mods.find(mod => mod.line && shape(mod.line) === shape(clean))
  if (!matched) return { line: clean, affix: '', group: '', tier: null, tierModel: item?.slot === 'jewel' ? 'tierless' : 'tiered' }

  const family = mods
    .filter(mod => mod.group === matched.group && mod.type === matched.type && mod.line)
    .sort((a, b) => ((b.min_item_level || 0) - (a.min_item_level || 0)) || (modPower(b) - modPower(a)))

  const seen = new Set<string>()
  const tiers = family.filter(mod => {
    const key = `${mod.id}|${mod.line}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  const idx = tiers.findIndex(mod => mod.id === matched.id && mod.line === matched.line)
  return {
    line: clean,
    affix: matched.type || '',
    group: matched.group || '',
    tier: item?.slot === 'jewel' ? null : idx >= 0 ? idx + 1 : null,
    source: (matched as ModEntry & { source?: string }).source || '',
    tags: (matched as ModEntry & { tags?: string[] }).tags || [],
    minItemLevel: matched.min_item_level,
    modId: matched.id,
    tierModel: item?.slot === 'jewel' ? 'tierless' : 'tiered',
  }
}

