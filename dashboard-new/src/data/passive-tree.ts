import type { PassiveTreeData, PassiveTreeNode } from '../types/build'

type RawTree = { min_x: number; min_y: number; max_x: number; max_y: number; nodes: Record<string, any>; groups: Record<string, { x: number; y: number }>; classes: Array<{ name: string }>; constants: { skillsPerOrbit: number[]; orbitRadii: number[] } }
let treeCache: Promise<PassiveTreeData> | undefined

export async function loadPassiveTree(): Promise<PassiveTreeData> {
  if (treeCache) return treeCache
  treeCache = loadPassiveTreeUncached()
  return treeCache
}

async function loadPassiveTreeUncached(): Promise<PassiveTreeData> {
  const raw = await fetch('/poe-tree/skilltree-3.28.json').then(response => {
    if (!response.ok) throw new Error('Não foi possível carregar a árvore passiva 3.28.')
    return response.json() as Promise<RawTree>
  })
  const classStarts: Record<string, string> = {}
  for (const [id, node] of Object.entries(raw.nodes)) if (Number.isInteger(node.classStartIndex)) classStarts[raw.classes[node.classStartIndex]?.name] = id
  const nodes: Record<string, any> = Object.fromEntries(Object.entries(raw.nodes).map(([id, node]) => {
    const group = raw.groups[String(node.group)] || { x: 0, y: 0 }
    const orbit = node.orbit || 0
    const angle = (node.orbitIndex || 0) * Math.PI * 2 / (raw.constants.skillsPerOrbit[orbit] || 1)
    const radius = raw.constants.orbitRadii[orbit] || 0
    return [id, { id, name: node.name, x: group.x + Math.sin(angle) * radius, y: group.y - Math.cos(angle) * radius, stats: node.stats || [], isNotable: node.isNotable, isKeystone: node.isKeystone, isMastery: node.isMastery, out: node.out || [], neighbors: [] }]
  }))
  const reverse = new Map<string, string[]>()
  for (const node of Object.values(nodes)) for (const target of node.out) reverse.set(target, [...(reverse.get(target) || []), node.id])
  for (const node of Object.values(nodes)) node.neighbors = [...new Set([...node.out, ...(reverse.get(node.id) || [])])]
  return { version: '3.28', min_x: raw.min_x, min_y: raw.min_y, max_x: raw.max_x, max_y: raw.max_y, nodes, classes: raw.classes.map(item => ({ name: item.name, startNodeId: classStarts[item.name] || '' })) }
}

export function disconnectedNodes(selected: string[], tree?: PassiveTreeData, className?: string) {
  if (!tree || !selected.length) return []
  const start = tree.classes.find(item => item.name.toLowerCase() === className?.toLowerCase())?.startNodeId
  if (!start) return selected
  const allowed = new Set(selected)
  allowed.add(start)
  const seen = new Set<string>([start])
  const queue = [start]
  while (queue.length) {
    const current = queue.shift()!
    for (const next of tree.nodes[current]?.neighbors || []) if (allowed.has(next) && !seen.has(next)) { seen.add(next); queue.push(next) }
  }
  return selected.filter(id => !seen.has(id))
}

export interface PassiveTreeGenerationStats {
  requested: number
  generated: number
  connected: boolean
  disconnected: number
  maxDepth: number
  frontierRemaining: number
  travel: number
  travelRatio: number
  regions: number
  proposals?: number
  beamWidth?: number
}

type TreeState = { selected: Set<string>; score: number; regions: Set<string>; proposals: number }
type TreeProposal = { target: string; path: string[]; cost: number; value: number; efficiency: number }

const useful = /\blife|energy shield|armour|evasion|resistance|suppress|block|damage|attack|spell|critical|crit|speed|mana|reservation|leech|regeneration|recovery|charge|ailment|elemental|projectile|bow|lightning|cold|fire|chaos|physical\b/i
const avoid = /\bminion|totem|brand|trap|mine\b/i

function sector(node: PassiveTreeNode) {
  return `${Math.round(node.x / 500)}:${Math.round(node.y / 500)}`
}

function nodeValue(node?: PassiveTreeNode) {
  if (!node) return 0
  const text = `${node.name} ${node.stats.join(' ')}`
  let score = 0
  if (node.isKeystone) score += 22
  if (node.isNotable) score += 18
  if (node.isMastery) score += 8
  score += node.stats.filter(stat => useful.test(stat)).length * 5
  score -= node.stats.filter(stat => avoid.test(stat)).length * 2
  if (useful.test(text)) score += 4
  if (avoid.test(text) && !useful.test(text)) score -= 6
  return score
}

function pathsFromSelected(tree: PassiveTreeData, selected: Set<string>, maxCost: number) {
  const queue = [...selected]
  const seen = new Set(selected)
  const depth = new Map<string, number>([...selected].map(id => [id, 0]))
  const parent = new Map<string, string>()
  while (queue.length) {
    const current = queue.shift()!
    const currentDepth = depth.get(current) || 0
    if (currentDepth >= maxCost) continue
    if (tree.nodes[current]?.isMastery) continue
    for (const next of tree.nodes[current]?.neighbors || []) {
      if (seen.has(next)) continue
      const node = tree.nodes[next]
      if (!node) continue
      seen.add(next)
      parent.set(next, current)
      depth.set(next, currentDepth + 1)
      queue.push(next)
    }
  }
  return { depth, parent }
}

function pathTo(parent: Map<string, string>, selected: Set<string>, target: string) {
  const path = [target]
  let current = target
  while (parent.has(current)) {
    current = parent.get(current)!
    if (selected.has(current)) break
    path.push(current)
  }
  return path.reverse()
}

function proposalsForState(tree: PassiveTreeData, state: TreeState, remaining: number) {
  const maxCost = Math.min(remaining, 8)
  const paths = pathsFromSelected(tree, state.selected, maxCost)
  const candidates = Object.values(tree.nodes)
    .filter(node => !state.selected.has(node.id) && paths.depth.has(node.id) && (node.isNotable || node.isKeystone || node.isMastery))
    .sort((a, b) => nodeValue(b) - nodeValue(a))
    .slice(0, 90)
  const proposals: TreeProposal[] = []
  for (const node of candidates) {
    const path = pathTo(paths.parent, state.selected, node.id)
    if (!path.length || path.length > remaining || path.length > maxCost) continue
    const travel = path.filter(id => {
      const pathNode = tree.nodes[id]
      return pathNode && !pathNode.isNotable && !pathNode.isKeystone && !pathNode.isMastery && !pathNode.stats.some(stat => useful.test(stat))
    }).length
    const regionPenalty = path.some(id => !state.regions.has(sector(tree.nodes[id]))) && state.regions.size >= 4 ? 8 : 0
    const value = path.reduce((sum, id) => sum + nodeValue(tree.nodes[id]), 0) - travel * 4 - regionPenalty
    proposals.push({ target: node.id, path, cost: path.length, value, efficiency: value / Math.max(1, path.length) })
  }
  return proposals.sort((a, b) => b.efficiency - a.efficiency || b.value - a.value).slice(0, 6)
}

function fillConnected(tree: PassiveTreeData, state: TreeState, budget: number) {
  while (state.selected.size < budget) {
    const frontier = [...state.selected].flatMap(id => tree.nodes[id]?.neighbors || []).filter(id => !state.selected.has(id) && tree.nodes[id])
    const ranked = [...new Set(frontier)].map(id => {
      const node = tree.nodes[id]
      const regionPenalty = state.regions.has(sector(node)) ? 0 : 4
      return { id, score: nodeValue(node) - regionPenalty + Math.min(2, node.neighbors?.length || 0) }
    }).sort((a, b) => b.score - a.score)
    const next = ranked[0]?.id
    if (!next) break
    state.selected.add(next)
    state.regions.add(sector(tree.nodes[next]))
  }
  return state
}

export function generateRandomTreeResult(tree: PassiveTreeData, className: string, budget: number, seed = Math.random()) {
  const start = tree.classes.find(item => item.name.toLowerCase() === className.toLowerCase())?.startNodeId
  if (!start || !tree.nodes[start]) return { nodes: [], stats: { requested: budget, generated: 0, connected: false, disconnected: 0, maxDepth: 0, frontierRemaining: 0, travel: 0, travelRatio: 0, regions: 0 } }
  const distance = new Map<string, number>([[start, 0]])
  const distanceQueue = [start]
  while (distanceQueue.length) {
    const current = distanceQueue.shift()!
    for (const next of tree.nodes[current]?.neighbors || []) if (!distance.has(next)) { distance.set(next, distance.get(current)! + 1); distanceQueue.push(next) }
  }
  const requested = Math.max(1, Math.min(123, budget))
  const beamWidth = 6
  let beam: TreeState[] = [{ selected: new Set([start]), score: 0, regions: new Set([sector(tree.nodes[start])]), proposals: 0 }]
  while (beam.some(state => state.selected.size < requested)) {
    const expanded: TreeState[] = []
    for (const state of beam) {
      const remaining = requested - state.selected.size
      if (remaining <= 0) { expanded.push(state); continue }
      for (const proposal of proposalsForState(tree, state, remaining)) {
        const nextSelected = new Set(state.selected)
        const nextRegions = new Set(state.regions)
        for (const id of proposal.path) {
          nextSelected.add(id)
          nextRegions.add(sector(tree.nodes[id]))
        }
        expanded.push({ selected: nextSelected, regions: nextRegions, score: state.score + proposal.value - proposal.cost * 1.5, proposals: state.proposals + 1 })
      }
    }
    if (!expanded.length) break
    beam = expanded.sort((a, b) => b.score - a.score || a.selected.size - b.selected.size).slice(0, beamWidth)
    if (beam[0].selected.size >= requested) break
  }
  const best = fillConnected(tree, beam.sort((a, b) => b.score - a.score)[0], requested)
  const nodes = [...best.selected].slice(0, requested)
  const disconnected = disconnectedNodes(nodes, tree, className).length
  const frontierRemaining = new Set(nodes.flatMap(id => tree.nodes[id]?.neighbors || [])).size - best.selected.size
  const travel = nodes.filter(id => { const node = tree.nodes[id]; return node && !node.isNotable && !node.isKeystone && !node.isMastery && !node.stats.length }).length
  return { nodes, stats: { requested, generated: nodes.length, connected: disconnected === 0, disconnected, maxDepth: Math.max(...nodes.map(id => distance.get(id) || 0)), frontierRemaining: Math.max(0, frontierRemaining), travel, travelRatio: nodes.length ? travel / nodes.length : 0, regions: best.regions.size, proposals: best.proposals, beamWidth } }
}

export function generateRandomTree(tree: PassiveTreeData, className: string, budget: number, seed = Math.random()) {
  return generateRandomTreeResult(tree, className, budget, seed).nodes
}
