# Right-drag camera angle

**Who:** Mikko, with Claude Code.

## What was asked

Turn the camera like in Roblox: hold the right mouse button and drag to change the angle.

## Decisions

- **It turns the same orbit as Q/E, within the same ±0.25 rad.** Every camera zone, its
  near-plane cuts (SJH, MGN, the boulevard, the chapel south walk) and the cutaways
  assume the camera faces its zone's way give or take that range. A full Roblox-style
  360° turn would show the cut-away sides and stand the camera inside buildings, so it
  was not done. Widening the range means checking every zone's cut first.
- **Horizontal only.** Tilting would move the hallway cutaway's dark bands and the
  arena's pitch, which are tuned to their angles.
- `DRAG_TURN` 0.004 rad per pixel: the whole range is about 125 px of drag. Mouse right
  looks right (the same way as E). The cursor hides while held and comes back where it
  was; the angle stays where it was left, like Roblox. R resets it.
- No drag while the F2 free cam or the F1 panel is open; F1/F2 end a drag.

## What changed

- `aps.gd`: `_input()` and `_end_drag()`, `DRAG_TURN`; a release missed while the
  window was unfocused ends the drag in `_process()`. Help line: "Q/E or right-drag".
  New check `drag_angle` (turns by the drag, clamps, stops on release).
- `README.md` controls table; `docs/godot-art-style.md` Camera section.

## Checks

`tools\run-aps-godot.cmd --headless -- --test`: all true, `checks_pass` true.
`npm run check` and `npm run build` pass.
