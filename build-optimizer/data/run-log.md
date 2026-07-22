# Run log

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
