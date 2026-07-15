# Path of Exile: regras avançadas, precedência e interações

## Objetivo

Base para o agente interpretar PoE além de descrições superficiais: ordem de cálculo, exceções, termos técnicos, precedência e interações.

## Ordem aproximada do dano

O agente deve interpretar dano nesta sequência aproximada:

1. dano base da habilidade;
2. dano adicional: `Adds X to Y Damage`;
3. conversão de dano;
4. ganho como extra: `Gain X% as Extra`;
5. modificadores `increased/reduced`;
6. modificadores `more/less`;
7. crítico;
8. penetração;
9. resistências do alvo;
10. mitigações adicionais;
11. dano final.

Regra: não tratar `gain as extra` como conversão.

## Ordem das defesas

Ao receber dano, as camadas dependem de origem e tipo:

- attack/spell;
- hit/DoT;
- tipo de dano;
- chance de evitar;
- block;
- suppression;
- armour;
- resistências;
- mitigadores específicos;
- energy shield;
- vida.

Nem toda defesa se aplica a todo dano.

## Hierarquia de palavras

Termos do jogo têm significado técnico.

Exemplos:
- `increased` não é `more`;
- `nearby` não é `in area`;
- `recently` é intervalo definido pelo jogo;
- `killed` não é sempre igual a `enemy died`;
- `when`, `if`, `while`, `during`, `on`, `after` mudam a condição.

Regra: interpretar termos pelo significado técnico de PoE, não pelo português/inglês comum.

## Tags

Tags determinam compatibilidade de modificadores e suportes.

Exemplo:
- Fireball com `Spell` escala com spell damage;
- `Attack Damage` não escala Fireball.

Regra: tag permite possibilidade, mas não prova compatibilidade completa. Validar por fonte.

## Keywords essenciais

O agente deve classificar e pesquisar:
- Attack;
- Spell;
- Projectile;
- Strike;
- Slam;
- Channelling;
- Melee;
- Area;
- Duration;
- Aura;
- Curse;
- Mark;
- Minion;
- Totem;
- Mine;
- Trap;
- Brand;
- Banner;
- Guard;
- Movement;
- Travel;
- Warcry.

Cada keyword exige regras próprias de suporte, escala, limites e interação.

## Buffs

Exemplos:
- Onslaught;
- Tailwind;
- Adrenaline;
- Fortify;
- Elusive;
- Arcane Surge;
- Rage;
- Berserk;
- Unholy Might.

Para cada buff, registrar:
- fonte;
- efeito;
- duração;
- empilhamento;
- limite;
- patch;
- fonte.

## Debuffs

Exemplos:
- Exposure;
- Shock;
- Chill;
- Scorch;
- Brittle;
- Sap;
- Intimidate;
- Unnerve;
- Maim;
- Hinder;
- Withered.

Para cada debuff, registrar:
- quem aplica;
- quem recebe;
- se acumula;
- máximo;
- duração;
- fonte.

## Prioridade entre modificadores

Modelo:

```text
base -> increased/reduced -> more/less -> final
```

`increased` soma dentro do grupo.
`more` multiplica.
`less` multiplica reduzindo.

## Caps

Sempre registrar:
- cap padrão;
- cap máximo possível;
- como aumentar cap;
- exceções;
- patch.

Exemplos:
- resistências máximas;
- block;
- spell suppression;
- efeitos específicos.

## Conversão

Registrar:
- origem;
- destino;
- porcentagem;
- conversão parcial;
- múltiplas conversões;
- conversão em cadeia;
- limite;
- patch.

Regra: conversão muda tipo de dano; `gain as extra` duplica parte como novo dano.

## Double Damage

Double Damage:
- não é crítico;
- não dobra DoT;
- só aplica quando a mecânica permite.

## Lucky e Unlucky

Lucky:
- rola duas vezes;
- usa melhor resultado.

Unlucky:
- rola duas vezes;
- usa pior resultado.

Registrar onde se aplica: dano, crit, ailment, chance, defesa etc.

## Snapshot

Algumas habilidades fixam atributos ao serem criadas; outras atualizam dinamicamente.

Registrar:
- snapshot;
- dynamic update;
- desconhecido;
- evidência.

## Trigger

Skills acionadas automaticamente podem:
- não ser usáveis manualmente ao mesmo tempo;
- ter custo alterado;
- respeitar cooldown;
- respeitar trigger rate;
- entrar em cooldown compartilhado.

Validar por patch.

## Cooldown

Registrar:
- cooldown normal;
- cooldown compartilhado;
- cooldown recovery rate;
- breakpoints;
- limite prático;
- fonte.

## Escalamento

Distinguir:
- atributo base;
- modificador local;
- modificador global;
- modificador específico;
- modificador condicional.

## Local vs Global

Exemplo:
- `+200% Physical Damage` em arma afeta localmente aquela arma;
- `+200% Global Physical Damage` afeta dano físico aplicável globalmente.

Regra: nunca assumir que mod de item é global.

## Stacks

Para pilhas, registrar:
- se acumula;
- máximo;
- duração;
- renovação;
- perda;
- fonte.

Exemplos:
- Poison;
- Wither;
- Rage;
- Trauma;
- Virulence.

## Precedência de regras

1. Texto específico da skill/item vence regra geral.
2. Regra mais específica vence regra genérica.
3. Termo técnico do jogo vence interpretação comum.
4. Se houver conflito sem fonte definitiva, registrar `conflicted`.

## Escopo de conhecimento desejado

Para agente nível wiki:
- 250-350 definições;
- 500-700 regras fundamentais;
- 200-300 exceções;
- centenas de interações;
- glossário técnico completo.

## Regras para o agente

- Explicar por que uma mecânica funciona.
- Separar regra, exceção e observação.
- Validar interações por fonte.
- Nunca inferir mecânica complexa apenas por nome.
- Nunca misturar patches.
- Registrar conflito quando fontes discordarem.
- Para targeting, projéteis, proxies, crafting, Atlas, estados, corpses e RNG, usar também `docs/POE_SYSTEMS_INTERACTIONS_BASE.md`.
