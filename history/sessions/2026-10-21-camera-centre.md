# The camera centres the student top to bottom

**Who:** Mikko, with Claude Code.

## What was asked

"Now on character when zoomed out": keep the student fully in the middle of the screen
(they were centred left to right, but sat low when zoomed out).

## Decisions

- After the zones blend and the sideways follow, the camera moves straight up or down
  the screen (whole render pixels) onto the student's middle, 0.9 m up. Not in a
  cutaway (`inside`), which frames its corridor; where an outdoor cut is in force, the
  raise over the cut's edge still wins.
- **It stops where the frame's lower edge would start under the ground** (below 0.5 m).
  At the game's shallow angles (about 8° close up, 13° wide), centring further means the
  bottom of the frame looks at ground behind where the camera stands. Tried:
  - stepping the camera back along its view (the picture does not change): it showed
    whatever stands behind it, a dark building edge in the APS view;
  - looking down more steeply as you zoom out: centring fully needs over 25° at 112 m,
    and ten checks that hold each view's facing failed. The angles are the team's style,
    so it was taken out.
  Mikko left the choice to me ("u decide"); I kept the style's angles: dead centre close
  up, a little below the middle zoomed out (from about 15 m wide).

## What changed

- `aps.gd` `_update_camera()`: the vertical centring (`onto`, `lowest`), before the raise
  over the outdoor cuts (which now reuses its `up`).
- `docs/godot-art-style.md` Camera: "And top to bottom".

## Checks

`tools\run-aps-godot.cmd --headless -- --test`: all true. `npm run check` and
`npm run build` pass. Captures at 22, 60 and 112 m checked.
