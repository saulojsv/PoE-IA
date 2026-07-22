# Continuous learning

## 2026-07-22T19:49:14+01:00
- run_id: poe-tree-review-aprendizagem-cont-nua; patch `3_0`; baseline_hash `02bacb2e26489e8364fbcf15dea327fa141a653de0e8122d490884bbaee87b2d`.
- experiment: inventário/hash e inspeção única do cursor 0; observed: 940/940 válidos, 0 inválidos; Shadow/Trickster nível 90; TotalDPS estático 16903.58, CombinedDPS 1207243.85, Life 2647, ES 23, resistências elementais 75, chaos 10.
- classification: inconclusive; verdict `NÃO VALIDADO`; nenhum candidato, mutação, delta causal ou rule_delta. PoB visual/Computer Use indisponível.
- next_retest: carregar exatamente este XML no PoB, confirmar identidade/métricas e observar Show Node Power; cursor não avança.

## 2026-07-22T20:12:00+01:00
- run_id: poe-tree-review-aprendizagem-cont-nua; patch `3_0`; baseline_hash `02bacb2e26489e8364fbcf15dea327fa141a653de0e8122d490884bbaee87b2d`.
- experiment: inventario/hash e inspeccao unica do cursor 0; observed: 940/940 validos e identidade/skill recuperadas estaticamente.
- classification: inconclusive; verdict `NAO VALIDADO`; nenhum rule_delta. PoB visual/Computer Use indisponivel.
- next_retest: carga visual confirmada no PoB; nao avancar cursor nem promover regra.

## 2026-07-22T20:00:00+01:00
- run_id: poe-tree-review-aprendizagem-cont-nua
- patch: 3_0; baseline_hash: 02bacb2e26489e8364fbcf15dea327fa141a653de0e8122d490884bbaee87b2d
- experiment: reindexação/hash/XML e inspeção única do cursor 0 (`-26z68CIDwLz.xml`).
- observed: 940/940 válidos, 0 inválidos; Shadow/Trickster, nível 90; métricas estáticas presentes; PoB visual/Computer Use não disponível.
- classification: inconclusive; verdict: NÃO VALIDADO.
- rule_delta: nenhum; 44 duplicatas e divergência 940 vs 930 continuam pendentes; originais preservados.
- next_retest: abrir uma única janela PoB, carregar exatamente o XML, confirmar identidade/métricas e observar Show Node Power.

## 2026-07-22T19:30:00+01:00
- run_id: poe-tree-review-aprendizagem-cont-nua
- patch: 3_0; pob_version: não disponível no XML
- baseline_hash: 02bacb2e26489e8364fbcf15dea327fa141a653de0e8122d490884bbaee87b2d
- experiment: inventário e inspeção sequencial do XML `-26z68CIDwLz.xml`
- prediction: XML válido e identidade Shadow/Trickster recuperável estaticamente.
- observed: 940/940 XMLs válidos; cursor 0; Shadow, Trickster, nível 90, targetVersion 3_0; GUI PoB/Computer Use não disponível para confirmar carga, métricas ou Show Node Power.
- classification: inconclusive
- confounders: identidade estática sem métricas PoB observadas; `expectedFromUser=930` diverge de `totalObserved=940`; 44 grupos duplicados pendentes.
- rule_delta: nenhum; frequência e análise estática não promovem regra.
- verdict: NÃO VALIDADO
- confidence: alta para integridade XML; baixa para otimização.
- next_retest: carregar exatamente este XML em uma única janela PoB e confirmar identidade, métricas e Show Node Power.
## 2026-07-22T19:42:00+01:00 — cursor 0
- Objective: validar o primeiro XML após reindexação.
- Inputs: 940/940 XMLs válidos; `-26z68CIDwLz.xml`; SHA-256 `02bacb2e26489e8364fbcf15dea327fa141a653de0e8122d490884bbaee87b2d`.
- Tests: inspeção estática; PoB visual não disponível.
- Comparisons: nenhum candidato, nenhuma métrica antes/depois.
- Failures/Rollbacks: `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`; pull/rebase bloqueado por worktree sujo.
- Learned Rules: nenhuma regra promovida; frequência/estática não substituem PoB.
- Rejected Rules: nenhuma.
- Unknowns: identidade visual, árvore, skills, causalidade e legalidade permanecem não confirmadas.
- Next Frontier: carregar exatamente este XML no PoB e observar Show Node Power; cursor permanece 0.
## 2026-07-22T20:20:00+01:00
- run_id: poe-tree-review-aprendizagem-cont-nua
- patch: 3_0; baseline_hash: 02bacb2e26489e8364fbcf15dea327fa141a653de0e8122d490884bbaee87b2d
- experiment: inventário/hash/validação e inspeção única do cursor 0.
- observed: 940/940 válidos, 0 inválidos; raiz `PathOfBuilding`; Shadow/Trickster nível 90; métricas estáticas presentes; PoB visual indisponível.
- classification: inconclusive; verdict: `NÃO VALIDADO`.
- rule_delta: nenhum; divergência 940 vs 930 e 44 duplicatas permanecem pendentes.
- next_retest: carga visual confirmada e Show Node Power no PoB.
# Estado atual
- Último ciclo: 2026-07-22T20:31:00+01:00; cursor 0/940.
- Bloqueios: `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `COMPUTER_USE_UNAVAILABLE`.

## Objective
Revalidar o próximo XML e priorizar pendências persistentes.

## Inputs
`-26z68CIDwLz.xml`; SHA-256 `02bacb2e26489e8364fbcf15dea327fa141a653de0e8122d490884bbaee87b2d`; inventário 940 válidos/0 inválidos.

## Candidates
Nenhum candidato legal promovido; PoB visual não carregado.

## Tests
Inspeção única estática do XML; Shadow/Trickster nível 90, Blade Trap of Laceration, árvore 3_23, 6 sockets.

## Comparisons
Baseline estático: CombinedDPS 1,207,243.85; TotalDPS 16,903.58; TotalDotDPS 1,069,688.24; vida 2,647; supressão 84.79%; caos 10%; mana livre 71. Sem delta antes/depois.

## Failures/Rollbacks
PoB/Computer Use não confirmaram carga, identidade, cálculo ou Show Node Power. Veredito: `NÃO VALIDADO`; cursor preservado em 0.

## Learned Rules
Nenhuma regra nova: frequência e previsão estática não substituem validação PoB.

## Rejected Rules
Não transformar esta baseline em recomendação de árvore.

## Unknowns
Legalidade causal, ranking Show Node Power, mutação e métricas pós-mudança.

## Next Frontier
Carregar visualmente o mesmo XML numa única janela PoB e confirmar identidade antes de qualquer mutação.

## Run 2026-07-22T21:25:00+01:00
- Objective: reteste do cursor 0 e erros pendentes.
- Inputs: 940 XMLs observados; `-26z68CIDwLz.xml`; SHA-256 `02bacb2e...87b2d`; original preservado.
- Tests: inventário/hash e inspeção XML estática; carga visual/Show Node Power indisponíveis.
- Result: sem candidato, mutação, delta causal ou regra; veredito `NÃO VALIDADO`.
- Failures/Rollbacks: `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `COMPUTER_USE_UNAVAILABLE`; cursor mantido em 0.
- Learned Rules: `NO_NEW_LEARNING`; frequência/predição estática não promove regra.
- Next Frontier: confirmar identidade e métricas no PoB antes de testar rota.

## Run 2026-07-22T20:55:00+01:00
- Reteste estático do cursor 0: 940/940 válidos; hash estável; raiz `PathOfBuilding`, Shadow/Trickster, nível 90, targetVersion `3_0`.
- `unresolved`; `NÃO VALIDADO`; `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `COMPUTER_USE_UNAVAILABLE`; sem candidato, mutação, delta ou regra.
- Próximo reteste: carga visual confirmada, identidade e métricas não vazias.
-
## Run 2026-07-22T20:42:00+01:00
- 940/940 XMLs válidos; cursor 0 e hash estáveis.
- `NO_NEW_LEARNING`: sem carga PoB, Show Node Power, mutação ou delta antes/depois.
- Bloqueios: `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `COMPUTER_USE_UNAVAILABLE`.
- Próximo reteste: carga visual confirmada do mesmo XML.
