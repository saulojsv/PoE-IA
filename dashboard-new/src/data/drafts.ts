import type { BuildDraft, BuildRow, DraftItem, ItemDetail } from '../types/build'

const STORAGE_KEY = 'poe-build-lab-drafts-v1'

function id() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function toDraftItem(item: ItemDetail, index: number): DraftItem {
  return { ...item, id: `item-${index}-${item.name}-${item.base}` }
}

export function createDraftFromBuild(build: BuildRow, name = build.skill || 'Untitled build'): BuildDraft {
  const now = new Date().toISOString()
  return {
    id: id(), name, source: 'dataset', sourceFile: build.file, createdAt: now, updatedAt: now,
    skill: build.skill, className: build.class, ascendancy: build.ascendancy, level: build.level,
    baseline: build, gems: [...build.gems], items: build.item_details.map(toDraftItem), nodes: [...build.nodes],
  }
}

export function emptyDraft(): BuildDraft {
  const now = new Date().toISOString()
  return { id: id(), name: 'New Mirage build', source: 'manual', createdAt: now, updatedAt: now, skill: '', className: '', ascendancy: '', level: 1, gems: [], items: [], nodes: [] }
}

export function readDrafts(): BuildDraft[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as BuildDraft[] } catch { return [] }
}

export function writeDrafts(drafts: BuildDraft[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
}

export function upsertDraft(draft: BuildDraft) {
  const next = { ...draft, updatedAt: new Date().toISOString() }
  const drafts = readDrafts()
  const index = drafts.findIndex(candidate => candidate.id === next.id)
  if (index >= 0) drafts[index] = next
  else drafts.unshift(next)
  writeDrafts(drafts)
  return next
}

export function removeDraft(id: string) { writeDrafts(readDrafts().filter(draft => draft.id !== id)) }

export function duplicateDraft(draft: BuildDraft) {
  const now = new Date().toISOString()
  const copy = { ...draft, id: id(), name: `${draft.name} copy`, createdAt: now, updatedAt: now }
  upsertDraft(copy)
  return copy
}
