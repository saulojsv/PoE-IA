import type { PassiveTreeData } from '../types/build'

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
  const nodes = Object.fromEntries(Object.entries(raw.nodes).map(([id, node]) => {
    const group = raw.groups[String(node.group)] || { x: 0, y: 0 }
    const orbit = node.orbit || 0
    const angle = (node.orbitIndex || 0) * Math.PI * 2 / (raw.constants.skillsPerOrbit[orbit] || 1)
    const radius = raw.constants.orbitRadii[orbit] || 0
    return [id, { id, name: node.name, x: group.x + Math.sin(angle) * radius, y: group.y - Math.cos(angle) * radius, stats: node.stats || [], isNotable: node.isNotable, isKeystone: node.isKeystone, isMastery: node.isMastery, out: node.out || [] }]
  }))
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
    for (const next of tree.nodes[current]?.out || []) if (allowed.has(next) && !seen.has(next)) { seen.add(next); queue.push(next) }
    for (const [id, node] of Object.entries(tree.nodes)) if (node.out.includes(current) && allowed.has(id) && !seen.has(id)) { seen.add(id); queue.push(id) }
  }
  return selected.filter(id => !seen.has(id))
}

export function generateRandomTree(tree: PassiveTreeData, className: string, budget: number, seed = Math.random()) {
  const start = tree.classes.find(item => item.name.toLowerCase() === className.toLowerCase())?.startNodeId
  if (!start || !tree.nodes[start]) return []
  const selected = new Set<string>([start])
  let state = Math.floor(seed * 0x7fffffff) || 1
  const random = () => { state = (state * 48271) % 0x7fffffff; return state / 0x7fffffff }
  const neighbors = (id: string) => Object.values(tree.nodes).filter(node => node.out.includes(id) || tree.nodes[id]?.out.includes(node.id))
  while (selected.size < budget) {
    const frontier = [...selected].flatMap(id => neighbors(id).filter(node => !selected.has(node.id)))
    if (!frontier.length) break
    const unique = [...new Map(frontier.map(node => [node.id, node])).values()]
    const weighted = unique.map(node => ({ node, weight: 1 + (node.isKeystone ? 5 : node.isNotable ? 3 : 0) + (node.stats.length ? 1 : 0) }))
    const total = weighted.reduce((sum, item) => sum + item.weight, 0)
    let pick = random() * total
    selected.add((weighted.find(item => (pick -= item.weight) <= 0) || weighted[0]).node.id)
  }
  return [...selected]
}
