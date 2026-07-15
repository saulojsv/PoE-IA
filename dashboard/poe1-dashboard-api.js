const DEFAULT_WEIGHTS = {
  ehp: 3,
  life: 2,
  es: 1,
  block: 2,
  suppression: 2,
  dps: 3,
  attack_speed: 1,
  crit_multi: 1,
};

const SLOT_ORDER = ["helmet", "amulet", "body", "weapon", "offhand", "gloves", "ring1", "ring2", "belt", "boots"];
const IGNORED_SKILLS = new Set(["xml", "extraction samples", "root"]);
const BOW_UNIQUES = /\b(widowhail|voltaxic rift|windripper|lioneye's glare|death's opus|chin sol|darkscorn|doomfletch)\b/i;

export function isValidSkill(skill) {
  return !!skill && !!skill.skill && !IGNORED_SKILLS.has(String(skill.skill).toLowerCase());
}

export function itemText(item) {
  return `${item?.base || ""} ${item?.name || ""}`;
}

export function isBow(item) {
  return /\bbow\b/i.test(itemText(item)) || BOW_UNIQUES.test(itemText(item));
}

export function isQuiver(item) {
  return /quiver/i.test(itemText(item));
}

export function isTwoHandWeapon(item) {
  return isBow(item) || /\b(staff|warstaff|maul|greatsword|two hand|two-handed)\b/i.test(itemText(item));
}

export function slotForItem(item, baseMods = {}) {
  const text = itemText(item).toLowerCase();
  const baseInfo = baseMods?.bases?.[item?.base] || baseMods?.bases?.[item?.name] || null;
  if (text.includes("flask") || baseInfo?.slot === "flask") return "flask";
  if (isQuiver(item)) return "offhand";
  const slot = baseInfo?.slot || item?.slot;
  if (slot === "jewel") return "jewel";
  if (slot === "ring") return "ring";
  if (slot === "twohand") return "weapon";
  return slot || "other";
}

export function compatibleOffhand(weapon, offhand) {
  if (!offhand) return true;
  if (isQuiver(offhand)) return !!weapon && isBow(weapon);
  if (!weapon) return true;
  return !isTwoHandWeapon(weapon);
}

export function autoMapItems(items = [], baseMods = {}) {
  const map = {};
  const rings = [];
  const offhands = [];
  for (const item of items) {
    const slot = slotForItem(item, baseMods);
    if (slot === "ring") rings.push(item);
    else if (slot === "offhand") offhands.push(item);
    else if (slot === "weapon" && !map.weapon) map.weapon = item;
    else if (!["flask", "jewel", "other"].includes(slot) && !map[slot]) map[slot] = item;
  }
  if (rings[0]) map.ring1 = rings[0];
  if (rings[1]) map.ring2 = rings[1];
  const validOffhand = offhands.find((item) => compatibleOffhand(map.weapon, item));
  if (validOffhand) map.offhand = validOffhand;
  else if (map.weapon && isTwoHandWeapon(map.weapon) && !isBow(map.weapon)) {
    map.offhand = { name: "Ocupado por arma two-handed", base: "Slot bloqueado", locked: true };
  }
  return map;
}

export function itemPoolForSlot(skill, slot, weapon, baseMods = {}) {
  const out = [];
  const seen = new Set();
  for (const build of skill?.build_rows || []) {
    for (const item of build.item_details || []) {
      const itemSlot = slotForItem(item, baseMods);
      let ok = itemSlot !== "flask" && (
        (slot === "jewel" && itemSlot === "jewel") ||
        ((slot === "ring1" || slot === "ring2") && itemSlot === "ring") ||
        itemSlot === slot
      );
      if (ok && slot === "offhand" && !compatibleOffhand(weapon, item)) ok = false;
      const key = `${item.name}|${item.base}`;
      if (ok && !seen.has(key)) {
        seen.add(key);
        out.push(item);
      }
    }
  }
  return out.sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

export function scoreBuild(build, weights = DEFAULT_WEIGHTS) {
  return (build?.ehp || 0) * weights.ehp +
    (build?.life || 0) * weights.life +
    (build?.energy_shield || 0) * weights.es +
    (build?.block || 0) * weights.block * 1000 +
    (build?.suppression || 0) * weights.suppression * 800 +
    (build?.combined_dps || 0) * weights.dps +
    (build?.attack_speed || 0) * weights.attack_speed * 10000 +
    (build?.crit_multi || 0) * weights.crit_multi * 1000;
}

export function deltaMetrics(baseBuild, nextBuild) {
  const keys = ["combined_dps", "ehp", "life", "energy_shield", "block", "spell_block", "suppression", "fire_resist", "cold_resist", "lightning_resist", "chaos_resist", "attack_speed", "crit_multi"];
  return Object.fromEntries(keys.map((key) => {
    const before = baseBuild?.[key] || 0;
    const after = nextBuild?.[key] ?? before;
    const percent = before ? ((after - before) / before) * 100 : 0;
    return [key, { before, after, change: after - before, percent }];
  }));
}

export function estimateModImpact(lines = []) {
  const impact = {
    combined_dps: 0,
    ehp: 0,
    life: 0,
    energy_shield: 0,
    block: 0,
    suppression: 0,
    fire_resist: 0,
    cold_resist: 0,
    lightning_resist: 0,
    chaos_resist: 0,
    attack_speed: 0,
    crit_multi: 0,
  };
  for (const line of lines) {
    const value = Number(String(line).match(/([+-]?\d+(?:\.\d+)?)/)?.[1] || 0);
    const lower = String(line).toLowerCase();
    if (lower.includes("maximum life")) impact.life += value;
    if (lower.includes("energy shield")) impact.energy_shield += value;
    if (lower.includes("fire") && lower.includes("resistance")) impact.fire_resist += value;
    else if (lower.includes("cold") && lower.includes("resistance")) impact.cold_resist += value;
    else if (lower.includes("lightning") && lower.includes("resistance")) impact.lightning_resist += value;
    else if (lower.includes("chaos") && lower.includes("resistance")) impact.chaos_resist += value;
    if (lower.includes("block")) impact.block += value;
    if (lower.includes("suppress")) impact.suppression += value;
    if (lower.includes("attack speed")) impact.attack_speed += value;
    if (lower.includes("critical") || lower.includes("crit")) impact.crit_multi += value;
    if (lower.includes("damage") || lower.includes("spell") || lower.includes("attack")) impact.combined_dps += Math.max(0, value) * 1000;
  }
  impact.ehp = impact.life * 2 + impact.energy_shield * 1.5 + impact.block * 500 + impact.suppression * 400;
  return impact;
}

export function applyManualMods(item, { implicits, explicits } = {}) {
  return {
    ...item,
    implicits: [...(implicits ?? item?.implicits ?? [])],
    explicits: [...(explicits ?? item?.explicits ?? [])],
  };
}

export function validateBuildSlots(build, baseMods = {}) {
  const map = autoMapItems(build?.item_details || [], baseMods);
  const errors = [];
  if (map.offhand && !map.offhand.locked && !compatibleOffhand(map.weapon, map.offhand)) {
    errors.push({ type: "invalid_weapon_offhand", weapon: map.weapon, offhand: map.offhand });
  }
  return { map, filledSlots: SLOT_ORDER.filter((slot) => map[slot] && !map[slot].locked).length, errors };
}

export function createPoE1DashboardApi({ data, sprites = {}, baseMods = {}, weights = DEFAULT_WEIGHTS }) {
  const skills = (data?.skills || []).filter(isValidSkill);
  return {
    data,
    sprites,
    baseMods,
    weights: { ...DEFAULT_WEIGHTS, ...weights },
    skills,
    slots: SLOT_ORDER,
    isValidSkill,
    slotForItem: (item) => slotForItem(item, baseMods),
    autoMapItems: (items) => autoMapItems(items, baseMods),
    itemPoolForSlot: (skill, slot, weapon) => itemPoolForSlot(skill, slot, weapon, baseMods),
    scoreBuild: (build, customWeights) => scoreBuild(build, customWeights || weights),
    deltaMetrics,
    estimateModImpact,
    applyManualMods,
    validateBuildSlots: (build) => validateBuildSlots(build, baseMods),
  };
}
