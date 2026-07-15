# Intensive Skill Workflow

Use this for every scheduled PoE 1 skill run.

Order:
1. Read patch state and A-Z cursor.
2. Select exactly one skill.
3. Identify category tags: active, support, Vaal, transfigured, minion, trigger, reservation, guard, movement, warcry, brand, trap, mine, totem, curse, mark, aura, herald, stance, retaliation, channeling.
4. Load only category skills needed for that skill.
5. Collect official/game-data facts first.
6. Add community/build/market observations only after official facts are separated.
7. Normalize into the skill JSON schema.
8. Validate claims, conflicts, support relationships, item dependencies, passive dependencies, and build patch compatibility.
9. Export Markdown, JSONL/CSV deltas, and RAG chunks.
10. Update cursor.

Completeness checklist per skill:
- identity and variants
- tags and requirements
- level scaling and quality
- costs, reservation, cooldown, souls if applicable
- mechanics and confirmed formulas
- limits and breakpoints
- support compatibility
- 2L-6L links and use cases
- item/mod/jewel/flask synergies
- class, ascendancy, passive, mastery, cluster links
- builds by budget/content/HC/SSF/Ruthless
- guides, videos, PoB links
- market/meta snapshots
- patch changes, bugs, conflicts
- sources, dates, confidence, status

Stop condition: if a core source fails, keep prior data, mark stale/needs_review, log error, and do not fabricate missing fields.
