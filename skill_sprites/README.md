# Catálogo de sprites de skills

Este diretório registra a relação canônica `nome da skill → sprite` usando o PoE Wiki.

## Fontes e prioridade

1. Página da skill no PoE Wiki: `https://www.poewiki.net/wiki/<título>`.
2. Categoria MediaWiki `Category:Skill icons`, consultada de forma agregada e paginada, sem uma requisição por skill.
3. Página do arquivo (`File:<nome>`), usada como evidência visual e origem do download.

O candidato principal é o arquivo cujo nome contém `skill icon`; os demais candidatos de imagem ficam registrados no JSON para auditoria. Não há fallback para ícone genérico: quando não houver sprite específica, o estado é `missing`.

## Execução

```powershell
python skill_sprites\scrape_skill_sprites.py
```

Saídas:

- `skill_sprite_index.json`: uma entrada por skill, com URL da página, sprite atribuída, candidatos e status.
- `sprites\`: cópia local dos arquivos de sprite encontrados.

## Parsing

O scraper descobre as skills na tabela de `Skill_gem`, consulta a categoria de ícones em poucos lotes paginados, associa pelo nome do arquivo (`<skill> skill icon.png`) e consulta os metadados em lotes de até 50 arquivos. Há cache local, atraso curto entre downloads e backoff para `429`; erros individuais são preservados no índice.

## Verificação

O índice contém `checked_at`, `source_page`, `api_page` e `file_page` para permitir revalidação posterior. A validação visual manual do padrão foi feita no navegador in-app no exemplo:

`https://www.poewiki.net/wiki/Alchemist%27s_Mark#/media/File:Alchemist%27s_Mark_skill_icon.png`
