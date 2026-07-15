import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Copy, Download, FileUp, FlaskConical, Link2, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import type { BuildDraft, DraftItem, ItemDetail, SlotKey } from '../../types/build'
import { createDraftFromBuild, duplicateDraft, emptyDraft, readDrafts, removeDraft, upsertDraft } from '../../data/drafts'
import { parsePobXml } from '../../data/pob-xml'
import { usePoeBundle } from '../../data/use-poe-bundle'
import { compatibleOffhand, mapEquipment, slotForItem, spriteFor } from '../../data/poe-data'
import { PassiveTreeEditor } from './passive-tree-editor'

const slotNames: Array<[SlotKey, string]> = [['weapon', 'Weapon'], ['helmet', 'Helmet'], ['offhand', 'Offhand'], ['amulet', 'Amulet'], ['body', 'Body armour'], ['ring1', 'Ring I'], ['ring2', 'Ring II'], ['gloves', 'Gloves'], ['belt', 'Belt'], ['boots', 'Boots']]
const compact = (value: number) => Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0)
const itemKey = (item: ItemDetail) => `${item.name}|${item.base}`

function asDraftItem(item: ItemDetail, slot?: DraftItem['equippedSlot']): DraftItem { return { ...item, id: `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`, equippedSlot: slot } }

function equipmentOf(draft: BuildDraft, baseMods: any) {
  const map = mapEquipment(draft.items, baseMods)
  return map
}

function estimate(draft: BuildDraft) {
  const base = draft.baseline
  if (!base) return { dps: 0, ehp: 0, life: 0, changed: true }
  const itemDelta = draft.items.length - base.item_details.length
  const gemDelta = draft.gems.length - base.gems.length
  const nodeDelta = draft.nodes.length - base.nodes.length
  const multiplier = 1 + itemDelta * .012 + gemDelta * .018 + nodeDelta * .003
  return { dps: Math.max(0, base.combined_dps * multiplier), ehp: Math.max(0, base.ehp * (1 + itemDelta * .008 + nodeDelta * .002)), life: Math.max(0, base.life + nodeDelta * 5), changed: itemDelta !== 0 || gemDelta !== 0 || nodeDelta !== 0 }
}

export function BuildLab() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { bundle, error, itemCatalog } = usePoeBundle()
  const [drafts, setDrafts] = useState<BuildDraft[]>(readDrafts)
  const [draft, setDraft] = useState<BuildDraft | undefined>(() => id ? readDrafts().find(entry => entry.id === id) : undefined)
  const [notice, setNotice] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (id) setDraft(readDrafts().find(entry => entry.id === id)) }, [id])
  const update = (patch: Partial<BuildDraft>) => setDraft(current => current && ({ ...current, ...patch }))
  const save = () => { if (!draft) return; const next = upsertDraft(draft); setDraft(next); setDrafts(readDrafts()); setNotice('Rascunho salvo localmente.') }
  const create = () => { const next = emptyDraft(); setDraft(next); navigate(`/build-lab/${next.id}`) }
  const choose = (next: BuildDraft) => { setDraft(next); navigate(`/build-lab/${next.id}`) }
  const importXml = async (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; try { const next = parsePobXml(await file.text(), file.name); setDraft(next); const saved = upsertDraft(next); setDrafts(readDrafts()); navigate(`/build-lab/${saved.id}`); setNotice('XML importado. Revise os slots e as gems antes de salvar.'); } catch (reason) { setNotice(reason instanceof Error ? reason.message : 'Não foi possível importar o XML.') } finally { event.target.value = '' } }
  if (error) return <div className="page-error">{error}</div>
  if (!bundle) return <div className="page-loading"><span />Carregando Build Lab…</div>
  return <div className="lab-page"><header className="page-heading lab-heading"><div><p><FlaskConical /> BUILD LAB · MIRAGE 3.28</p><h1>Build Lab</h1><span>Edite uma build local, acompanhe estimativas e guarde seu rascunho no navegador.</span></div><div className="lab-heading-actions"><button className="secondary-action" onClick={() => fileRef.current?.click()}><FileUp /> Importar XML</button><button className="primary-action" onClick={create}><Plus /> Nova build</button><input ref={fileRef} type="file" accept=".xml,text/xml,application/xml" hidden onChange={importXml} /></div></header>{notice && <div className="lab-notice">{notice}<button onClick={() => setNotice('')}><X /></button></div>}<div className="lab-layout"><DraftRail drafts={drafts} activeId={draft?.id} onChoose={choose} onNew={create} onDuplicate={candidate => { const copy = duplicateDraft(candidate); setDrafts(readDrafts()); choose(copy) }} onDelete={candidate => { removeDraft(candidate.id); const next = readDrafts(); setDrafts(next); if (candidate.id === draft?.id) { setDraft(next[0]); navigate(next[0] ? `/build-lab/${next[0].id}` : '/build-lab') } }} />{draft ? <DraftEditor draft={draft} update={update} save={save} catalog={itemCatalog} sprites={bundle.sprites} baseMods={bundle.baseMods} /> : <LabEmpty onNew={create} onImport={() => fileRef.current?.click()} />}</div></div>
}

function DraftRail({ drafts, activeId, onChoose, onNew, onDuplicate, onDelete }: { drafts: BuildDraft[]; activeId?: string; onChoose: (draft: BuildDraft) => void; onNew: () => void; onDuplicate: (draft: BuildDraft) => void; onDelete: (draft: BuildDraft) => void }) { return <aside className="draft-rail"><header><span>Rascunhos locais</span><button onClick={onNew} aria-label="Nova build"><Plus /></button></header>{!drafts.length && <p>Nenhum rascunho salvo.</p>}{drafts.map(draft => <article className={draft.id === activeId ? 'active' : ''} key={draft.id}><button className="draft-select" onClick={() => onChoose(draft)}><b>{draft.name}</b><span>{draft.skill || 'Sem skill'} · Lv. {draft.level}</span></button><div><button onClick={() => onDuplicate(draft)} aria-label="Duplicar rascunho"><Copy /></button><button onClick={() => onDelete(draft)} aria-label="Excluir rascunho"><Trash2 /></button></div></article>)}</aside> }

function LabEmpty({ onNew, onImport }: { onNew: () => void; onImport: () => void }) { return <section className="lab-empty"><FlaskConical /><h2>Comece uma build</h2><p>Crie um rascunho manual ou importe um XML exportado pelo Path of Building.</p><div><button className="primary-action" onClick={onNew}><Plus /> Nova build</button><button className="secondary-action" onClick={onImport}><FileUp /> Importar XML</button></div><footer><span><Link2 /> Link pobb.in</span><span>Código PoB</span><small>Disponíveis quando o backend de importação estiver pronto.</small></footer></section> }

function DraftEditor({ draft, update, save, catalog, sprites, baseMods }: { draft: BuildDraft; update: (patch: Partial<BuildDraft>) => void; save: () => void; catalog: ItemDetail[]; sprites: Record<string, string>; baseMods: any }) {
  const estimateValues = estimate(draft)
  const [itemSearch, setItemSearch] = useState('')
  const equipment = equipmentOf(draft, baseMods)
  const matchingItems = useMemo(() => catalog.filter(item => `${item.name} ${item.base}`.toLowerCase().includes(itemSearch.toLowerCase())).slice(0, 80), [catalog, itemSearch])
  const setSlot = (slot: SlotKey, item?: ItemDetail) => {
    const current = equipment[slot]?.raw
    const next = draft.items.filter(candidate => !current || itemKey(candidate) !== itemKey(current))
    if (item) next.push(asDraftItem(item, slot))
    const weapon = slot === 'weapon' ? item : equipment.weapon?.raw
    const offhand = slot === 'offhand' ? item : equipment.offhand?.raw
    update({ items: compatibleOffhand(weapon, offhand) ? next : next.filter(candidate => slotForItem(candidate, baseMods) !== 'offhand') })
  }
  const addGem = () => { const value = prompt('Nome da gem'); if (value?.trim()) update({ gems: [...draft.gems, value.trim()] }) }
  const addItem = (item: ItemDetail) => update({ items: [...draft.items, asDraftItem(item)] })
  return <section className="draft-editor"><header className="draft-title"><div><input value={draft.name} onChange={event => update({ name: event.target.value })} aria-label="Nome da build" /><span>{draft.source === 'xml' ? 'Importada de XML' : draft.source === 'dataset' ? 'Base do dataset' : 'Manual'} · salvo no navegador</span></div><button className="primary-action" onClick={save}><Save /> Salvar rascunho</button></header><div className="lab-estimates"><article><small>Combined DPS</small><b>{compact(estimateValues.dps || draft.baseline?.combined_dps || 0)}</b></article><article><small>EHP</small><b>{compact(estimateValues.ehp || draft.baseline?.ehp || 0)}</b></article><article><small>Life</small><b>{Math.round(estimateValues.life || draft.baseline?.life || 0).toLocaleString('pt-BR')}</b></article><p>{estimateValues.changed ? 'Estimativa local após edição — valide o resultado no Path of Building.' : 'Snapshot original do dataset — sem alterações estruturais.'}</p></div><section className="lab-basics"><label>Skill<input value={draft.skill} onChange={event => update({ skill: event.target.value })} placeholder="Ex.: Lightning Arrow" /></label><label>Classe<input value={draft.className} onChange={event => update({ className: event.target.value })} placeholder="Ex.: Ranger" /></label><label>Ascendência<input value={draft.ascendancy} onChange={event => update({ ascendancy: event.target.value })} placeholder="Ex.: Deadeye" /></label><label>Nível<input type="number" min="1" max="100" value={draft.level} onChange={event => update({ level: Number(event.target.value) || 1 })} /></label></section><section className="lab-section"><header><div><h2>Equipment</h2><p>Troque itens por slot; as regras de arma, offhand e quiver continuam ativas.</p></div></header><div className="lab-slots">{slotNames.map(([slot, label]) => <ItemSlot key={slot} slot={slot} label={label} item={equipment[slot]?.raw} sprites={sprites} catalog={matchingItems} onSearch={setItemSearch} onSet={setSlot} />)}</div><div className="lab-unassigned"><h3>Itens adicionados</h3>{draft.items.filter(item => !Object.values(equipment).some(equipped => equipped?.raw && itemKey(equipped.raw) === itemKey(item))).map(item => <button key={item.id} onClick={() => update({ items: draft.items.filter(candidate => candidate.id !== item.id) })}>{item.name} <span>{item.base}</span> <X /></button>)}<label><Pencil /><input value={itemSearch} onChange={event => setItemSearch(event.target.value)} placeholder="Buscar item do dataset para adicionar" /></label>{itemSearch && <div className="item-results">{matchingItems.map(item => <button key={itemKey(item)} onClick={() => addItem(item)}>{item.name}<span>{item.base}</span></button>)}</div>}</div></section><section className="lab-section"><header><div><h2>Gems & links</h2><p>Edite a lista importada ou adicione novas gems ao rascunho.</p></div><button className="secondary-action" onClick={addGem}><Plus /> Adicionar gem</button></header><div className="editable-tags">{draft.gems.map((gem, index) => <span key={`${gem}-${index}`}>{gem}<button onClick={() => update({ gems: draft.gems.filter((_, position) => position !== index) })}>×</button></span>)}</div></section><PassiveTreeEditor nodes={draft.nodes} className={draft.className} onChange={nodes => update({ nodes })} /></section>
}

function ItemSlot({ slot, label, item, sprites, catalog, onSearch, onSet }: { slot: SlotKey; label: string; item?: ItemDetail; sprites: Record<string, string>; catalog: ItemDetail[]; onSearch: (value: string) => void; onSet: (slot: SlotKey, item?: ItemDetail) => void }) { const [open, setOpen] = useState(false); const src = item ? spriteFor(item, sprites) : ''; return <article className={`lab-slot ${item ? 'filled' : ''}`}><button onClick={() => setOpen(value => !value)}><i>{src ? <img src={src} alt="" /> : '+'}</i><small>{label}</small><b>{item?.name || 'Empty'}</b><span>{item?.base || 'Selecionar item'}</span></button>{open && <div className="slot-popover"><label><input autoFocus onChange={event => onSearch(event.target.value)} placeholder="Buscar no catálogo" /></label>{item && <button className="remove-slot" onClick={() => { onSet(slot); setOpen(false) }}>Remover</button>}<div>{catalog.slice(0, 20).map(candidate => <button key={itemKey(candidate)} onClick={() => { onSet(slot, candidate); setOpen(false) }}>{candidate.name}<span>{candidate.base}</span></button>)}</div></div>}</article> }
