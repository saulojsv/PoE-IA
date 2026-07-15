# Sprites de Itens

## Pasta principal

`assets/poe_item_sprites`

Todas as sprites usadas pela dashboard ficam nesta pasta.

## Indice

`dashboard/item_sprite_index.json`

Formato:

```json
{
  "Nome ou Base": "../assets/poe_item_sprites/Arquivo.png"
}
```

O indice pode apontar o mesmo arquivo para varios nomes. Isso e esperado, porque varios raros usam a mesma sprite da base.

## Regra sem fallback

Nao usar icone generico para substituir sprite ausente.

Se nao existe sprite correta:

- registrar como missing;
- buscar em fonte confiavel;
- salvar a sprite correta;
- adicionar ao indice.

## Fontes usadas

As sprites foram buscadas em varias fontes, nesta ordem pratica:

1. PoE Wiki;
2. Fandom API;
3. PoEDB;
4. CDN oficial `web.poecdn.com`;
5. PoE2DB para itens de PoE2 encontrados em XMLs.

## Scripts relacionados

- `scripts/download_item_sprites.py`
- `scripts/backfill_missing_item_sprites.py`
- `scripts/audit_item_sprite_coverage.py`
- `scripts/build_item_asset_indexes.py`

## Relatorios

- `data/items/sprite_final_missing.json`
- `data/items/sprite_missing_remaining.json`
- `data/items/sprite_poedb_report.json`
- `data/items/sprite_category_report.json`
- `data/items/sprite_aliases.json`

## Validacao atual

A validacao final do dataset atual retornou:

```text
missing 0
index 1189
```

Isso significa que todos os itens presentes no JSON atual da dashboard possuem sprite mapeada por nome ou base.

## Cuidados

- Nao mapear uma base para sprite errada so porque o nome parece parecido.
- Para raros, a sprite deve vir da base.
- Para uniques, a sprite geralmente deve vir do proprio unique.
- Para PoE2, algumas imagens usam CDN diferente e podem vir em `.webp`.
- Se o navegador mostrar sprite antiga, usar `Ctrl+F5`.
