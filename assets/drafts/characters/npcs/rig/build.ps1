# Rebuilds the NPC sheets (walk.png, idle.png per NPC) with the boy's rig made
# general (NpcRig.cs + the setups in NpcCast.cs).
# Run from anywhere in Windows PowerShell:  .\assets\drafts\characters\npcs\rig\build.ps1 [id ...]
param([string[]]$Ids = @("migo", "kuya-ben", "bea", "bianca"))
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path "$here\..\..\..\..\.."
Add-Type -AssemblyName System.Drawing
# one compile: the cast's using lines are already at the top of NpcRig.cs
$cast = (Get-Content "$here\NpcCast.cs" | Where-Object { $_ -notmatch '^using ' }) -join "`n"
Add-Type -TypeDefinition ((Get-Content -Raw "$here\NpcRig.cs") + "`n" + $cast) -ReferencedAssemblies System.Drawing
foreach ($id in $Ids) {
  $log = [NpcRig]::Run($id, $here, (Join-Path $env:TEMP "npc-rig-frames\$id"), "$root\src\drafts\aps-godot\sprites\npcs\$id")
  "$id :" + (($log -split "`n") | Where-Object { $_ -match 'box' })
}
