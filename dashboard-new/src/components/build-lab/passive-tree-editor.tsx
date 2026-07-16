import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Minus, Plus, Search } from 'lucide-react'
import type { PassiveTreeData } from '../../types/build'
import { disconnectedNodes, generateRandomTree, loadPassiveTree } from '../../data/passive-tree'

export function PassiveTreeEditor({ nodes, className, onChange }: { nodes: string[]; className: string; onChange: (nodes: string[]) => void }) {
  const [tree, setTree] = useState<PassiveTreeData>()
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [zoom, setZoom] = useState(.18)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragging = useRef<{ x: number; y: number } | undefined>(undefined)
  useEffect(() => { loadPassiveTree().then(setTree).catch(reason => setError(reason.message)) }, [])
  const selected = useMemo(() => new Set(nodes), [nodes])
  const visible = useMemo(() => {
    if (!tree) return []
    const normalized = query.trim().toLowerCase()
    const include = new Set(nodes)
    if (normalized) Object.values(tree.nodes).filter(node => node.name.toLowerCase().includes(normalized) || node.stats.some(stat => stat.toLowerCase().includes(normalized))).slice(0, 120).forEach(node => include.add(node.id))
    return Object.values(tree.nodes).filter(node => include.has(node.id))
  }, [tree, query, nodes])
  const disconnected = disconnectedNodes(nodes, tree, className)
  const toggle = (id: string) => onChange(selected.has(id) ? nodes.filter(node => node !== id) : [...nodes, id])
  if (error) return <div className="tree-error">{error}</div>
  if (!tree) return <div className="tree-loading"><span />Carregando árvore oficial 3.28…</div>
  const focus = (id: string) => { const node = tree.nodes[id]; if (node) { setPan({ x: -node.x * zoom, y: -node.y * zoom }); setZoom(.32) } }
  const links = visible.flatMap(node => node.out.filter(id => selected.has(node.id) && selected.has(id) && tree.nodes[id]).map(id => ({ from: node, to: tree.nodes[id] })))
  return <section className="tree-editor"><header><div><h3>Passive tree</h3><p>PoE 3.28 Mirage · {nodes.length} nós selecionados</p></div><div className="tree-tools"><label><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar nó ou stat" /></label><button onClick={() => setZoom(value => Math.min(.45, value + .04))} aria-label="Aproximar"><Plus /></button><button onClick={() => setZoom(value => Math.max(.08, value - .04))} aria-label="Afastar"><Minus /></button></div></header>{disconnected.length > 0 && <div className="tree-warning"><AlertTriangle /> {disconnected.length} nó(s) desconectado(s) do início de {className || 'sua classe'}.</div>}<div className="tree-canvas" onPointerDown={event => { dragging.current = { x: event.clientX - pan.x, y: event.clientY - pan.y }; event.currentTarget.setPointerCapture(event.pointerId) }} onPointerMove={event => { if (dragging.current) setPan({ x: event.clientX - dragging.current.x, y: event.clientY - dragging.current.y }) }} onPointerUp={() => { dragging.current = undefined }}><div className="tree-world" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}><svg className="tree-links" aria-hidden="true">{links.map(({ from, to }) => <line key={`${from.id}-${to.id}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />)}</svg>{visible.map(node => <button key={node.id} className={`tree-node ${selected.has(node.id) ? 'selected' : ''} ${node.isKeystone ? 'keystone' : node.isNotable ? 'notable' : ''}`} style={{ left: node.x, top: node.y }} onPointerDown={event => event.stopPropagation()} onClick={() => toggle(node.id)} title={`${node.name}\n${node.stats.join('\n')}`}>{node.isKeystone ? 'K' : node.isNotable ? 'N' : ''}</button>)}</div>{!visible.length && <div className="tree-hint">Busque um nó para adicionar ou importe uma build com passivas.</div>}</div><div className="tree-selection">{nodes.slice(0, 20).map(id => <button key={id} onClick={() => focus(id)}>{tree.nodes[id]?.name || `Node ${id}`} <span onClick={event => { event.stopPropagation(); toggle(id) }}>×</span></button>)}{nodes.length > 20 && <small>+{nodes.length - 20} nós</small>}</div></section>
}
