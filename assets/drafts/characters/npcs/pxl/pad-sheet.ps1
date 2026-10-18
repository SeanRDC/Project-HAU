# Copies a pxl sheet into the game with every frame widened to a multiple of 8 pixels and the
# figure centred, feet on the bottom row. The game shrinks textures for distance (mipmaps);
# with odd or tight frames (33 px, figure touching the edges) each half-size frame takes in
# the edge of the next one, which shows as faint copies of hair or a backpack at her sides.
#   .\pad-sheet.ps1 <in.png> <frames> <out.png> [width]
param([string]$In, [int]$Frames, [string]$Out, [int]$Width = 0)
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile($In)
$fw = [int]($src.Width / $Frames); $h = $src.Height
if ($Width -le 0) { $Width = [int]([math]::Ceiling(($fw + 4) / 8.0) * 8) } # at least 2 px of room each side
$dst = New-Object System.Drawing.Bitmap ($Width * $Frames), $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$left = [int][math]::Floor(($Width - $fw) / 2)
for ($k = 0; $k -lt $Frames; $k++) {
  for ($y = 0; $y -lt $h; $y++) { for ($x = 0; $x -lt $fw; $x++) {
    $c = $src.GetPixel($k * $fw + $x, $y)
    if ($c.A -gt 0) { $dst.SetPixel($k * $Width + $left + $x, $y, $c) } } }
}
$src.Dispose(); $dst.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png); $dst.Dispose()
"$Out : $Frames frames of $fw -> $Width px"
