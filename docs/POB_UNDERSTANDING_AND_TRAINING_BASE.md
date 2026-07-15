# Path of Building: base de entendimento para o agente

## Objetivo

Ensinar o agente a coletar, validar, converter e usar builds de Path of Building (PoB) como dados locais para análise, combinação e treino de modelos de Path of Exile 1.

## O que é PoB

Path of Building Community Fork é o planejador de builds mais usado para Path of Exile. Ele permite criar builds, importar personagens, montar árvore passiva, itens, gems, configurações de combate e compartilhar builds por código/link. A versão Community Fork é mantida pela comunidade e recebe suporte contínuo a mecânicas novas.

Fontes:
- https://github.com/PathOfBuildingCommunity/PathOfBuilding
- https://pathofbuilding.community/
- https://www.pathofexile.com/forum/view-thread/3009317

## Conceitos centrais

### Build PoB

Uma build PoB representa um personagem completo ou parcial:
- classe;
- ascendência;
- árvore passiva;
- masteries;
- jewels;
- cluster jewels;
- itens;
- flasks;
- skill gems;
- support gems;
- links;
- configurações de combate;
- cálculos de dano e defesa;
- notas.

### Código PoB

O código PoB é um texto comprimido que representa o XML interno da build.

Modelo operacional:
1. receber código PoB ou link;
2. resolver para código exportado;
3. decodificar base64/base64url;
4. descomprimir zlib/deflate;
5. obter XML;
6. validar XML;
7. salvar XML e metadata.

### XML PoB

O XML é a forma estruturada da build. Ele deve ser tratado como contrato técnico, não como texto livre.

Seções comuns:
- `Build`;
- `Skills`;
- `Items`;
- `Calcs`;
- `Config`;
- `TreeView`;
- `Import`;
- `Party`;
- `Tree`;
- `Notes`.

O agente nunca deve fabricar XML completo sem dados suficientes.

## Fontes de PoB/XML

Prioridade atual, sem poe.ninja:
1. fórum oficial de Path of Exile;
2. pobb.in;
3. Mobalytics;
4. YouTube: descrição, comentário fixado e links externos;
5. Maxroll;
6. PoE Vault;
7. Reddit;
8. GitHub/repositórios de builds;
9. Google Docs ou guias de criadores.

Não usar poe.ninja enquanto estiver instável para esta coleta.

Fontes úteis:
- https://pobb.in/
- https://www.poe-vault.com/guides/path-of-building
- https://github.com/PathOfBuildingCommunity/PathOfBuilding

## Pobb.in

pobb.in é um serviço de compartilhamento e pré-visualização de builds PoB. Pode conter ou apontar para o código exportado da build. O agente deve tentar resolver links pobb.in antes de considerar uma fonte sem XML.

Regra:
- se houver pobb.in, tentar obter o código PoB;
- se houver código, converter para XML;
- se falhar, registrar `xml_status: needs_review`;
- nunca copiar conteúdo protegido desnecessário.

Fonte:
- https://www.reddit.com/r/pathofexile/comments/sh6n6u/announcing_pobbin_a_path_of_building_pastebin_and/

## Pasta correta para XML

Salvar XMLs em:

```text
C:\Users\saulo\Documents\Agente - PoE\data\poe_ninja\poe_ninja_dataset\xml\{normalized_skill}\{build_id}.xml
```

Salvar metadata ao lado:

```text
C:\Users\saulo\Documents\Agente - PoE\data\poe_ninja\poe_ninja_dataset\xml\{normalized_skill}\{build_id}.meta.json
```

Mesmo sem usar poe.ninja, manter essa pasta por compatibilidade com o dataset local.

## Metadata obrigatória

Cada XML precisa de:

```json
{
  "skill": "",
  "normalized_name": "",
  "source_url": "",
  "source_type": "",
  "pob_url": "",
  "xml_path": "",
  "patch": "",
  "league": "",
  "author": "",
  "build_title": "",
  "class": "",
  "ascendancy": "",
  "collected_at": "",
  "status": "generated|needs_review|invalid|needs_source"
}
```

## Critérios de validade

Um XML só é válido se:
- parseia como XML;
- tem raiz compatível com PoB;
- contém ao menos skill principal ou árvore/itens relevantes;
- possui fonte rastreável;
- possui metadata;
- não mistura patches incompatíveis;
- não depende de dados inventados.

## Dados a extrair do XML

Extrair para JSON:
- classe;
- ascendência;
- skill principal;
- support gems;
- links;
- gem levels;
- gem quality;
- itens obrigatórios;
- flasks;
- jewels;
- cluster jewels;
- passivas;
- masteries;
- keystones;
- configurações PoB;
- DPS quando presente;
- EHP/defesas quando presente;
- notas do autor.

## Uso para combinações

Depois de coletar XMLs suficientes, o agente pode inferir padrões:
- skill + support mais frequente;
- itens obrigatórios;
- ascendência dominante;
- masteries comuns;
- clusters recorrentes;
- variações budget/endgame;
- diferenças mapping/bossing;
- padrões HC/SSF.

Não transformar frequência em regra absoluta.

## Uso para treino

Treinar modelo só depois de ter dataset validado.

Exemplo de amostra:

```json
{
  "input": {
    "skill": "Lightning Arrow",
    "budget": "mid",
    "content": "mapping",
    "patch": "3.xx"
  },
  "target": {
    "class": "Ranger",
    "ascendancy": "Deadeye",
    "gem_links": [],
    "items": [],
    "passives": [],
    "flasks": [],
    "constraints": []
  },
  "evidence": {
    "xml_count": 10,
    "sources": [],
    "confidence": 0.0
  }
}
```

## Regras para o agente

- Não usar poe.ninja para XML enquanto instável.
- Buscar PoB/XML em fontes externas públicas.
- Priorizar builds com patch e data.
- Salvar 10 XMLs por skill quando disponível.
- Nunca colar 10 builds no mesmo XML.
- Um XML por build.
- Um `.meta.json` por XML.
- Marcar ausência como `needs_source`.
- Marcar falha de parsing como `invalid`.
- Não inventar árvore, itens, gems ou configurações.
- Não declarar build atual sem patch/data/fonte.

## Consultas por skill

Usar:

```text
"{skill}" "Path of Building"
"{skill}" "PoB" "Path of Exile"
"{skill}" "pobb.in"
"{skill}" "build guide" "PoB"
"{skill}" site:pathofexile.com/forum "PoB"
"{skill}" site:mobalytics.gg "PoB"
"{skill}" site:youtube.com "PoB"
"{skill}" site:maxroll.gg "Path of Building"
"{skill}" site:poe-vault.com "Path of Building"
```

## Relação com ciclos da automação

- Ciclo 1: catálogo e dados básicos.
- Ciclo 2: supports e links.
- Ciclo 3: itens e mods.
- Ciclo 4: passivas e masteries.
- Ciclo 5: builds, PoB, XML, guias e vídeos.
- Ciclo 6+: conflitos, mercado, bugs e refinamento.

PoB/XML pertence principalmente ao ciclo 5 e ao ciclo 6+.

## Dependência de fundamentos mecânicos

Ao interpretar um XML PoB, o agente deve aplicar as regras fundamentais de:
- vida;
- mana;
- energy shield;
- ward;
- accuracy;
- evasion;
- armour;
- resistências;
- hit;
- damage over time;
- tipos de dano;
- ailments;
- critical strike;
- increased vs more;
- conversão de dano.

Referência local:

```text
docs/POE_FUNDAMENTAL_MECHANICS_BASE.md
docs/POE_ADVANCED_RULES_PRECEDENCE_BASE.md
docs/POE_SYSTEMS_INTERACTIONS_BASE.md
```

## Fontes consultadas

- Path of Building Community Fork: https://github.com/PathOfBuildingCommunity/PathOfBuilding
- Site do Path of Building Community: https://pathofbuilding.community/
- Fórum oficial sobre Community Fork: https://www.pathofexile.com/forum/view-thread/3009317
- PoE Vault sobre exportar/importar PoB e pobb.in: https://www.poe-vault.com/guides/path-of-building
- Anúncio pobb.in: https://www.reddit.com/r/pathofexile/comments/sh6n6u/announcing_pobbin_a_path_of_building_pastebin_and/
