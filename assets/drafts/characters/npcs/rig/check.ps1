# Checks every character sheet for broken pixels: pieces not joined to the body,
# and notches (a transparent pixel with the body on three or four sides).
# Run from anywhere in Windows PowerShell:  .\assets\drafts\characters\npcs\rig\check.ps1
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$sprites = Resolve-Path "$here\..\..\..\..\..\src\drafts\aps-godot\sprites"
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition (Get-Content -Raw "$here\SpriteCheck.cs") -ReferencedAssemblies System.Drawing
$sheets = @(@("boy", "walk", 12), @("boy", "idle", 24))
foreach ($id in "migo", "kuya-ben", "bea", "bianca", "rica", "paolo", "ate-lorna", "coach-gab") {
  foreach ($k in @(@("walk", 12), @("idle", 24), @("talk", 4), @("wave", 4))) { $sheets += ,@("npcs\$id", $k[0], $k[1]) } }
$bad = 0
foreach ($s in $sheets) {
  $r = [SpriteCheck]::Run("$sprites\$($s[0])\$($s[1]).png", $s[2])
  if ($r) { "$($s[0]) $($s[1]):"; $r.TrimEnd(); $bad++ } }
if ($bad -eq 0) { "All sheets clean." } else { "$bad sheet(s) need a look."; exit 1 }
