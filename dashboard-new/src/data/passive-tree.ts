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
    return [id, { id, name: node.name, group: String(node.group || ''), x: group.x + Math.sin(angle) * radius, y: group.y - Math.cos(angle) * radius, stats: node.stats || [], isNotable: node.isNotable, isKeystone: node.isKeystone, isMastery: node.isMastery, isJewelSocket: node.isJewelSocket, isClassStart: Number.isInteger(node.classStartIndex), out: node.out || [], neighbors: [] }]
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
  paidPoints?: number
  travelByReason?: number
  investment?: number
  touchedClusters?: number
  completedClusters?: number
  travelOnlyClusters?: number
  incompleteClusters?: number
  badLeaves?: number
  redundantNodes?: number
  proposalsAccepted?: number
  proposalsRejected?: number
  prunedNodes?: number
  travelJustified?: number
  travelQuestionable?: number
  branches?: number
  directions?: number
  masteries?: number
  keystones?: number
  sockets?: number
  score?: number
  generationMs?: number
  proposals?: number
  beamWidth?: number
  seed?: number
  requestedClass?: string
  resolvedClass?: string
  startNodeId?: string
  fallbackUsed?: boolean
}

type SelectionReason = 'path' | 'hybrid' | 'investment' | 'fill'
type TreeState = { selected: Set<string>; score: number; regions: Set<string>; reasons: Map<string, SelectionReason>; proposals: number; rejected: number }
type TreeProposal = { target: string; path: string[]; cost: number; value: number; efficiency: number }

const useful = /\blife|energy shield|armour|evasion|resistance|suppress|block|damage|attack|spell|critical|crit|speed|mana|reservation|leech|regeneration|recovery|charge|ailment|elemental|projectile|bow|lightning|cold|fire|chaos|physical\b/i
const avoid = /\bminion|totem|brand|trap|mine\b/i

function sector(node: PassiveTreeNode) {
  return `${Math.round(node.x / 500)}:${Math.round(node.y / 500)}`
}

function macroRegion(node: PassiveTreeNode) {
  return `${Math.round(node.x / 1800)}:${Math.round(node.y / 1800)}`
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

function selectionReason(node: PassiveTreeNode, isTarget: boolean): SelectionReason {
  if (isTarget) return 'investment'
  return nodeValue(node) >= 10 ? 'hybrid' : 'path'
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
      if (node.isClassStart) continue
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

function proposalsForState(tree: PassiveTreeData, state: TreeState, remaining: number, random: () => number) {
  const maxCost = Math.min(remaining, 8)
  const paths = pathsFromSelected(tree, state.selected, maxCost)
  const candidates = Object.values(tree.nodes)
    .filter(node => !state.selected.has(node.id) && paths.depth.has(node.id) && (node.isNotable || node.isKeystone || node.isMastery))
    .sort((a, b) => nodeValue(b) - nodeValue(a) || random() - .5)
    .slice(0, 90)
  const proposals: TreeProposal[] = []
  for (const node of candidates) {
    const path = pathTo(paths.parent, state.selected, node.id)
    if (!path.length || path.length > remaining || path.length > maxCost) continue
    const travel = path.filter(id => {
      const pathNode = tree.nodes[id]
      return pathNode && !pathNode.isNotable && !pathNode.isKeystone && !pathNode.isMastery && !pathNode.stats.some(stat => useful.test(stat))
    }).length
    const newRegions = path.filter(id => !state.regions.has(sector(tree.nodes[id]))).length
    const regionPenalty = newRegions && state.regions.size >= 4 ? 8 + Math.max(0, state.regions.size - 6) ** 2 : 0
    const value = path.reduce((sum, id) => sum + nodeValue(tree.nodes[id]), 0) - travel * 4 - regionPenalty
    const jitter = (random() - .5) * 3
    const adjusted = value + jitter
    const efficiency = adjusted / Math.max(1, path.length)
    if (efficiency >= 2.5 || node.isKeystone) proposals.push({ target: node.id, path, cost: path.length, value: adjusted, efficiency })
  }
  return proposals.sort((a, b) => b.efficiency - a.efficiency || b.value - a.value || random() - .5).slice(0, 10)
}

function fillConnected(tree: PassiveTreeData, state: TreeState, budget: number, random: () => number) {
  while (state.selected.size < budget) {
    const frontier = [...state.selected].flatMap(id => tree.nodes[id]?.neighbors || []).filter(id => !state.selected.has(id) && tree.nodes[id] && !tree.nodes[id].isClassStart)
    const ranked = [...new Set(frontier)].map(id => {
      const node = tree.nodes[id]
      const onward = (node.neighbors || []).filter(next => !state.selected.has(next) && tree.nodes[next] && !tree.nodes[next].isClassStart)
      const objectiveNearby = onward.some(next => {
        const target = tree.nodes[next]
        return target?.isNotable || target?.isKeystone || target?.isMastery || target?.isJewelSocket || nodeValue(target) >= 10
      })
      const regionPenalty = state.regions.has(sector(node)) ? 0 : 4
      const weakLeafPenalty = nodeValue(node) < 10 && onward.length <= 1 ? 12 : 0
      return { id, score: nodeValue(node) - regionPenalty - weakLeafPenalty + Math.min(3, onward.length) + (objectiveNearby ? 8 : 0) + (random() - .5) * 2 }
    }).filter(item => item.score > -8).sort((a, b) => b.score - a.score)
    const next = ranked.slice(0, 4)[Math.floor(random() * Math.min(4, ranked.length))]?.id
    if (!next) break
    state.selected.add(next)
    state.regions.add(sector(tree.nodes[next]))
  }
  return state
}

function pruneWeakLeaves(tree: PassiveTreeData, state: TreeState, start: string) {
  let pruned = 0
  while (true) {
    const selected = new Set(state.selected)
    const removable = [...state.selected].filter(id => {
      if (id === start || tree.nodes[id]?.isClassStart) return false
      const node = tree.nodes[id]
      const degree = (node?.neighbors || []).filter(next => selected.has(next)).length
      return degree <= 1 && nodeValue(node) < 10 && !node?.isNotable && !node?.isKeystone && !node?.isMastery
    }).sort((a, b) => nodeValue(tree.nodes[a]) - nodeValue(tree.nodes[b]))
    const next = removable[0]
    if (!next) break
    state.selected.delete(next)
    state.reasons.delete(next)
    pruned += 1
  }
  return pruned
}

function connectedWithout(tree: PassiveTreeData, selected: Set<string>, start: string, removed: string) {
  const allowed = new Set([...selected].filter(id => id !== removed))
  const seen = new Set<string>([start])
  const queue = [start]
  while (queue.length) {
    const current = queue.shift()!
    for (const next of tree.nodes[current]?.neighbors || []) if (allowed.has(next) && !seen.has(next)) { seen.add(next); queue.push(next) }
  }
  return [...allowed].every(id => seen.has(id))
}

function removableRedundantNodes(tree: PassiveTreeData, state: TreeState, start: string) {
  return [...state.selected].filter(id => {
    const node = tree.nodes[id]
    if (!node || id === start || node.isClassStart || node.isNotable || node.isKeystone || node.isMastery) return false
    if (nodeValue(node) >= 4 || state.reasons.get(id) === 'investment') return false
    return connectedWithout(tree, state.selected, start, id)
  })
}

function pruneRedundant(tree: PassiveTreeData, state: TreeState, start: string) {
  let pruned = 0
  while (true) {
    const next = removableRedundantNodes(tree, state, start).sort((a, b) => nodeValue(tree.nodes[a]) - nodeValue(tree.nodes[b]))[0]
    if (!next) break
    state.selected.delete(next)
    state.reasons.delete(next)
    pruned += 1
  }
  return pruned
}

export function generateRandomTreeResult(tree: PassiveTreeData, className: string, budget: number, seed = Math.random()) {
  const started = performance.now()
  const resolvedClass = tree.classes.find(item => item.name.toLowerCase() === className.toLowerCase())
  const start = resolvedClass?.startNodeId
  if (!start || !tree.nodes[start]) return { nodes: [], stats: { requested: budget, generated: 0, connected: false, disconnected: 0, maxDepth: 0, frontierRemaining: 0, travel: 0, travelRatio: 0, regions: 0 } }
  const distance = new Map<string, number>([[start, 0]])
  const distanceQueue = [start]
  while (distanceQueue.length) {
    const current = distanceQueue.shift()!
    for (const next of tree.nodes[current]?.neighbors || []) if (!distance.has(next)) { distance.set(next, distance.get(current)! + 1); distanceQueue.push(next) }
  }
  const requested = Math.max(1, Math.min(123, budget))
  const internalBudget = requested + 1
  let rngState = Math.floor(seed * 0x7fffffff) || 1
  const random = () => { rngState = (rngState * 48271) % 0x7fffffff; return rngState / 0x7fffffff }
  const beamWidth = 10
  let beam: TreeState[] = [{ selected: new Set([start]), score: 0, regions: new Set([sector(tree.nodes[start])]), reasons: new Map([[start, 'path']]), proposals: 0, rejected: 0 }]
  while (beam.some(state => state.selected.size < internalBudget)) {
    const expanded: TreeState[] = []
    for (const state of beam) {
      const remaining = internalBudget - state.selected.size
      if (remaining <= 0) { expanded.push(state); continue }
      const proposals = proposalsForState(tree, state, remaining, random)
      for (const proposal of proposals) {
        const nextSelected = new Set(state.selected)
        const nextRegions = new Set(state.regions)
        const nextReasons = new Map(state.reasons)
        for (const id of proposal.path) {
          nextSelected.add(id)
          nextRegions.add(sector(tree.nodes[id]))
          if (!nextReasons.has(id) || id === proposal.target) nextReasons.set(id, selectionReason(tree.nodes[id], id === proposal.target))
        }
        expanded.push({ selected: nextSelected, regions: nextRegions, reasons: nextReasons, score: state.score + proposal.value - proposal.cost * 1.5, proposals: state.proposals + 1, rejected: state.rejected + Math.max(0, proposals.length - 1) })
      }
    }
    if (!expanded.length) break
    beam = expanded.sort((a, b) => b.score - a.score || random() - .5).slice(0, beamWidth)
    if (beam[0].selected.size >= internalBudget) break
  }
  const best = beam.sort((a, b) => b.score - a.score || random() - .5).slice(0, 3)[Math.floor(random() * Math.min(3, beam.length))]
  let prunedNodes = 0
  for (let i = 0; i < 4; i += 1) {
    prunedNodes += pruneWeakLeaves(tree, best, start)
    prunedNodes += pruneRedundant(tree, best, start)
    fillConnected(tree, best, internalBudget, random)
  }
  const nodes = [...best.selected].filter(id => id !== start && !tree.nodes[id]?.isClassStart).slice(0, requested)
  for (const id of nodes) if (!best.reasons.has(id)) best.reasons.set(id, nodeValue(tree.nodes[id]) >= 10 ? 'investment' : 'fill')
  const disconnected = disconnectedNodes(nodes, tree, className).length
  const frontierRemaining = new Set(nodes.flatMap(id => tree.nodes[id]?.neighbors || [])).size - best.selected.size
  const selectedSet = new Set([...nodes, start])
  const travel = nodes.filter(id => best.reasons.get(id) === 'path' || best.reasons.get(id) === 'fill').length
  const groups = new Map<string, string[]>()
  for (const id of nodes) {
    const key = tree.nodes[id]?.group || `node:${id}`
    groups.set(key, [...(groups.get(key) || []), id])
  }
  let completedClusters = 0, travelOnlyClusters = 0, incompleteClusters = 0
  for (const ids of groups.values()) {
    const hasObjective = ids.some(id => tree.nodes[id]?.isNotable || tree.nodes[id]?.isKeystone || tree.nodes[id]?.isMastery)
    if (hasObjective) completedClusters += 1
    else travelOnlyClusters += 1
  }
  const routeDegree = (id: string) => (tree.nodes[id]?.neighbors || []).filter(next => selectedSet.has(next)).length
  const badLeaves = nodes.filter(id => routeDegree(id) <= 1 && nodeValue(tree.nodes[id]) < 10 && !tree.nodes[id]?.isNotable && !tree.nodes[id]?.isKeystone && !tree.nodes[id]?.isMastery && !tree.nodes[id]?.isJewelSocket).length
  const redundantNodes = removableRedundantNodes(tree, best, start).length
  const strategicRegions = new Set(nodes.map(id => macroRegion(tree.nodes[id]))).size
  const startNode = tree.nodes[start]
  const directionSet = new Set(nodes.map(id => {
    const node = tree.nodes[id]
    const dx = node.x - startNode.x, dy = node.y - startNode.y
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N')
  }))
  const branches = nodes.filter(id => routeDegree(id) >= 3).length
  const masteries = nodes.filter(id => tree.nodes[id]?.isMastery).length
  const keystones = nodes.filter(id => tree.nodes[id]?.isKeystone).length
  const sockets = nodes.filter(id => tree.nodes[id]?.isJewelSocket).length
  const travelQuestionable = badLeaves + redundantNodes
  const generationMs = Math.round(performance.now() - started)
  return { nodes, stats: { requested, generated: nodes.length, connected: disconnected === 0, disconnected, maxDepth: Math.max(...nodes.map(id => distance.get(id) || 0)), frontierRemaining: Math.max(0, frontierRemaining), travel, travelRatio: nodes.length ? travel / nodes.length : 0, regions: strategicRegions, paidPoints: nodes.length, travelByReason: travel, investment: nodes.length - travel, touchedClusters: groups.size, completedClusters, travelOnlyClusters, incompleteClusters, badLeaves, redundantNodes, prunedNodes, travelJustified: Math.max(0, travel - travelQuestionable), travelQuestionable, branches, directions: directionSet.size, masteries, keystones, sockets, score: Math.round(best.score), generationMs, proposals: best.proposals, proposalsAccepted: best.proposals, proposalsRejected: best.rejected, beamWidth, seed, requestedClass: className, resolvedClass: resolvedClass?.name || className, startNodeId: start, fallbackUsed: false } }
}

export function generateRandomTree(tree: PassiveTreeData, className: string, budget: number, seed = Math.random()) {
  return generateRandomTreeResult(tree, className, budget, seed).nodes
}
