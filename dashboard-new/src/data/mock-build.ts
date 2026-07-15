import type { BuildMetric, BuildStageOption, DamageSource, EquipmentItem } from '../types/build'
import spineBowSprite from '../../../assets/poe_item_sprites/Spine_Bow_inventory_icon.png'
import ornateQuiverSprite from '../../../assets/poe_item_sprites/Ornate_Quiver_inventory_icon.png'
import maskSprite from '../../../assets/poe_item_sprites/Torturers_Mask_inventory_icon.png'
import armourSprite from '../../../assets/poe_item_sprites/Necrotic_Armour_inventory_icon.png'
import glovesSprite from '../../../assets/poe_item_sprites/Phantom_Mitts_inventory_icon.png'
import bootsSprite from '../../../assets/poe_item_sprites/Phantom_Boots_inventory_icon.png'
import amuletSprite from '../../../assets/poe_item_sprites/Simplex_Amulet_inventory_icon.png'
import ringSprite from '../../../assets/poe_item_sprites/Amethyst_Ring_inventory_icon.png'
import beltSprite from '../../../assets/poe_item_sprites/Foulborn_Headhunter_poecdn.png'
import brassDomeSprite from '../../../assets/poe_item_sprites/The_Brass_Dome_inventory_icon.webp'
import coilSprite from '../../../assets/poe_item_sprites/Lightning_Coil_inventory_icon.png'
export const stages: BuildStageOption[] = [
  { id:'league-start', label:'League Start', description:'Lvl 1–68' }, { id:'early-maps', label:'Early Maps', description:'T1–T5 Maps' }, { id:'mid-game', label:'Mid Game', description:'T6–T12 Maps' }, { id:'endgame', label:'Endgame', description:'T13–T16 Maps' }, { id:'min-max', label:'Min-Max', description:'Uber Content' }
]
export const metrics: BuildMetric[] = [
  { id:'dps', label:'DPS', value:'8.76M', change:9.2, tone:'blue' }, { id:'ehp', label:'EHP', value:'31.8K', change:6.1, tone:'yellow' }, { id:'life', label:'Life', value:'4,168', change:3.4, tone:'red' }, { id:'speed', label:'Movement Speed', value:'295%', change:2, tone:'cyan' }, { id:'budget', label:'Budget', value:'Test data', description:'poe.ninja snapshot', tone:'yellow' }
]
export const damageSources: DamageSource[] = [ { name:'Lightning',value:48,color:'#5ea6e8' }, { name:'Projectile',value:23,color:'#55c788' }, { name:'Elemental',value:18,color:'#c9a24a' }, { name:'Other',value:11,color:'#9671df' } ]
export const equipment: EquipmentItem[] = [
 {id:'loath-wind',name:'Loath Wind',baseType:'Spine Bow',slot:'weapon',rarity:'rare',sprite:spineBowSprite,itemLevel:89,quality:20,requiredLevel:68,properties:[{label:'Physical Damage',value:'37–111'},{label:'Critical Strike Chance',value:'6.50%'},{label:'Attacks per Second',value:'1.40'}],stats:['Adds 15 to 332 Lightning Damage to Attacks','+45% to Global Critical Strike Multiplier','+2 to Level of Socketed Bow Gems']},
 {id:'brood-skewer',name:'Brood Skewer',baseType:'Ornate Quiver',slot:'quiver',rarity:'rare',sprite:ornateQuiverSprite,itemLevel:88,stats:['+111 to maximum Life','+41% to Global Critical Strike Multiplier','50% increased Damage with Bow Skills']},
 {id:'demon-cowl',name:'Demon Cowl',baseType:'Torturer’s Mask',slot:'helmet',rarity:'rare',sprite:maskSprite,itemLevel:86,stats:['+1058 Evasion Rating','+82 to maximum Life','+47% Fire Resistance']},
 {id:'onslaught-cloak',name:'Onslaught Cloak',baseType:'Necrotic Armour',slot:'body-armour',rarity:'rare',sprite:armourSprite,itemLevel:87,quality:20,requiredLevel:68,properties:[{label:'Evasion Rating',value:'3,009'},{label:'Sockets',value:'6 linked'}],stats:['+3009 Evasion Rating','+102 to maximum Life','+46% Chaos Resistance','10% chance to gain Onslaught on Kill'],impact:{dps:2.4,ehp:5.8,life:2.4}},
 {id:'mind-hold',name:'Mind Hold',baseType:'Phantom Mitts',slot:'gloves',rarity:'rare',sprite:glovesSprite,itemLevel:85,stats:['+294 Evasion Rating','+71 to maximum Life','14% increased Attack Speed']}, {id:'torment-goad',name:'Torment Goad',baseType:'Phantom Boots',slot:'boots',rarity:'rare',sprite:bootsSprite,itemLevel:86,stats:['+488 Evasion Rating','35% increased Movement Speed','+89 to maximum Life']}, {id:'foulborn-headhunter',name:'Foulborn Headhunter',baseType:'Leather Belt',slot:'belt',rarity:'unique',sprite:beltSprite,itemLevel:84,stats:['+55 to maximum Life','Steal a random modifier from Rare monsters']}, {id:'maelstrom-rosary',name:'Maelstrom Rosary',baseType:'Simplex Amulet',slot:'amulet',rarity:'rare',sprite:amuletSprite,itemLevel:85,stats:['+92 to maximum Life','+32% to Global Critical Strike Multiplier','+1 to Level of all Dexterity Skill Gems']}, {id:'rage-twirl',name:'Rage Twirl',baseType:'Amethyst Ring',slot:'ring-1',rarity:'rare',sprite:ringSprite,itemLevel:100,stats:['+76 to maximum Life','+42% to Chaos Resistance','Adds 8 to 134 Lightning Damage to Attacks']}, {id:'nimis',name:'Nimis',baseType:'Topaz Ring',slot:'ring-2',rarity:'unique',itemLevel:84,stats:['Projectiles Return to you','+35% Lightning Resistance']}
]
export const alternatives: EquipmentItem[] = [ {id:'brass-dome',name:'The Brass Dome',baseType:'Unique Gladiator Plate',slot:'body-armour',rarity:'unique',sprite:brassDomeSprite,armour:1626,stats:['Increased Armour','Maximum Elemental Resistances','No Extra Damage from Critical Strikes'],impact:{ehp:8.3}}, {id:'coil',name:'Lightning Coil',baseType:'Unique Desert Brigandine',slot:'body-armour',rarity:'unique',sprite:coilSprite,armour:1379,stats:['Physical Damage taken as Lightning Damage','Lightning Resistance','Increased Evasion'],impact:{ehp:6.1}} ]
