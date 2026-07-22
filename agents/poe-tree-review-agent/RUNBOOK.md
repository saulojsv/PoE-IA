# PoE Tree Review — contrato de cada run

## Objetivo

Gerar builds otimizadas por análise estruturada e experimentos reproduzíveis. O PoB visual valida a candidata e diagnostica falhas; não é o dataset principal.

## Arquitetura de aprendizado

- **Dataset:** XMLs imutáveis, normalizados por build, skill, árvore, itens, configuração e métricas.
- **Experimento:** baseline → hipótese → mutação legal → cálculo comparável → classificação → rollback ou promoção.
- **Otimização:** priorizar legalidade, funcionamento, defesa/recursos, eficiência de pontos e só depois dano; penalizar dependência de item, uptime falso e risco de brick.
- **Autonomia:** escolher a ordem e as combinações de teste dentro do escopo; cobrir famílias de nodos, rotas, skills, suportes, itens e configurações por busca adaptativa, sem prometer enumeração literal quando o espaço for inviável.
- **Validação:** abrir a candidata no PoB, confirmar identidade/configuração/métricas e usar `Show Node Power` antes de aceitar a rota.
- **Veredito:** todo ajuste termina como `VIÁVEL`, `INVIÁVEL`, `CONDICIONAL` ou `NÃO VALIDADO`, com métricas baseline/candidata, legalidade, regressões, premissas e evidência. Sem veredito, não há promoção.
- **Causalidade:** para cada nodo/rota, explicar posição no grafo, distância, custo de oportunidade, skill/tags, escala, defesa/recursos, atributos, itens, configuração, ascendência e momento de uso; separar motivo específico da build, padrão reutilizável e simples frequência.
- **Leitura causal:** reconstruir (a) caminho e alternativas, (b) dependências da build, (c) métrica esperada e (d) teste de remoção/substituição. Registrar `node_role`, `depends_on`, hipótese, variante, delta de métrica, veredito e escopo; sem ablação, marcar como hipótese.
- **Memória:** guardar evidência, versão/patch, confiança, regra aprendida e escopo; hipóteses não viram regras automaticamente.

## Protocolo agendado de 5 minutos

Cada execução é um ciclo curto e persistente: carregar estado → escolher uma pendência ou um XML → normalizar baseline → gerar hipóteses → testar o candidato de maior informação → validar no PoB → emitir veredito → atualizar memórias/planilha → commit/push → salvar o próximo cursor. O run deve continuar do último checkpoint, reaprender as regras anteriores e priorizar erros não resolvidos antes de abrir uma nova frente.

## Fluxo obrigatório por run

1. **Preparar:** ler memória, cursor e pendências; selecionar um XML e preservar o baseline.
2. **Estruturar:** normalizar a build e extrair árvore, skills, itens, configuração, tags e métricas.
3. **Gerar:** criar candidatos legais de árvore/skills/itens/configuração e escolher os testes com maior informação por token.
4. **Comparar:** medir cada candidato contra o mesmo baseline/configuração; registrar ganhos, perdas, custos, defesa e risco.
5. **Validar:** abrir somente a melhor candidata no PoB, confirmar identidade/métricas e usar `Show Node Power`; se divergir, corrigir o parser ou marcar falha.
6. **Aprender:** promover apenas regras sustentadas por evidência; manter hipóteses e pendências na fila.
7. **Registrar:** escrever `run-YYYYMMDD-HHMMSS.md`, JSON, memórias locais, `Updates` e, para cada conquista, `Avanços e Aprendizado`.
9. **Versionar:** executar `git pull --rebase` quando houver remoto, commit dos artefatos próprios e `git push`; registrar falhas Git sem fingir publicação.
10. **Encerrar:** fechar apenas a instância aberta pelo run e confirmar ausência de PoB duplicado.

## Regra de progresso

O cursor só avança depois de resultado medido ou erro documentado com próxima tentativa. Uma lista observada sem clique confirmado nunca conta como inspeção.

## Evidência mínima

Cada update informa data, objetivo, build, elementos testados, combinações/rotas, métricas, resultado, erro, correção, flexibilidade obtida e próximo teste. XMLs originais permanecem imutáveis.
