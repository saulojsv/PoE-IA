param(
  [string]$Source = 'C:\Users\saulo\Documents\Path of Building\Builds',
  [string]$Output = 'C:\Users\saulo\Documents\PoE-IA\build-optimizer\data'
)

New-Item -ItemType Directory -Path $Output -Force | Out-Null
$rows = foreach ($file in Get-ChildItem -LiteralPath $Source -Filter '*.xml' -File -Recurse) {
  $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  $status = 'valid'
  $errorText = $null
  try { [xml](Get-Content -LiteralPath $file.FullName -Raw) | Out-Null } catch { $status = 'invalid'; $errorText = $_.Exception.Message }
  [pscustomobject]@{
    path = $file.FullName.Substring($Source.Length).TrimStart('\')
    bytes = $file.Length
    sha256 = $hash
    status = $status
    error = $errorText
  }
}
$rows | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $Output 'raw-manifest.json') -Encoding UTF8
$rows | Group-Object sha256 | Where-Object Count -gt 1 | ForEach-Object { [pscustomobject]@{ sha256=$_.Name; paths=$_.Group.path } } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $Output 'duplicates.json') -Encoding UTF8
Write-Output ("files={0}; valid={1}; invalid={2}" -f $rows.Count,($rows | Where-Object status -eq 'valid').Count,($rows | Where-Object status -eq 'invalid').Count)
