# PGN: main merged in

**Who:** Mikko, with Claude Code.

## What was asked

Push the local `pgn` branch, open a pull request into main (#44), and resolve its
conflicts.

## What was done

`pgn` was pushed as its own branch (it had been tracking `origin/main`). Main was merged
into it. Every conflict was both sides adding in the same places, so both were kept:
- `aps.gd`: the preloads, `pgn_east` beside `formation`, and both in the chapel view's
  weights, `_turns()`, the focus blend, `facing_north` and the framing choice; PGN's
  garden cut beside the Formation Center's, Aero Hall's and the Covered Court's; PGN's
  checks before the Formation Center's.
- `world.gd`: the preloads, walkable, blocked and build lines.
- `tools/export-godot-plan.mjs` `BUILT`: pgn with formation, annex and court.
  `campus_plan.gd` was exported again (unchanged).
- `history/CONTEXT.md`, the README and style doc rows.

## Checks

`--test`: all true on the merged branch. `npm run check` and `npm run build` pass.
