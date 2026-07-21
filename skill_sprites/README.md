# Catálogo de sprites de skills

Este diretório registra a relação canônica `nome da skill → sprite` usando o PoE Wiki.

## Fontes e prioridade

1. Página da skill no PoE Wiki: `https://www.poewiki.net/wiki/<título>`.
2. API MediaWiki da mesma página (`prop=images`), usada para localizar todas as imagens referenciadas.
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

O scraper descobre as skills na tabela de `Skill_gem`, normaliza e deduplica os links, consulta a API com paginação (`continue`), filtra imagens por `skill icon` e baixa a URL oficial retornada por `imageinfo`. Erros individuais são preservados no índice; uma falha não interrompe o lote.

## Verificação

O índice contém `checked_at`, `source_page`, `api_page` e `file_page` para permitir revalidação posterior. A validação visual manual do padrão foi feita no navegador in-app no exemplo:

`https://www.poewiki.net/wiki/Alchemist%27s_Mark#/media/File:Alchemist%27s_Mark_skill_icon.png`
