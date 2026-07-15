# Path of Exile: sistemas e interações para agente especialista

## Objetivo

Expandir a base de conhecimento do agente para sistemas que vão além de dano/defesa: alvo, projéteis, AoE, minions, proxies, auras, curses, estados, corpos, duração, recuperação, crafting, IA, Atlas e RNG.

## Targeting

Tipos:
- target;
- ground target;
- auto target;
- chain;
- fork;
- pierce;
- return;
- split;
- ricochet;
- homing;
- projectile lifetime.

Registrar para cada skill:
- como escolhe alvo;
- se mira no chão;
- se pode auto mirar;
- se interage com projéteis;
- ordem de interações.

## Projéteis

Cada projétil pode ter:
- velocidade;
- direção;
- duração;
- distância máxima;
- colisão;
- retorno;
- pierce;
- fork;
- chain;
- split;
- ricochet.

Regra: a ordem dessas interações importa e deve ser fonteada por skill/mecânica.

## Área de efeito

Campos:
- radius;
- area damage;
- area of effect;
- area scaling.

Regra: aumentar área não implica aumentar dano, salvo quando a skill/mecânica disser.

## Minions

Minions têm atributos próprios:
- vida;
- resistências;
- accuracy;
- critical strike;
- armour;
- AI;
- agressividade;
- duração.

Regra: modificadores do personagem não afetam minions, salvo texto explícito.

## Totens

Totem é entidade separada.

Registrar:
- habilidade usada;
- limite;
- duração;
- propriedade do dano;
- escalamento aplicável;
- interação com on hit, leech, reflect e buffs.

## Traps

Trap:
1. é lançada;
2. arma;
3. espera condição;
4. ativa;
5. usa a habilidade.

Registrar tempo de armar, trigger, limite, recuperação e suporte.

## Mines

Mine:
- é colocada;
- é detonada;
- pode encadear detonações;
- possui bônus próprios;
- tem limite ativo.

Separar mine behavior de skill behavior.

## Brands

Brands:
- prendem em inimigos;
- trocam alvo;
- têm duração;
- podem ser recuperadas;
- podem ter ativações periódicas.

Registrar attachment range, activation frequency, detached duration e recall.

## Auras

Campos:
- reserva;
- alcance;
- aura effect;
- self aura;
- ally aura;
- enemy aura.

Separar aura em si de buffs/debuffs aplicados.

## Curses

Distinguir:
- hex;
- mark;
- doom, quando existir no patch;
- curse limit;
- curse effect;
- hexproof;
- curse immunity.

## Estados do personagem

Exemplos:
- moving;
- stationary;
- full life;
- low life;
- low mana;
- full ES;
- recently hit;
- recently killed.

Registrar duração/condição exata quando fonteada.

## Estados de monstros

Exemplos:
- alive;
- dead;
- destroyed;
- corpse;
- frozen corpse;
- exploded corpse;
- consumed.

## Corpos

Corpse é objeto de jogo.

Pode ser:
- destruído;
- explodido;
- consumido;
- revivido;
- detonado;
- transformado.

Registrar corpse level, corpse life, origem e disponibilidade.

## Duração

Campos:
- base duration;
- increased duration;
- less duration;
- more duration;
- expiração;
- renovação;
- atualização.

Separar refresh de stacking.

## Recuperação

Distinguir:
- regeneration;
- recharge;
- leech;
- recovery;
- recoup;
- gain;
- recover.

Cada termo tem regra própria.

## Leech

Registrar:
- instâncias independentes;
- limite de recuperação;
- life leech;
- mana leech;
- ES leech;
- overleech quando fonteado.

## Frascos

Campos:
- charges;
- uso;
- recuperação de cargas;
- duração;
- prefixo;
- sufixo;
- enchantment, quando existe.

## Influências de itens

Reconhecer:
- Shaper;
- Elder;
- Crusader;
- Redeemer;
- Hunter;
- Warlord;
- Exarch;
- Eater.

Cada influência possui pool de mods próprio.

## Prefixos e sufixos

Registrar:
- limite por item;
- híbridos;
- grupos de mods;
- exclusões;
- crafted mods;
- spawn weights.

## Item level

Item level define:
- quais mods podem aparecer;
- tiers máximos;
- opções de crafting.

## Affixes

Tipos:
- prefix;
- suffix;
- hybrid;
- crafted;
- implicit;
- explicit;
- enchant;
- fractured;
- synthesised.

## Tags de mods

Tags internas afetam:
- Harvest;
- Fossils;
- Essences;
- Crafting Bench;
- Recombinators, se existirem no patch.

## Spawn weights

Mods têm pesos de geração diferentes.

Nunca tratar craft como deterministicamente disponível sem fonte.

## Pools de mods

Pool depende de:
- base item;
- item level;
- influência;
- tipo;
- tags;
- exclusões.

## IA dos monstros

Tipos:
- melee;
- ranged;
- caster;
- summoner;
- support;
- patrol;
- aggressive;
- defensive.

## Prioridade de IA

Monstros escolhem alvos conforme regras próprias.

Totens, minions e jogador podem alterar prioridade.

## Atlas

Registrar:
- tier de mapas;
- progressão;
- conclusão;
- influências;
- eventos;
- modificadores do Atlas.

## RNG

RNG afeta:
- drops;
- crafting;
- crítico;
- evasão;
- block;
- ailments;
- mods;
- mapas;
- recompensas.

Regra: sistemas diferentes podem usar lógicas diferentes.

## Prioridade global

Regras essenciais:
- `Cannot` prevalece sobre `Can`.
- Regra específica prevalece sobre geral.
- Local e global são distintos.
- `More` e `Less` são multiplicativos.
- `Increased` e `Reduced` são aditivos.
- Termo técnico prevalece sobre linguagem comum.

## Escala da base especialista

Meta aproximada:

| Categoria | Quantidade |
| --- | ---: |
| Termos técnicos | 300-400 |
| Regras fundamentais | 700-900 |
| Exceções | 300-500 |
| Mecânicas de habilidades | 500-700 |
| Itens e crafting | 400-600 |
| Mecânicas de ligas | 500-800 |
| Interações entre sistemas | 1000+ |

Objetivo final: mais de 3000 regras/interações documentadas e versionadas.
