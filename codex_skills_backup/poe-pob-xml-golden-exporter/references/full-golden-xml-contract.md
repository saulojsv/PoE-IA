# Full Golden XML Contract

Use this when generating, validating or repairing complete Path of Building XML, not tree-only drafts.

## Project Contract

Primary project files:

- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\33-full-pob-xml-golden-dataset-contract.md`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\pob_full_xml_golden_contract.json`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\pob_full_xml_golden_summary.json`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\pob_full_xml_golden_filled_template.xml`
- `C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1\docs\pob_full_xml_golden_clean_template.xml`

Refresh the contract with:

```powershell
python scripts\build-pob-full-xml-golden-contract.py
```

## Golden Section Order

The user-provided `Penance Brand of Dissipation.xml` reference has this direct child section order:

```text
Build
Skills
Items
Calcs
Config
TreeView
Import
Party
Tree
Notes
```

Do not use string search for `<Tree`; `TreeView` appears before the real `Tree` section.

## Complete Build Rule

A build is complete only when tree + items + gems + Config are joined and validated together.

Tree-only XML may be useful for route training, but it cannot claim full DPS/EHP. Label it as tree-only and keep item/gem/config metrics pending.

Keep two template roles:

- filled golden template: known-working Penance Brand example, used as reference shape;
- clean golden template: conservative full XML fill target for generated builds.

## Active Pointer Checks

Resolve these before trusting XML:

- `Build@mainSocketGroup`
- `Skills@activeSkillSet`
- `Items@activeItemSet`
- `Config@activeConfigSet`
- `Tree@activeSpec`
- `Calcs/Input@name=skill_number`

Dangling pointers are export blockers.

## Config Source Rule

Enable Config effects only when sourced by:

- passive tree;
- ascendancy;
- items or jewels;
- flasks;
- active/support gems;
- explicit user request.

Unsupported charges, ailments, exposure, curses, flask uptime, brand counts and enemy overrides become blockers or negative labels.
