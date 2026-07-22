# Run 2026-07-22 — bloqueio de clique da build

- Objetivo: garantir uma build aberta por automação, não apenas a lista do PoB.
- Testado: janela inicial do PoB e tentativa de selecionar/Abrir a primeira linha.
- Resultado: a lista foi observada, mas a carga da build não foi confirmada por identidade e métricas; estado válido: `POB_LOAD_FAILED`/reteste pendente.
- Falha aprendida: fechar após visualizar a lista permite zero inspeções reais.
- Correção: uma linha obrigatória por run, sequência observação → clique → observação, `Open` confirmado antes de `Show Node Power`, e fechamento apenas após resultado ou erro documentado.
- Versionamento: `RUNBOOK.md` e `skill/SKILL.md` foram atualizados e commitados localmente.
- Git: `git pull --rebase` falhou porque `main` não tem tracking remoto configurado; push ainda não foi declarado nem executado. Registrar `GIT_PULL_FAILED`/`GIT_PUSH_FAILED` até existir `origin`.
- Próximo teste: selecionar a primeira linha, confirmar build/classe/nível/métricas, clicar `Show Node Power` e registrar a árvore.
