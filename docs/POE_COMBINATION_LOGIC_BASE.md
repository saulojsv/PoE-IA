# Lógica de combinações do PoE 1

## Objetivo

Organizar combinações de builds em camadas verificáveis. A geração pode explorar possibilidades; somente regras determinísticas podem aprovar uma combinação.

## Fluxo obrigatório

```text
contrato da build
  -> normalização de dados e patch
  -> geração de candidatos por camada
  -> validação de compatibilidade
  -> validação de recursos e limites
  -> montagem PoB/XML
  -> auditoria de métricas e configuração
  -> score e ranking
```

Falha em qualquer gate crítico impede aprovação, mas o candidato deve ser preservado como exemplo negativo com seus blockers.

## Camadas

1. **Identidade**: patch, skill principal, classe, ascendência, conteúdo, orçamento e modo de entrega.
2. **Skill e gems**: tags, dano, supports, links, custos, triggers e limites.
3. **Árvore**: conectividade, ascendência, keystones, masteries, sockets e custo em pontos.
4. **Equipamentos**: bases, uniques, affixes, influências, atributos, resistências e dependências.
5. **Configuração PoB**: buffs, debuffs, charges, flasks, alvo, uptime e condições realistas.
6. **Build completa**: união das camadas, XML importável, métricas e explicação dos blockers.

Não misturar camadas antes de cada uma passar sua validação local.

## Tipos de relação

- `requires`: A exige B.
- `enables`: A desbloqueia ou habilita B.
- `supports`: A escala ou complementa B.
- `conflicts`: A e B não podem coexistir.
- `consumes`: A usa recurso limitado de B.
- `scales_with`: A recebe escala válida de B.
- `conditional`: a relação só vale sob uma condição explicitamente registrada.
- `observed_with`: associação estatística; nunca é regra de legalidade.

## Ordem de decisão

1. Patch e fonte compatíveis.
2. Legalidade estrutural.
3. Requisitos e recursos.
4. Compatibilidade mecânica.
5. Cobertura funcional: dano, clear, defesa, recuperação e conteúdo.
6. Eficiência e score.

`Cannot` vence `Can`; regra específica vence geral; `increased/reduced` são aditivos; `more/less` são multiplicativos. Frequência em builds não substitui validação.

## Gates críticos

- skill principal e links válidos;
- supports compatíveis com tags e comportamento;
- árvore conectada e ascendência legal;
- atributos, níveis, sockets e limites válidos;
- itens e mods disponíveis para a base/patch;
- recursos suficientes para custo e reserva;
- configuração PoB explícita e não inventada;
- XML parseável e estruturalmente compatível.

## Estados

- `generated`: candidato criado;
- `blocked`: falhou em gate crítico;
- `validated_partial`: camadas locais válidas, build incompleta;
- `validated`: build completa válida;
- `needs_review`: conflito, fonte insuficiente ou métrica pendente;
- `invalid`: estrutura impossível ou dados corrompidos.

## Score

O score só é calculado depois dos gates. Blocker crítico zera o score final. O score deve manter componentes separados: legalidade, funcionalidade, defesa, dano, eficiência, custo, evidência e realismo PoB.

## Evidência e versionamento

Cada relação e candidato deve guardar patch, versão do schema, versão das regras, fonte, data, confiança, blockers e warnings. Claims estatísticos devem ser marcados como observação, não como compatibilidade.

## Contrato de manutenção

Alterações nas regras exigem atualização do schema, exemplos/fixtures e auditoria correspondente. Nunca promover uma recomendação para blocker sem implementação local do validador.

