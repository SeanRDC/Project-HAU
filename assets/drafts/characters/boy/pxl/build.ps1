# Builds the player boy's game sprites from pxl (boy.px.js) into src/drafts/aps-godot/sprites/boy:
# the idle and walk sheets.
# Needs pxl: the Claude Code skill (git clone https://github.com/crsolver/claude-pxl.git
# ~/.claude/skills/pxl-pixel-art) or set $env:PXL to its bin\pxl.js. Node 22.18 or newer.
#   .\assets\drafts\characters\boy\pxl\build.ps1            build boy.px.js as it is
#   .\assets\drafts\characters\boy\pxl\build.ps1 -Convert   remake boy.px.js from source\*.png first
param([switch]$Convert)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path "$here\..\..\..\..\.."
$pxl = if ($env:PXL) { $env:PXL } else { Join-Path $env:USERPROFILE ".claude\skills\pxl-pixel-art\bin\pxl.js" }
if (-not (Test-Path $pxl)) { throw "pxl not found at $pxl (see the top of this script)" }
$work = Join-Path $env:TEMP "pxl-boy"
New-Item -ItemType Directory -Force $work | Out-Null
Add-Type -AssemblyName System.Drawing
if ($Convert) {
  # each source sheet as JSON pixels for convert.mjs
  foreach ($k in @(@("idle", 24), @("walk", 12))) {
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
node $pxl build "$here\boy.px.js" --out "$work\out" --no-preview | Select-Object -Last 1
$sprites = "$root\src\drafts\aps-godot\sprites\boy"
foreach ($k in "idle", "walk") { Copy-Item "$work\out\anims\boy_$k.png" "$sprites\$k.png" -Force }
"boy: idle and walk written to $sprites"
