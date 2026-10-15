# Hand touch-ups on Bea and Bianca after the plaid pass (pixel coordinates in
# their 84 px tall sprites). Run from anywhere: .\touchup.ps1
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Add-Type -AssemblyName System.Drawing
function Paint($in, $out, $edits) {
  $im = [System.Drawing.Bitmap]::FromFile($in); $o = New-Object System.Drawing.Bitmap $im; $im.Dispose()
  foreach ($e in $edits) {
    $c = if ($e[2] -eq '') { [System.Drawing.Color]::Transparent } else { [System.Drawing.ColorTranslator]::FromHtml('#' + $e[2]) }
    $o.SetPixel($e[0], $e[1], $c)
  }
  $o.Save($out, [System.Drawing.Imaging.ImageFormat]::Png); $o.Dispose()
}

# Bea, near hand: clear the skirt showing left of the hand, round the hand with a darker skin edge
Paint "$here\bea-plaid.png" "$here\bea-final.png" @(
  @(1,49,''), @(2,49,''), @(1,50,''), @(2,50,''),
  @(0,51,''), @(1,51,''), @(2,51,'bc644d'),
  @(0,52,''), @(0,53,''), @(0,54,''),
  @(1,52,'8a4441'), @(1,53,'8a4441'), @(1,54,'8a4441'),
  @(1,55,''), @(2,55,'8a4441'), @(3,55,'8a4441')
)

# Bianca, near hand: the same
Paint "$here\bianca-plaid.png" "$here\bianca-final.png" @(
  @(1,48,''), @(2,48,''), @(1,49,''), @(2,49,''), @(1,50,''), @(2,50,''),
  @(0,51,''), @(0,52,''), @(0,53,''), @(0,54,''),
  @(1,52,'97503d'), @(1,53,'97503d'), @(1,54,'97503d'),
  @(1,55,''), @(2,55,'97503d'), @(3,55,'97503d'),
  # left eye: iris on the left and white on the right, like her right eye
  @(3,17,'0d0a15'), @(4,17,'1b1419'), @(5,17,'ac9d9e'),
  @(3,18,'0e0e17'), @(4,18,'1c141a'), @(5,18,'eee1df'),
  @(3,19,'0d0b15'), @(4,19,'191117'), @(5,19,'ecdfda'),
  @(3,20,'0f0c15'), @(4,20,'23181f'), @(5,20,'ede2dd'),
  # far hand: stray skin under the backpack becomes the skirt's edge
  @(24,55,'4f5267'), @(24,56,'4f5267'), @(25,57,'343648'), @(25,58,'343648')
)
"done"
