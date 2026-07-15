# RAG Chunk Rules

Chunk types:
- definition
- mechanics
- compatibility
- formula
- build
- item
- passive
- patch_change
- guide
- FAQ
- conflict
- market_snapshot

Each chunk must include:
```json
{
  "entity_id": "",
  "entity_type": "skill",
  "chunk_type": "",
  "patch": "",
  "league": "",
  "source_type": "",
  "confidence": 0.0,
  "current": false,
  "source_url": ""
}
```

Never mix patches inside one chunk. Prefer one answerable topic per chunk.
