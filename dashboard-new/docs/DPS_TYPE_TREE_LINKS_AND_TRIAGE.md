# DPS Type: árvore, links e triagem por build

## Árvore

`/poe-tree/skilltree-3.28.svg` é carregado inline na miniárvore. Isso preserva o `viewBox`, os `path`/`line` de conexão, os nodos e os estilos usados pela Passive Tree.

## Triagem

Cada `build_row` é avaliada individualmente. A classificação usa:

- IDs de nodos presentes na build;
- nome e stats dos nodos/masteries;
- gems e modificadores ofensivos dos itens;
- exclusão de textos defensivos, como `Avoid Bleeding` e `Corrupted Blood cannot...`.

Bleed exige evidência ofensiva de bleed ou nodo/mastery de bleed. Dano físico, ataque ou ailment isolados não bastam.

## Limite do XML exportado

O XML exportado pela interface é um artefato de estudo. Deve ser validado no Path of Building antes de ser usado como build operacional.
