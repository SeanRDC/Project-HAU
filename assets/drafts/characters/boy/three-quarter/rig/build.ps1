# Rebuilds the boy's Godot sheets (walk.png, idle.png) from his reference with the rig in Rig.cs.
# Run from anywhere in Windows PowerShell:  .\assets\drafts\characters\boy\three-quarter\rig\build.ps1
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path "$here\..\..\..\..\..\.."
$frames = Join-Path $env:TEMP "boy-rig-frames"
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition (Get-Content -Raw "$here\Rig.cs") -ReferencedAssemblies System.Drawing
[Rig]::Run("$here\..\first-frame-fixed.png", $frames, "$root\src\drafts\aps-godot\sprites\boy")
