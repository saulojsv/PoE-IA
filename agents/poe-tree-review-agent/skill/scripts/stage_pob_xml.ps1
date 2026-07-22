param(
  [Parameter(Mandatory=$true)][string]$SourceXml,
  [string]$DestinationRoot = 'C:\Users\saulo\Documents\Path of Building\Builds',
  [string]$RunId = (Get-Date -Format 'yyyyMMdd-HHmmss')
)
$ErrorActionPreference = 'Stop'
if(-not (Test-Path -LiteralPath $SourceXml)){ throw "SOURCE_NOT_FOUND:$SourceXml" }
[xml]$doc = Get-Content -LiteralPath $SourceXml -Raw
if($null -eq $doc.SelectSingleNode('/PathOfBuilding')){ throw 'NOT_POB_XML' }
New-Item -ItemType Directory -Force -Path $DestinationRoot | Out-Null
$safe = [IO.Path]::GetFileNameWithoutExtension($SourceXml) -replace '[^A-Za-z0-9._-]','_'
$dest = Join-Path $DestinationRoot ("Review-$RunId-$safe.xml")
Copy-Item -LiteralPath $SourceXml -Destination $dest -Force
[pscustomobject]@{source=$SourceXml;staged=$dest;status='STAGED_FOR_POB_LIST'} | ConvertTo-Json -Compress
