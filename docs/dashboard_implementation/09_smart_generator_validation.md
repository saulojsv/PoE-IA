# Smart Generator: validação de itens PoE 1

## Objetivo

O gerador deve produzir um item válido antes de tentar otimizar DPS ou defesa. A ordem é: slot, classe da base, base real, item level, raridade, pool permitido, filtros de domínio/tags/origem, grupos, tiers e valores.

## Correções aplicadas

- O pool global deixou de ser usado quando a base não possui `eligible_mods`; sem catálogo elegível, o resultado fica vazio e não recebe um mod inventado.
- O item level agora é definido na interface do Smart Combination, entre 1 e 100, e cada mod é filtrado por `min_item_level` antes do sorteio.
- O item level final nunca fica abaixo do nível mínimo da base.
- Prefixos e sufixos compartilham o mesmo conjunto de grupos ocupados; o mesmo grupo não pode ser escolhido duas vezes.
- Flask mágico usa exclusivamente os mods filtrados para `flask`, com no máximo 1 prefixo e 1 sufixo.
- Mods de socketed, cluster, flask, fishing e ataques de armas específicas são rejeitados nos slots incompatíveis.
- Jewels de cluster são excluídos da primeira geração de jewels comuns; cluster jewels permanecem reservados para um gerador estrutural próprio.
- Implicits da base são carregados separadamente e não consomem prefixos ou sufixos.
- A geração continua exigindo os 21 slots definidos: 10 equipamentos, 5 flasks e 6 jewels. Resultado incompleto é marcado como falha e não pode ser aplicado.
- O overlay de sockets permanece apenas visual e indica a capacidade aproximada da categoria da base; não afirma cores ou links reais sem dados de socket no XML.

## Limitações explícitas

O catálogo público atual fornece `eligible_mods`, grupo, tipo e nível mínimo, mas nem todos os registros expõem domínio, tags estruturadas, origem, tier formal ou propriedades locais. Esses campos não são inferidos a partir de texto para validar um item como se fossem dados oficiais. Mods sem metadados suficientes devem ser enriquecidos no catálogo antes de entrarem no gerador.

Unique items não devem ser sorteados como rares: precisam ser carregados com o conjunto fixo da própria definição. Cluster jewels, Abyss jewels e jewels básicos também devem possuir pools separados quando o catálogo estrutural estiver completo.

## Fluxo de validação

```text
slot -> classe/base -> item level -> raridade
     -> eligible_mods -> domínio/tags/origem
     -> capacidade de prefixo/sufixo -> grupos
     -> tier -> valor dentro da faixa -> validação final
```

## Verificação

- `npm run build` deve concluir sem erros TypeScript/Vite.
- O botão de aplicar permanece desabilitado quando algum slot obrigatório não foi gerado.
- Falha de base, sprite ou metadado deve ser exibida como ausência explícita, nunca como fallback silencioso.

