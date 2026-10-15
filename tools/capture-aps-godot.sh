#!/bin/sh
# Native GPU review captures of the Godot APS scene into builds/aps-godot-review/port/.
# Usage: sh tools/capture-aps-godot.sh [name ...]   (no names = all shots)
cd "$(dirname "$0")/.." || exit 1
G="${GODOT:-builds/godot-tools/4.7.2/Godot_v4.7.2-stable_win64_console.exe}"
OUT="$(pwd)/builds/aps-godot-review/port"
mkdir -p "$OUT"
shot() {
  name=$1; shift
  [ -n "$ONLY" ] && case " $ONLY " in *" $name "*) ;; *) return ;; esac
  if timeout 120 "$G" --path src/drafts/aps-godot -- --capture="$OUT/$name.png" --frames=40 --hide-help "$@" > "$OUT/$name.log" 2>&1; then
    echo "ok    $name"
  else
    echo "FAIL  $name (see $OUT/$name.log)"
  fi
}
ONLY="$*"
shot wide-afternoon
shot wide-morning --hour=8
shot wide-noon --hour=12
shot wide-night --hour=21
shot building-afternoon --zoom=56
shot corridor-afternoon --zoom=36 --angle=-0.2
shot entrance-afternoon --zoom=22
shot entrance-night --zoom=22 --hour=21
shot entrance-girl-shade --zoom=22 --girl --z=1.2
shot entrance-walking --zoom=22 --walk=1.5
shot entrance-chunky --zoom=22 --pixel=pixel
shot canteen-afternoon --view=canteen
shot canteen-night --view=canteen --hour=21
shot canteen-inside --view=canteen --z=-1 --zoom=22
shot gym-afternoon --view=gym
shot gym-night --view=gym --hour=21
shot gym-front-close --view=gym --zoom=40
shot gym-side --view=gym-side
shot gym-in-court --view=gym-in
shot gym-in-night --view=gym-in --hour=21
shot gym-in-plan --view=gym-in --zoom=84
shot gym-in-lobby --x=64 --z=83.8 --zoom=28
shot gym-in-stand --x=63 --z=97 --level=6.95 --zoom=36
shot gym-in-stage --x=78.5 --z=129 --level=1.95 --zoom=32
shot gym-in-east --x=91 --z=95.8 --zoom=28
shot gym-walk-in --x=55.5 --z=75.5 --zoom=36 --walk=3.5
