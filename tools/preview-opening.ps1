# Previews the whole opening without playing it: one Godot run saves every screen of the
# manga opening (each page finished, the title last) into builds\opening-preview\, puts
# them together on one sheet (opening-preview.png, numbered) and opens it.
#   tools\preview-opening.cmd            (or: powershell -File tools\preview-opening.ps1)
#   tools\preview-opening.cmd -NoOpen    just make the files
param([switch]$NoOpen)
$root = Resolve-Path "$PSScriptRoot\.."
$out = Join-Path $root "builds\opening-preview"
New-Item -ItemType Directory -Force $out | Out-Null
Get-ChildItem $out -Filter "screen-*.png" | Remove-Item -Force
& cmd /c "`"$PSScriptRoot\run-aps-godot.cmd`" -- --opening-capture=`"$out`" --opening-page=all" | Select-String "opening capture" | ForEach-Object { $_.Line }
$screens = @(Get-ChildItem $out -Filter "screen-*.png" | Sort-Object Name)
if ($screens.Count -eq 0) { throw "No screens were saved. Is Godot found? (see tools\run-aps-godot.cmd)" }

# the sheet: two screens a row, each numbered in its corner (the last is the title)
Add-Type -AssemblyName System.Drawing
$cellW = 800; $cellH = 450; $gap = 16; $cols = 2
$rows = [math]::Ceiling($screens.Count / $cols)
$sheet = New-Object System.Drawing.Bitmap ($cols * $cellW + ($cols + 1) * $gap), ($rows * $cellH + ($rows + 1) * $gap)
$draw = [System.Drawing.Graphics]::FromImage($sheet)
$draw.Clear([System.Drawing.Color]::FromArgb(58, 56, 64))
$draw.InterpolationMode = "HighQualityBicubic"
$font = New-Object System.Drawing.Font "Arial", 16, ([System.Drawing.FontStyle]::Bold)
for ($i = 0; $i -lt $screens.Count; $i++) {
  $image = [System.Drawing.Image]::FromFile($screens[$i].FullName)
  $x = $gap + ($i % $cols) * ($cellW + $gap); $y = $gap + [math]::Floor($i / $cols) * ($cellH + $gap)
  $draw.DrawImage($image, $x, $y, $cellW, $cellH)
  $image.Dispose()
  $label = if ($i -eq $screens.Count - 1) { "Title" } else { "Page $($i + 1)" }
  $draw.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 28, 27, 25))), $x, $y, 110, 32)
  $draw.DrawString($label, $font, [System.Drawing.Brushes]::White, $x + 8, $y + 5)
}
$draw.Dispose()
$sheetPath = Join-Path $out "opening-preview.png"
$sheet.Save($sheetPath, [System.Drawing.Imaging.ImageFormat]::Png)
$sheet.Dispose()
"$($screens.Count) screens -> $sheetPath"
if (-not $NoOpen) { Invoke-Item $sheetPath }
