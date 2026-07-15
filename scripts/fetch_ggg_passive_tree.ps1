param(
  [string]$Url = 'https://www.pathofexile.com/passive-skill-tree',
  [string]$Output = 'poe-knowledge-system/data/normalized/ggg-passive-tree.json',
  [string]$RawOutput = 'poe-knowledge-system/data/raw/ggg-passive-tree.html'
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$rawPath = Join-Path $root $RawOutput
$outPath = Join-Path $root $Output
New-Item -ItemType Directory -Force (Split-Path $rawPath) | Out-Null
New-Item -ItemType Directory -Force (Split-Path $outPath) | Out-Null
$html = (Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 60).Content
[IO.File]::WriteAllText($rawPath, $html, [Text.Encoding]::UTF8)
$startToken = 'var passiveSkillTreeData = '
$start = $html.IndexOf($startToken)
$end = $html.IndexOf("`n            var opts", $start)
if ($start -lt 0 -or $end -lt 0) { throw 'GGG passiveSkillTreeData marker not found' }
$json = $html.Substring($start + $startToken.Length, $end - ($start + $startToken.Length)).Trim().TrimEnd(';')
$tree = $json | ConvertFrom-Json
$versionMatch = [regex]::Match($html.Substring($end), "version:\s*'([^']+)'")
$treeVersion = if ($versionMatch.Success) { $versionMatch.Groups[1].Value } else { 'unknown' }
$normalized = [ordered]@{
  treeVersion = $treeVersion
  tree = $tree.tree
  fetchedAt = (Get-Date).ToUniversalTime().ToString('o')
  source = $Url
  classes = $tree.classes
  alternate_ascendancies = $tree.alternate_ascendancies
  groups = $tree.groups
  nodes = $tree.nodes
  jewelSlots = $tree.jewelSlots
  bounds = [ordered]@{ min_x=$tree.min_x; min_y=$tree.min_y; max_x=$tree.max_x; max_y=$tree.max_y }
  constants = $tree.constants
  sprites = $tree.sprites
  imageZoomLevels = $tree.imageZoomLevels
  points = $tree.points
}
$normalized | ConvertTo-Json -Depth 100 -Compress | Set-Content -LiteralPath $outPath -Encoding UTF8
Write-Output "treeVersion=$($tree.version) nodes=$($tree.nodes.PSObject.Properties.Count) groups=$($tree.groups.PSObject.Properties.Count) output=$outPath"
