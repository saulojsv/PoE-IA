# PoE Tree Review — contrato de cada run

## Objetivo

Revisar uma única build por execução, validar a carga real no Path of Building Community, explorar a árvore com `Show Node Power`, comparar alterações e transformar cada erro em regra reutilizável.

## Fluxo obrigatório por run

1. **Preparar:** ler memória, cursor, pendências e último erro; escolher uma única build.
2. **Abrir:** iniciar `Path of Building.exe`, observar a janela e clicar `Back` até `Builds`.
3. **Carregar:** clicar uma linha concreta, observar, clicar `Open` e observar novamente. Confirmar identidade, classe, ascendência, nível, versão, skills e métricas. Sem isso: `POB_LOAD_FAILED`.
4. **Mapear PoB:** registrar Tree, Skills, Items, Calcs, Config, Notes, Compare, versão da árvore, pontos e avisos.
5. **Explorar árvore:** selecionar skill/configuração, clicar `Show Node Power`, registrar candidatos, custo e ranking; testar rota original, rota defensiva e rota de eficiência.
6. **Experimentar:** criar checkpoint, alterar uma hipótese por vez, recalcular, comparar dano/defesa/recursos/custo; classificar `helped`, `hurt`, `neutral`, `conditional` ou `unresolved`; desfazer regressões.
7. **Aprender:** comparar com builds anteriores, consultar fontes relevantes apenas para hipóteses, transformar somente evidência medida em regra e enfileirar pendências.
8. **Registrar:** escrever `run-YYYYMMDD-HHMMSS.md`, JSON, memórias locais e a aba `Updates` com data, objetivo, testes, erro, correção e próximo teste. Sempre que houver conquista nova confirmada, repetir o registro na aba `Avanços e Aprendizado`, incluindo evidência PoB, métricas, regra aprendida, confiança e próximo aprendizado.
9. **Versionar:** executar `git pull --rebase` quando houver remoto, commit dos artefatos próprios e `git push`; registrar falhas Git sem fingir publicação.
10. **Encerrar:** fechar apenas a instância aberta pelo run e confirmar ausência de PoB duplicado.

## Regra de progresso

O cursor só avança depois de resultado medido ou erro documentado com próxima tentativa. Uma lista observada sem clique confirmado nunca conta como inspeção.

## Evidência mínima

Cada update informa data, objetivo, build, elementos testados, combinações/rotas, métricas, resultado, erro, correção, flexibilidade obtida e próximo teste. XMLs originais permanecem imutáveis.
