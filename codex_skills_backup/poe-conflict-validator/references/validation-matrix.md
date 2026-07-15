# Validation Matrix

Before saving `current`:
- patch present
- source URL present
- source date or collected_at present
- source classification present
- confidence > 0
- no incompatible patch mixing

Support relationship validation:
- effect confirmed by source or tested data
- conditions recorded
- incompatible/ineffective cases preserved
- deprecated interactions marked historical

Build validation:
- build patch compatible with skill patch
- main skill exists and is current/likely_current
- mandatory uniques sourced
- PoB link valid or marked unverified
- budget tier has evidence
- HC/SSF/Ruthless claims have constraints

Conflict handling:
1. Preserve all claims.
2. Compare source rank.
3. Compare patch.
4. Compare source date.
5. Prefer official/current over old/community.
6. If unresolved, keep `resolution: null`.
