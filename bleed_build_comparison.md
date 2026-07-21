# Comparativo de builds públicas de Bleed — PoE 1

## Escopo e método

O extractor foi aplicado conforme a regra da skill: não acessar `poe.ninja` diretamente para gerar XML quando o serviço está instável; em vez disso, foram usadas páginas públicas que expõem PoB/pobb.in e dados de builds. Os valores abaixo são snapshots das páginas e não devem ser comparados sem normalizar versão, equipamento, configuração e alvo.

## Amostras coletadas

| Arquétipo | Versão | Skill principal | Classe | Vida | Armadura | Resistências | DPS exibido | Configuração | Fonte |
|---|---:|---|---|---:|---:|---|---:|---|---|
| Lacerate of Haemorrhage / Eviscerate | 3.26 | Lacerate + Eviscerate | Gladiator | 3.828 | 47.601 | 79/78/79/62 | 23,35M | Uber, Frenzy | https://pobb.in/lr4LO8Ok4737 |
| Lacerate of Haemorrhage híbrida | 3.26 | Lacerate | Gladiator | 4.451 + 1.293 ES | 22.307 | 90/90/90/75 | 36,16M | Uber, Shock 15%, Frenzy | https://pobb.in/NvjKC8uJSCpb |
| Lacerate / Eviscerate de progressão | 3.28 | Lacerate + Eviscerate | Gladiator | 4.044 | 49.325 | 80/79/80/15 | 1,9M | Late maps | https://mobalytics.gg/poe/builds/ronarray-bleed-lacerate-eviscerate-gladiator |
| Eviscerate / Earthquake | 3.25 | Eviscerate + Earthquake | Gladiator | 5.411 | 11.625 | 80/79/81/75 | 1,73M | 3 Frenzy | https://pobb.in/u/Gnarlbrew/l-qMS8ffSW6J |
| Bleed bow | 3.22 | Puncture + Snipe | Gladiator | n/d | n/d | n/d | n/d | PoB público | https://pobb.in/do4wxVTtrV68 |
| Bleed bow clássico | 3.15 | Rain of Arrows + Puncture | Gladiator | n/d | n/d | n/d | n/d | Puncture single-target | https://www.pathofexile.com/forum/view-thread/2247655 |
| Bleed Earthquake budget | 3.25 | Earthquake | Gladiator | n/d | n/d | n/d | n/d | Bleed aggravated | https://www.pathofexile.com/forum/view-thread/3543278 |

## Padrões sólidos

### Lacerate / Eviscerate Gladiator

- O padrão moderno separa funções: Lacerate para alvo resistente/boss e Eviscerate para clear/retaliation.
- Block não é apenas defesa: ele habilita Eviscerate e alimenta recuperação on-block.
- As variantes recentes priorizam Determined Survivor, More Than Skill, Measured Retaliation, Gratuitous Violence e Jagged Technique; a última torna o bleed aggravated.
- A build do XML local segue esse padrão, mas usa uma config agressiva: `conditionEnemyMoving=true`, Pride MAX, Rage 30, inimigo bleeding/intimidated e blocked recently ativos.

### Lacerate de alto investimento

- As duas amostras 3.26 mostram que DPS alto não significa automaticamente melhor build: uma possui 23,35M DPS e 62% chaos res; outra possui 36,16M DPS e 90/90/90/75, mas menor phys max hit.
- A comparação correta precisa guardar: bleed DPS sem culling, faixa mínima/máxima do bleed, uptime da tincture, agravamento real, regen/recoup e max hit.
- Ryslatha's Coil + Volatility é controverso: uma fonte afirma que causa dano inconsistente; outra defende que, com ataques frequentes e duração suficiente, o build permanece no topo da distribuição. Deve ser tratado como hipótese a testar no PoB, não como regra universal.

### Puncture / Bleed Bow

- A estrutura clássica usa Rain of Arrows/Tornado Shot para clear e Puncture/Snipe para single-target.
- O bow precisa carregar dano físico alto, bleed/phys DoT multiplier e suporte de ailment; o ataque inicial é menos importante que o bleed aplicado.
- É um arquétipo diferente do seu: menos block/armour e mais distância, projéteis, duração, Crimson Dance ou Snipe conforme a versão.
- Os guias antigos não são patch-equivalentes às variantes 3.26–3.28; servem para reconhecer padrões, não para copiar itens ou árvore.

### Earthquake / Earthshatter bleed

- Earthquake usa o aftershock como evento de dano pesado; a aplicação é mais lenta, mas cada bleed pode ser grande.
- Earthshatter/Generals Cry pode complementar clear ou aplicação, mas adiciona dependência de rotação e configuração.
- A amostra budget mostra que este arquétipo pode funcionar sem clusters/jewels caros, ao custo de DPS exibido menor.

## Comparação com o XML local

| Eixo | XML local | Padrão observado | Diagnóstico |
|---|---|---|---|
| Identidade | Gladiator 98; Lacerate + Eviscerate | Padrão dominante moderno | Arquétipo correto |
| Bleed DPS | 17,36M | 1,7M progressão; 23–36M endgame | Faixa plausível, mas config precisa ser normalizada |
| Vida | 5.385 | 3.828–5.411 nas amostras | Boa para a faixa analisada |
| Block | 91% attack / 87,75% spell | 88–90% em variantes tanky | Muito forte |
| Chaos res | 13% | 15–75% nas amostras modernas | Principal lacuna defensiva |
| Jewels | Large phys + medium cold DoT + phys/bleed rares | Large phys, life/bleed/DoT; bow usa jewel/ailment/duration | Medium cold DoT é o elemento menos coerente |
| Tincture | Bleed chance, bleed damage, DoT multi | Comum em variantes modernas | DPS deve ser medido com e sem uptime |
| Config | Moving, Rage 30, Pride MAX, múltiplas condições | Builds públicas também usam configs agressivas | Criar três perfis: realista, boss e teto |

## Filtros de comparação recomendados

1. Separar `Lacerate/Eviscerate melee`, `Puncture/Bleed Bow` e `Earthquake/Earthshatter` antes de comparar DPS.
2. Normalizar para mesmo patch, nível 95–100, alvo Uber, sem shock, sem culling e sem buffs impossíveis.
3. Registrar sempre: bleed mínimo/máximo, bleed médio, dano agravado, hit chance, chance de bleed, velocidade, duração, vida, max hit físico/elemental/caos, recovery e chaos res.
4. Classificar jewels por função: dano físico, bleed/phys DoT multi, vida, cluster entry, resistência/atributos e utilidade.
5. Penalizar builds que ativam `enemy moving`, `Pride MAX`, tincture, rage, charges, curse e flasks sem demonstrar uptime.

## Conclusões para a build local

- A base Lacerate/Eviscerate Gladiator está alinhada com o arquétipo mais consistente encontrado.
- O upgrade de maior confiança é separar configs e elevar chaos resistance; isso melhora a validade defensiva sem depender de mais DPS.
- O medium cluster com `12% increased Cold Damage over Time` deve ser comparado contra um cluster físico/bleed ou contra jewels raras com vida + bleed/DoT multi.
- Não substituir Ryslatha/Volatility automaticamente: testar a faixa de bleed e a frequência real de aplicação; o material público é conflitante.
- Para comparar com Puncture, não copiar a árvore melee: o bow exige outra entrega de dano, defesa e lógica de clear/single-target.

## Fontes

- https://pobb.in/lr4LO8Ok4737
- https://pobb.in/NvjKC8uJSCpb
- https://mobalytics.gg/poe/builds/ronarray-bleed-lacerate-eviscerate-gladiator
- https://pobb.in/u/Gnarlbrew/l-qMS8ffSW6J
- https://pobb.in/do4wxVTtrV68
- https://www.pathofexile.com/forum/view-thread/2247655
- https://www.pathofexile.com/forum/view-thread/3543278
- https://www.pathofexile.com/forum/view-thread/3804187
