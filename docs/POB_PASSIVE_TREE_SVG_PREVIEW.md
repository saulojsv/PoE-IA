# PoB Passive Tree SVG Preview

## Objetivo

Replicar na dashboard local a visualização da passive tree do POBb sem inventar posição, ligação ou tipo de nodo.

Referência usada:

- Build: `https://pobb.in/3pkA2HJRQNw2`
- Asset POBb: `/assets/3.28.svg`
- Asset local equivalente: `dashboard-new/public/poe-tree/skilltree-3.28.svg`

## Como a árvore foi replicada

O POBb não desenha a árvore manualmente em React/canvas. Ele carrega um SVG versionado:

```html
<object data="/assets/3.28.svg" type="image/svg+xml" title="Skilltree Preview"></object>
```

A dashboard replica isso carregando o SVG local:

```tsx
<object
  className="pob-tree-svg"
  data="/poe-tree/skilltree-3.28.svg"
  type="image/svg+xml"
  title="Passive Tree"
/>
```

Isso preserva:

- geometria original;
- `viewBox`;
- zoom/pan interno do SVG;
- posições reais dos pontos;
- linhas reais entre nodos;
- classes internas de ascendancy;
- scripts internos de `tree_load` e `tree_highlight`.

## Como os nodos ativos são marcados

Cada XML PoB tem:

```xml
<Tree>
  <Spec nodes="31344,39841,7444,..." masteryEffects="{17945,34420},..." treeVersion="3_28" classId="3" ascendClassId="1"/>
</Tree>
```

A dashboard lê `build.nodes` do dataset gerado a partir de `Tree/Spec/@nodes` e chama a função do próprio SVG:

```ts
win?.tree_load?.({
  nodes: nodes.map(Number),
  classId: 0,
  ascendancyId: 0,
  alternateAscendancyId: 'nil',
})
```

Dentro do SVG, `tree_load` faz:

- pinta `#n{id}` se o ID está em `nodes`;
- pinta `#cA-B` se `A` e `B` estão ambos em `nodes`;
- mostra a ascendancy correspondente.

Regra crítica:

```text
conexão ativa = cA-B onde A ∈ nodes e B ∈ nodes
```

Nenhuma conexão é inferida por proximidade.

## O que cada ponto simboliza

Cada ponto do SVG já contém metadados:

```xml
<circle
  id="n529"
  data-name="Poisonous Fangs"
  data-kind="Notable"
  data-stats="+10% to Damage over Time Multiplier for Poison;;..."
/>
```

Campos:

- `id="n529"`: ID PoB/GGG do nodo.
- `data-name`: nome do nodo.
- `data-kind`: tipo (`Normal`, `Notable`, `Keystone`, `Mastery`, `Ascendancy`).
- `data-stats`: linhas de stats separadas por `;;`.

Masteries também aparecem como círculos com `data-kind="Mastery"`. O efeito escolhido da mastery não vem só do círculo; vem do XML em `masteryEffects`, por pares `{nodeId,effectId}`.

## Tooltip sem quebrar a árvore

Não converter o SVG para inline React. Isso altera o comportamento visual e pode quebrar a renderização.

A solução segura é manter o SVG como `<object>` e colocar tooltip dentro do próprio SVG asset, usando os metadados `data-*` dos círculos. Assim o layout original continua sob controle do SVG.

O script local no fim de `skilltree-3.28.svg`:

- escuta `pointerover`/`mouseover` em círculos `id^="n"`;
- lê `data-name`, `data-kind`, `data-stats`;
- desenha um tooltip em `<g id="dashboard-node-tooltip">`;
- expõe `document.querySelector('svg').dashboardShowNodeTooltip(id)` para validação no browser;
- não altera nós, conexões, viewBox ou estilo ativo.

## Sprites dos nodos

A camada de sprites também fica dentro de `skilltree-3.28.svg`, mas é separada da árvore base:

- fonte primária: `skilltree-3.28.json` oficial da GGG/PoE CDN; Wiki/Fandom servem só para conferência visual;
- cria `<g id="dashboard-node-sprites">` com `pointer-events:none`;
- lê `/poe-tree/skilltree-3.28.json`;
- cruza `circle#n{id}` com `json.nodes[id].icon`;
- usa os sprite sheets oficiais da GGG/PoE CDN em `json.sprites`;
- desenha imagens recortadas por `clipPath` em fases:
  - Fase 1: `Normal` e `Jewel`;
  - Fase 2: `Mastery`;
  - Fase 3: `Notable` e `Keystone`;
- ignora ascendancy por enquanto para não poluir a árvore;
- não altera círculos, links, `viewBox`, IDs ou `tree_load`.

### Ajuste visual tipo Mobalytics

- sprites usam atlas ativos oficiais (`normalActive`, `notableActive`, `keystoneActive`, `masteryActiveSelected`);
- o recorte mudou para `clipPath` circular para não aparecer quadrado do atlas;
- brilho/saturação ficam apenas no `<image>` do overlay;
- cards abaixo da árvore são renderizados no React, usando os mesmos IDs selecionados e `skilltree-3.28.json`;
- os cards separam `Keystone`, `Mastery`, `Notable` e `Node` sem alterar o SVG base.

### Tooltip estilo poe.ninja

- caixa compacta com fundo azul-escuro e borda cinza;
- título branco e stats em azul;
- sem linha de tipo no tooltip para reduzir altura;
- continua usando só `data-name` e `data-stats` dos círculos existentes.

### Tooltip estilo árvore oficial PoE

- barra superior marrom/dourada com título centralizado;
- ornamentos vetoriais simples nos cantos, sem imagens externas;
- corpo preto translúcido para stats;
- stats em azul-violeta, próximo ao visual antigo oficial;
- stats com `\n` interno são quebrados antes do wrap por palavras para evitar vazamento;
- alteração restrita a `<g id="dashboard-node-tooltip">`.

## Combinações e ganho/perda

É possível simular combinações visuais direto no SVG:

1. Começar com o conjunto atual `nodes`.
2. Adicionar/remover IDs candidatos.
3. Reexecutar `tree_load`.
4. Comparar:
   - nodos adicionados;
   - nodos removidos;
   - conexões que passaram a existir;
   - `data-stats` ganhos/perdidos.

Isso permite explicar mudanças de atributos simples, por exemplo:

- `+10 to Strength`;
- `12% increased Chaos Damage`;
- `5% increased maximum Life`;
- notables/keystones adicionados ou removidos.

Limitação importante:

O SVG e o XML explicam estrutura e stats textuais. Eles não recalculam corretamente DPS, EHP, ailments, reservation, trigger setups, gem links ou interações condicionais. Para ganho/perda real de build, é preciso motor PoB. Localmente, a dashboard pode fazer uma estimativa textual/heurística, mas não deve afirmar DPS/EHP exato sem recalcular no PoB.

## Critérios de aceitação

- A dashboard deve carregar `skilltree-3.28.svg` por `<object>`.
- Não usar layout circular/manual.
- Não usar SVG inline React para a árvore principal.
- Ativar nós somente por IDs do XML.
- Ativar links somente quando ambos os endpoints estão selecionados.
- Tooltips devem ler `data-*` do SVG ou `masteryEffects` do XML.
- Não fabricar stats ausentes.

## Arquivos relevantes

- `dashboard-new/public/poe-tree/skilltree-3.28.svg`
- `dashboard-new/src/components/build/build-dashboard.tsx`
- `dashboard-new/src/index.css`
- `data/poe_ninja/poe_ninja_dataset/xml/**/**/*.xml`
