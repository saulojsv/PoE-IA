param(
  [Parameter(Mandatory=$true)][string]$InputRoot,
  [Parameter(Mandatory=$true)][string]$OutputRoot,
  [string]$RunId = (Get-Date -Format 'yyyyMMdd-HHmmss')
)

$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $OutputRoot | Out-Null
$files = @(Get-ChildItem -LiteralPath $InputRoot -Recurse -File -Filter '*.xml')
$rows = [System.Collections.Generic.List[object]]::new()
$nodeCounts = @{}
$errors = [System.Collections.Generic.List[object]]::new()

foreach ($file in $files) {
  try {
    [xml]$doc = Get-Content -LiteralPath $file.FullName -Raw
    $root = $doc.SelectSingleNode('/PathOfBuilding')
    if ($null -eq $root) { throw 'NON_POB_XML' }
    $build = $doc.SelectSingleNode('//Build')
    $spec = $doc.SelectSingleNode('//Spec')
    if ($null -eq $build -or $null -eq $spec) { throw 'BUILD_OR_SPEC_MISSING' }
    $nodes = @($spec.GetAttribute('nodes').Split(',') | Where-Object { $_ -match '^\d+$' })
    foreach ($node in $nodes) { if($nodeCounts.ContainsKey($node)){ $nodeCounts[$node]++ } else { $nodeCounts[$node]=1 } }
    $stats = @{}
    foreach ($stat in @($doc.SelectNodes('//PlayerStat'))) { $stats[$stat.GetAttribute('stat')] = $stat.GetAttribute('value') }
    $rows.Add([pscustomobject]@{
      file=$file.FullName.Substring($InputRoot.Length).TrimStart('\')
      class=$build.GetAttribute('className'); ascendancy=$build.GetAttribute('ascendClassName')
      level=$build.GetAttribute('level'); target_version=$build.GetAttribute('targetVersion')
      tree_version=$spec.GetAttribute('treeVersion'); node_count=$nodes.Count
      total_dps=$stats['TotalDPS']; combined_dps=$stats['CombinedDPS']; life=$stats['Life']; energy_shield=$stats['EnergyShield']
      armour=$stats['Armour']; evasion=$stats['Evasion']; spell_suppression=$stats['SpellSuppressionChance']; resistances=$stats['FireResist']
      mana_cost=$stats['ManaCost']; warnings=@($doc.SelectNodes('//Warnings/Warning')).Count
    })
  } catch {
    if ($_.Exception.Message -ne 'NON_POB_XML') { $errors.Add([pscustomobject]@{file=$file.FullName; error=$_.Exception.Message}) }
  }
}

$nodeTop = @($nodeCounts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 100 | ForEach-Object { [pscustomobject]@{node_id=$_.Key; frequency=$_.Value} })
$nonPob = $files.Count - $rows.Count - $errors.Count
$json = [pscustomobject]@{run_id=$RunId; input_root=$InputRoot; scanned=$files.Count; parsed=$rows.Count; ignored_non_pob=$nonPob; failed=$errors.Count; builds=$rows; top_nodes=$nodeTop; errors=$errors}
$json | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $OutputRoot "run-$RunId.json") -Encoding UTF8

$classes = $rows | Group-Object class | Sort-Object Count -Descending | ForEach-Object { "- $($_.Name): $($_.Count)" }
$asc = $rows | Group-Object ascendancy | Sort-Object Count -Descending | Select-Object -First 20 | ForEach-Object { "- $($_.Name): $($_.Count)" }
$top = $nodeTop | Select-Object -First 20 | ForEach-Object { "- node $($_.node_id): $($_.frequency) builds" }
$lowLife = @($rows | Where-Object { $_.life -as [double] -and [double]$_.life -lt 3000 } | Measure-Object).Count
$md = @("# PoE Tree Review run $RunId", "", "- XML scanned: $($files.Count)", "- PoB XML parsed: $($rows.Count)", "- Non-PoB XML ignored: $nonPob", "- Parser failures: $($errors.Count)", "- Low-life outliers (<3000): $lowLife", "", "## Classes", "") + $classes + @("", "## Ascendancies (top 20)", "") + $asc + @("", "## Most frequent allocated node IDs (top 20)", "") + $top + @("", "## Learning status", "", "- This run is evidence collection, not automatic truth promotion.", "- Tree/defense rules require patch/version scope and controlled PoB retests.", "- Interactive GUI recalculation remains pending unless separately observed.")
$md | Set-Content -LiteralPath (Join-Path $OutputRoot "run-$RunId.md") -Encoding UTF8
Write-Output "run=$RunId scanned=$($files.Count) parsed=$($rows.Count) failed=$($errors.Count)"
