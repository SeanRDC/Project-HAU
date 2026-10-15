# Migo from the second boy in the style sheet: no tie and black pants, like the
# playable boy. Input is the sheet's boy with the sunset rim already removed.
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Add-Type -AssemblyName System.Drawing
$im = [System.Drawing.Bitmap]::FromFile("$here\migo-clean.png"); $o = New-Object System.Drawing.Bitmap $im; $im.Dispose()
function Lum($c) { 0.3 * $c.R + 0.59 * $c.G + 0.11 * $c.B }
# the tie: red down the shirt front becomes the shirt beside it
for ($y = 30; $y -le 50; $y++) { for ($x = 14; $x -le 21; $x++) {
  $c = $o.GetPixel($x, $y); if ($c.A -lt 128) { continue }
  if ($c.R -gt 1.8 * $c.G -and $c.R -gt 90) {
    $shirt = $null
    foreach ($d in 1..5) { foreach ($xx in @(($x - $d), ($x + $d))) {
      if (-not $shirt -and $xx -ge 0 -and $xx -lt $o.Width) { $s = $o.GetPixel($xx, $y); if ($s.A -ge 128 -and $s.R -gt 180 -and $s.G -gt 150 -and -not ($s.R -gt 1.8 * $s.G)) { $shirt = $s } } } }
    if ($shirt) { $o.SetPixel($x, $y, $shirt) } } } }
# pants: navy (and the leftover orange edge) to black, keeping three tones
for ($y = 51; $y -le 80; $y++) { for ($x = 6; $x -le 25; $x++) {
  $c = $o.GetPixel($x, $y); if ($c.A -lt 128) { continue }
  $navy = $c.B -gt $c.R + 8
  if ($y -le 58 -and -not $navy) { continue } # the hands
  if ($y -ge 59 -and -not $navy -and $c.R -lt 150) { continue } # shoes start lower; keep other dark bits
  $l = Lum $c
  if ($c.R -ge 150) { $o.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 42, 42, 48)) }
  elseif ($l -lt 30) { $o.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 17, 17, 20)) }
  elseif ($l -lt 48) { $o.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 28, 28, 32)) }
  else { $o.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 42, 42, 48)) } } }
$o.Save("$here\migo-final.png", [System.Drawing.Imaging.ImageFormat]::Png); $o.Dispose()
"done"
