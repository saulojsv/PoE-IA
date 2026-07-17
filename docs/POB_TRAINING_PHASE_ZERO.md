# PoB Training Phase Zero

Regra central: o XML usado pelo Path of Building fica puro. Metadados da IA ficam em sidecar pareado.

```text
combo_00000012.xml
combo_00000012.analysis.xml
```

`combo_*.xml` deve ser cópia byte-a-byte ou serialização compatível do PoB. Não adicionar tags internas nele.

`combo_*.analysis.xml` guarda fase 0, auditoria, métricas defensivas, scores, histórico e nota humana.

## Layout

O script `scripts/phase0_pob_training_audit.py` cria:

```text
PoE - Combinacoes para Treino Futuro/
  pob-builds/raw generated validated rejected
  analysis/phase-zero tree-evaluations defense-statistics human-ratings
  datasets/pending train validation test quarantine
  reports/global by-class by-ascendancy by-defense by-patch
  manifests
  schemas/pob-observed-schema internal-analysis-schema
```

## Fase 0

Fase 0 não gera árvore. Ela identifica classe/start, cataloga XML real, mede defesa observada, registra defesa externa como `unknown` e só então libera a geração.

## Auditoria

Rodar lote pequeno:

```powershell
python scripts/phase0_pob_training_audit.py --limit 25 --batch-id batch-0001 --copy-pob
```

Saídas principais:

- `analysis/phase-zero/batch-0001.json`
- `analysis/phase-zero/combo_*.analysis.xml`
- `analysis/defense-statistics/batch-0001.json`
- `schemas/pob-observed-schema/batch-0001.json`
- `manifests/*.xml`

## Métricas defensivas

Cada build recebe:

- `totalPassivePoints`
- `defensiveNodeCount`
- `defensiveWeightedPoints`
- `travelPoints`
- `offensivePoints`
- `utilityPoints`
- categorias como `lifePoints`, `evasionPoints`, `spell_suppressionPoints`, `blockPoints`

Estatísticas por grupo usam mediana, P25/P75, P10/P90, média, mínimo, máximo e desvio.

## Limite atual

Classificação por texto dos stats oficiais do passive tree. Timeless jewels, clusters gerados e itens ainda ficam como desconhecidos/pendentes.
