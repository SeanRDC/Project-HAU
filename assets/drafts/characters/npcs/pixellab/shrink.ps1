# Shrinks a 512 px PixelLab edit to the boy's pixel density, the way the boy was
# made: the centre of each block. $SourceHeight is how tall the character was in
# the style sheet (the boy's 655 px became 85), scaled to the 500 px it filled at 512.
param([string]$In, [string]$Out, [double]$SourceHeight)
Add-Type -AssemblyName System.Drawing
$factor = (655.0 / 85.0) * 500.0 / $SourceHeight
$im = [System.Drawing.Bitmap]::FromFile($In)
$minx = 9999; $miny = 9999; $maxx = 0; $maxy = 0
for ($y = 0; $y -lt $im.Height; $y++) { for ($x = 0; $x -lt $im.Width; $x++) {
  if ($im.GetPixel($x, $y).A -gt 200) { if ($x -lt $minx) { $minx = $x }; if ($x -gt $maxx) { $maxx = $x }; if ($y -lt $miny) { $miny = $y }; if ($y -gt $maxy) { $maxy = $y } } } }
$sw = $maxx - $minx + 1; $sh = $maxy - $miny + 1
$ow = [int][math]::Round($sw / $factor); $oh = [int][math]::Round($sh / $factor)
$bmp = New-Object System.Drawing.Bitmap $ow, $oh
for ($y = 0; $y -lt $oh; $y++) { for ($x = 0; $x -lt $ow; $x++) {
  $c = $im.GetPixel($minx + [int](($x + 0.5) * $sw / $ow), $miny + [int](($y + 0.5) * $sh / $oh))
  if ($c.A -ge 128) { $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B)) } } }
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose(); $im.Dispose()
"$Out : $ow x $oh"
