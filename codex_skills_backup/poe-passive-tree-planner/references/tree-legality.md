# Tree Legality

Use this for passive tree planning, repair and validation.

## Non-Negotiable Rules

- Every selected passive node must exist in the loaded tree version.
- Every selected main-tree node must be connected to the class start through selected nodes.
- Ascendancy nodes must belong to the selected ascendancy, except explicitly supported Ascendant behavior.
- Passive budget and ascendancy budget are separate.
- Shared travel nodes count once.
- Cycles are legal, but unique selected nodes determine cost.
- Mastery effects require valid allocated mastery node context.
- Jewel sockets do not count item stats unless the item layer validates the socketed jewel.

## Route Mutation

When changing a tree candidate, carry a diff:

- added nodes;
- removed nodes;
- preserved shared connector nodes;
- new cost;
- disconnected nodes, if any;
- blocker codes.

Never silently remove locked/checkpoint nodes.

## Official URL

Prefer official passive tree URL in XML/export. If URL generation fails, keep the candidate below final trust and record blocker/warning.
