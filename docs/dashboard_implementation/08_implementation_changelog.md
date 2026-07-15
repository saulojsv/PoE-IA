# Changelog Tecnico da Dashboard

Este arquivo resume as implementacoes feitas desde o inicio da dashboard.

## 1. Inventario inicial

Foi criada uma leitura dos XMLs existentes para contar:

- builds XML;
- skills com XML;
- gems unicas;
- itens unicos;
- nodos unicos.

Essa etapa mostrou que os XMLs podiam virar uma base navegavel, nao apenas arquivos soltos.

## 2. Primeira dashboard

Foi criada uma dashboard HTML local com:

- titulo `PoE Build Lab`;
- resumo de metricas;
- busca;
- lista de skills;
- top gems;
- top items;
- top nodes.

Problema encontrado: o HTML carregava, mas os dados nem sempre populavam por bloqueio de `fetch` local ou erro de runtime.

## 3. Correcao de carregamento

Foram adicionados ajustes para:

- ler `build_dashboard_data.json`;
- mostrar dados reais;
- evitar tela vazia sem diagnostico;
- permitir abrir por launcher local.

## 4. Smart Generator

A dashboard passou a estruturar uma area de geracao por fases:

- Fase 1: defesa;
- Fase 2: DPS;
- aba de itens para testar trocas.

A logica definida foi separar escolha de pesos/objetivos da execucao real de calculo.

## 5. Slots de equipamento

Foram definidos slots visuais:

- helmet;
- amulet;
- body;
- weapon;
- offhand;
- gloves;
- ring 1;
- ring 2;
- belt;
- boots;
- jewels separados.

Foi corrigido:

- jewel nao e ring;
- flask nao e weapon;
- amuleto nao e helmet;
- two-handed bloqueia offhand.

## 6. Layout estilo poe.ninja

A aba de itens foi reorganizada para parecer um painel de build:

- equipamento visual agrupado;
- opcoes do slot ao lado;
- item selecionado em painel separado;
- atributos da build abaixo;
- jewels em mini slots.

Um bug visual deixou as sprites desalinhadas; depois o CSS foi ajustado para manter proporcao, espacamento e area compacta.

## 7. Interacao de clique

Foi corrigido o bug em que clicar em uma jewel ativava varias. A causa era identificacao por sprite/base compartilhada. A solucao foi tratar cada instancia como item distinto no estado da UI.

## 8. Modificadores no item

O painel do item selecionado passou a mostrar:

- implicit mods;
- divisor visual;
- explicit mods.

Isso aproxima a leitura do item do estilo Path of Exile.

## 9. Catalogos

Foram criados catalogos para:

- categorias de itens;
- bases;
- tipos;
- modificadores;
- anointments de amuletos.

Esses catalogos ficam em `data/items` e alimentam a dashboard e o futuro gerador.

## 10. Sprites

Foi criada e expandida a pasta:

`assets/poe_item_sprites`

Foi criado o indice:

`dashboard/item_sprite_index.json`

Fontes usadas:

- PoE Wiki;
- Fandom API;
- PoEDB;
- CDN oficial PoE;
- PoE2DB para itens PoE2.

A regra final foi remover todos os fallbacks. Se a sprite falta, precisa ser resolvida de verdade.

## 11. Auditoria de sprites

A auditoria compara os itens em `dashboard/build_dashboard_data.json` contra `dashboard/item_sprite_index.json` e verifica se o arquivo existe em `assets/poe_item_sprites`.

Resultado validado:

```text
missing 0
index 1189
```

## 12. XMLs adicionais

Foram adicionados XMLs novos de skills como:

- puncture;
- purity of fire;
- purity of lightning;
- pyroclast mine;
- rain of arrows;
- raise spectre;
- raise zombie;
- rallying cry;
- reap;
- reave.

Depois de novos XMLs, e necessario regerar o JSON da dashboard se quiser que eles entrem na UI.

## 13. GitHub

Tudo foi sincronizado no repositorio `saulojsv/PoE-IA`, branch `main`.

Comandos padrao:

```bat
git add -A
git commit -m "mensagem"
git pull --rebase origin main
git push origin main
```

## 14. Google Drive

Foi criado um zip do estado commitado e enviado ao Drive:

`PoE-IA_0e6e64b_full.zip`

Esse backup e complementar. Para desenvolvimento, usar GitHub.

## 15. Limitacao conhecida

A dashboard ainda nao recalcula Path of Building em tempo real. Ela mostra metricas extraidas dos XMLs e comparacoes baseadas nesses dados.

Para precisao total:

1. gerar combinacao;
2. calcular no PoB;
3. salvar resultado;
4. atualizar ranking;
5. so entao treinar ranker/IA.
