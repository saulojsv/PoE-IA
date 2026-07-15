# Dashboard

## Arquivo principal

`dashboard/index.html`

Este arquivo contem a interface, os estilos e o JavaScript da dashboard. A implementacao foi mantida em HTML unico para facilitar abertura local, copia entre PCs e manutencao rapida.

## Dados consumidos

- `dashboard/build_dashboard_data.json`
- `dashboard/item_sprite_index.json`
- `dashboard/item_base_mod_summary.json`

O JavaScript carrega estes arquivos por `fetch`. Por isso, quando o navegador bloquear leitura local via `file://`, o launcher `.bat` deve iniciar um servidor local simples.

## Objetivo visual

A dashboard foi organizada para se aproximar da leitura de itens do poe.ninja:

- lista lateral de skills/builds;
- painel central com equipamento visual por slot;
- painel de opcoes do slot selecionado;
- painel lateral com item selecionado, modificadores e atributos da build;
- abas `Itens`, `Defesa`, `DPS`.

## Metricas exibidas

As metricas usadas vem dos XMLs/PoB parseados para o JSON:

- DPS;
- EHP;
- Vida;
- ES;
- Block;
- Spell block;
- Suppression;
- resistencias;
- attack speed;
- crit multi;
- max hit fisico/elemental/chaos;
- pontos usados.

## Comparacao de item

A dashboard compara o item selecionado contra outra build/XML que use aquele item quando existe referencia suficiente. O objetivo da UI e mostrar:

- valor base;
- valor atualizado;
- percentual de mudanca;
- seta verde para melhora;
- seta vermelha para piora.

Ainda nao e um calculo completo do Path of Building em tempo real. O calculo preciso depende de integrar PoB como motor ou rodar batches externos de PoB para cada combinacao.

## Bugs corrigidos

- Abas laterais sem clique funcional.
- Campo de busca sem efeito.
- Cards vazios quando o JSON nao carregava.
- Itens aparecendo no slot errado.
- Joias entrando como ring.
- Flasks aparecendo como arma.
- Selecionar uma jewel ativava varias iguais.
- Sprites genericas apareciam como fallback.
- Texto quebrado por encoding em alguns pontos da interface.

## Principio atual

O dashboard deve exibir somente informacao real extraida dos dados locais. Quando algo falta, deve ficar explicito que falta dado/sprite, em vez de inventar substituto.
