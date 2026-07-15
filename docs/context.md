# Contexto do Projeto PoE IA

Este arquivo e o ponto de entrada para qualquer IA ou desenvolvedor continuar o projeto.

## Objetivo

Construir uma dashboard local e interativa para analisar builds de Path of Exile a partir de XMLs do Path of Building, organizar itens por slot, exibir sprites corretas, comparar metricas de builds e preparar a base para um gerador inteligente de combinacoes.

## Repositorio

- GitHub: `https://github.com/saulojsv/PoE-IA`
- Branch usada: `main`
- Pasta local principal: `C:\Users\joao.carvalho\Desktop\Robo\Agente - PoE_GDRIVE_STAGE`
- Dashboard principal: `dashboard/index.html`
- Dados da dashboard: `dashboard/build_dashboard_data.json`
- Indice de sprites: `dashboard/item_sprite_index.json`
- Sprites: `assets/poe_item_sprites`

## Regras importantes

- Nao usar fallback visual para sprites. Se nao existe sprite correta, o estado deve ser tratado como `missing`, nao como icone generico.
- Itens devem ser classificados por base/tipo, nao apenas por nome raro.
- Joias nao podem entrar como ring. Elas devem aparecer em area propria de jewel.
- Flasks nao podem aparecer em slots de arma, armadura, capacete, etc.
- Arma two-handed bloqueia offhand.
- O dashboard deve funcionar em qualquer PC depois de `git pull`, sem caminho absoluto do PC original.
- Alteracoes devem ser enviadas com `git pull --rebase origin main` e `git push origin main`.
- Google Drive e usado como backup/estagio, mas GitHub e a fonte principal do codigo.

## Estado atual

- Dataset da dashboard contem 683 builds XML em `dashboard/build_dashboard_data.json`.
- O indice de sprites contem 1189 entradas em `dashboard/item_sprite_index.json`.
- A validacao final de sprites para o dataset atual retornou `missing 0`.
- Ultimo backup zip enviado ao Google Drive: `PoE-IA_0e6e64b_full.zip`.

## Como abrir

Use os launchers locais:

- `Abrir_Dashboard.html`
- `Abrir_Dashboard.bat`

Os arquivos foram ajustados para funcionar por caminho relativo quando a pasta existe no PC.

## Arquivos de documentacao desta fase

- `docs/dashboard_implementation/01_dashboard.md`
- `docs/dashboard_implementation/02_data_pipeline.md`
- `docs/dashboard_implementation/03_item_slots_and_smart_generator.md`
- `docs/dashboard_implementation/04_sprites.md`
- `docs/dashboard_implementation/05_modifiers_and_catalogs.md`
- `docs/dashboard_implementation/06_sync_github_drive.md`
- `docs/dashboard_implementation/07_next_steps.md`
- `docs/dashboard_implementation/08_implementation_changelog.md`
