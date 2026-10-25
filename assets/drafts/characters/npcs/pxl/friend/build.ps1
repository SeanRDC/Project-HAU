# Builds the friend's game sprites from pxl (friend-idle.px.js) into
# src/drafts/aps-godot/sprites/npcs/friend: the idle sheet (padded to 40 px frames, like the
# other NPCs') and the talk-bubble portrait. He has no walk, talk or wave yet; the game
# stands his idle in for them.
# Needs pxl: the Claude Code skill (git clone https://github.com/crsolver/claude-pxl.git
# ~/.claude/skills/pxl-pixel-art) or set $env:PXL to its bin\pxl.js. Node 22.18 or newer.
#   .\assets\drafts\characters\npcs\pxl\friend\build.ps1
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path "$here\..\..\..\..\..\.."
$pxl = if ($env:PXL) { $env:PXL } else { Join-Path $env:USERPROFILE ".claude\skills\pxl-pixel-art\bin\pxl.js" }
if (-not (Test-Path $pxl)) { throw "pxl not found at $pxl (see the top of this script)" }
$work = Join-Path $env:TEMP "pxl-friend"
New-Item -ItemType Directory -Force $work | Out-Null
node $pxl build "$here\friend-idle.px.js" --out "$work\out" --no-preview | Select-Object -Last 1
$sprites = "$root\src\drafts\aps-godot\sprites\npcs\friend"
New-Item -ItemType Directory -Force $sprites | Out-Null
& "$here\..\pad-sheet.ps1" "$work\out\anims\friend_idle.png" 24 "$sprites\idle.png"
Copy-Item "$work\out\sprites\friend_portrait.png" "$sprites\portrait.png" -Force
# the previews kept next to the source, like the others'
Copy-Item "$work\out\anims\friend_idle.gif" "$here\idle.gif" -Force
Copy-Item "$work\out\sprites\friend.png" "$here\friend.png" -Force
