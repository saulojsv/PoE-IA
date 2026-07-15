# Pipeline de Dados

## Entrada principal

Os XMLs do Path of Building ficam em:

`data/poe_ninja/poe_ninja_dataset/xml`

Cada XML representa uma build exportada ou coletada. Arquivos `.meta.json` acompanham alguns XMLs com metadados de origem.

## Geracao da dashboard

Script principal:

`scripts/generate_build_dashboard.py`

Responsabilidades:

- varrer XMLs;
- extrair skills principais;
- extrair gems;
- extrair itens;
- extrair item level;
- extrair rarity;
- extrair implicits;
- extrair explicits;
- inferir slot;
- extrair nodos;
- extrair metricas numericas de build quando presentes;
- gerar `dashboard/build_dashboard_data.json`.

## Estrutura do JSON

`dashboard/build_dashboard_data.json` contem:

- `summary`: totais gerais;
- `skills`: agrupamento por skill;
- `builds`: lista completa das builds;
- `top_gems`: gems mais frequentes;
- `top_items`: itens mais frequentes;
- `top_nodes`: nodos mais frequentes.

Cada build contem:

- `file`;
- `skill`;
- `class`;
- `ascendancy`;
- `level`;
- metricas de defesa e DPS;
- `gems`;
- `items`;
- `item_details`;
- `nodes`.

Cada item em `item_details` contem:

- `name`;
- `base`;
- `rarity`;
- `item_level`;
- `slot`;
- `implicits`;
- `explicits`.

## Coleta poe.ninja

Scripts relacionados:

- `scripts/poe_ninja_api_pob_xml_by_skill.py`
- `scripts/poe_ninja_pob_xml_by_skill.py`
- `scripts/automate_poe_ninja_by_skill_class.py`

Uso esperado:

```bat
py -3 scripts\poe_ninja_api_pob_xml_by_skill.py --batch-size 1 --target-per-skill 6 --max-profile-attempts 6 --sleep 8 --ensure-folders
```

O coletor salva XMLs por skill em `data/poe_ninja/poe_ninja_dataset/xml`.

## Estado atual do dataset

A dashboard foi alinhada para 683 XML builds no JSON principal. Se novos XMLs forem adicionados, e preciso regerar:

```bat
py -3 scripts\generate_build_dashboard.py
```

Depois disso, rodar auditoria de sprites para garantir que novos itens nao ficaram sem imagem.
