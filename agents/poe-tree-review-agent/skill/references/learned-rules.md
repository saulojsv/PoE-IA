# Learned rules

These rules are provisional and must be revalidated when the PoE patch, tree version, PoB version, or archive composition changes.

## Run 20260721-234343

- Archive hygiene: classify only files with `/PathOfBuilding` root as PoB builds; ignore auxiliary XMLs without treating them as parser failures. Evidence: 1,194 XMLs scanned, 934 PoB XMLs parsed, 260 ignored, 0 parser failures.
- Version isolation: do not compare node frequency across tree versions without partitioning first. The sample contains 639 `3_28`, 194 `3_28_alternate`, and older versions.
- Frequency is discovery evidence, not causation: a frequent node is a candidate for inspection, never proof that allocating it improves a build.
- Safety gate: low life, resource failure, disconnected paths, invalid masteries, and hidden configuration assumptions must be checked before accepting a high-DPS candidate.
- Recalculation boundary: XML-extracted metrics describe the saved PoB state; they do not prove that a newly allocated node would produce the expected delta until PoB recalculates it.

Confidence: medium for the data-hygiene/version rules; low for any gameplay conclusion until node IDs are resolved to names and controlled PoB experiments are run.
