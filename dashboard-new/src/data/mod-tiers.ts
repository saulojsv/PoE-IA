import type { ItemDetail } from '../types/build'

type ModEntry = {
  id?: string
  type?: string
  group?: string
  min_item_level?: number
  line?: string
  lines?: string[]
}

export type TierInfo = {
  line: string
  affix: string
  group: string
  tier: number | null
  source?: string
  tags?: string[]
  minItemLevel?: number
}

export type ModOption = ModEntry & { line: string }

export function modOptionsForItem(item: ItemDetail | undefined, baseMods: any): ModOption[] {
  const base = baseMods?.bases?.[item?.base || '']
  const fullMods = baseMods?.mods || {}
  const ids = (base?.eligible_mods || []).map((entry: string | [string, number]) => Array.isArray(entry) ? entry[0] : entry)
  const source = ids.length ? ids.map((id: string) => fullMods[id]).filter(Boolean) : Object.values(fullMods)
  return (source as ModEntry[]).flatMap(mod => (mod.lines || [mod.line]).filter((line): line is string => Boolean(line)).map(line => ({ ...mod, line })))
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
  if (!matched) return { line: clean, affix: '', group: '', tier: null }

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
    tier: idx >= 0 ? idx + 1 : null,
    source: (matched as ModEntry & { source?: string }).source || '',
    tags: (matched as ModEntry & { tags?: string[] }).tags || [],
    minItemLevel: matched.min_item_level,
  }
}

