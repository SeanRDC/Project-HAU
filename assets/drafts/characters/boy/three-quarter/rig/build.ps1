# Makes the boy's idle frames from his reference with the rig in Rig.cs.
# Run from anywhere in Windows PowerShell:  .\assets\drafts\characters\boy\three-quarter\rig\build.ps1
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$frames = Join-Path $env:TEMP "boy-rig-frames"
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition (Get-Content -Raw "$here\Rig.cs") -ReferencedAssemblies System.Drawing
# The game's sheets now come from pxl (..\..\pxl\build.ps1): this rig only makes his idle
# frames (in $frames) for those, so its own sheets go to a temporary folder.
[Rig]::Run("$here\..\first-frame-fixed.png", $frames, (Join-Path $env:TEMP "boy-rig-sheets"))
