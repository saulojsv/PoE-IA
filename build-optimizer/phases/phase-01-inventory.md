# Fase 1 — inventário e integridade

## Fonte canônica

`C:\Users\saulo\Documents\Path of Building\Builds`

## Primeira leitura

- Contagem encontrada em 2026-07-22: **940 XMLs**.
- A expectativa informada era 930; a diferença de 10 arquivos precisa ser explicada por duplicatas, cópias ou builds novas.
- Validação executada: **940 válidos, 0 inválidos**.
- Hashes SHA-256 gerados; foram encontrados **44 grupos de duplicatas exatas**.
- Nenhum XML original foi movido ou editado nesta fase.

## Saída obrigatória

- `data/raw-manifest.jsonl`: caminho relativo, tamanho, hash, data e status XML.
- `data/normalized-builds.jsonl`: somente após a fase 2.
- `data/duplicates.json`: hashes e identidades duplicadas.
- `reports/phase-01-YYYYMMDD.md`: erros, contagem e decisões.

## Próxima ação

Concluído: `data/raw-manifest.json` e `data/duplicates.json`. Próximo: consolidar duplicatas por hash, preservar aliases e normalizar a identidade de cada build.
