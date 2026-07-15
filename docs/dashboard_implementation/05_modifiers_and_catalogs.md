# Modificadores e Catalogos

## Objetivo

Criar base local para saber quais modificadores cada tipo/base de item pode receber, preparando o smart generator para criar combinacoes validas.

## Arquivos principais

- `data/items/item_base_mods.json`
- `data/items/item_type_mods.json`
- `data/items/item_category_catalog.json`
- `data/items/item_category_overrides.json`
- `data/items/amulet_anointments.json`
- `dashboard/item_base_mod_summary.json`

## Scripts relacionados

- `scripts/build_item_base_mod_catalog.py`
- `scripts/build_item_type_mod_catalog.py`
- `scripts/build_item_category_catalog.py`
- `scripts/build_dashboard_item_mod_summary.py`
- `scripts/build_amulet_anointment_catalog.py`

## Catalogo por categoria

O catalogo separa bases em grupos como:

- armour;
- helmet;
- gloves;
- boots;
- belt;
- ring;
- amulet;
- weapon;
- shield/offhand;
- flask;
- jewel.

Essa separacao e essencial para evitar erro como amuleto em helmet ou flask em weapon.

## Modificadores do item selecionado

Na dashboard, o painel do item selecionado mostra:

- nome;
- base;
- rarity;
- item level;
- slot;
- implicit mods;
- explicit mods.

Formato visual planejado:

- implicit mods primeiro;
- divisor;
- explicit mods abaixo.

## Anointments de amuleto

Arquivo:

`data/items/amulet_anointments.json`

Objetivo:

- listar combinacoes de oils;
- associar cada anoint ao notable/modificador concedido;
- permitir ao gerador testar impacto de anoint em amuletos.

## Limitacao atual

Os modificadores catalogados ajudam a organizar e sugerir combinacoes, mas ainda nao substituem o motor do Path of Building. Para precisao total, cada combinacao precisa ser calculada pelo PoB ou por uma implementacao fiel das formulas dele.
