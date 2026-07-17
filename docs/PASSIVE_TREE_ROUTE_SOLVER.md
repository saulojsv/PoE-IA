# Passive Tree Route Solver

Arquivo principal: `dashboard-new/src/data/passive-tree.ts`.

O gerador de rota não escolhe nós aleatórios. Ele trata a árvore passiva como grafo:

1. Carrega `nodes` e `links` do JSON oficial 3.28.
2. Encontra o start node da classe.
3. Propõe alvos de valor: notables, keystones e masteries.
4. Para cada alvo, calcula o menor caminho conectado via BFS.
5. Pontua a proposta por valor do alvo menos custo de travel e dispersão regional.
6. Mantém as melhores rotas com beam search.
7. Preenche pontos restantes apenas por vizinhos conectados.
8. Valida `connected`, `travel`, `travelRatio`, `regions`, `proposals` e `beamWidth`.

Critério atual de valor:

- Prioriza vida, ES, defesas, resistências, suppress, block, dano, crítico, velocidade, mana, reserva, recovery, charges, ailments e dano elemental/físico/chaos.
- Penaliza apenas tags muito específicas sem perfil ativo: minion, totem, brand, trap e mine.

Regra importante: a árvore/SVG/base visual não participa da geração. O SVG só exibe os IDs selecionados. A rota vem do grafo oficial.

A dashboard não cria cópias visuais dos nós. Ela mantém o SVG oficial isolado em `<object>` e, quando o documento interno fica disponível, adiciona apenas regras CSS para `#n{id}` e `#c{idA-idB}`. Assim, os nós e as arestas continuam sendo os elementos originais do `skilltree-3.28.svg`.

O start interno da classe é usado pelo solver como âncora, mas não é retornado como ponto comprado quando ele não existe como círculo visual no SVG.

Próxima melhoria segura: passar perfil da skill/build para o solver, por exemplo `bow`, `projectile`, `lightning`, `attack`, `life`, e trocar a pontuação genérica por pontuação contextual.
