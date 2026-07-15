# Source Query Rules

Generate queries for each canonical name, alias, Vaal variant, transfigured variant, current patch, previous patch, common ascendancy, and key item.

Base query set:
```text
"{skill}" Path of Exile official
"{skill}" PoE Wiki
"{skill}" patch notes
"{skill}" mechanics
"{skill}" support gems
"{skill}" best links
"{skill}" build guide
"{skill}" league starter
"{skill}" endgame build
"{skill}" Path of Building
"{skill}" poe.ninja
"{skill}" interaction
"{skill}" breakpoint
"{skill}" bug
"{skill}" forum
"{skill}" "{patch}"
site:pathofexile.com "{skill}"
site:poewiki.net "{skill}"
site:youtube.com "{skill}" "{patch}"
site:reddit.com/r/pathofexile "{skill}"
```

Source ranking:
official > patch notes > game data > technical repos > PoB Community Fork > updated wiki > official forums > poe.ninja > recognized guide > Reddit/community > unverified.

Required metadata for every claim: URL, type, source date if available, collected_at, patch, league, classification, confidence.
