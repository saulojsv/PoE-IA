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
