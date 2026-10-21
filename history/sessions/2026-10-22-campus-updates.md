# Campus updates: one branch

**Who:** Mikko, with Claude Code.

## What was asked

"Merge to main all except middle road and make a pull request." Asked, Mikko said leave
out the whole PGN branch (it changes the boulevard) and make one combined PR.

## What was done

`campus-updates`, from main, merges sjh-mgn-spacing (#37), formation-center (#39),
audio-fixes (#40) and aero-hall. Each side only added in the same places, so the
conflicts were resolved by keeping both:
- `history/CONTEXT.md`: both sides' entries.
- `roads.gd` `OPENINGS`: MGN's corner opening and the Formation Center's two.
- `world.gd`: both areas' preloads, walkable, blocked and build lines.
- `aps.gd`: both camera cuts and both sets of checks.
- The README and style doc rows.
- `tools/export-godot-plan.mjs` `BUILT`: formation and annex. `campus_plan.gd` was
  exported again.

PGN (branch `pgn`) is not in it.

## Checks

`--test`: all true on the merged branch. `npm run check` and `npm run build` pass.
