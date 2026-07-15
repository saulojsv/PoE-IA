# Proximos Passos

## Prioridade 1: calculo real via PoB

A dashboard hoje compara dados ja existentes nos XMLs. Para mostrar ganho/perda exato ao trocar item, o correto e:

1. gerar XML candidato;
2. abrir/calcular no Path of Building;
3. exportar resultado;
4. salvar antes/depois;
5. atualizar ranking na dashboard.

## Prioridade 2: banco de resultados

Criar base persistente:

`data/generated_build_tests`

Campos recomendados:

- build original;
- item alterado;
- item novo;
- nodos alterados;
- gems alteradas;
- metricas antes;
- metricas depois;
- ganho/perda percentual;
- restricoes quebradas;
- data do teste.

## Prioridade 3: ranking que aprende

Depois de acumular resultados reais:

- treinar ranker simples;
- prever combinacoes promissoras;
- evitar testar combinacoes obviamente ruins;
- manter PoB como validador final.

## Prioridade 4: completar catalogos

Expandir:

- mod pools por base;
- ilvl minimo por mod;
- prefix/suffix;
- tags;
- influencia;
- corruptions;
- implicits;
- enchants;
- anointments;
- limites de jewels/uniques.

## Prioridade 5: UX

Melhorias planejadas:

- filtros por slot;
- filtros por rarity;
- painel de item com estilo mais proximo do PoE;
- setas e valores absolutos atualizados;
- aviso claro quando metrica depende de PoB externo;
- cache busting para evitar navegador mostrar dashboard antiga.
