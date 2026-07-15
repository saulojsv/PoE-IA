param(
  [string]$ProjectRoot = "C:\Users\saulo\Desktop\IA - Projetos\IA - PoE 1"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Push-Location $ProjectRoot
try {
  node scripts\build-item-catalog-index.js
  node scripts\audit-pob-data.js
  Push-Location "backend"
  try {
    go test ./...
  } finally {
    Pop-Location
  }
} finally {
  Pop-Location
}
