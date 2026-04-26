param(
  [Parameter(Mandatory = $true)]
  [string]$PptxPath,

  [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"

$pptx = (Resolve-Path -LiteralPath $PptxPath).Path
if (-not $OutDir) {
  $OutDir = Join-Path (Split-Path -Parent $pptx) "headless_render"
}
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

$sofficeCandidates = @(
  "C:/Program Files/LibreOffice/program/soffice.exe",
  "C:/Program Files (x86)/LibreOffice/program/soffice.exe"
)
$soffice = $sofficeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $soffice) {
  $cmd = Get-Command soffice -ErrorAction SilentlyContinue
  if ($cmd) { $soffice = $cmd.Source }
}
if (-not $soffice) {
  throw "LibreOffice soffice.exe not found."
}

$pdftoppmCandidates = @(
  "$env:LOCALAPPDATA/Microsoft/WinGet/Packages/oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe/poppler-25.07.0/Library/bin/pdftoppm.exe"
)
$pdftoppm = $pdftoppmCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $pdftoppm) {
  $cmd = Get-Command pdftoppm -ErrorAction SilentlyContinue
  if ($cmd) { $pdftoppm = $cmd.Source }
}
if (-not $pdftoppm) {
  throw "Poppler pdftoppm.exe not found."
}

$base = [IO.Path]::GetFileNameWithoutExtension([string]$pptx)
$pdf = Join-Path $OutDir "$base.pdf"
if (Test-Path -LiteralPath $pdf) {
  Remove-Item -LiteralPath $pdf -Force
}
Get-ChildItem -LiteralPath $OutDir -Filter "$base-*.png" -ErrorAction SilentlyContinue |
  Remove-Item -Force

& $soffice --headless --nologo --nofirststartwizard --convert-to pdf --outdir $OutDir $pptx
for ($i = 0; $i -lt 30 -and -not (Test-Path -LiteralPath $pdf); $i++) {
  Start-Sleep -Milliseconds 500
}
if (-not (Test-Path -LiteralPath $pdf)) {
  throw "PDF render output not found: $pdf"
}

$prefix = Join-Path $OutDir $base
& $pdftoppm -png -r 160 $pdf $prefix

$pngs = Get-ChildItem -LiteralPath $OutDir -Filter "$base-*.png" | Sort-Object Name
[pscustomobject]@{
  Pptx = $pptx
  Pdf = $pdf
  PngCount = $pngs.Count
  OutDir = (Resolve-Path -LiteralPath $OutDir).Path
}
