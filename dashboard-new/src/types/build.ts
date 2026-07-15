export type BuildStage = 'league-start' | 'early-maps' | 'mid-game' | 'endgame' | 'min-max'
export type ItemRarity = 'normal' | 'magic' | 'rare' | 'unique'
export type MetricTone = 'blue' | 'green' | 'red' | 'yellow' | 'cyan'
export interface BuildMetric { id: string; label: string; value: string; change?: number; description?: string; tone: MetricTone }
export interface ItemImpact { dps?: number; ehp?: number; life?: number }
export interface EquipmentItem { id: string; name: string; baseType: string; slot: string; rarity: ItemRarity; corrupted?: boolean; quality?: number; armour?: number; itemLevel?: number; requiredLevel?: number; requiredStrength?: number; stats: string[]; flavorText?: string; impact?: ItemImpact }
export interface BuildStageOption { id: BuildStage; label: string; description: string }
export interface DamageSource { name: string; value: number; color: string }
