# Passive Tree Route Solver

Arquivo principal: `dashboard-new/src/data/passive-tree.ts`.

O gerador de rota não escolhe nós aleatórios. Ele trata a árvore passiva como grafo:

1. Carrega `nodes` e `links` do JSON oficial 3.28.
2. Encontra o start node da classe.
3. Propõe alvos de valor: notables, keystones e masteries.
4. Para cada alvo, calcula o menor caminho conectado via BFS.
5. Pontua a proposta por valor dos novos nós menos travel e penalidade progressiva por nova região.
6. Mantém as melhores rotas com beam search, deduplicação e diversidade por assinatura estratégica.
7. Preenche pontos restantes apenas por vizinhos conectados.
8. Valida `connected`, `travel`, `travelRatio`, clusters, propostas, folhas ruins e redundância estimada.

Cada geração usa uma `seed` registrada no resultado. A seed injeta pequena variação em desempates, propostas e preenchimento final, então cliques sucessivos geram rotas diferentes sem quebrar conectividade.

Qualidade estrutural:

- Propostas usam custo marginal real: só contam os nós ainda não selecionados.
- Propostas com baixa eficiência marginal são rejeitadas antes de entrar no beam.
- Nova região recebe penalidade crescente, reduzindo dispersão.
- Estados idênticos são deduplicados por `hash(sorted(selectedNodeIds))`.
- O beam limita rotas quase iguais por assinatura de regiões e direções abertas.
- Após o beam, folhas fracas de baixo valor são podadas e os pontos liberados são reinvestidos por vizinhos conectados.
- `prunedNodes` mostra quantos nós foram removidos nessa poda.
- O botão `Aplicar rota à build` fica bloqueado se a rota tiver fallback, origem inválida, clusters incompletos, folhas ruins ou redundantes removíveis.

Origem da rota:

- O modo padrão da Smart Combination é `Aleatória balanceada`: escolhe uniformemente uma das sete classes antes da busca.
- `Classe da build` força a origem a usar a classe do XML/build atual.
- Uma classe específica pode ser selecionada manualmente.
- O resultado registra `requestedClass`, `resolvedClass`, `startNodeId` e `fallbackUsed`; fallback silencioso deve ser `false`.
- Ascendência não muda o start da árvore principal.
- No modo aleatório/específico, a ascendência é resolvida a partir da classe escolhida para evitar combinações impossíveis.

Critério atual de valor:

- Prioriza vida, ES, defesas, resistências, suppress, block, dano, crítico, velocidade, mana, reserva, recovery, charges, ailments e dano elemental/físico/chaos.
- Penaliza apenas tags muito específicas sem perfil ativo: minion, totem, brand, trap e mine.

Regra importante: a árvore/SVG/base visual não participa da geração. O SVG só exibe os IDs selecionados. A rota vem do grafo oficial.

A dashboard não cria cópias visuais dos nós. Ela mantém o SVG oficial isolado em `<object>` e, quando o documento interno fica disponível, adiciona apenas regras CSS para `#n{id}` e `#c{idA-idB}`. Assim, os nós e as arestas continuam sendo os elementos originais do `skilltree-3.28.svg`.

O start interno da classe é usado pelo solver como âncora, mas não é retornado como ponto comprado quando ele não existe como círculo visual no SVG.

Métricas de auditoria:

- `travelByReason`: pontos comprados por caminho/preenchimento, não por ausência de stats.
- `travelEssential`: travel de grau 2, usado como conector inevitável.
- `travelShared`: travel de grau 3+, reaproveitado por vários ramos.
- `travelSpeculative`: travel de ponta ou preenchimento fraco.
- `travelRedundant`: travel removível sem quebrar conectividade.
- `investment`: pontos comprados pelo valor do próprio nó.
- `touchedClusters`, `completedClusters`, `travelOnlyClusters`, `incompleteClusters`.
- `badLeaves`, `topologicalRedundant` e `strategicRedundant` para indicar galhos fracos ou pontos de baixo valor.
- `proposalsAccepted` e `proposalsRejected`.
- `beamDeduped`: estados iguais eliminados durante a busca.

Próxima melhoria segura: passar perfil da skill/build para o solver, por exemplo `bow`, `projectile`, `lightning`, `attack`, `life`, e trocar a pontuação genérica por pontuação contextual.
