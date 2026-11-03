# Project HAU: Performance Report

November 2026 performance pass on the Godot game (`src/drafts/aps-godot/`), branch `performance`.

**Result:** across all 31 fast-travel places the game went from about **71 fps to about 167 fps**
on the test PC. Frame-time spikes (p99) fell from about 31 ms to 11 ms, and the slowest view
(IH Gym front) went from about 35 fps to about 94 fps. Nothing was removed: every building,
NPC, cat, bird, sound, shader and setting is still there and looks the same, and all 148
headless checks pass.

## Test setup

| | |
| --- | --- |
| PC | AMD Ryzen 5 3600, NVIDIA GeForce GTX 1660 SUPER, 16 GB RAM, Windows 11 Pro |
| Engine | Godot 4.7.2 stable (official), Vulkan 1.4, Forward+ |
| Window | 1600x900 (the project's default), Auto pixels, afternoon, the weather as it comes |
| Method | `--bench=<path>` (new, `dev_bench.gd`): vsync and the fps cap off; at each of the 31 fast-travel places, 30 warm-up frames, then 120 measured frames; then 8 s holding Shift+D (a run along APS and round the corner). Frame times are wall clock. GPU and render-CPU times are Godot's own measured times for the 3D viewport (`viewport_get_measured_render_time_*`). Memory and node counts come from `Performance` monitors. |
| Fairness | Before and after were run **alternately, twice each**, right after one another, from a copy of the original commit (`3a5e027`) with only the benchmark added. Both pairs agree within a few percent. |

During most of the session another game ("Fall of Avalon") was running on the same GPU. It
doubled the GPU times and made the mid-session numbers unreliable, which is why the final
comparison was redone alternately once it had closed. If you measure, close other games and
videos first.

Not measured: overall CPU usage in percent (Task Manager style), GPU usage in percent, and
the Godot editor's interactive profiler (the measurements above use the same counters from
inside the game, so they can be repeated from the command line).

## Before and after

Averages over the two alternating pairs (each pair: 31 places x 120 frames, plus the run).

| | Before | After |
| --- | --- | --- |
| **Average fps, all places** | **71** | **167** |
| Average frame time | 14.0 ms | 6.0 ms |
| p99 frame time (spikes) | 31.4 ms | 11.1 ms |
| Worst frame seen | 65 ms | 13 to 26 ms |
| IH Gym front (slowest view) | 35 fps, 8,690 draw calls | 94 fps, 3,941 draw calls |
| Canteen patio | 62 fps | 148 fps |
| Running (Shift+D, 8 s) | 87 fps | 172 fps |
| GPU time per frame (typical) | ~5 ms | ~5 ms (unchanged) |
| Render CPU time (gym front) | 11.9 ms | 4.2 ms |
| Scene nodes | 12,236 | 4,948 |
| Engine objects | 28,480 | 13,597 |
| Static (CPU) memory | 259 MB | 221 MB |
| Video memory | 503 MB | 520 MB (+17 MB of merged mesh buffers) |
| Start-up: building the campus | 4.77 s | 4.98 s |
| Start-up: until the first frame | 7.31 s | 7.52 s |

CPU time per frame of each system (average over all places; the largest place in brackets):

| System | Before | After |
| --- | --- | --- |
| Cats and birds (`critters.update`) | 7.33 ms (11.2) | 0.45 ms (1.2) |
| NPCs (`npcs.update`) | 1.14 ms (2.2) | 0.51 ms (1.0) |
| The student's movement and collision | 0.83 ms (1.3) | 0.38 ms (0.6) |
| Rain, leaves, light shafts (`atmosphere.update`) | 1.52 ms (1.7) | 1.22 ms (1.3) |
| Camera | 0.15 ms | 0.12 ms |

Per-place numbers: run `--bench` (README, Performance) and compare the JSON.

## How the game is built

- **One scene, built in code.** `main.tscn` holds one node with `aps.gd`. At start-up
  `world.gd` and the 20 area scripts in `areas/` build the whole campus from the team's
  plan (`campus_plan.gd`): about 34,500 boxes, rods, custom meshes, procedural textures,
  trees, grass, labels and lights. There are no imported models.
- **Rendering.** The 3D world renders into a `SubViewport` at a pixel scale picked from the
  zoom, and is enlarged with nearest sampling (`display.gdshader` grades it). An edge
  shader on a full-screen quad draws the outlines. Forward+ with SSAO, glow, depth fog, an
  8192 directional shadow map and 4x MSAA. All of this is the art style
  (`docs/godot-art-style.md`) and was left alone.
- **The frame.** `aps.gd _process()` reads the keys (polled, no input map), moves the
  student, updates the camera and the cut-aways, then the NPCs, the critters and the
  atmosphere. `audio.gd` plays synthesised sound (no audio files). There is no physics
  engine: collision and floor heights are plain functions (`World.blocked()`,
  `World.floor_height()`) that ask each area in turn.
- **Systems.** 8 NPCs with talk scripts; about 12 cats, 22 flocks (about 110 birds) and
  birds flying over; rain, puddles, 74 particle systems, light shafts; the opening; the
  F1 fast-travel and F2 free-cam dev tools; 148 headless checks (`--test`).

## Problems found and what was done

The GPU was never the limit on this PC (about 5 ms a frame). The time went to the CPU:
GDScript work every frame, and the engine's per-object cost of drawing about 11,000
separate meshes. Each fix below was measured, kept only if it helped, and checked to look
the same (screenshots before and after, compared pixel by pixel against the run-to-run
noise of the same build).

### 1. Cats and birds updated everywhere, every frame (CPU, the biggest cost)
About 120 animals ran their full behaviour every frame wherever they were. A hop or a step
asks the world's collision 12 to 36 times, so they took **5 to 11 ms a frame**, half the
frame, for animals nobody could see.
**Fix:** cats and feeding flocks that are off the screen and more than 12 m from the
student wait where they are (`critters.gd`, `_awake()`). Flocks taking off, flying away or
landing always update, so the take-off and landing behaviour and its checks are unchanged.
*7.3 to 0.45 ms a frame.*

### 2. Collision queries cost 0.15 to 0.25 ms each (CPU, also the spikes)
`World.blocked()` took 256 µs and `floor_height()` 154 µs per call. When several flocks
chose hops in the same frame they made 70 ms frames.
- `Roads.across()` (the distance across the road, used by nearly every query) measured all
  ~400 road segments each time. It now looks only at the segments that can be nearest,
  listed per 12 m square once (`roads.gd`). The answer is identical; the new
  `road_grid_exact` check compares it against measuring every segment at 4,000 points.
- Helpers that rebuilt arrays from constants on every call now keep them:
  `Chapel.south_bays()` (which walked the outline twice per edge), the chapel south walk's
  bollards, the gym's blockers and back doors. The south walk's path test first checks a
  bounding rectangle.
- `Critters._clear_spot()` carries the last spot's height on instead of asking again, and at
  most four bird hops are chosen per frame (a fifth bird decides one frame later).
*`blocked()` 256 to 115 µs, `floor_height()` 154 to 55 µs; critter spikes gone.*

### 3. About 11,000 separate meshes, each its own draw call (render CPU)
Boxes with the same size and material shared a MultiMesh, but most sizes are unique, so
about 4,100 batches held under 20 boxes, plus 2,700 rods, 3,700 custom meshes and 3,600
leaf clusters, each drawn on its own (twice, with its shadow). The gym front issued 8,690
draw calls and spent 12 ms of CPU submitting them.
**Fix:** `World.merge_static()`, run once after the campus is built, bakes every small
static mesh and small box batch into one mesh per material, shadow mode and 24 m square,
under the same parent node. Only unnamed leaf nodes are merged, because every node the
code looks up or changes at run time has a name; cut-away groups keep their own meshes.
Textures are world-mapped (triplanar), so baked vertices look the same; the leaf shader
now takes each card's sway direction from its vertex colour so baked leaves still sway
exactly as before. To keep start-up fast the merge never reads meshes back from the GPU
(that cost 7 to 16 s): built meshes keep their arrays (`w.commit(tool)`), and boxes and
rods are a unit shape scaled on the CPU. *Draw calls halved everywhere; render CPU at the
gym front 11.9 to 4.2 ms; the merge takes about 0.9 s.*

### 4. Sound synthesis on the main thread (stutter)
All sounds are synthesised in GDScript. The warm-up rendered one sound per frame for the
first ~45 frames after launch (1.2 s of work in all; one run caught an 82 ms frame from
it), the 6 s rain loop was rendered before the first frame, and the first thunder (64 ms),
purr (18 ms) and meow (7 ms) were rendered when first heard.
**Fix:** every sound, including the rain loop, is rendered on one `WorkerThreadPool` task at
start-up (`audio.gd`); the cache is locked, a sound wanted before it is ready is rendered
on the spot as before, and the task is waited on at exit (the earlier crash-on-quit fix).
*None of that synthesis runs on the main thread any more.*

### Other findings
- Two scripts (`areas/beside_aps.gd`, `areas/sh.gd`) were missing their `.uid` files in the
  repository; they are committed now.
- The project needed nothing else to open and run on this PC: no missing resources or
  broken references, no script errors, and every check passed before and after.
- The launcher (`tools\run-aps-godot.cmd`) finds Godot in `builds\godot-tools\4.7.2\`, in
  `GODOT` or on the PATH; on this PC Godot was copied into the first (ignored by git).

## Remaining issues

- **IH Gym front is still the heaviest view** (about 94 fps, 3,900 draw calls): the gym's
  interior (stands, ceilings, walls) is drawn from outside, where it is only glimpsed
  through the doorways.
- **Shader compilation on first sight.** The first time an area is seen on a computer,
  Godot compiles its pipelines, which once froze the Student Center for 2.2 s. The cache
  makes it a one-time cost per machine (and per driver update).
- **Collision is still script code**, about 0.1 ms per query; fine at today's numbers, but
  every new building adds to every query.
- **Start-up builds the whole campus every launch** (about 5 s, plus about 2.5 s to the first
  frame).
- **Memory:** about 395 MB of texture memory, mostly the 8192 shadow map (256 MB) and the
  4096 positional shadow atlas, both art-style settings.
- Godot prints a few "leaked at exit" and "Unreferenced static string" lines on quit;
  engine noise, harmless.

## Recommended next steps

1. Hide the gym interior's cut-away groups while the student is outside and away from the
   doorways (or stop them casting shadows), then compare captures of the gym front.
2. Warm the shader pipelines behind the opening, by showing each area's materials once
   off-screen, so the first visit does not hitch.
3. Give `World.blocked()` and `floor_height()` a bounding box per area (skip an area whose
   box does not contain the point), as `Roads.across()` now does for the road.
4. Add Windows export presets and export templates, so the team can share a playable .exe.
5. Keep using `--bench` before and after big changes; close other games while measuring.
