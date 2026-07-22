# PoE Tree Review — aprendizagem contínua

## Run 2026-07-22 07:52:22+01:00

Reteste estático do cursor 3: 940/940 XMLs válidos, hash do `_fast_more_8_build_3.xml` estável. Sem GUI observável, carga PoB, Show Node Power, mutação ou recálculo; `NÃO VALIDADO`, `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `NO_NEW_LEARNING`. Cursor permanece 3; nenhuma regra promovida. Próximo teste: mesma build com GUI observável.

Arquivo cumulativo da automação recorrente. Cada execução deve acrescentar uma seção; não apagar histórico nem alterar XMLs originais.

## Contrato de realimentação

Cada run deve maximizar informação útil: registrar contexto, versão, fonte, hipótese, métrica antes/depois, nós e rotas, configurações, defesa, recursos, warnings, erro, rollback, confiança, contraexemplo e próximo experimento. Repetição textual deve ser comprimida; evidência não deve ser omitida. Regras sem rastreabilidade permanecem hipóteses.

## Run inicial — 2026-07-21

- Estado: automação criada para executar a cada 10 minutos.
- PoB: `C:\Users\saulo\AppData\Roaming\Path of Building Community\Path of Building.exe`.
- Arquivo analisado: `run-20260721-234343.md`.
- Cobertura: 1.194 XMLs verificados; 934 PoBs válidos; 260 XMLs auxiliares ignorados; 0 falhas.
- Versões: 639 árvores `3_28`, 194 `3_28_alternate`, demais versões antigas separadas.
- Regras confirmadas: separar versões; frequência de nó é apenas pista; XML salvo não prova delta de uma nova alocação; validar defesa e funcionalidade antes de DPS.
- Limitação atual: recálculo gráfico de nós depende de controle observável da interface do PoB; análise XML é segura, mas não substitui teste interativo.
- Próximo experimento: detectar novos/alterados XMLs, comparar por versão e selecionar rotas para teste em checkpoint.

## Protocolo de busca ativa

Cada execução deve manter a fronteira `untested`, `testing`, `measured`, `rejected` e `retest`; gerar várias rotas legais; comparar candidatos de dano, defesa/recurso e eficiência de caminho; testar em lotes com checkpoints; rever rejeitados quando as premissas mudarem; e repetir até não existir candidato capaz de alterar a decisão.

## Contrato de estudo de mecânicas e PoB

Em cada mecânica relevante, consultar o PoE Wiki, registrar URL/data/patch/claim, explicar por que o PoB mostra o valor, mapear a informação para a aba/field correto, testar uma variável e uma combinação, e classificar o resultado. Abrir o executável do PoB em todo run; registrar navegação, cliques/atalhos, path-trace, tooltips, undo/redo, tabs, warnings e blockers. Nunca declarar interação de interface ou recálculo que não tenha sido observado.

## Gate Show Node Power

Toda exploração da árvore deve iniciar com `Show Node Power` visível e ativo, usando a skill/configuração correta. O log precisa guardar ranking, candidatos, custo de caminho, previsão, exclusões e rota escolhida. Sem observação do recurso, registrar `SHOW_NODE_POWER_PENDING` e não considerar a rota potencializada/ranqueada.
## Run 2026-07-21 23:52:35 - poe-tree-review-aprendizagem-cont-nua

### Objective
Revisar XMLs e atualizar a fronteira sem alterar originais.

### Inputs
- PoB confirmado em `C:\Users\saulo\AppData\Roaming\Path of Building Community\Path of Building.exe`.
- Indexador: `C:\Users\saulo\.codex\skills\poe-tree-review\scripts\review_pob_xmls.ps1`.
- Snapshot `run-20260721-235235`: 1194 XMLs, 934 PoBs, 260 auxiliares, 0 falhas.
- Tree versions: 3_28=639, 3_28_alternate=194; demais particionadas.

### Candidates
- Dano: nos frequentes, ainda sem nomes/rotas resolvidos.
- Defesa/recurso: outliers de vida <3000 (280), resistencias e custos.
- Eficiencia de caminho: rotas curtas por classe/arquetipo.
- Frontier: `untested` candidatos; `testing` nenhum; `measured` baseline XML; `rejected` frequencia como prova; `retest` regras apos mudanca de patch/config/tree.

### Tests
- Indexacao completa em lote; checkpoint preservado.
- Comparacao com `run-20260721-234343`: 0 linhas metricas alteradas; nenhum XML novo/alterado detectavel por conteudo.
- Recalculo interativo pendente: PoB aberto, interface nao observada/controlada.

### Comparisons
- Antes/depois: 934/934 PoBs, 1194/1194 XMLs, 0 alteracoes; nenhum delta causal promovido.
- Patch/tree_version/classe/ascendencia/skill/nos/masteries/sockets/itens/configuracao seguem descritivos, nao experimentais.

### Failures/Rollbacks
- Politica PowerShell bloqueou a primeira chamada; repetida com `-ExecutionPolicy Bypass`, sem impacto.
- Nenhuma mutacao, brick, sobrescrita ou rollback.

### Learned Rules
- Manter reindexacao e separacao por versao antes de comparar frequencia; evidencias nos snapshots 234343/235235.
- XML salvo nao mede delta de no; confianca media em higiene/versionamento, baixa em gameplay.

### Rejected Rules
- No frequente melhora a build: rejeitada como causalidade.
- Vida baixa implica build invalida: nao promovida sem contexto ES/low-life.

### Unknowns
- Nomes/efeitos dos IDs, rotas legais e deltas de DPS/defesa/recurso nao foram medidos no PoB.

### Next Frontier
Testar no PoB, com checkpoint, tres rotas legais da mesma classe/ascendencia/tree_version: dano, defesa/recurso e eficiencia de caminho.

## Run 2026-07-21 23:57:11 - poe-tree-review-aprendizagem-cont-nua

### Objective
Reindexar o arquivo, detectar alteracoes e preservar a fronteira sem mutar XMLs.

### Inputs
- PoB iniciado em `C:\Users\saulo\AppData\Roaming\Path of Building Community\Path of Building.exe`.
- Skill principal relida; `learning-loop.md`, `learned-rules.md`, `poewiki-mechanics.md` e `continuous-learning.md` nao existem no diretorio da skill; usado o arquivo cumulativo local.
- Indexador: `C:\Users\saulo\.codex\skills\poe-tree-review\scripts\review_pob_xmls.ps1`.

### Candidates
- Dano, defesa/recurso e eficiencia de caminho permanecem `untested`.
- `testing`: nenhum; `measured`: baseline XML; `rejected`: frequencia como causalidade; `retest`: regras sob mudanca de patch/config/tree.

### Tests
- Indexacao completa: 1.194 XMLs, 934 PoBs validos, 260 auxiliares, 0 falhas.
- Nenhum XML novo/alterado detectado por timestamp desde o snapshot anterior.
- Nenhum clique, tooltip, path-trace, undo/redo, tab, warning visual ou recalculo foi observado/controlado; UI e testes PoB ficaram pendentes.

### Comparisons
- Snapshot anterior: 1.194/934/260/0; novo: 1.194/934/260/0; delta de cobertura: 0.
- Relatorio novo aponta 1 outlier de life <3000; nao e comparavel ao contador anterior sem explicar a diferenca do parser, portanto inconclusive.

### Failures/Rollbacks
- Primeira execucao bloqueada pela ExecutionPolicy; repetida com `-ExecutionPolicy Bypass`, sem mutacao.
- Nenhum brick, sobrescrita, rollback ou fonte Wiki consultada neste run; nenhuma claim mecanica foi promovida.

### Learned Rules
- `confirmed`: reindexar e separar por versao antes de comparar; 3_28=639 e 3_28_alternate=194 no snapshot.
- `inconclusive`: contador de outliers de life entre snapshots requer auditoria do parser antes de virar metrica.

### Rejected Rules
- Frequencia de node prova melhoria causal: rejeitada.
- XML estatico prova delta de DPS/defesa: rejeitada.

### Unknowns
- UI atual, Show Node Power, rotas legais, nomes/efeitos dos IDs, claims Wiki e deltas PoB continuam desconhecidos.

### Next Frontier
Abrir um XML homogeneo por classe/ascendancy/tree_version no PoB e observar a UI; depois testar, com checkpoint, uma rota de dano, uma de defesa/recurso e uma de eficiencia.
## Run 2026-07-22 07:25:00

Reteste do XML Ã­ndice 3 `_fast_more_8_build_3.xml`: 940/940 PoBs vÃ¡lidos, 0 falhas; hash e baseline estÃ¡ticos estÃ¡veis. Computer Use indisponÃ­vel; sem carga confirmada, Show Node Power, mutaÃ§Ã£o, recÃ¡lculo ou delta. `NÃƒO VALIDADO`; `NO_NEW_LEARNING`; cursor permanece 3. Pull/rebase/commit/push nÃ£o executados por alteraÃ§Ãµes unstaged preexistentes.

## Run 2026-07-22 15:47:00+01:00

Reindexação canônica 940/940 válida, 0 falhas. Cursor 3 retestado sem GUI observável; sem carga PoB confirmada, Show Node Power, mutação, recálculo ou delta. `NÃO VALIDADO`; POB_LOAD_FAILED, COMPUTER_USE_UNAVAILABLE, SHOW_NODE_POWER_PENDING, POB_CLOSE_BLOCKED. Nenhuma regra promovida; cursor permanece 3.

## Ciclo sequencial do arquivo

## Run 2026-07-22 07:17:18+01:00

### Objective
Retestar o XML imutável do cursor 3 e preservar a fronteira de validação.

### Inputs
`_fast_more_8_build_3.xml`; Templar/Hierophant, nível 100, árvore `3_28`, 135 nós; SHA-256 `5530FF45E2C3B711EAD96F15D8A7317A98550E51775417712ECDAC234DF682BA`. Baseline estático: TotalDPS 5.183.879,83; CombinedDPS 5.188.054,69; vida 3.548; ES 1.356; armadura 40.154; mana 1.072; warnings 0. Reindexação canônica: 940/940 válidos, 0 falhas.

### Tests / Comparisons
PoB iniciado, mas Computer Use/GUI não observável; não houve seleção/Open confirmados, identidade visual, Show Node Power, mutação, recálculo ou delta antes/depois. Veredito: `NÃO VALIDADO`.

### Failures/Rollbacks
`POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`. Foram detectados 3 processos PoB; sem controle visual não foi seguro fechar nenhum: `POB_CLOSE_BLOCKED`. XML preservado, sem mutação/rollback.

### Learned Rules / Unknowns
`NO_NEW_LEARNING`: processo responsivo e baseline XML não provam carga nem recálculo. Ranking, rota legal, deltas, uptime e brick risk continuam desconhecidos; nenhuma regra promovida.

### Next Frontier
Retentar o mesmo XML somente com GUI observável e resolver a fila de carga/fecho antes de otimizar.

## Run 2026-07-22 07:07:21

### Objective
Retestar a pendência do cursor 3 sem alterar o XML imutável.

### Inputs
`_fast_more_8_build_3.xml`; Templar/Hierophant, nível 100, árvore `3_28`, 135 nós. Reindexação: 940/940 PoBs válidos, 0 falhas. Baseline estático: TotalDPS 5.183.879,83; CombinedDPS 5.188.054,69; vida 3.548; ES 1.356; armadura 40.154; mana 1.072; custo 19; warnings 0; SHA-256 estável `5530FF45...DF682BA`.

### Tests / Comparisons
Somente parser e leitura estática. Computer Use não está disponível nesta sessão; não houve Open confirmado, identidade visual, Show Node Power, mutação, recálculo ou delta antes/depois. Veredito: `NÃO VALIDADO`.

### Failures/Rollbacks
`POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`. Nenhuma mutação nem rollback; cursor permanece 3. Não encerrar processo PoB preexistente sem controle visual.

### Learned Rules / Unknowns
`NO_NEW_LEARNING`: reindexação e baseline estático não substituem carga e recálculo PoB. Ranking, rota legal, deltas, uptime e brick risk continuam desconhecidos; nenhuma regra promovida.

### Next Frontier
Retentar o mesmo XML apenas quando Computer Use estiver disponível; confirmar carga e Show Node Power antes de qualquer teste.

## Run 2026-07-22 12:17

Reteste do XML índice 3 `_fast_more_8_build_3.xml`: reindexação canônica 940/940 válidos, hash estático estável. O PoB preexistente estava responsivo, mas a GUI não foi observável; a instância aberta pelo run foi fechada normalmente. Sem carga confirmada, Show Node Power, mutação, recálculo ou delta. `NÃO VALIDADO`; `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`; cursor permanece 3. `NO_NEW_LEARNING`; nenhuma regra promovida.

## Run 2026-07-22 11:00:00+01:00

### Objective
Retestar o XML imutável no cursor 3 e preservar a fronteira de validação.

### Inputs
`_fast_more_8_build_3.xml`; Templar/Hierophant, nível 100, árvore 3.28, 135 nós. Reindexação canônica: 940/940 PoBs válidos, 0 falhas. Baseline estático: TotalDPS 5.183.879,83; CombinedDPS 5.188.054,69; vida 3.548; ES 1.356; armadura 40.154; mana não reservada 108.

### Candidates
Reteste de carga, Show Node Power e, somente após confirmação, uma rota de dano, uma de defesa/recurso e uma de eficiência.

### Tests
Somente análise estática e verificação do executável; Computer Use/GUI observável indisponível. Não houve seleção/Open confirmados, carga visual, Show Node Power, mutação, recálculo ou delta.

### Comparisons
Sem comparação antes/depois. Veredicto: `NÃO VALIDADO`.

### Failures/Rollbacks
`POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`. Nenhuma mutação; cursor permanece 3.

### Learned Rules
`NO_NEW_LEARNING`: reindexação estável e processo do PoB não provam build carregada nem substituem cálculo visual.

### Rejected Rules
Nenhuma regra de gameplay promovida.

### Unknowns
Ranking, nomes/rotas legais, deltas, uptime e brick risk.

### Next Frontier
Repetir o mesmo XML apenas quando a GUI do PoB estiver observável.

## Run 2026-07-22 10:27:28+01:00

### Objective
Retestar a pendência no cursor 3 sem alterar o XML imutável.

### Inputs
`_fast_more_8_build_3.xml`; Templar/Hierophant, nível 100, árvore 3_28, 135 nós. Reindexação canônica: 940/940 válidos, 0 falhas. PoB PID 10692 responsivo, sem controle visual observável.

### Candidates
Frontier permanece `retest`: confirmação de carga, Show Node Power e depois rotas de dano, defesa/recurso e eficiência.

### Tests
Reindexação estática e verificação do processo PoB. Nenhuma seleção/Open, identidade, Show Node Power, mutação ou recálculo foi confirmado.

### Comparisons
Sem antes/depois e sem delta causal. Veredito: `NÃO VALIDADO`.

### Failures/Rollbacks
`POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`. Nenhuma mutação ou rollback; cursor permanece 3.

### Learned Rules
`NO_NEW_LEARNING`: baseline estático e processo responsivo não provam build carregada nem substituem recálculo PoB.

### Rejected Rules
Nenhuma regra de gameplay promovida.

### Unknowns
Ranking Show Node Power, nomes/rotas legais, deltas, uptime e brick risk.

### Next Frontier
Repetir o mesmo XML quando a GUI estiver observável e controlável.

## Run 2026-07-22 10:18:00+01:00

Reteste do índice 3 `_fast_more_8_build_3.xml`: reindexação canônica 940/940 válidos, baseline Templar/Hierophant nível 100, árvore 3_28, 135 nós, Total DPS 5.183.879,83, vida 3.548, ES 1.356, armour 40.154. PoB mostrou a lista inicial única, mas entrada/importação não foi confirmada; sem carga, Show Node Power, mutação, recálculo ou delta. `NÃO VALIDADO`; `POB_LOAD_FAILED`, `COMPUTER_USE_INPUT_UNCONFIRMED`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`; cursor permanece 3. `NO_NEW_LEARNING`.

## Run 2026-07-22 04:02:43+01:00

### Objective
Retestar a pendência no cursor 3 sem alterar o XML imutável.

### Inputs
`_fast_more_8_build_3.xml`; Templar/Hierophant, nível 100, árvore 3_28, 135 nós; Total DPS 5.183.879,83; vida 3.548; ES 1.356; armour 40.154; resistências 84; mana cost 19; warnings 0. Reindexação: 940/940 válidos, 0 falhas.

### Tests
Computer Use/observação visual indisponível. Não foi possível confirmar seleção/Open, identidade carregada, Show Node Power, mutação ou recálculo.

### Comparisons
Baseline estático igual ao run anterior; nenhum antes/depois ou delta causal. Veredito: `NÃO VALIDADO`.

### Failures/Rollbacks
`POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`. Nenhuma mutação; XML preservado. Google Sheets não conectado.

### Learned Rules
`NO_NEW_LEARNING`: reindexação e hash estáveis não substituem carga visual e recálculo PoB; cursor permanece 3.

### Rejected Rules
Nenhuma regra de gameplay promovida.

### Unknowns
Ranking Show Node Power, rota legal, deltas de dano/defesa/recurso, uptime e brick risk.

### Next Frontier
Retentar o mesmo XML somente com GUI observável; confirmar carga e Show Node Power antes de qualquer teste.

## Run 2026-07-22 03:42:29

Reteste do XML índice 3 `_fast_more_8_build_3.xml`: reindexação 940/940 válidos, 0 falhas; baseline estático Templar/Hierophant nível 100, tree 3_28, 135 nós, Total DPS 5,183,879.83, vida 3,548, ES 1,356, armour 40,154. Computer Use indisponível; sem carga visual, Show Node Power, mutação, recálculo ou delta. `NÃO VALIDADO`; `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`; cursor permanece 3. `NO_NEW_LEARNING`.

## Run 2026-07-22 05:25:00

### Objective
Retestar a pendência no XML índice 3 e preservar a evidência.

### Inputs
`_fast_more_8_build_3.xml`; Templar/Hierophant, nível 100, árvore 3_28, 135 nós; CombinedDPS 5.188.054,69, TotalDPS 5.183.879,83, vida 3.548, ES 1.356, armour 40.154, evasion 26, resistências 84, mana cost 19, warnings 0. Reindexação: 940/940 XMLs válidos, 0 falhas.

### Tests
PoB existente PID 10692 responsivo; Computer Use observável não disponível. Não foi possível confirmar seleção, Open, identidade, Show Node Power, mutação ou recálculo.

### Comparisons
Nenhum antes/depois; cursor permanece 3. Veredito: `NÃO VALIDADO`.

### Failures/Rollbacks
`POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`. Nenhuma mutação ou rollback; Google Sheets não conectado.

### Learned Rules
Processo responsivo não prova build carregada; sem identidade e métricas visíveis, não avançar cursor nem promover rota. Regra operacional, confiança alta; gameplay, zero.

### Unknowns
Ranking Show Node Power, rota legal, delta PoB, uptime e impacto defensivo.

### Next Frontier
Repetir o índice 3 com controle visual observável; confirmar carga e Show Node Power antes de testar.

## Run 2026-07-22 02:52:10

Reteste do XML índice 3 `_fast_more_8_build_3.xml`: Computer Use indisponível, sem carga visual, Show Node Power, mutação, recálculo ou delta. `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`; `NÃO VALIDADO`, `NO_NEW_LEARNING`; cursor permanece 3. `git pull --rebase` falhou por alterações unstaged preexistentes.

## Run 2026-07-22 03:30:00

Reteste do XML índice 3 `_fast_more_8_build_3.xml`: Computer Use indisponível; sem carga visual, Show Node Power, mutação, recálculo ou delta. `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`; `NÃO VALIDADO`, `NO_NEW_LEARNING`, cursor permanece 3. Próximo: mesma build com GUI observável.

## Run 2026-07-22 00:38:17

Objective: retomar o XML índice 3 e resolver o bloqueio visual.

Testes: PoB abriu como processo único responsivo; Builds/Open, identidade visual e Show Node Power não foram observados. Nenhuma mutação; processo encerrado graciosamente.

Aprendizado: baseline estático válido não equivale a build carregada; sem identidade visível e Show Node Power, a rota permanece não validada.

Próximo: repetir este XML somente com controle visual observável; cursor permanece no índice 3.

## Run 2026-07-22 00:18:00

### Objective
Inspecionar um único XML sequencial e manter a fila de validação sem mutar originais.

### Inputs
XML índice 2: `absolution/Absolution - ID 2.xml`; raiz `PathOfBuilding`; Witch/Necromancer; nível 95; `targetVersion=3_0`; `treeVersion=3_28`; 125 nós.

### Candidates
Dano de Absolution/minions; defesa/recurso priorizando a vida reportada como 1; eficiência de rota. Transferência de regras: `conditional_transfer` apenas para separar versões e exigir gates, não para gameplay.

### Tests
Indexador: 910 XMLs, 909 PoBs, 0 falhas. Leitura estática do XML; PoB iniciado sem elevação, mas sem confirmação visual de carga, identidade, métricas calculadas ou `Show Node Power`.

### Comparisons
Baseline salvo: CombinedDPS 171390.3431074; vida 1; ES 2270; armour 35204; evasion 2166; caos 22; mana 1213; warnings 0. Sem antes/depois e sem delta causal.

### Failures/Rollbacks
`GUI_PERMISSION_NOT_GRANTED`, `SHOW_NODE_POWER_PENDING` e `POB_LOAD_FAILED` permanecem. Nenhuma alocação, clique, recálculo ou alteração do XML. Processo PoB aberto pelo run foi fechado e verificado ausente.

### Learned Rules
Novo fato: esta variante é uma build híbrida com vida efetiva reportada como 1 e ES 2270; qualquer rota de dano fica bloqueada até confirmar low-life/ES, reserva e funcionalidade. Regra de segurança permanece hipótese específica do XML, não generalizada.

### Rejected Rules
Nenhuma regra de gameplay promovida; DPS estático não valida rota.

### Unknowns
Skills efetivas, itens, configuração, masteries, nomes dos nós, warnings visuais e ranking Show Node Power.

### Next Frontier
Reabrir este XML com observação autorizada/observável; confirmar identidade e configuração antes de medir uma única rota de defesa/recurso.

## Run 2026-07-22 00:13:15

### Objective
Repetir a inspeção do XML pendente `absolution/Absolution - ID 1.xml` e resolver `SHOW_NODE_POWER_PENDING` antes de qualquer mutação.

### Inputs
PoB lançado pelo executável instalado, sem elevação. Parser estático: 910 XMLs escaneados, 909 PoB válidos, 0 falhas.

### Tests
O PoB expôs duas janelas e uma janela `Não responde`; depois mostrou `Imported build (Scion)` por processo, mas a janela desapareceu antes da observação acessível. Import/Open, identidade do XML, árvore, skills, métricas e Show Node Power não foram confirmados.

### Comparisons
Nenhum antes/depois; nenhuma alocação ou recálculo.

### Failures/Rollbacks
`POB_LOAD_FAILED`: carga/identidade do XML pendente não confirmada. `SHOW_NODE_POWER_PENDING` permanece. Nenhum prompt de permissão observado; nenhum clique, UAC, mutação ou fechamento forçado.

### Learned Rules
PoB não deve ser considerado carregado por título/processo; a confirmação exige identidade visível e métricas não vazias. Confiança alta para este bloqueio operacional.

### Rejected Rules
Nenhuma regra de gameplay promovida.

### Unknowns
Árvore, skills, métricas, warnings, ranking de nós e rotas continuam não observados.

### Next Frontier
Na próxima execução, verificar primeiro se o PoB já está aberto; se não, abrir uma única vez e aguardar uma janela observável. Repetir Import/Open do XML pendente; se não houver carga confirmada, não testar.

## Run 2026-07-22 00:10:00

### Objective
Inspecionar um XML sequencial e resolver a fila pendente antes de nova exploração.

### Inputs
XML índice 1: `absolution/Absolution - ID 1.xml`; raiz `PathOfBuilding`; Templar/Guardian; nível 96; targetVersion 3_0; modo IMPORT.

### Tests
PoB aberto e fechado com segurança. Acessibilidade retornou apenas a janela; `Show Node Power`, path-trace, tooltip e tabs não foram observáveis. Nenhuma mutação.

### Comparisons
Sem alteração antes/depois; deltas não medidos. Arquivo original intacto.

### Failures/Rollbacks
`SHOW_NODE_POWER_PENDING` permanece após retry com método de observação diferente; sem brick, warning novo ou rollback.

### Learned Rules
Sem observação do controle, não promover rota power-ranked nem delta causal. `targetVersion=3_0` continua particionado das árvores 3_28.

### Unknowns
Rotas, nomes/IDs completos, ranking de nós, métricas recalculadas e warnings visuais.

### Next Frontier
Reabrir este XML e obter observação visual/controle de `Show Node Power` antes de alocar.

## Run 2026-07-22 00:02:00

Objective: inspeção única e imutável do XML `data/poe_ninja/poe_ninja_dataset/xml/5hfezli6lrvf/5hfezli6lrvf_75c63ee4.xml`.

Inputs: raiz `PathOfBuilding`; nível 95; Duelist/Champion; `targetVersion=3_0`; Double Strike principal com Brutality, Multistrike, Close Combat, Melee Physical Damage e Impale; delivery melee crit/physical/impale. Skills auxiliares incluem Leap Slam, Vaal Molten Shell, Blood Rage, Precision, Assassin's Mark, Grace, Flesh and Stone e Determination.

Baseline salvo: TotalDPS 7.466.990; CombinedDPS 14.727.743; vida 3.884; EHP 39.651; armour 72.321; evasion 72.998; mana livre 32; resistências elementais 75%; caos -14%; regen líquido de vida 255,1.

TreeSpec/masteries/rotas, nomes completos de itens/flasks, Config e warnings não foram confirmados pelos campos parseados; não foram inventados. PoB foi iniciado, mas UI, Show Node Power, path-trace, tooltips e recálculo não foram observados: `SHOW_NODE_POWER_PENDING`.

Candidates: dano crítico/impale; defesa/recurso vida-mana-caos; eficiência de rota. Nenhuma mutação, delta ou rollback; classificação `unresolved`. Novo aprendizado: baseline híbrido com apenas 32 mana livre e caos negativa exige gates de recurso/defesa antes de aceitar DPS. Regra revisada: `targetVersion=3_0` deve permanecer separado de árvores 3_28; confiança média, escopo deste XML.

Next Frontier: abrir este XML com UI observável, ativar Show Node Power e medir uma rota de dano, uma de defesa/recurso e uma de eficiência com checkpoint.

Inspecionar exatamente um XML por vez, salvando cursor e nota individual. Ao atingir todos os XMLs atuais, voltar ao zero e fazer uma síntese completa do aprendizado, separada por skill/arquetipo/delivery/defesa. Cada tipo novo precisa de uma base de conhecimento própria antes de promover regras.
## Importação PoB — correção 2026-07-22

- Falha observada: abrir o executável e tentar tratar o caminho local como import deixou `Imported build (Scion)` vazio, nível 1, sem skills e com métricas padrão.
- Causa: esta instalação aceita o XML pelo fluxo interno/lista de builds; abrir o `.exe` sozinho não carrega o arquivo.
- Correção: criado `scripts/stage_pob_xml.ps1`, que valida `/PathOfBuilding` e copia o XML original para `C:\Users\saulo\Documents\Path of Building\Builds` com nome único.
- Teste executado: XML Crackling Lance staged com sucesso como `Review-test-import-external_pobb_ZWtqnxz3xrzQ.xml`.
- Gate seguinte: abrir pela lista do PoB e confirmar identidade, skills, árvore e métricas antes de Show Node Power.
- Limitação: a abertura visual/lista não foi confirmada nesta execução sem autorização de controle gráfico.

## Biblioteca canônica do PoB — 2026-07-22

- Pasta confirmada: `C:\Users\saulo\Documents\Path of Building\Builds`.
- Ação: 934 XMLs PoB válidos movidos para `Builds\PoE-IA Archive`, preservando a estrutura relativa; XMLs auxiliares não foram movidos.
- Regra: abrir a pasta/lista inicial do PoB e carregar a build específica pela lista; não usar caminho local como argumento do executável.
- Próximo gate: confirmar visualmente identidade, skills, árvore e métricas antes de Show Node Power.

## Biblioteca achatada — 2026-07-22

- 936 XMLs PoB foram movidos das subpastas para a raiz `C:\Users\saulo\Documents\Path of Building\Builds`.
- 73 nomes receberam prefixo para resolver colisões sem sobrescrever arquivos.
- Resultado: 940 XMLs diretamente na pasta principal; 0 XMLs permanecem em subpastas.
- O cursor do ciclo foi ajustado para o total atual da biblioteca: 940.

## Fluxo de abertura confirmado — 2026-07-22

- Sequência correta: `Open PoB → Back → Builds/subpasta → selecionar linha → Open → confirmar build → Show Node Power`.
- Falha evitada: tentar importar pelo caminho do XML ou usar a tela `Imported build` vazia.
- Regra nova: se `Open` estiver desativado, selecionar uma linha; se a lista estiver vazia, diagnosticar `POB_BUILD_LIST_EMPTY` e corrigir a biblioteca antes de testar.
## Run 2026-07-22 00:40:00

### Objective
Inspecionar exclusivamente o XML índice 3 pela biblioteca canônica e resolver o bloqueio visual antes de qualquer teste.

### Inputs
- XML: `Bleeding Base.xml`; Duelist/Gladiator; nível 98; `targetVersion=3_0`.
- Baseline estático: CombinedDPS 20.425.034; TotalDPS 1.021.830; vida 5.385; ES 49; armour 27.983; evasion 33; mana 734.

### Tests
Executável aberto sem argumentos e respondeu. O fluxo Back → Builds → seleção → Open não pôde ser observado/controlado; identidade, skills, árvore, métricas visíveis e Show Node Power não foram confirmados.

### Comparisons
Nenhum antes/depois; nenhuma mutação, recálculo ou rota power-ranked.

### Failures/Rollbacks
`POB_LOAD_FAILED`, `GUI_PERMISSION_NOT_GRANTED`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`. Sem encerramento forçado.

### Learned Rules
A biblioteca e o executável estão acessíveis, mas abrir o processo não prova carregamento; a confirmação visual continua obrigatória.

### Unknowns
Lista Builds, seleção, identidade visual, skills, tree_version, nós, métricas não vazias e ranking Show Node Power.

### Next Frontier
Resolver `POB_CLOSE_BLOCKED` e executar o fluxo visual para este mesmo XML; não avançar o cursor.

## Run 2026-07-22 00:48:00

### Objective
Retomar o XML índice 3 na raiz canônica e obter estado visual confiável antes de qualquer teste.

### Inputs
- XML: `C:\Users\saulo\Documents\Path of Building\Builds\Bleeding Base.xml`; Duelist/Gladiator; nível 98; `targetVersion=3_0`.
- Baseline estático previamente confirmado: CombinedDPS 20.425.034; TotalDPS 1.021.830; vida 5.385; ES 49; armour 27.983; evasion 33; mana 734.

### Tests
PoB foi aberto sem argumentos e a janela foi capturada. A imagem exibida era gameplay de `The Spell Brigade`, apesar do título `Path of Building`; Back, Builds, seleção, Open, identidade, árvore, skills, métricas e Show Node Power ficaram indisponíveis.

### Comparisons
Nenhuma mutação, recálculo, observação de node power ou delta antes/depois.

### Failures/Rollbacks
`POB_LOAD_FAILED`, `GUI_WRONG_CONTENT`, `SHOW_NODE_POWER_PENDING`. A instância aberta foi fechada com Alt+F4 e não restou processo PoB visível.

### Learned Rules
O título da janela não é evidência suficiente de conteúdo; a captura visual precisa mostrar a interface PoB antes de usar Back ou Open. Nenhuma regra de árvore foi promovida.

### Unknowns
Estado da lista Builds, identidade visual, árvore, skills, métricas calculadas e ranking Show Node Power.

### Next Frontier
Reabrir o mesmo XML somente após confirmar que a janela renderiza a interface PoB; manter o cursor no índice 3.
## 2026-07-22 01:45
- Objective: retry XML index 3 `_fast_more_8_build_3.xml` from the canonical Builds root.
- Result: static identity Templar Hierophant level 100, targetVersion 3_0; static TotalDPS 5,183,879.8297441, CombinedDPS 5,184,054.6920088, life 3,548, ES 1,356, armour 40,154, evasion 26, chaos 75.
- GUI: `COMPUTER_USE_UNAVAILABLE`; no load, identity, metrics, mutation, or Show Node Power confirmation.
- Rule delta: static parsing remains triage evidence only; cursor stays at 3 until visual validation.
## 2026-07-22 02:00:00 +01:00 — retry index 3

Objective: resolve the queued GUI validation for `_fast_more_8_build_3.xml` from the canonical `Path of Building\\Builds` root.

Inputs: Templar Hierophant, level 100, targetVersion 3_0; static baseline retained from prior checkpoint (TotalDPS 5,183,879.8297441; CombinedDPS 5,184,180.5676757; life 3548; ES 1356; armour 40154; evasion 26; chaos resistance 75).

Tests: launched the configured executable without arguments; process exposed title `Path of Building`, but no computer-control/visual interaction was available, so Builds → select → Open, identity, tree, skills, metrics, and Show Node Power remained unconfirmed. Graceful close was attempted; process remained nonresponsive.

Failures/Rollbacks: `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`; no mutation or delta claimed.

Learned Rules: GUI validation remains blocked until observable controls are available and the prior PoB process is closed; static XML evidence cannot promote a route.

Next Frontier: close/verify the existing process, then retry the same XML through the visible saved-build list before advancing the cursor.

## 2026-07-22 02:35:00 +01:00

Objective: retry canonical XML index 3 `_fast_more_8_build_3.xml`.
Result: two responsive PoB processes appeared, but GUI controls were unavailable; no load, identity, metrics, Show Node Power, mutation, recalculation, or delta. Recorded `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`; cursor remains index 3.
Next Frontier: verify all PoB instances are closed, then retry this same XML with observable GUI control.
## 2026-07-22 01:11:36

Objective: retry GUI validation of canonical XML index 3. PoB launched responsively, but the Computer Use runtime was unavailable; no saved-build load, identity, metrics, Show Node Power, mutation, or delta was confirmed. Graceful close remained blocked. Rule unchanged: executable launch is not validation; unresolved GUI blockers stay ahead of new optimization.

## 2026-07-22 02:20:00 +01:00

Objective: retry visual validation of canonical XML index 3 `_fast_more_8_build_3.xml`.
Tests: executable launched and process path verified; GUI controls remained unobservable (`COMPUTER_USE_UNAVAILABLE`).
Result: no load, identity, metrics, Show Node Power, mutation, recalculation, or delta. `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`; no force-close used. `NO_NEW_LEARNING`; cursor remains index 3.
Next Frontier: close/verify the existing PoB process, then retry the same XML only with observable GUI controls.

## 2026-07-22 01:42:50 +01:00

### Objective
Retry the queued canonical XML index 3 without advancing until PoB validation is observable.

### Inputs
`_fast_more_8_build_3.xml`; Templar/Hierophant; level 100; `targetVersion=3_0`. Static skills include Kinetic Blast/Kinetic Fusillade and defensive/reservation skills. Static baseline: TotalDPS 5,183,879.8297441; CombinedDPS 5,188,054.6920088; life 3,548; ES 1,356; armour 40,154; evasion 26; chaos 75%.

### Tests
Executable launched without arguments. Two responsive PoB processes were present; computer-control was unavailable, so the saved-build flow, identity, calculated metrics, and Show Node Power were not observed.

### Comparisons
No mutation, recalculation, route ranking, or before/after delta.

### Failures/Rollbacks
`POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`; no force-close and no XML mutation.

### Learned Rules
Static identity and metrics are triage evidence only. Process/window title still does not prove a loaded build. Confidence: high for the operational gate, low for gameplay conclusions.

### Rejected Rules
No gameplay rule promoted; no causal measurement.

### Unknowns
Visible Builds list, loaded identity, active config, tree/masteries, node-power ranking, and route deltas.

### Next Frontier
Verify all PoB instances are closed, then retry this same XML only with observable GUI control; cursor remains index 3.

## Run 2026-07-22 02:45:00

Retried `_fast_more_8_build_3.xml` from the canonical root. Static baseline: Templar/Hierophant level 100, targetVersion 3_0, CombinedDPS 5.188M, life 3,548, ES 1,356, armour 40,154, chaos 75, mana 1,072. PoB was responsive, but GUI control was unavailable; `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `NO_NEW_LEARNING`. No mutation or delta; cursor remains index 3. Next: retry the same XML with observable controls.

## Run 2026-07-22 03:15:00

Objective: retry queued index 3 `_fast_more_8_build_3.xml`. Static baseline unchanged: CombinedDPS 5.188M, life 3,548, ES 1,356, armour 40,154, chaos 75, mana 1,072. No PoB process was present before the attempt, but Computer Use was unavailable; no visual load, Show Node Power, mutation, recalculation, or close verification. All adjustments: `NÃO VALIDADO`; `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`. No new learning; cursor remains 3. Next: retry same XML with observable Computer Use.
## Run 20260722-030000

### Objective
Validar uma build por GUI no PoB e testar a frontier visual.

### Inputs
Build `0ven_4733_frozendesert`, Witch Elementalist, nível 100, tree 3.28, 123/123 pontos, Default; PoB 2.65.0.

### Candidates
Show Node Power destacou nós candidatos após cálculo visual até 95%; nomes não foram capturados.

### Tests
Builds → seleção concreta → Open → identidade/métricas confirmadas → Show Node Power. Um clique candidato não mudou a árvore.

### Comparisons
Sem delta válido: nenhum ponto ou métrica mudou.

### Failures/Rollbacks
`ROUTE_TEST_INCONCLUSIVE`; sem rollback necessário. PoB fechado e processo verificado ausente.

### Learned Rules
`SHOW_NODE_POWER_CONFIRMED` apenas para disponibilidade e cálculo visual; ranking/nó exigem tooltip legível. `NO_NEW_LEARNING` sobre eficácia de rota.

### Rejected Rules
Não inferir ganho por nó destacado sem alocação e recálculo observáveis.

### Unknowns
Nomes/ranking final e qualquer delta de rota.

### Next Frontier
Repetir a mesma build com seleção de nó por tooltip e checkpoint antes da alocação.
## Run 2026-07-22 03:23:05+01:00

Computer Use encontrou uma única janela do PoB, mas `Ctrl+I` não confirmou importação, identidade ou métricas. XML índice 3 e hash permaneceram estáveis; baseline estático preservado. Resultado `NÃO VALIDADO`; `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `POB_CALC_STALE`, `POB_CLOSE_BLOCKED`; cursor permanece 3. Nova hipótese: disponibilidade da GUI não equivale a carga confirmada. Não promover; retestar quando a tela de importação for observável.

## Run 2026-07-22 06:25:00

Retestei `_fast_more_8_build_3.xml` no índice 3. Reindexação: 940/940 PoBs válidos, 0 falhas. PID 10692 responsivo, mas Computer Use indisponível; sem carga visual, Show Node Power, mutação, recálculo ou delta. Veredito `NÃO VALIDADO`; `NO_NEW_LEARNING`; cursor permanece 3. Sheets indisponível; pull/rebase bloqueado por alterações unstaged, sem commit/push.

## Current state
- Cursor: XML índice 3; bloqueio recorrente de carga visual/Computer Use.
- Regra ativa: parse estático não promove ajuste sem recálculo PoB e Show Node Power.

## Run 2026-07-22 04:12:08+01:00

Retestei `_fast_more_8_build_3.xml` no índice 3. PID 10692 está responsivo, porém Computer Use indisponível; não houve carga confirmada, Show Node Power, mutação, recálculo ou delta. Veredito `NÃO VALIDADO`; erros `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`; `NO_NEW_LEARNING`; cursor permanece 3.

Próximo teste: a mesma build pela lista Builds com GUI observável.

## Run 2026-07-22 03:52:48+01:00

Retestei o XML índice 3. Computer Use encontrou uma janela única do PoB, mas não confirmou lista/importação, identidade, árvore ou métricas; `Ctrl+I` não confirmou carga. `NÃO VALIDADO`; `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `POB_CALC_STALE`, `POB_CLOSE_BLOCKED`; sem mutação, delta ou regra promovida. Cursor permanece 3. Próximo teste: mesmo XML com estado de importação e build observável.

## Run 2026-07-22 02:47:11+01:00

### Objective
Retestar `_fast_more_8_build_3.xml` priorizando o gate de carga.

### Inputs
Templar Hierophant nível 100, árvore 3.28, 135 nós, SHA-256 `5530FF45E2C3B711EAD96F15D8A7317A98550E51775417712ECDAC234DF682BA`.

### Tests
Tentativa de validação visual; Computer Use indisponível. Baseline estático normalizado: 5,183,879.83 Total DPS, 3,548 vida, 1,356 ES, 40,154 armadura.

### Failures/Rollbacks
`POB_LOAD_FAILED`; `SHOW_NODE_POWER_PENDING`; sem mutação e sem rollback necessário.

### Learned Rules
Hipótese não promovida: a fronteira de validação permanece após carga confirmada, cálculo atualizado e Show Node Power.

### Next Frontier
Retestar o mesmo XML somente com GUI observável; cursor permanece 3.
## Run 20260722-030707

- Objective: retestar `_fast_more_8_build_3.xml` no índice 3.
- Inputs: Templar Hierophant 100, 3_28, 135 nós; baseline estático Total DPS 5,183,879.83, vida 3,548, EHP 292,930.91.
- Tests: carga visual, mutação e Show Node Power bloqueados por `COMPUTER_USE_UNAVAILABLE`; processo PoB preexistente não foi encerrado.
- Result: `NÃO VALIDADO`; `POB_LOAD_FAILED`; cursor 3.
- Learning: nenhum aprendizado promovido; manter a mesma pendência como próxima ação.

## Run 2026-07-22 03:57:51

Objective: retestar o XML Ã­ndice 3 priorizando carga confirmada.

Tests: reindexaÃ§Ã£o 940/940 PoBs vÃ¡lidos, 0 falhas; baseline estÃ¡tico estÃ¡vel. Computer Use indisponÃ­vel; sem carga, Show Node Power, mutaÃ§Ã£o, recÃ¡lculo ou delta.

Veredito: `NÃƒO VALIDADO`; erros: `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`. `NO_NEW_LEARNING`; cursor permanece 3.

Next Frontier: repetir este mesmo XML somente com GUI observÃ¡vel.

## Run 2026-07-22 09:00:00

Reindexação confirmou 940/940 PoBs válidos e 0 falhas; o XML índice 3 manteve hash e baseline estáticos. Computer Use/GUI indisponível: carga, Show Node Power, mutação e delta não confirmados. Veredito `NÃO VALIDADO`; cursor permanece 3; `NO_NEW_LEARNING`. Próximo teste: mesmo XML pela lista Builds com GUI observável.

## Run 20260722-042500

Objective: retestar o XML índice 3 `_fast_more_8_build_3.xml` e resolver primeiro o gate de carga.

Inputs: Templar Hierophant nível 100, árvore 3_28, 135 nós, SHA-256 `5530FF45E2C3B711EAD96F15D8A7317A98550E51775417712ECDAC234DF682BA`; baseline estático Total DPS 5,183,879.83, Combined DPS 5,188,054.69, vida 3,548, ES 1,356, armadura 40,154, evasão 26, caos 75%, mana 1,072.

Tests: reindexação 940/940 PoBs válidos, 0 falhas. Computer Use indisponível; sem carga visual, Show Node Power, mutação, recálculo ou delta. `NÃO VALIDADO`; `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`.

Learning: `NO_NEW_LEARNING`; baseline estático continua somente triagem. Cursor permanece 3. Google Sheets indisponível. Não promover regras de dano, defesa ou rota.

Next Frontier: repetir este mesmo XML somente com GUI observável.
## 2026-07-22T04:58:21+01:00 — run-20260722-045821

- XML: `_fast_more_8_build_3.xml`, cursor 3, hash estável.
- Aprendizado: a janela/lista visível do PoB não prova build carregada; controles customizados não aceitaram pesquisa nem `Ctrl+I` observavelmente.
- Classificação: `unresolved`; hipótese separada, sem promoção.
- Veredito: `NÃO VALIDADO`; `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`.
- Próximo reteste: importação com seleção observável, identidade/métricas confirmadas e só então Show Node Power.

## 2026-07-22T05:07:41+01:00 — run-20260722-050741

- XML: `_fast_more_8_build_3.xml`, cursor 3, hash estável; 940/940 XMLs válidos.
- Teste: somente baseline estático e processo PoB responsivo; Computer Use/GUI observável indisponível.
- Resultado: `NÃO VALIDADO`; `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`; sem mutação, recálculo ou delta.
- Aprendizado: `NO_NEW_LEARNING`; cursor permanece 3 e nenhuma regra de gameplay foi promovida.
- Retrospectiva: reindexação/hash eficientes; GUI continua bloqueada; Git/Sheets pendentes por alterações unstaged/conector indisponível.
- Próximo reteste: confirmar carga visual e Show Node Power no mesmo XML.
- 2026-07-22T05:32:13+01:00: reteste do `_fast_more_8_build_3.xml` no cursor 3; hash/baseline estáticos estáveis. PoB responsivo, porém GUI/Computer Use indisponível; sem carga confirmada, Show Node Power, mutação, recálculo ou delta. `NÃO VALIDADO`; nenhuma regra promovida. Próximo teste: repetir com GUI observável.
## Run 2026-07-22T05:57:05+01:00

- ReindexaÃ§Ã£o canÃ´nica: 940/940 vÃ¡lidos, 0 falhas; XML do cursor 3 retestado.
- `NÃƒO VALIDADO`: `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`.
- Sem carga PoB confirmada, mutaÃ§Ã£o, recÃ¡lculo, delta ou regra promovida; cursor permanece 3.
- Retrospectiva: reindexaÃ§Ã£o foi eficiente; GUI permanece o gargalo. PrÃ³ximo teste: mesma build com GUI observÃ¡vel.
## 2026-07-22T06:02:07+01:00 — reteste índice 3

- Evidência: reindexação 940/940 válida; baseline/hash estáveis; PoB observado, mas importação/identidade/métricas não confirmadas.
- Classificação: `unresolved`; `POB_LOAD_FAILED`, `COMPUTER_USE_INPUT_UNCONFIRMED`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`.
- Regra: nenhuma promoção. Hipótese mantida: selecionar a linha concreta da lista é pré-requisito para o fluxo de importação observável.
- Próximo reteste: mesma build, confirmar seleção e identidade antes de qualquer teste.
Run 2026-07-22 06:12:52: canonical reindex 940/940 valid, 0 failures; cursor 3 retested statically. No observable GUI, confirmed load, Show Node Power, mutation, or delta; `NÃO VALIDADO`; no rule promoted.
## 2026-07-22T14:00:00+01:00
- Reindexação 940/940 válida; XML pendente no cursor 3 retestado sem GUI observável.
- `NÃO VALIDADO`; `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`; sem delta/regra promovida.
## Current state — 2026-07-22 14:55:00 +01:00
- Cursor 3; `_fast_more_8_build_3.xml`; hash estável `5530FF45E2C3B711EAD96F15D8A7317A98550E51775417712ECDAC234DF682BA`.
- Reteste bloqueado: `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`.
- Nenhuma mutação, delta ou regra promovida; próxima ação é confirmar carga visual no PoB.
- Run 2026-07-22T16:00:00+01:00: reteste do cursor 3 (`_fast_more_8_build_3.xml`), hash `5530FF45E2C3B711EAD96F15D8A7317A98550E51775417712ECDAC234DF682BA`; reindexação 940/940 válida, 0 falhas. Computer Use/GUI indisponível: `POB_LOAD_FAILED`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`; sem mutação, recálculo, delta ou regra promovida. Veredito `NÃO VALIDADO`; cursor permanece 3. Próximo teste: confirmar carga visual e Show Node Power no mesmo XML.
- Run 2026-07-22T07:32:11+01:00: reindexação canônica 940/940 válida, 0 falhas; XML do cursor 3 (`_fast_more_8_build_3.xml`) preservou SHA-256 `5530FF45E2C3B711EAD96F15D8A7317A98550E51775417712ECDAC234DF682BA`. PoB iniciado, mas GUI não observável; `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`. `NÃO VALIDADO`; sem mutação, recálculo, delta ou regra promovida; `NO_NEW_LEARNING`. Próximo teste: confirmar seleção/Open e identidade visual da mesma build; cursor permanece 3.
## Run 2026-07-22 07:37:40+01:00

Reindexação canônica: 940/940 válidos, 0 falhas. O XML imutável do cursor 3 (`_fast_more_8_build_3.xml`) foi retestado estaticamente; baseline Templar/Hierophant nível 100, árvore 3_28, 135 nós, TotalDPS 5.183.879,83, vida 3.548, ES 1.356, armadura 40.154. GUI/Computer Use não observável: `POB_LOAD_FAILED`, `COMPUTER_USE_UNAVAILABLE`, `SHOW_NODE_POWER_PENDING`. Sem mutação, recálculo, delta ou promoção; veredito `NÃO VALIDADO`; cursor permanece 3. `NO_NEW_LEARNING`. Retrospectiva: reindexação eficiente; iniciar sem canal GUI foi desperdício; manter a pendência como prioridade.
## Run 2026-07-22 19:15:33+01:00

Reteste exclusivo do `_fast_more_8_build_3.xml` no cursor 3. Reindexação canônica: 940/940 válidos, 0 falhas; hash estável `5530FF45E2C3B711EAD96F15D8A7317A98550E51775417712ECDAC234DF682BA`. PoB abriu duas janelas, mas a ativação expirou; sem carga confirmada, identidade visual, Show Node Power, mutação, recálculo ou delta. Veredito `NÃO VALIDADO`; `POB_LOAD_FAILED`, `COMPUTER_USE_TIMEOUT`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`; cursor permanece 3, XML preservado, nenhuma regra promovida. Retrospectiva: reindexação útil; tentativa GUI sem janela controlável não produziu evidência. Próximo teste: uma única janela controlável, importação confirmada do mesmo XML e Show Node Power.
## Run 2026-07-22T19:19:49+01:00

- Objective: retestar o XML imutável do cursor 3 com prioridade para carga confirmada.
- Evidence: 940/940 XMLs válidos; hash do `_fast_more_8_build_3.xml` estável; baseline estático preservado.
- Failure: PoB abriu a lista, mas pesquisa/seleção não confirmou a build-alvo; entrada do usuário interrompeu o controle. `POB_LOAD_FAILED`, `COMPUTER_USE_INPUT_UNCONFIRMED`, `SHOW_NODE_POWER_PENDING`, `POB_CLOSE_BLOCKED`.
- Decision: `NÃO VALIDADO`; sem mutação, delta, promoção ou avanço do cursor.
- Retrospective: reindexação/hash foram eficientes; insistir após perda de controle foi desperdício. Correção: exigir janela única e confirmação visual antes de qualquer interação subsequente.
- Next frontier: mesma build, seleção concreta na lista, identidade/métricas confirmadas e só então Show Node Power.
