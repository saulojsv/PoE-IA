# Local PoE Learning Dataset

Dataset offline criado a partir dos XMLs PoB extraidos.

Arquivos:

- `xml/*.xml`: builds PoB completas.
- `builds.jsonl`: uma linha por build, com build attrs, stats, skills, items e passive nodes.
- `skill_to_builds.json`: skill principal -> builds.
- `class_to_builds.json`: classe base -> builds.
- `ascendancy_to_builds.json`: ascendencia -> builds.
- `item_to_builds.json`: item -> builds.
- `passive_to_builds.json`: passive node id -> builds.
- `support_to_main_skills.json`: support gem -> main skills.

Uso local: aponte o agente para esta pasta antes de responder sobre formacao, combinacao ou comparacao de builds.
