# Run log

## 2026-07-22T20:12:00+01:00 - cursor 0
- inventario: 940 XMLs, 940 validos, 0 invalidos; cursor `-26z68CIDwLz.xml` preservado, SHA-256 `02bacb2e...87b2d`.
- inspeccao estatica: Shadow/Trickster, nivel 90, targetVersion `3_0`, Blade Trap of Laceration; TotalDPS `16903.58`, CombinedDPS `1207243.85`, Life `2647`, ES `23`.
- candidato/mutacao: nenhum; PoB/Computer Use indisponivel, Show Node Power pendente. Veredito: `NAO VALIDADO`.
- proximo: carregar exatamente este XML no PoB e confirmar identidade, metricas e Show Node Power.

## 2026-07-22T20:00:00+01:00 — cursor 0
- inventário: 940 XMLs, 940 válidos, 0 inválidos; hash do cursor estável (`02bacb2e...87b2d`).
- inspeção: `-26z68CIDwLz.xml`, Shadow/Trickster, nível 90, targetVersion `3_0`; TotalDPS estático 16903.58, CombinedDPS 1207243.85.
- candidato/mutação: nenhum; sem baseline PoB carregado, Show Node Power, causalidade ou delta antes/depois. Veredito: `NÃO VALIDADO`.
- falhas: `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`; pull/rebase bloqueado por alterações unstaged preexistentes.
- próximo: carga visual confirmada do cursor 0; não avançar cursor nem promover regra.

## 2026-07-22T19:42:00+01:00
- objetivo: reindexar e retestar o cursor 0, priorizando normalização e falhas PoB.
- inventário: 940 XMLs, 940 válidos, 0 inválidos; hash do cursor 0 estável (`02bacb2e...87b2d`).
- XML inspecionado: `-26z68CIDwLz.xml`, Shadow/Trickster, nível 90, targetVersion `3_0`; métricas estáticas: TotalDPS 16903.58, CombinedDPS 1207243.85, Life 2647, ES 23, resistências elementais 75, chaos 10.
- baseline/candidato: nenhum candidato legal gerado; sem PoB carregado, Show Node Power, mutação ou delta antes/depois. Veredito: `NÃO VALIDADO`.
- falhas: `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`; `git pull --rebase origin main` falhou por alterações unstaged preexistentes.
- aprendizado: duplicatas permanecem 44 grupos; diferença observada 940 vs 930 ainda não explicada; não promover regra nem avançar cursor.
- próximo teste: iniciar uma única janela PoB, selecionar concretamente o XML do cursor 0, confirmar identidade visual e então executar Show Node Power.

## 2026-07-22T19:30:00+01:00
- fases: inventário/hash/validação XML; inspeção estática de um XML.
- resultado: 940 arquivos, 940 válidos, 0 inválidos; original preservado.
- cursor: 0; XML: `-26z68CIDwLz.xml`; hash: `02bacb2e...87b2d`.
- pendências priorizadas: `explain_10_file_difference`, `consolidate_44_duplicate_groups`, `normalize_build_identity`, `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`.
- PoB: validação visual não executada porque a capacidade Computer Use/GUI não está disponível nesta sessão; nenhuma mutação ou regra promovida.
- Git: `pull --rebase origin main` bloqueado por alterações não staged preexistentes; sem commit/push.
## 2026-07-22T19:49:14+01:00 — cursor 0
- Objective: executar o ciclo persistente e priorizar pendências PoB/normalização.
- Inputs: 940 XMLs; cursor 0; `-26z68CIDwLz.xml`; SHA-256 `02bacb2e...87b2d`.
- Tests: inventário, hash, validação XML e inspeção estática de um XML.
- Comparisons: nenhum candidato ou métrica antes/depois; baseline PoB não carregado.
- Failures/Rollbacks: `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`; divergência 940 vs 930 e 44 grupos duplicados continuam pendentes.
- Learned Rules: nenhuma regra promovida; original preservado.
- Unknowns: identidade visual, legalidade/causalidade da árvore e ranking Show Node Power.
- Next Frontier: uma janela PoB controlável, seleção concreta do cursor 0 e confirmação visual; depois normalização.
## 2026-07-22T20:20:00+01:00 — cursor 0
- Objective: executar inventário/hash/validação XML e priorizar bloqueios do PoB.
- Inputs: 940 XMLs; cursor 0; `-26z68CIDwLz.xml`; SHA-256 `02bacb2e26489e8364fbcf15dea327fa141a653de0e8122d490884bbaee87b2d`.
- Tests: inventário completo e inspeção estática única; XML raiz `PathOfBuilding`, Shadow/Trickster, nível 90, targetVersion `3_0`.
- Comparisons: nenhum candidato, mutação, métrica antes/depois ou causalidade PoB.
- Failures/Rollbacks: execução inicial bloqueada pela política PowerShell; repetida com bypass; `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, Computer Use indisponível.
- Learned Rules: nenhuma regra promovida; original preservado; 940/940 válidos, 0 inválidos.
- Unknowns: identidade/skills/árvore/configuração visual, legalidade e ranking Show Node Power.
- Next Frontier: carregar exatamente o XML no PoB em uma única janela; cursor permanece 0.
# 2026-07-22T20:31:00+01:00
- Inventário: 940/940 válidos, 0 inválidos; cursor 0, XML `-26z68CIDwLz.xml`, hash estável.
- Inspeção: Shadow/Trickster 90, Blade Trap of Laceration, árvore 3_23; baseline estático CombinedDPS 1,207,243.85, vida 2,647, supressão 84.79%, caos 10%.
- Falhas: `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `COMPUTER_USE_UNAVAILABLE`.
- Sem mutação, candidato, delta, regra ou avanço de cursor; original preservado. Próximo: carga visual confirmada do mesmo XML.
-
## 2026-07-22T20:42:00+01:00 — cursor 0
- Objective: reteste estático e priorização dos bloqueios PoB.
- Inputs: 940 XMLs válidos; `-26z68CIDwLz.xml`; SHA-256 `02bacb2e...87b2d`.
- Tests: inventário/hash/XML; PoB iniciado, GUI não observável.
- Result: sem baseline PoB, candidato, mutação ou delta; original preservado.
- Failures: `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `COMPUTER_USE_UNAVAILABLE`.
- Next: confirmar carga visual do XML do cursor 0.

## Run 2026-07-22T20:55:00+01:00
- Objective: retestar cursor 0 e priorizar `POB_LOAD_FAILED`/`SHOW_NODE_POWER_PENDING`.
- Inputs: 940/940 XMLs válidos; `-26z68CIDwLz.xml`; SHA-256 `02bacb2e...87b2d`.
- Tests: hash/XML e inspeção estática única; raiz `PathOfBuilding`, Shadow/Trickster, nível 90, targetVersion `3_0`.
- Result: sem carga visual, cálculo, candidato, mutação, delta ou causalidade PoB; original preservado; `NÃO VALIDADO`.
- Failures: `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `COMPUTER_USE_UNAVAILABLE`; pull/rebase bloqueado por unstaged preexistentes.
- Next Frontier: confirmar seleção/Open e identidade visual do mesmo XML numa única janela PoB.
## Run 2026-07-22T21:25:00+01:00
- Inventário/hash: 940/940 válidos; cursor 0; `-26z68CIDwLz.xml`; hash estável `02bacb2e...87b2d`.
- Inspeção: estática apenas; PoB/Computer Use indisponível.
- Bloqueios: `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `COMPUTER_USE_UNAVAILABLE`.
- Sem candidato, mutação, delta, regra ou avanço; veredito `NÃO VALIDADO`.
2026-07-22T21:37:00+01:00 — Inventory 940/940 valid, cursor 0 `-26z68CIDwLz.xml` hash stable; static identity Shadow/Trickster 90, Blade Trap of Laceration, CombinedDPS 1207243.8489. `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`; no candidate/mutation/delta/rule; verdict `NÃO VALIDADO`. Pull --rebase blocked by unstaged pre-existing changes. Next: confirmed visual import in one PoB window.

## Run 2026-07-22T22:00:00+01:00
- Objective: retestar cursor 0 e priorizar bloqueios PoB.
- Inputs: 940/940 XMLs válidos; `-26z68CIDwLz.xml`; SHA-256 estável `02bacb2e...87b2d`.
- Tests: inventário/hash/validação XML e inspeção estática única; identidade Shadow/Trickster 90, targetVersion `3_0`, CombinedDPS `1207243.8489`, vida `2647`, supressão `84.79%`, caos `10%`.
- Result: candidato, mutação, delta e causalidade não validados; original preservado; veredito `NÃO VALIDADO`.
- Failures/Rollbacks: `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`; `git pull --rebase origin main` bloqueado por alterações unstaged preexistentes; Google Sheet não identificado.
- Learned Rules: nenhuma promoção; frequência não convertida em regra.
- Unknowns: identidade visual, árvore legal, configuração e ranking Show Node Power.
- Next Frontier: importar exatamente o cursor 0 em uma única janela PoB e confirmar identidade visual.
## Run 2026-07-22T22:34:00+01:00
- Objective: priorizar `POB_LOAD_FAILED` e retestar estaticamente o cursor 0.
- Inputs/Tests: inventário/hash/XML; 940/940 válidos, 0 inválidos; `-26z68CIDwLz.xml`, hash `02bacb2e...87b2d`, Shadow/Trickster 90, targetVersion `3_0`.
- Observed: CombinedDPS `1207243.8489`, TotalDPS `16903.5799`, BleedDPS `1069688.2385`, vida `2647`, EHP `38725.2390`, supressão `84.79%`, resistências elementais `75%`, caos `10%`.
- Decision: sem carga PoB confirmada, Show Node Power, candidato, mutação, delta ou causalidade; veredito `NÃO VALIDADO`; original preservado; cursor permanece 0.
- Failures: `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`; `git pull --rebase origin main` bloqueado por unstaged preexistentes; Google Sheet não identificado.
- Learned Rules: `NO_NEW_LEARNING`; frequência não promovida a regra.
- Next Frontier: seleção/Open visual do XML exato numa única janela PoB e confirmação de identidade/métricas antes de Show Node Power.
