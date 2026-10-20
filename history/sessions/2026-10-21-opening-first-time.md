# The opening can't be skipped the first time

**Who:** Mclaren (Aistwobig), with Claude Code.

## What was asked

The first time someone plays, they can't skip the opening; once they have played it
before, they can.

## Decisions

- **"Played before" = watched to the end once on this computer.** `opening.gd` saves
  `seen = true` in `user://opening.cfg` (Godot's user data folder) when the title card
  finishes. Quitting halfway the first time does not count.
- **First time:** no "HOLD SPACE TO SKIP" hint; Space and Esc only move on like any other
  key, so lines can still be hurried but nothing is skipped.
- **After that:** the hold-Space skip (and Esc) from 2026-10-20 as it was.
- `--opening-first` plays it as the first time again, for testing; deleting `opening.cfg`
  from the user data folder resets it for real.

## What changed

- `opening.gd`: `seen()`, `mark_seen()`, `_can_skip`; the skip hint and the Space/Esc skip
  only when it is true.
- `opening/README.md`, `opening/SCRIPT.md`: how skipping works now.

## Left unfinished / known problems

- No check covers it (a check would write the flag on the developer's own computer).
