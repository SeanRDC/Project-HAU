# Dev free cam in Godot

**Who:** Sean, with Claude Code.

## What was asked

Another developer control: a free cam to fly round and look at everything.

## Decisions

- **F2 toggles it**, next to F1's fast travel. It starts where the game's camera stands,
  looking the same way, so nothing jumps.
- **Perspective while flying** (FOV 65, far 900). The game's orthographic views can't
  fly into or between buildings; this is a dev view, not a game view, so the style rules
  (orthographic, framing widths) are kept for the game and not tuned from here.
- **Mouse look** (the mouse is captured; click to take it back after alt-tabbing),
  W/A/S/D or arrows fly along the view, Space/E rise and Ctrl/Q sink straight up and down,
  Shift is 4x, the wheel steps the speed through 3, 6, 12, 24, 48, 96 m/s.
- **The student waits** where they were. The camera zones, cutaways and the corridor cut
  stop, so the gym's walls, the boulevard sides and so on all stand. Rain, NPCs, time (T),
  rain (G), pixels (P), mute, Tab and F11 still work; every other key is ignored.
- In Auto pixels the free cam renders crisp (perspective has no one width to match);
  fog runs 80 to 520 m and shadows reach 160 m while flying.
- **F2 or Esc** lands back on the student's camera at once. F1 leaves the free cam and
  opens fast travel.

## What changed

- New `dev_free_cam.gd` (the flight, mouse look and its badge).
- `aps.gd`: F2 handling, `_fly()`, `_leave_free_cam()`, crisp Auto while flying, no
  cutaways while flying, the help line, and the `free_cam` check (starts on the game
  camera's view, flies along it, rises, leaves the student put, hands back the
  orthographic camera where it was).
- Docs: the Godot README controls, the style guide's file table and Camera section.

## Validation

- `tools\run-aps-godot.cmd --headless -- --test`: every check true, `free_cam` included.
- `npm run check`, `npm run build` pass.

## Left unfinished

- No collision: the free cam flies through walls and under the ground.
