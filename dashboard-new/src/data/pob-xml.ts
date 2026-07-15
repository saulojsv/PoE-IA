import type { BuildDraft, DraftItem } from '../types/build'
import { emptyDraft } from './drafts'

function attr(element: Element | null, name: string) { return element?.getAttribute(name) || '' }
function textLines(element: Element | null) { return (element?.textContent || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean) }

export function parsePobXml(xml: string, fileName = 'Imported PoB.xml'): BuildDraft {
  const document = new DOMParser().parseFromString(xml, 'application/xml')
  const parserError = document.querySelector('parsererror')
  const build = document.querySelector('PathOfBuilding > Build')
  if (parserError || !build) throw new Error('Este arquivo não é um export XML válido do Path of Building.')
  const draft = emptyDraft()
  draft.source = 'xml'
  draft.sourceFile = fileName
  draft.name = fileName.replace(/\.xml$/i, '') || 'Imported PoB build'
  draft.level = Number(attr(build, 'level')) || 1
  draft.className = attr(build, 'className')
  draft.ascendancy = attr(build, 'ascendClassName')
  const spec = document.querySelector('Tree > Spec')
  draft.nodes = (attr(spec, 'nodes').match(/\d+/g) || [])

  const groups = Array.from(document.querySelectorAll('SkillSet Skill'))
  draft.gems = groups.flatMap(group => Array.from(group.querySelectorAll('Gem')).map(gem => attr(gem, 'nameSpec') || attr(gem, 'name'))).filter(Boolean)
  draft.skill = draft.gems.find(gem => !/support/i.test(gem)) || draft.gems[0] || ''

  const items: DraftItem[] = []
  Array.from(document.querySelectorAll('Items Item')).forEach((node, index) => {
    const lines = textLines(node)
    const base = lines.find(line => /^(Item Class:|Rarity:)/.test(line)) ? (lines.find(line => !/^(Item Class:|Rarity:|--------)/.test(line)) || 'Unknown base') : 'Unknown base'
    const rarityLine = lines.find(line => line.startsWith('Rarity:')) || 'Rarity: Rare'
    const nameIndex = lines.findIndex(line => line === rarityLine)
    const name = lines[nameIndex + 1] || base
    const baseType = lines[nameIndex + 2] || base
    const separator = lines.lastIndexOf('--------')
    items.push({ id: `xml-${index}-${name}`, name, base: baseType, rarity: rarityLine.replace('Rarity:', '').trim(), item_level: Number((lines.find(line => /Item Level:/i.test(line)) || '').match(/\d+/)?.[0]) || 0, slot: '', implicits: [], explicits: separator >= 0 ? lines.slice(separator + 1).filter(line => !/^(Item Level:|Quality:|Requirements:)/i.test(line)) : [] })
  })
  draft.items = items
  return draft
}
