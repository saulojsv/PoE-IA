# Path of Exile: fundamentos mecânicos para o agente

## Objetivo

Base curta para o agente interpretar builds, PoB, XML, skills, suportes, itens, passivas e combinações sem confundir regras fundamentais.

## Vida

Vida é o recurso principal. Se chegar a 0, o personagem morre.

Recuperação comum:
- regeneração;
- leech;
- frascos;
- recoup;
- gain on hit;
- recuperação instantânea.

## Mana e custos

Mana normalmente paga habilidades.

Custos possíveis:
- mana;
- vida;
- energy shield;
- rage;
- nenhum custo.

Se o recurso exigido for insuficiente, a habilidade não pode ser usada.

## Energy Shield

Energy Shield funciona como camada antes da vida para a maioria dos danos.

Regra geral:

```text
dano recebido -> Energy Shield -> vida
```

Exceção importante: dano de chaos normalmente ignora Energy Shield, salvo mecânica que altere isso.

Após ficar sem sofrer dano por um período, ES começa a recarregar.

Fonte: https://www.poewiki.net/wiki/Game_mechanics

## Ward

Ward absorve dano de um golpe e depois fica indisponível até recarregar.

Diferença central:
- ES é uma reserva contínua;
- Ward é proteção pontual contra hit.

## Accuracy

Accuracy afeta ataques.

Ela é comparada contra Evasion do alvo.

Accuracy não afeta spells.

Fonte: https://www.poewiki.net/wiki/Evasion

## Evasion

Evasion pode evitar ataques completamente.

Se um ataque é evadido:
- não causa dano;
- normalmente não aplica efeitos associados ao hit.

Evasion não evita spells por padrão.

Fonte: https://www.poewiki.net/wiki/Evasion

## Armour

Armour reduz dano físico de hits.

Não reduz:
- fire;
- cold;
- lightning;
- chaos;
- damage over time.

Armour é mais eficiente contra vários hits pequenos do que contra um hit físico muito grande.

## Resistências

Tipos principais:
- fire;
- cold;
- lightning;
- chaos.

Resistências elementais normalmente têm limite base de 75%.

Exemplo:

```text
1000 fire damage com 75% fire resistance = 250 dano sofrido
```

## Hit

Hit é dano instantâneo.

Exemplos:
- ataque de espada;
- flecha;
- Fireball;
- Ice Spear.

Um hit pode:
- critar;
- aplicar ailments;
- causar stun;
- iniciar leech;
- acionar efeitos on hit;
- ser bloqueado ou evitado.

## Damage over Time

DoT é dano contínuo.

Exemplos:
- ignite;
- poison;
- bleeding;
- Righteous Fire;
- Caustic Ground.

DoT:
- não é hit;
- não crita por padrão;
- não aciona efeitos on hit;
- normalmente ignora mecânicas específicas de hits.

Fonte: https://www.poewiki.net/wiki/Game_mechanics

## Tipos de dano

Tipos básicos:
- physical;
- fire;
- cold;
- lightning;
- chaos.

Fire pode causar ignite.
Cold pode causar chill/freeze.
Lightning pode causar shock.
Chaos não é elemental e normalmente ignora ES.

## Ailments

Principais:
- ignite: DoT de fogo;
- freeze: impede ações;
- chill: reduz velocidade;
- shock: aumenta dano recebido;
- bleeding: DoT físico;
- poison: DoT chaos.

## Critical Strike

Crítico ocorre em hits.

Fluxo:

```text
hit -> verifica chance crítica -> aplica multiplicador crítico
```

Critical Strike Multiplier aumenta dano crítico.

## Increased vs More

`Increased` soma com outros increased.

Exemplo:

```text
50% increased + 30% increased = 80% increased
```

`More` multiplica.

Exemplo:

```text
100 * 1.5 * 1.5 = 225
```

Regra para o agente: tratar `more` como multiplicador forte e `increased` como soma dentro do mesmo grupo.

## Conversão de dano

Conversão muda o tipo do dano.

Exemplo:

```text
100 physical -> 100% converted to fire -> 100 fire
```

Depois da conversão, o dano pode escalar com modificadores aplicáveis ao novo tipo.

## Morte

Ao morrer, o personagem pode:
- perder experiência;
- voltar à cidade/checkpoint;
- perder tentativa em mapa/boss/conteúdo limitado.

## Regras para o agente

- Separar hit de DoT.
- Separar attack de spell.
- Separar elemental de chaos.
- Não aplicar armour a DoT.
- Não aplicar accuracy a spell.
- Não aplicar evasion a spell por padrão.
- Não tratar chaos como elemental.
- Não misturar increased e more.
- Confirmar exceções por fonte, item, keystone, ascendência ou patch.
- Para precedência, ordem de cálculo, caps, stacks, trigger e exceções, usar também `docs/POE_ADVANCED_RULES_PRECEDENCE_BASE.md`.

## Fontes

- https://www.poewiki.net/wiki/Game_mechanics
- https://www.poewiki.net/wiki/Evasion
- https://www.poewiki.net/wiki/Armour
