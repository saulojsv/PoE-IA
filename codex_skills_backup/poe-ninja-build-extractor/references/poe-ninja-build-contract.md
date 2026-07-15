# poe.ninja Build Contract

Observed public page flow for PoE 1 character builds:

Index URL:

```text
https://poe.ninja/poe1/builds
```

Index API:

```text
GET /poe1/api/data/build-index-state
```

Index response:

```text
leagueBuilds[] = {
  leagueName,
  leagueUrl,
  total,
  status,
  category,
  hardcore,
  statistics[]: { class, skill, percentage, trend }
}
```

Search URL:

```text
https://poe.ninja/poe1/builds/{leagueUrl}?class={class}&skills={skill}
```

Search page contains:

```text
component-export="Poe1SearchPageWrapper"
props={ league, timeMachine, type }
```

Search API used by the client:

```text
GET /poe1/api/builds/{version}/search
```

Useful query:

```text
overview={snapshotName}
type=exp
class={ascendancy}
skills={skill}
```

The response is protobuf binary. Fast extraction can scan printable value-list strings:

```text
name, <character names...>, account, <account names...>
```

Pair `account[i]` with `name[i]`. Some rows can be stale; validate by calling the character API and skip 404.

Character URL:

```text
https://poe.ninja/poe1/builds/{league}/character/{account}/{name}?i=0
```

Page contains an Astro island:

```text
component-export="CharPageWrapper"
props={ league, account, name, type }
```

The component calls:

```text
GET /poe1/api/builds/{version}/character
```

Query:

```text
account={account}
name={name}
overview={snapshotName}
type={overviewType}
timeMachine=
```

Fast path:

When `version`, `snapshotName`, `league`, `account`, and `name` are known from search, skip the character HTML page and call the character API directly. Reconstruct the public URL as:

```text
https://poe.ninja/poe1/builds/{league}/character/{account}/{name}?i={index}
```

For a pasted character URL, parse directly:

```text
league = path segment after /builds/
account = path segment after /character/
name = path segment after account
```

Then fetch the league page once for `version/snapshotName` and call the direct character API.

Important fields in response:

- `pathOfBuildingExport`: PoB code, base64url + zlib.
- `defensiveStats`: direct defensive metrics.
- `skills`: gems, supports, slot grouping, DPS blocks.
- `items`, `jewels`, `flasks`: item payloads and mods.
- `passiveSelection`: allocated passive node IDs.
- `masteries`, `keyStones`, `clusterJewels`, `tattoos`, `runegrafts`.
- `baseClass`, `class`, `ascendancyClassName`, `secondaryAscendancyClassName`, `level`.

PoB decode:

```text
base64url decode -> zlib decompress -> XML
```

Type mapping:

```text
exp=0
depthsolo=1
streamers=2
atlastree=3
racing=4
```

Version selection:

Use embedded `snapshotVersions` where `url == league` and `type == overview type`. If multiple versions match, prefer the first page match unless the URL/time-machine context selects another.
