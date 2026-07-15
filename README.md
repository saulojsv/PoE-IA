# Agente PoE

## Execucao

Requisito: Python 3 instalado e disponivel como `py -3` ou `python`.

Launchers:

- `launchers/abrir_chat_poe_local.bat`: chat no terminal.
- `launchers/abrir_chat_poe_web.bat`: chat web em `http://localhost:7860`.
- `launchers/alimentar_agente_poe.bat`: atualiza a base local.
- `launchers/extrair_poe_ninja_xml_por_skill.bat`: extrai XMLs do poe.ninja.

Os launchers usam caminhos relativos ao repositorio, entao funcionam em qualquer pasta/PC.

Execucao manual, a partir da raiz do projeto:

```bat
py -3 scripts\chat_poe_local.py
py -3 scripts\poe_local_chat_web.py
py -3 scripts\feed_poe_agent.py --skip-ninja --crawl-forum --forum-pages 5 --max-threads 200 --sleep 1.5
py -3 scripts\optimize_poe_knowledge.py
py -3 scripts\build_poe_rulebooks.py
py -3 scripts\poe_ninja_api_pob_xml_by_skill.py --batch-size 1 --target-per-skill 6 --max-profile-attempts 6 --sleep 8 --ensure-folders
```

Se `py -3` nao existir, troque por `python`.

## Estrutura

- `launchers/`: atalhos para abrir chats locais.
- `scripts/`: automacao, geracao de dataset, base de conhecimento e chats.
- `data/local_poe_learning_dataset/`: XMLs normalizados e indices brutos.
- `data/xml_inbox/`: cole XMLs novos do PoB aqui antes de regerar a base.
- `data/local_poe_build_knowledge/`: base interpretada para IA.
- `data/forum_knowledge_cache/`: paginas do forum/fontes baixadas pelo alimentador.
- `data/local_poe_chat_memory/`: respostas aprovadas pelo usuario.
- `data/poe_ninja/`: extracoes automatizadas do poe.ninja.
- `archive/extraction_samples/`: testes e amostras antigas.
- `docs/`: instrucoes.
- `logs/`: logs.
