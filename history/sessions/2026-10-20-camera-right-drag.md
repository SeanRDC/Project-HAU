# Right-drag camera angle

**Who:** Mikko, with Claude Code.

## What was asked

Turn the camera like in Roblox: hold the right mouse button and drag to change the angle.
Then, after trying it: zooming out did not stay on the student, the drag was too fast,
and zoomed out on SJH a white band showed at the bottom.

## Decisions

- **It turns the same orbit as Q/E, within the same ±0.25 rad.** Every camera zone, its
  near-plane cuts (SJH, MGN, the boulevard, the chapel south walk) and the cutaways
  assume the camera faces its zone's way give or take that range. A full Roblox-style
  360° turn would show the cut-away sides and stand the camera inside buildings, so it
  was not done. Widening the range means checking every zone's cut first.
- **Horizontal only.** Tilting would move the hallway cutaway's dark bands and the
  arena's pitch, which are tuned to their angles.
- `DRAG_TURN` 0.0015 rad per pixel (0.004 at first, too fast): the whole range is about
  330 px of drag. Mouse right
  looks right (the same way as E). The cursor hides while held and comes back where it
  was; the angle stays where it was left, like Roblox. R resets it.
- No drag while the F2 free cam or the F1 panel is open; F1/F2 end a drag.
- **Every framing follows the student across the screen,** the wide ones too (Mikko
  chose this over keeping the fixed wide building shots). The focus slides sideways
  onto the student and keeps its view's depth and height, so the student sits a little
  below the middle zoomed out. To see a whole building wide, stand at its middle; the
  checks `wide_shows_l`, `whole_building_visible` and `mgn_view_faces_front` now do.
- **No empty band under the outdoor cuts.** SJH's, MGN's, the boulevard's and the
  chapel south walk's near-plane cuts also remove the near ground, so zoomed out the
  frame showed the background below. The camera now moves straight up the screen until
  the cut's edge (on the ground, y −0.2) sits on the frame's bottom. Checked in wide
  captures of `--view=sjh`, `mgn` and `middle` before and after.

## What changed

- `aps.gd`: `_input()` and `_end_drag()`, `DRAG_TURN`; a release missed while the
  window was unfocused ends the drag in `_process()`. Help line: "Q/E or right-drag".
  New check `drag_angle` (turns by the drag, clamps, stops on release).
- `aps.gd` `_update_camera()`: the sideways follow after the zones blend, and the raise
  over the near cut (`inside_near` keeps the interiors' cutaways out of it).
- `README.md` controls table; `docs/godot-art-style.md` Camera section.

## Checks

`tools\run-aps-godot.cmd --headless -- --test`: all true, `checks_pass` true.
`npm run check` and `npm run build` pass.
