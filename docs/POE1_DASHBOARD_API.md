# PoE 1 Dashboard API

Arquivo: `dashboard/poe1-dashboard-api.js`

API JavaScript pura para reutilizar a lógica da dashboard em outra interface.

```js
import { createPoE1DashboardApi } from "./dashboard/poe1-dashboard-api.js";

const [data, sprites, baseMods] = await Promise.all([
  fetch("./dashboard/build_dashboard_data.json").then((r) => r.json()),
  fetch("./dashboard/item_sprite_index.json").then((r) => r.json()),
  fetch("./dashboard/item_base_mod_summary.json").then((r) => r.json()),
]);

const poe = createPoE1DashboardApi({ data, sprites, baseMods });
const skill = poe.skills[0];
const build = skill.build_rows[0];
const slotMap = poe.autoMapItems(build.item_details);
const offhandPool = poe.itemPoolForSlot(skill, "offhand", slotMap.weapon);
const editedItem = poe.applyManualMods(slotMap.weapon, {
  explicits: ["25% increased Attack Speed", "+80 to maximum Life"],
});
const impact = poe.estimateModImpact([...editedItem.implicits, ...editedItem.explicits]);
```

Regras principais:

- PoE 1 apenas.
- Wand/sceptre/dagger/claw/sword one-hand não bloqueia offhand.
- Quiver só é compatível com bow.
- Melee/two-hand sem bow bloqueia offhand.
- Rare/Magic/Normal usam sprite da base; Unique usa nome e depois base.

Funções principais:

- `createPoE1DashboardApi({ data, sprites, baseMods, weights })`
- `autoMapItems(items)`
- `itemPoolForSlot(skill, slot, weapon)`
- `validateBuildSlots(build)`
- `scoreBuild(build, weights)`
- `deltaMetrics(baseBuild, nextBuild)`
- `slotForItem(item)`
- `applyManualMods(item, { implicits, explicits })`
- `estimateModImpact(modLines)`

Observação: `estimateModImpact` é uma estimativa local rápida para UI. O cálculo final exato deve continuar sendo validado pelo Path of Building.
