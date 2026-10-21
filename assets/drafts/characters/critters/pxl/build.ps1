# Builds the cats' and the maya's game sheets from pxl (cats.px.js, maya.px.js) into
# src/drafts/aps-godot/sprites/critters: one strip per pose (and per cat coat), frames side by side.
# Needs pxl: the Claude Code skill (git clone https://github.com/crsolver/claude-pxl.git
# ~/.claude/skills/pxl-pixel-art) or set $env:PXL to its bin\pxl.js. Node 22.18 or newer.
#   .\assets\drafts\characters\critters\pxl\build.ps1            build the .px.js files as they are
#   .\assets\drafts\characters\critters\pxl\build.ps1 -Convert   remake them from source\*.png first
param([switch]$Convert)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path "$here\..\..\..\..\.."
$pxl = if ($env:PXL) { $env:PXL } else { Join-Path $env:USERPROFILE ".claude\skills\pxl-pixel-art\bin\pxl.js" }
if (-not (Test-Path $pxl)) { throw "pxl not found at $pxl (see the top of this script)" }
if ($Convert) { node "$here\convert.mjs" }
$work = Join-Path $env:TEMP "pxl-critters"
$dest = Join-Path $root "src\drafts\aps-godot\sprites\critters"
New-Item -ItemType Directory -Force $dest | Out-Null
foreach ($file in @("cats", "maya")) {
  node $pxl build "$here\$file.px.js" --out "$work\$file" --no-preview | Select-Object -Last 1
  Copy-Item "$work\$file\anims\*.png" $dest -Force
}
Write-Output "sheets in $dest"
