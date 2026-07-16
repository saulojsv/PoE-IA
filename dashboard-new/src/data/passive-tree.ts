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
}

export function generateRandomTreeResult(tree: PassiveTreeData, className: string, budget: number, seed = Math.random()) {
  const start = tree.classes.find(item => item.name.toLowerCase() === className.toLowerCase())?.startNodeId
  if (!start || !tree.nodes[start]) return { nodes: [], stats: { requested: budget, generated: 0, connected: false, disconnected: 0, maxDepth: 0, frontierRemaining: 0, travel: 0, travelRatio: 0, regions: 0 } }
  const selected = new Set<string>([start])
  const distance = new Map<string, number>([[start, 0]])
  const distanceQueue = [start]
  while (distanceQueue.length) {
    const current = distanceQueue.shift()!
    for (const next of tree.nodes[current]?.neighbors || []) if (!distance.has(next)) { distance.set(next, distance.get(current)! + 1); distanceQueue.push(next) }
  }
  let state = Math.floor(seed * 0x7fffffff) || 1
  const random = () => { state = (state * 48271) % 0x7fffffff; return state / 0x7fffffff }
  const sector = (node: PassiveTreeNode) => `${Math.round(node.x / 500)}:${Math.round(node.y / 500)}`
  const sectorCounts = new Map<string, number>()
  sectorCounts.set(sector(tree.nodes[start]), 1)
  const leadsToNotable = (origin: PassiveTreeNode) => {
    const seen = new Set([origin.id])
    const queue: Array<[string, number]> = [[origin.id, 0]]
    while (queue.length) {
      const [id, depth] = queue.shift()!
      if (depth > 0 && tree.nodes[id]?.isNotable) return true
      if (depth >= 6) continue
      for (const next of tree.nodes[id]?.neighbors || []) if (!seen.has(next) && !tree.nodes[next]?.isMastery) { seen.add(next); queue.push([next, depth + 1]) }
    }
    return false
  }
  while (selected.size < budget) {
    const frontier = [...selected].flatMap(id => (tree.nodes[id]?.neighbors || []).map(nodeId => tree.nodes[nodeId]).filter(node => node && !selected.has(node.id)))
    if (!frontier.length) break
    const unique = [...new Map(frontier.map(node => [node.id, node])).values()].filter(node => node.isNotable || node.isKeystone || node.isMastery || leadsToNotable(node))
    if (!unique.length) break
    const ranked = unique.map(node => {
      const key = sector(node)
      const count = sectorCounts.get(key) || 0
      const degree = node.neighbors?.length || 0
      const newRegionPenalty = count === 0 && sectorCounts.size >= 3 ? 10 : 0
      const travelPenalty = node.isNotable || node.isKeystone || node.isMastery ? 0 : 2.5
      const score = (node.isKeystone ? 10 : node.isNotable ? 8 : node.isMastery ? 2 : 0) + node.stats.length * 1.5 + Math.min(2, degree * .2) - (distance.get(node.id) || 0) * .8 - count * 1.2 - newRegionPenalty - travelPenalty
      return { node, score }
    }).sort((a, b) => b.score - a.score).slice(0, 12)
    const weighted = ranked.map(item => ({ node: item.node, weight: Math.max(.2, item.score - ranked[ranked.length - 1].score + 1) }))
    const total = weighted.reduce((sum, item) => sum + item.weight, 0)
    let pick = random() * total
    const chosen = (weighted.find(item => (pick -= item.weight) <= 0) || weighted[0]).node
    selected.add(chosen.id)
    const key = sector(chosen)
    sectorCounts.set(key, (sectorCounts.get(key) || 0) + 1)
  }
  const nodes = [...selected]
  const disconnected = disconnectedNodes(nodes, tree, className).length
  const frontierRemaining = new Set(nodes.flatMap(id => tree.nodes[id]?.neighbors || [])).size - selected.size
  const travel = nodes.filter(id => { const node = tree.nodes[id]; return node && !node.isNotable && !node.isKeystone && !node.isMastery && !node.stats.length }).length
  return { nodes, stats: { requested: budget, generated: nodes.length, connected: disconnected === 0, disconnected, maxDepth: Math.max(...nodes.map(id => distance.get(id) || 0)), frontierRemaining: Math.max(0, frontierRemaining), travel, travelRatio: nodes.length ? travel / nodes.length : 0, regions: sectorCounts.size } }
}

export function generateRandomTree(tree: PassiveTreeData, className: string, budget: number, seed = Math.random()) {
  return generateRandomTreeResult(tree, className, budget, seed).nodes
}
