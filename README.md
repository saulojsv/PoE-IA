# Agente PoE

## Estrutura

- `launchers/`: atalhos para abrir chats locais.
- `scripts/`: automacao, geracao de dataset, base de conhecimento e chats.
- `data/local_poe_learning_dataset/`: XMLs normalizados e indices brutos.
- `data/xml_inbox/`: cole XMLs novos aqui antes de regerar a base.
- `data/local_poe_build_knowledge/`: base interpretada para RAG/memoria.
- `data/forum_knowledge_cache/`: paginas do forum/fontes baixadas pelo alimentador.
- `data/local_poe_chat_memory/`: respostas aprovadas pelo usuario.
- `data/poe_ninja/`: extracoes automatizadas do poe.ninja.
- `archive/extraction_samples/`: testes e amostras antigas.
- `docs/`: instrucoes.
- `logs/`: logs.

## Abrir chat web

```bat
launchers\abrir_chat_poe_web.bat
```

## Regerar base local

```bat
C:\Users\saulo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\build_local_poe_learning_dataset.py
C:\Users\saulo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\generate_poe_build_knowledge_base.py
```

## Alimentar com forum/fundamentos

```bat
launchers\alimentar_agente_poe.bat
```
