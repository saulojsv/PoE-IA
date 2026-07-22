# PoE Build Optimizer

Otimizador experimental para aprender combinações legais de árvores, skills, itens e configurações do Path of Building Community.

## Objetivo

Transformar builds PoB em dados comparáveis, gerar candidatos explicáveis, validá-los no PoB e preservar o aprendizado por build e arquétipo.

## Fases

1. **Inventário e integridade:** contar, identificar, hashear e verificar XMLs sem alterar os originais.
2. **Normalização:** extrair identidade, patch, classe, skill, árvore, gems, itens, configuração e métricas.
3. **Grafo:** validar IDs/conexões, custos, rotas, ascendência, masteries e sockets.
4. **Agrupamento:** separar por patch, ascendência, skill, arquétipo, conteúdo e orçamento.
5. **Baselines/Pareto:** descobrir referências fortes, medianas, legais fracas e falhas.
6. **Candidatos:** gerar mutações legais de árvore, skills, itens e configurações.
7. **Avaliação:** comparar no mesmo contexto; registrar deltas e veredito.
8. **Validação PoB:** confirmar as melhores candidatas, cálculos e Show Node Power.
9. **Aprendizado:** atualizar regras específicas, de arquétipo e globais com confiança/escopo.
10. **Otimização contínua:** repetir por cursor, pendências e ganho de informação.

## Contratos

- XML original é imutável.
- Cada candidato tem baseline, hipótese, mutação, validação, métricas e veredito.
- Legalidade determinística vence qualquer ranking.
- Nenhuma frequência vira regra sem teste causal ou evidência suficiente.

