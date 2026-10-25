# Every branch merged into main

**Who:** Sean, with Claude Code.

## What was asked

"Pull all the latest updates locally, and merge every feature to main then push."

## What was merged

Into `main`, in this order: `campus-updates` (which already held `aero-hall`,
`audio-fixes`, `formation-center` and `sjh-mgn-spacing`), `canteen-layout`,
`covered-court`, `godot-npcs`, `sjh-rear-facade` and `assets-girl-sprite-test`.

Left out: the local `ih-gym-godot` draft (one commit from 2026-10-16, 225 behind). It was
replaced by `ih-gym-on-plan`, which is already in main (`areas/gym.gd`).

## Conflicts and how they were settled

- `history/CONTEXT.md`, the file tables in `docs/godot-art-style.md` and the README: both
  sides kept.
- Covered Court with Formation Center and Aero Hall: all three areas are preloaded, built
  and in `walkable`/`blocked`; the plan export marks `formation`, `annex` and `court`
  built (`campus_plan.gd` regenerated); both camera cuts and every check kept.
- SJH's back lane with the SJH-MGN spacing: both sets of constants in `sjh.gd`;
  `gym_for` yields to both `Formation.view_for` and `Sjh.rear_for`; the `sjh-rear` view
  added to the README's list. `audio.gd` keeps main's version: the murmur was removed, so
  the back-lane branch's worker-thread murmur is dropped.
- Aero Hall blocked everything south of z 145.6, which closed SJH's new back lane
  (`sjh_rear_lane`, `sjh_rear_view_faces_back` and `fast_travel` failed). The grey edge wall
  now only runs east of `GATEWAY_X` 44.4, as a wall rather than a half-plane, with the gate
  slid open beside the gap, so the concrete by the hall runs on into the lane.

## Checks

`--test`: all true. `npm run check` and `npm run build` pass.
