# Slots de Itens e Smart Generator

## Slots visuais

A aba `Itens` organiza equipamento nestes slots:

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
- jewels em area separada.

## Regra de arma two-handed

Se o item principal for two-handed:

- o slot `weapon` recebe a arma;
- o slot `offhand` fica bloqueado;
- nenhum escudo/segunda arma deve ser sugerido como offhand.

## Joias

Joias nao sao equipamento de ring.

Tipos de jewel devem ficar abaixo do equipamento:

- cluster jewels;
- base jewels;
- abyss jewels;
- other.

Cada jewel precisa ter selecao independente. O bug de clique que marcava varias joias iguais foi corrigido criando identidade por instancia, nao apenas por sprite/base.

## Classificacao de item

A classificacao correta deve usar prioridade:

1. slot declarado no XML quando confiavel;
2. base do item;
3. catalogo de categoria;
4. overrides manuais em `data/items/item_category_overrides.json`.

Nao classificar por nome raro. Exemplo: `Plague Blow` nao define o tipo. A base `Sambar Sceptre` define que e sceptre/weapon.

## Opcoes por slot

Quando o usuario clica em um slot, a dashboard mostra apenas itens compativeis com aquele slot.

Exemplos:

- slot weapon: bows, wands, sceptres, swords, claws, etc.;
- slot helmet: helmet bases e uniques de helmet;
- slot belt: belts;
- slot ring: rings;
- slot jewel: jewels;
- slot flask: nao deve aparecer em weapon/helmet/body.

## Fases do Smart Generator

Fase 1: Defesa

Metricas planejadas:

- Life;
- ES;
- EHP;
- resistencias;
- chaos res;
- block;
- spell block;
- suppression;
- armour;
- evasion.

Fase 2: DPS

Metricas planejadas:

- CombinedDPS;
- attack speed;
- crit;
- dot;
- conversao;
- penetracao;
- gem level;
- aura/support.

## Objetivo do gerador

O gerador nao deve "chutar" build. A arquitetura correta e:

XMLs existentes -> gerador de combinacoes -> PoB calcula -> banco de resultados -> dashboard mostra ganho/perda -> ranker aprende.

Assim a IA aprende com resultado real e nao com inferencia solta.
