# Performance pass, and playing on Windows

**Who:** Simpledog1, with Claude Code.

## What was asked

Understand the whole project, find what makes it slow, make it run smoothly without
changing the game or its look, make sure it opens and plays through Godot on a Windows PC,
test it, and write `PERFORMANCE_REPORT.md` and the README's setup, controls and known issues.

## Decisions

- **Measure first, and fairly.** A new `--bench` (`dev_bench.gd`) measures every fast-travel
  place and a run with vsync off. Another game was sharing the GPU for most of the session
  and doubled the GPU times, so the final before/after was run alternately against a copy of
  the starting commit. Close other games before measuring.
- **The GPU was never the limit** (about 5 ms a frame on a GTX 1660 Super), so no shadow,
  SSAO, MSAA or resolution setting was touched: those are the art style. All the time was
  CPU: GDScript every frame and about 11,000 separate meshes.
- **Off-screen critters wait** (`critters.gd`): cats and feeding flocks off the screen and
  over 12 m from the student skip their update. Taking off, flying and landing always run.
- **Static batching** (`World.merge_static()`): small static meshes and box batches are baked
  per material, shadow mode and 24 m square, under their own parent. Only unnamed nodes are
  merged, so anything looked up or changed at run time must have a name, and custom meshes
  go through `w.commit(tool)` so the merge never reads them back from the GPU (that took 7
  to 16 s). Leaf cards keep their sway direction in their vertex colour
  (`leaves.gdshader`), so they sway exactly as before. Both rules are in the style guide.
- **Collision queries made cheaper without changing their answers**: `Roads.across()` looks
  only at nearby road segments (checked exact by `road_grid_exact`), and helpers that rebuilt
  arrays on every call keep them. At most four bird hops are chosen per frame.
- **Sounds render on a worker thread** (`audio.gd`), with the cache locked and the task waited
  on at exit (the crash-on-quit lesson from 2026-10-21).
- Every change was checked against captures before and after (with leaf sway off, compared
  pixel by pixel against the run-to-run noise): no difference beyond drifting shafts, dust
  and NPCs.

## What changed

- `critters.gd`, `world.gd` (`merge_static`, `commit`), `shaders/leaves.gdshader`,
  `roads.gd`, `audio.gd`, `areas/chapel.gd`, `areas/chapel_south.gd`, `areas/gym.gd`, and the
  `w.commit(tool)` calls in `chapel`, `formation`, `gym`, `gym_interior`, `mgn`, `pgn`, `sjh`.
- `aps.gd`: `--bench`, `startup_ms`, the `road_grid_exact` check (148 checks).
- Committed the missing `areas/beside_aps.gd.uid` and `areas/sh.gd.uid`.
- Docs: `PERFORMANCE_REPORT.md` (new), `README.md` (Play It, controls, known issues),
  `src/drafts/aps-godot/README.md` (batching, Performance), `docs/godot-art-style.md`
  (static batching rules, keeping collision cheap).

Measured (two alternating pairs): about 71 to 167 fps on average over 31 places, p99 31 to
11 ms, IH Gym front 35 to 94 fps, start-up +0.2 s. Details in `PERFORMANCE_REPORT.md`.

## Left unfinished / known problems

- The gym front is still the heaviest view: the gym's inside is drawn from outside.
- The first sight of an area compiles shaders once per machine (a 2.2 s freeze was seen at
  the Student Center on a fresh install).
- No Windows export preset yet.
- `npm run check` and `npm run build` were not run: `node_modules` was not installed on this
  machine and no TypeScript was changed.
