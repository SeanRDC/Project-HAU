# Hand touch-ups on the girlfriend (pixel coordinates in her 35 x 84 sprite, facing right).
# Run from anywhere: .\gf-touchup.ps1   (reads gf-plaid.png if given, else gf-final.png)
param([string]$In = "")
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $In) { $In = "$here\gf-final.png" }
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile($In); $o = New-Object System.Drawing.Bitmap $src; $src.Dispose()
function Lum($c) { 0.3 * $c.R + 0.59 * $c.G + 0.11 * $c.B }
# No ribbon and no buttons: the dark red bow under her collar and the buttons below it
# become the blouse round them (the commonest light blouse colour within two pixels).
# The skin at her neck stays.
$ribbon = @(@(21,31), @(21,32), @(22,32), @(23,33), @(24,33), @(25,33), @(23,34), @(24,34), @(25,34), @(24,35), @(25,35), @(26,35), @(26,36))
# and no buttons down the front of her blouse
$ribbon += @(@(24,39), @(25,39), @(24,40), @(25,40), @(24,44), @(25,44))
$isRibbon = @{}; foreach ($p in $ribbon) { $isRibbon["$($p[0]),$($p[1])"] = $true }
$fills = @()
foreach ($p in $ribbon) {
  $count = @{}
  for ($dy = -2; $dy -le 2; $dy++) { for ($dx = -2; $dx -le 2; $dx++) {
    $x = $p[0] + $dx; $y = $p[1] + $dy
    if ($isRibbon["$x,$y"]) { continue }
    $c = $o.GetPixel($x, $y)
    if ($c.A -ge 128 -and (Lum $c) -gt 140) { $k = $c.ToArgb(); $count[$k] = 1 + $count[$k] } } }
  if ($count.Count) { $fills += ,@($p[0], $p[1], ($count.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1).Key) }
}
foreach ($f in $fills) { $o.SetPixel($f[0], $f[1], [System.Drawing.Color]::FromArgb($f[2])) }
$o.Save("$here\gf-final.png", [System.Drawing.Imaging.ImageFormat]::Png); $o.Dispose()
"ribbon and buttons: $($fills.Count) of $($ribbon.Count) pixels repainted"
