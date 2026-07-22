# Build-type knowledge base

Persistent, scoped memory for PoE Tree Review. Create a section when a new skill/archetype/delivery/defense package appears.

## Required record

- Identity: skill, variant, tags, delivery, class/ascendancy, patch/tree version.
- Mechanics: relevant wiki claims, PoB tabs/fields, conditions and calculation explanation.
- Tree: common nodes, routes, masteries, sockets, path costs, failed/disconnected paths.
- Build system: supports, items, jewels, flasks, reservations, attributes, resources.
- Metrics: damage, defense, sustain, uptime, warnings, before/after tests.
- Evidence: XML IDs, run IDs, sources, confidence, counterexamples and stale conditions.
- Frontier: untested, testing, measured, rejected, retest, next experiment.
- Interpretation: helped/hurt/neutral/conditional/unresolved; why the change likely caused the result; hidden costs; rollback; follow-up test.
- Transfer map: habits/rules inherited from compatible builds, compatibility checks, build-specific exceptions, rejected transfers, and evidence for each reuse.
- Resolution queue: unresolved/pending items, attempted methods, next changed method, blocker evidence, retry count, and final resolution.
- PoB validation proof: loaded-build identity, visible tabs/metrics, active configuration, Show Node Power state, mutation/recalculation evidence, before/after values, and export/checkpoint reference.
- Task lifecycle: `OPEN_POB`, `LOAD_MEMORY`, `TEST_ERRORS_FIRST`, `INSPECT_XML`, `TEST_ACTION`, `MEASURE`, `RECORD_UPDATE`, `CHECKPOINT/EXPORT`, `CLOSE_POB`, `VERIFY_CLOSED`.

No generic rule may override a scoped contradiction. Reconcile only after checking patch, PoB version, configuration and item assumptions.

## Double Strike crit/impale — Duelist Champion — targetVersion 3_0

Baseline: nível 95; CombinedDPS 14.727.743; vida 3.884; EHP 39.651; armour 72.321; evasion 72.998; mana livre 32; chaos -14%; elemental 75%. Árvore, masteries, itens e configuração não confirmados. Interpretação `unresolved`; `SHOW_NODE_POWER_PENDING`. Próximo teste: dano, defesa/recurso e eficiência no mesmo estado PoB. Evidência: XML `5hfezli6lrvf/5hfezli6lrvf_75c63ee4.xml`, run 2026-07-22; gameplay baixa confiança.

## Per-XML completion gate

Run 2026-07-22 00:38:17: repetição de `Bleeding Base.xml`; baseline estático confirmado com 133 nós, caos 13 e warnings 0. PoB abriu como processo único e foi fechado graciosamente, mas carga visual e Show Node Power continuam não confirmados; cursor permanece no índice 3.

## Absolution — Witch Necromancer — targetVersion 3_0 / tree 3_28

Baseline: nível 95; XML índice 2; 125 nós; CombinedDPS 171.390; vida reportada 1; ES 2.270; armour 35.204; evasion 2.166; caos 22; mana 1.213; warnings 0. Skills e itens foram apenas listados no XML, sem validação visual. Interpretação `unresolved`; `POB_LOAD_FAILED`, `GUI_PERMISSION_NOT_GRANTED`, `SHOW_NODE_POWER_PENDING`. Evidência: XML `absolution/Absolution - ID 2.xml`, run 2026-07-22 00:18; gameplay baixa confiança. Próximo teste: confirmar low-life/ES, configuração e árvore no PoB antes de qualquer rota.

## Absolution — Templar Guardian — targetVersion 3_0

Baseline: nível 96; XML índice 1; raiz `PathOfBuilding`; modo IMPORT. O PoB foi aberto e fechado sem mutação; métricas, árvore completa e ranking de `Show Node Power` não foram confirmados. Interpretação `unresolved`; `SHOW_NODE_POWER_PENDING`. Próximo teste: reabrir com controle visual observável e medir uma rota de dano, uma de defesa/recurso e uma de eficiência.

Evidência: `run-20260722-001000.md`; confiança baixa para gameplay, média para identidade do XML.

Before advancing the cursor, record the XML identity, full evidence pass, prior knowledge consulted, new learning or `NO_NEW_LEARNING`, experiment result, interpretation, and links to the corresponding cumulative Markdown and Updates row.

## Transfer policy

Run 2026-07-22 01:13:15: same XML retry; responsive process/title only, no visual PoB controls, load, identity, metrics, or Show Node Power. `POB_LOAD_FAILED`, `GUI_PERMISSION_NOT_GRANTED`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`; `NO_NEW_LEARNING`; cursor remains index 3.

Reuse a prior rule only after checking patch, skill tags, delivery, damage model, defense model, configuration and gear dependencies. Mark it `shared_rule` only when repeated across compatible builds; otherwise keep it `conditional_transfer` or `build_specific` and retest.

Run 2026-07-22 00:13:15: retry bloqueado por `POB_LOAD_FAILED`; duas janelas/estado não responde, seguido de desaparecimento antes de observação. Nenhuma carga confirmada, Show Node Power ou teste. Manter `SHOW_NODE_POWER_PENDING`; não transferir regras de dano/defesa.
Run 2026-07-22 00:40:00: `Bleeding Base.xml` (Duelist Gladiator, nível 98, targetVersion 3_0) analisado estaticamente; CombinedDPS 20.425.034, vida 5.385, ES 49, armour 27.983, evasion 33, mana 734. PoB respondeu sem argumentos, mas Builds/Open não foi observado; `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`. Cursor permanece no índice 3.
Run 2026-07-22 00:48:00: nova tentativa visual do mesmo XML; a janela intitulada PoB exibiu gameplay de `The Spell Brigade`. Regra operacional: validar conteúdo visual, não apenas título/processo, antes de navegar ou testar. `POB_LOAD_FAILED`, `GUI_WRONG_CONTENT`, `SHOW_NODE_POWER_PENDING`; instância fechada graciosamente; cursor permanece no índice 3.
## Templar Hierophant — group-8 build

### 2026-07-22 01:58:46 — retry index 3

`_fast_more_8_build_3.xml` remains unvalidated. PoB showed an unrelated loaded Elementalist, then Back returned to Builds; the concrete cursor row and target Open were not confirmed. Record `POB_LOAD_FAILED` and `SHOW_NODE_POWER_PENDING`; no route, mutation, or rule promoted. Cursor remains index 3.
- 2026-07-22: Static-only evidence from `_fast_more_8_build_3.xml`: level 100, targetVersion 3_0, TotalDPS 5.184M, life 3,548, ES 1,356, armour 40,154, chaos resistance 75.
- Validation status: unvalidated; GUI load and Show Node Power pending.
### 2026-07-22 — Fast More 8 / Templar Hierophant

Current evidence remains static-only for `_fast_more_8_build_3.xml` (level 100, targetVersion 3_0). No Show Node Power ranking or tree mutation is validated. Scope: do not transfer DPS/path rules until PoB load identity and recalculation are observable.
### 2026-07-22 01:11:36 — Templar Hierophant / `_fast_more_8_build_3.xml`

Interactive validation unresolved: `COMPUTER_USE_UNAVAILABLE`, `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`. No rule promoted.

Run 2026-07-22 02:20:00: executable process path was verified, but GUI state remained unobservable. `NO_NEW_LEARNING`; no rule promoted and cursor remains index 3.
Run 2026-07-22 02:35:00: `_fast_more_8_build_3.xml` retried; two responsive PoB processes appeared but GUI control was unavailable. `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`; no rule promoted, cursor remains index 3.

Run 2026-07-22 02:45:00: same XML retried; one responsive process, no observable GUI. Static baseline CombinedDPS 5.188M, life 3,548, ES 1,356, armour 40,154, chaos 75, mana 1,072. `NO_NEW_LEARNING`; no rule promoted and cursor remains index 3.
### 2026-07-22 — Kinetic Blast/Kinetic Fusillade Hierophant

- Static identity: Templar Hierophant, level 100, tree 3_28, 135 nodes.
- Static baseline: CombinedDPS 5.188M, life 3548, ES 1356, armour 40154, chaos resistance 75, mana 1072.
- GUI validation remains pending; do not promote route or node-power rules.
