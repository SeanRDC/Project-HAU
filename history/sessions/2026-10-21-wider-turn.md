# Wider camera turn

**Who:** Mikko, with Claude Code.

## What was asked

"Full freedom when dragging angles". Mikko chose a wider turn rather than a full 360°,
and to fade whatever ends up between the camera and the student.

## Decisions

- **±45°** (`ORBIT_MAX` 0.785) for Q/E and right-drag, up from ±0.25 rad. Not 360°: every
  camera zone, its cuts and the sun's aim are made for one facing.
- **The cuts** (SJH's parking, the chapel south walk's road, MGN's lawn, the boulevard's
  two sides) were made for ±0.25 (`ORBIT_CUT`). Turned further, they would slice through
  buildings at an angle, so they ease out over 0.1 rad (`_cuts_hold()`).
- **The fade instead:** past that, everything but the ground (`GROUND_KINDS`) nearer to the
  camera than the student dithers out, from 5 m nearer to gone by 1.5 m nearer: Godot's
  pixel-dither distance fade on the StandardMaterials, switched on only while turned
  past the range (the first time compiles the dithered variant: a short hitch), and the
  same by hand in the foliage shader; the weathering pass skips fading walls.
- **In a corridor's cutaway** (APS hallway, SJH walkway, the boulevard's covered walks,
  the Student Center) the turn is held to ±0.25 (`_orbit()`): those cuts and bands are
  the corridor, and the player's angle comes back on leaving.
- Known limit: it measures straight-line distance, so the high parts of a tall wall
  behind the student (and the near end of a building seen at a slant) can dither too.
  A fade measured on the ground plane would need every material to be a shader.

- **Polish after Mikko tried it ("lagging when dragging right and left"):** a probe
  sweeping the turn printed 50 ms frames every time it crossed ±0.25: switching the
  fade's mode on and off rebuilt every material. Now the fade mode stays on (off is a
  1 mm fade), the shaders read two global uniforms (one write a frame instead of one per
  tree), and the StandardMaterials are rewritten only when the distances move. The sweep
  then held 60 fps at SJH and on the boulevard. The turn also eases after the mouse
  (`orbit_goal`, rate 16), so it glides instead of stepping with each mouse event.

- **The fade is gone (Mikko: "I don't want to see any grays when turning").** It measured
  distance from the camera, so walls that were nearer than the student without blocking
  them (SJH's brown tower, turned) dithered grey. With the fade off and the views' own
  cuts kept on at every angle, captures turned 40° both ways at SJH, both sides of the
  boulevard, MGN and APS showed no grey and the student in view, so the fade and the
  easing out of the cuts were removed (`_cuts_hold`, `set_occluder_fade`, the global
  uniforms, the always-on distance fade). The smoothed turn stays.

- **Taken back (Mikko: "stick with the previous angle limit, it has a lot of bugs"):** the
  turn is ±0.25 again (`ORBIT_MAX` 0.25; `ORBIT_CUT` and `_orbit()` are gone). The eased
  turn (`orbit_goal`) stays.

## What changed

- `aps.gd`: `ORBIT_MAX`, `ORBIT_CUT`, `_orbit()`, `_cuts_hold()`; the cuts scaled by it;
  the fade driven each frame; the `drag_angle` check clamps at `ORBIT_MAX`.
- `world.gd`: `foliage`, `GROUND_KINDS`, `set_occluder_fade()`, `_fade_materials()`.
- `shaders/leaves.gdshader`, `shaders/weathering.gdshader`: `eye`, `fade`.
- `docs/godot-art-style.md` Camera.

## Checks

`tools
un-aps-godot.cmd --headless -- --test`: all true. `npm run check`, `npm run build`
pass. Captures turned 40° at SJH, the boulevard and APS checked.
