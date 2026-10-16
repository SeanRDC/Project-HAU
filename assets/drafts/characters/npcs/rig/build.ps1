# Rebuilds the NPC sheets (walk, idle, talk, wave and portrait per NPC).
# The rig (NpcRig.cs + the setups in NpcCast.cs) makes idle, talk and the portrait from
# each reference drawing. Walk and wave are PixelLab skeleton redraws kept in
# ..\pixellab\frames\<id>\walk and \wave (made by ..\pixellab\animate.mjs); NpcSheets.cs
# cleans them and puts all four sheets in one box with the feet on the bottom row.
# Run from anywhere in Windows PowerShell:  .\assets\drafts\characters\npcs\rig\build.ps1 [id ...]
param([string[]]$Ids = @("migo", "kuya-ben", "bea", "bianca", "rica", "paolo", "ate-lorna", "coach-gab"))
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path "$here\..\..\..\..\.."
$frames = Resolve-Path "$here\..\pixellab\frames"
Add-Type -AssemblyName System.Drawing
# one compile: the cast's using lines are already at the top of NpcRig.cs
$cast = (Get-Content "$here\NpcCast.cs" | Where-Object { $_ -notmatch '^using ' }) -join "`n"
$sheets = (Get-Content "$here\NpcSheets.cs" | Where-Object { $_ -notmatch '^using ' }) -join "`n"
Add-Type -TypeDefinition ((Get-Content -Raw "$here\NpcRig.cs") + "`n" + $cast + "`n" + $sheets) -ReferencedAssemblies System.Drawing
foreach ($id in $Ids) {
  # an NPC kept in pxl (..\pxl\<id>) is built from its .px.js there instead
  if (Test-Path "$here\..\pxl\$id\build.ps1") { "$id : kept in pxl, run ..\pxl\$id\build.ps1"; continue }
  $rigFrames = Join-Path $env:TEMP "npc-rig-frames\$id"
  $out = "$root\src\drafts\aps-godot\sprites\npcs\$id"
  [NpcRig]::Run($id, $here, $rigFrames, $out) | Out-Null
  "$id : " + [NpcSheets]::Run("$here\$id-canvas.png", $rigFrames, "$frames\$id\walk", "$frames\$id\wave", $out)
}
