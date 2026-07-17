export type BuildStage = 'items' | 'defense' | 'damage' | 'combinations' | 'smart-combination' | 'tree' | 'league-start' | 'early-maps' | 'mid-game' | 'endgame' | 'min-max'
export type ItemRarity = 'normal' | 'magic' | 'rare' | 'unique'
export type MetricTone = 'blue' | 'green' | 'red' | 'yellow' | 'cyan'
export type SlotKey = 'weapon' | 'helmet' | 'offhand' | 'amulet' | 'body' | 'ring1' | 'ring2' | 'gloves' | 'belt' | 'boots'

export interface ItemDetail {
  name: string
  base: string
  rarity: string
  item_level: number
  slot: string
  implicits: string[]
  explicits: string[]
  locked?: boolean
  affix_meta?: { modId: string; tier: number | null; tierModel?: 'tiered' | 'tierless'; requiredItemLevel: number | null; group: string; generationType: 'Prefix' | 'Suffix'; source: 'natural'; rawValue?: number; displayMultiplier?: number }[]
  capacity?: { prefixes: number; suffixes: number }
  target?: { prefixes: number; suffixes: number }
  generated?: { prefixes: number; suffixes: number }
  failure?: string
}

export interface EquipmentItem {
  id: string
  name: string
  baseType: string
  slot: string
  rarity: ItemRarity
  sprite?: string
  itemLevel?: number
  quality?: number
  armour?: number
  requiredLevel?: number
  requiredStrength?: number
  properties?: { label: string; value: string }[]
  impact?: { dps?: number; ehp?: number; life?: number }
  flavorText?: string
  corrupted?: boolean
  stats: string[]
  implicits?: string[]
  explicits?: string[]
  raw?: ItemDetail
  locked?: boolean
}

export interface BuildRow {
  file: string
  skill: string
  class: string
  ascendancy: string
  level: number
  combined_dps: number
  ehp: number
  life: number
  energy_shield: number
  fire_resist: number
  cold_resist: number
  lightning_resist: number
  chaos_resist: number
  block: number
  spell_block: number
  suppression: number
  attack_speed: number
  crit_multi: number
  max_phys_hit?: number
  max_fire_hit?: number
  max_cold_hit?: number
  max_lightning_hit?: number
  max_chaos_hit?: number
  points_used: number
  gems: string[]
  items: string[]
  item_details: ItemDetail[]
  nodes: string[]
}

export interface SkillGroup {
  skill: string
  builds: number
  best_dps: number
  best_file: string
  classes: [string, number][]
  build_rows: BuildRow[]
  gems: [string, number][]
  items: [string, number][]
  nodes: [string, number][]
  candidate_space: number
}

export interface BuildData {
  summary: Record<string, number>
  skills: SkillGroup[]
  builds: BuildRow[]
  top_gems: [string, number][]
  top_items: [string, number][]
  top_nodes: [string, number][]
}

export interface BuildMetric {
  id: string
  label: string
  value: string
  change?: number
  description?: string
  tone: MetricTone
}

export interface DamageSource {
  name: string
  value: number
  color: string
}

export interface BuildStageOption {
  id: BuildStage
  label: string
  description: string
}

export interface ExploreFilters {
  query: string
  skill: string
  ascendancy: string
  gem: string
  item: string
  minLevel: number
  minDps: number
  minEhp: number
  minLife: number
  minEnergyShield: number
  minResistance: number
  minBlock: number
  minSuppression: number
}

export interface DraftItem extends ItemDetail {
  id: string
  equippedSlot?: SlotKey | 'flask' | 'jewel'
}

export interface BuildDraft {
  id: string
  name: string
  source: 'dataset' | 'xml' | 'manual'
  sourceFile?: string
  createdAt: string
  updatedAt: string
  skill: string
  className: string
  ascendancy: string
  level: number
  baseline?: BuildRow
  gems: string[]
  items: DraftItem[]
  nodes: string[]
}

export interface PassiveTreeNode {
  id: string
  name: string
  x: number
  y: number
  stats: string[]
  isNotable?: boolean
  isKeystone?: boolean
  isMastery?: boolean
  isClassStart?: boolean
  out: string[]
  neighbors?: string[]
}

export interface PassiveTreeData {
  version: '3.28'
  min_x: number
  min_y: number
  max_x: number
  max_y: number
  nodes: Record<string, PassiveTreeNode>
  classes: Array<{ name: string; startNodeId: string }>
}
