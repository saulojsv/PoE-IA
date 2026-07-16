# Pipeline de validação e medição

## Separação obrigatória

### 1. Validação determinística

Verifica somente fatos estruturais e regras implementadas: campos, patch, gems, árvore, itens, requisitos, recursos, limites e XML. Não calcula DPS, EHP ou eficiência.

### 2. Medição real

Um executor do Path of Building deve abrir/importar a build, aplicar a configuração registrada e devolver métricas observadas. A origem deve ser `path_of_building_app` ou outra fonte explicitamente identificada.

Estados: `not_run`, `running`, `measured`, `failed`, `pending`.

### 3. Avaliação

Só ocorre quando `measurement.status = measured`. Métricas ausentes, estimadas ou pendentes não podem gerar score positivo.

### 4. Ranking

Compara apenas candidatos com validação estrutural aprovada e medição real compatível com o mesmo patch, configuração e conteúdo.

## Regra de segurança

Se o PoB não executar, o resultado é `needs_review` com `pob_app_metrics_pending`; nunca preencher métricas por fórmula aproximada ou por frequência de builds.

## Contrato mínimo

```json
{
  "validation": {"status": "validated", "blockers": [], "warnings": []},
  "measurement": {"status": "measured", "source": "path_of_building_app", "metrics": {}},
  "evaluation": {"status": "scored", "score": {}}
}
```

