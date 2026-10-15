# Dev fast travel in Godot

**Who:** Mikko, with Claude Code.

## What was asked

Add fast travel for development.

## Decisions

- **F1 opens a panel**, centred, with one button per place, so nothing clashes with the
  number keys (framings 1-9, 0). Click a place, or move with the arrow keys and press
  Enter. F1 or Esc closes it (Esc no longer quits while the panel is open). Walking is
  paused while it is open.
- **A short fade to black** hides the jump (0.16 s out, 0.22 s in). Every camera zone,
  the gym's cutaways and the zoom snap to the new place at once.
- **13 places:** APS entrance, APS hallway, corner garden, canteen patio, canteen hall,
  picnic strip, chapel plaza, IH Gym front, side and inside, St. Joseph Hall, SJH walkway,
  and the Mary statue. Each has its own framing width.
- It is a dev tool only: it skips walking, doors and story.

## What changed

- New `dev_travel.gd` (the panel and its fade).
- `aps.gd`: `travel_places()`, `_travel_to()`, F1 handling, the `--travel` flag, and the
  `fast_travel` check (jumps to every place, which must be walkable and framed).
- Docs: the Godot README controls and files, the style guide's file table, `CONTEXT.md`.

## Validation

- Headless `--test`: all pass, including `fast_travel` (all 13 places).
- A capture with the panel open was checked.

## For the team

When you merge a building, add its spots to `travel_places()`; the check will tell you if
one is not walkable.
