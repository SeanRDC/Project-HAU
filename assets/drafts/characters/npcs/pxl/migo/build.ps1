# Builds Migo's game sprites from pxl (migo.px.js) into src/drafts/aps-godot/sprites/npcs/migo:
# idle, talk, wave and walk sheets, and the talk-bubble portrait from the cleaned face.
# Needs pxl: the Claude Code skill (git clone https://github.com/crsolver/claude-pxl.git
# ~/.claude/skills/pxl-pixel-art) or set $env:PXL to its bin\pxl.js. Node 22.18 or newer.
#   .\assets\drafts\characters\npcs\pxl\migo\build.ps1            build migo.px.js as it is
#   .\assets\drafts\characters\npcs\pxl\migo\build.ps1 -Convert   remake migo.px.js from source\*.png first
param([switch]$Convert)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path "$here\..\..\..\..\..\.."
$pxl = if ($env:PXL) { $env:PXL } else { Join-Path $env:USERPROFILE ".claude\skills\pxl-pixel-art\bin\pxl.js" }
if (-not (Test-Path $pxl)) { throw "pxl not found at $pxl (see the top of this script)" }
$work = Join-Path $env:TEMP "pxl-migo"
New-Item -ItemType Directory -Force $work | Out-Null
Add-Type -AssemblyName System.Drawing
if ($Convert) {
  # each source sheet as JSON pixels for convert.mjs
  foreach ($k in @(@("idle", 24), @("talk", 4), @("wave", 4), @("walk", 12))) {
    $bmp = [System.Drawing.Bitmap]::FromFile("$here\source\$($k[0]).png")
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.Append("{""w"":$($bmp.Width),""h"":$($bmp.Height),""frames"":$($k[1]),""px"":[")
    for ($y = 0; $y -lt $bmp.Height; $y++) { for ($x = 0; $x -lt $bmp.Width; $x++) {
      $c = $bmp.GetPixel($x, $y)
      $v = if ($c.A -ge 128) { ([int]$c.R * 65536) + ([int]$c.G * 256) + [int]$c.B } else { -1 }
      if ($x + $y -gt 0) { [void]$sb.Append(",") }; [void]$sb.Append($v) } }
    [void]$sb.Append("]}"); $bmp.Dispose()
    [IO.File]::WriteAllText("$work\src-$($k[0]).json", $sb.ToString())
  }
  node "$here\convert.mjs" $work 20
}
node $pxl build "$here\migo.px.js" --out "$work\out" --no-preview | Select-Object -Last 1
$sprites = "$root\src\drafts\aps-godot\sprites\npcs\migo"
foreach ($k in "idle", "talk", "wave", "walk") { Copy-Item "$work\out\anims\migo_$k.png" "$sprites\$k.png" -Force }
# portrait: 32 x 32 round the face (the rig's eye-centred crop), mouth shut, open, blinking
$idle = [System.Drawing.Bitmap]::FromFile("$sprites\idle.png"); $talk = [System.Drawing.Bitmap]::FromFile("$sprites\talk.png")
$fw = 50; $px = 14; $py = 4
$portrait = New-Object System.Drawing.Bitmap 96, 32, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$faces = @(@($idle, 0), @($talk, 1), @($idle, 9))
for ($k = 0; $k -lt 3; $k++) { for ($y = 0; $y -lt 32; $y++) { for ($x = 0; $x -lt 32; $x++) {
  $sx = $faces[$k][1] * $fw + $px + $x; $sy = $py + $y
  if ($sx -lt ($faces[$k][1] + 1) * $fw -and $sy -lt $faces[$k][0].Height) {
    $c = $faces[$k][0].GetPixel($sx, $sy); if ($c.A -ge 128) { $portrait.SetPixel($k * 32 + $x, $y, $c) } } } } }
$idle.Dispose(); $talk.Dispose()
$portrait.Save("$sprites\portrait.png", [System.Drawing.Imaging.ImageFormat]::Png); $portrait.Dispose()
"migo: idle, talk, wave, walk and portrait written to $sprites"
