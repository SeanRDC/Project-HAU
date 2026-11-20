# The Main Building and the Side Gate: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the DJDN Main Building (outside, lobby, courtyard, both gallery storeys) and the side gate (flag circle, walk, gatehouse, colonnade, fence, car gate) in the Godot campus, 1:1 from the photos.

**Architecture:** Two new area files on their plan plots, `areas/djdn.gd` and `areas/side_gate.gd`, built with `world.gd`'s helpers; they expose static `walkable` / `blocked(x, z, level)` / `floor_height(x, z, level)` and camera weights that `world.gd` and `aps.gd` call, the way `student_center.gd` and `gym_interior.gd` do. The plots move in `plan.ts`, which regenerates `campus_plan.gd`.

**Tech Stack:** Godot 4.7.2 GDScript; TypeScript plan + `npm run export:godot-plan`.

**Spec:** `docs/superpowers/specs/2026-11-20-main-building-and-side-gate-design.md` (read it with this plan; every number below comes from it).

## Global Constraints

- **No cars anywhere** at the Main Building or the side gate; parking bays stay empty.
- Nothing past the fence (no street); the theatre and every room behind a door stay closed.
- Follow `docs/godot-art-style.md`: metres, Y up; `w.box`, `w.framed_window`, `w.panel`, `w.rod`, `w._ground`, `w._tree`, `w._cards`, `w.material(kind, tint)`, `w.glow`; Lambert, no specular except glass; name every node changed at run time; custom meshes via `w.commit(tool)`; no flush faces (5 mm apart); no imported models or photo textures.
- Commits: one per task (more if a task has separable parts), under `SeanRDC`, plain message, **no co-author or "Generated with" line**, pushed to `origin main-building`.
- Gate every commit on: `tools\run-aps-godot.cmd --headless -- --test` → `"checks_pass": true` (set `GODOT=D:\Downloads\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe`; run `--headless --import` first if new files fail to load).
- Levels (spec): drive -0.19, walks -0.04, porch/lobby/galleries 0.9, courtyard 0.45, stage 1.35, upper floor 5.3; glass roof ~12.0.

## Review Focus

1. Walking south from the Student Center's brick apron onto the drive: the camera hands from the boulevard's south view to the front view without flipping through north. Test in Task 3 (`walk_onto_drive`).
2. Upstairs, walking off a gallery's open edge or the mezzanine into the void is refused (no 4.4 m drop). Test in Task 6 (`gallery_no_drop`).
3. A student under an upper gallery or the mezzanine is still seen (not hidden by the floor above). Test in Task 6 (`_all_visible` in `gallery_upstairs`).
4. The Student Center's courtyard gate leads through into the courtyard (it used to be a dead end). Test in Task 5 (`courtyard_gate_through`).
5. Fast travel to every new spot lands on walkable ground (the existing `fast_travel` check, extended in each task that adds a spot).

---

### Task 1: The plots, the bound

**Files:**
- Modify: `src/game/campus/plan.ts` (`GODOT_PLOTS`: `djdn`, `flagCircle`, `gateWalk`, `sideGate1`, `rotonda2`)
- Modify: `tools/export-godot-plan.mjs:29` (`BUILT` adds `djdn`, `flagCircle`, `gateWalk`, `sideGate1`)
- Regenerate: `src/drafts/aps-godot/campus_plan.gd`
- Modify: `src/drafts/aps-godot/world.gd:275` (`clamp_position` x from -192 to -212)
- Test: `aps.gd` `_verify_and_capture`

**Interfaces:**
- Produces: `CampusPlan.PLOTS["djdn"].outline` with the straight west face x -156.2 (z 88.4..127.0) and the porch -159.1 (z 103.4..112.0); the four moved plots 5.4 m west (`shift(…, -5.4, 0)`).

- [ ] **Step 1:** Add check `plots_moved`: `CampusPlan.PLOTS["djdn"]["built"] and CampusPlan.PLOTS["flagCircle"]["built"] and absf(_centre(CampusPlan.PLOTS["flagCircle"]["outline"]).x + 178.5) < 0.6 and not CampusPlan.PLOTS["rotonda2"]["built"]` (a small `_centre(outline) -> Vector2` mean of the points).
- [ ] **Step 2:** Run the checks; `plots_moved` false.
- [ ] **Step 3:** Edit `plan.ts` (outline for `djdn` via `inGodot`, `shift` on the four), `BUILT`, run `npm run export:godot-plan`, change the bound.
- [ ] **Step 4:** Run the checks: all true (`plots_clear` too). Run `npm run check`.
- [ ] **Step 5:** Commit `main building: plots moved from the photos, the west bound out to the side gate`; push.

### Task 2: The Main Building's shell

**Files:**
- Create: `src/drafts/aps-godot/areas/djdn.gd`
- Modify: `world.gd` (preload `Djdn`, `Djdn.new().build(self)` after `StudentCenter`)
- Test: `aps.gd`

**Interfaces:**
- Produces in `djdn.gd`: `const FRONT := -156.2`, `const PORCH := -159.1`, `const CENTRE_Z := 107.7`, `const NORTH := 88.4`, `const SOUTH := 127.0`, `const EAST := -90.1`, `const PAVILION := Vector2(102.2, 113.2)`, `const COLUMNS: Array[float]` (4 z's, symmetric about `CENTRE_Z`), `const DOORS: Array[float]` (3 z's), `static func front_windows() -> Array[float]` (z of every front window, single + 4 pairs per wing), `const FLOOR_Y := 0.9`, `const UPPER_Y := 5.3`, `const YARD_Y := 0.45`, `const STAGE_Y := 1.35`, `const BUILT_NAME := "DjdnBuilding"`.
- Shell: plinth, wings (cream `e8cf86`, trim `f5f1e6`), string course ~5.2, dentil cornice to 10.2, parapet 10.9, low hip roofs behind; the pavilion's front 0.6 m proud, the porch, four Ionic columns (shaft, base, volute capital), entablature with `HOLY ANGEL UNIVERSITY` (`w.panel`, facing -x), pediment with the seal medallion, balustraded roof terrace; pedimented door frames, the dark cross north of the porch; `framed_window` pairs with white frames; the north face's upper floor above the Student Center's roof; south and east faces in the same vocabulary.

- [ ] **Step 1:** Add checks `djdn_built` (`scene.find_child(Djdn.BUILT_NAME, true, false) != null`) and `djdn_front_symmetric` (every z in `Djdn.front_windows()` has its mirror `2 * CENTRE_Z - z` within 0.01; 10 per floor-side, i.e. 18 windows a floor; `COLUMNS` and `DOORS` mirror the same way).
- [ ] **Step 2:** Run: both false (no file).
- [ ] **Step 3:** Write `djdn.gd` (`build(world_builder)`, the shell under a node named `BUILT_NAME`), wire it in `world.gd`.
- [ ] **Step 4:** Run the checks, all true. Capture `--x=-168 --z=107.7 --zoom=56 --hour=16.5` and compare against `MAIN BUILDING FRONT.jpg` and `20261019_152823.jpg`; fix proportions.
- [ ] **Step 5:** Commit `main building: the front, wings, portico and roofs`; push.

### Task 3: The grounds and the front view

**Files:** Modify `areas/djdn.gd`, `world.gd` (`walkable_ground`, `blocked`, `floor_height`), `aps.gd` (view, cut, fast travel, checks).

**Interfaces:**
- Produces: `const DRIVE := Vector2(-171.5, -165.0)` (x), `const DRIVE_Z := Vector2(76.0, 122.0)`, `const PARKING := Vector2(-165.0, -160.2)`, `const GARDEN := Vector2(-160.2, -156.2)`, `const STEPS_FOOT := -161.1`; `static func walkable(x, z) -> bool`, `static func blocked(x, z, level := NAN) -> bool`, `static func floor_height(x, z, level := NAN) -> float` (NAN off it); `static func front_for(x, z) -> float` (1 on the drive, forecourt, parking and garden walks south of the brick apron; yields to `StudentCenter.view_for`); `const CUT_X := -171.6`.
- `aps.gd`: `var djdn_front := 0.0`, added to `_snap_follow`, `_update_camera` (eased rate 3), `_turns()` (+1 quarter turn, facing east), the focus blend (face x `FRONT`, sliding in z), and a near cut through `CUT_X` (ground line) while facing east; the chapel and MGN weights multiply by `1 - djdn_front`.

- [ ] **Step 1:** Checks: `djdn_grounds` (drive at -0.19, parking and forecourt -0.04 walkable, the garden beds and fence, the lamp posts and urn posts blocked, the porch at `FLOOR_Y` reached up the steps one riser at a time), `djdn_view_faces_front` (at (-168, 107.7) after 60 frames: `djdn_front > 0.95`, camera forward `.dot(Vector3.RIGHT) > 0.9`, the porch visible, `camera.near` past `CUT_X`), `walk_onto_drive` (from (-160, 84) holding S for 4 s: the turn goes 2 → 1 without passing 0 or 3), `no_cars_at_djdn` (no node under the Main Building or side gate whose name contains "car").
- [ ] **Step 2:** Run: false.
- [ ] **Step 3:** Build the drive (kerbs), parking pavers (grass-and-cobble: `pavers` tinted green-grey) with no cars, garden beds (palms, shrubs, urn posts, low white fence), the forecourt and swan-neck lamps, the zebra; wire the functions and the view; add fast travel `["Main Building front", Vector2(-163.0, 107.7), 40.0]`.
- [ ] **Step 4:** All checks true; captures at morning, noon, afternoon, night, wide and close vs `152817`, `152823`, `152810`.
- [ ] **Step 5:** Commit `main building: the drive, parking, garden and the view facing the front`; push.

### Task 4: The lobby

**Files:** Modify `areas/djdn.gd`, `world.gd`, `aps.gd`.

**Interfaces:**
- Produces: `const LOBBY := Rect2(-156.8, 102.2, 8.8, 11.0)`, `const BUST := Vector2(-151.0, 107.7)`, `static func inside(x, z) -> bool`, `static func floors(x, z) -> Array` (`[height, solid]` entries, like `GymInterior.floors`), `static func floor_at(x, z, level := NAN) -> float` (highest floor at most 0.5 above `level`), `static func inside_for(x, z) -> float` (1 inside, rising across the doors' last 0.8 m), `const INSIDE_WIDTH := 18.0`, `const CUT_AHEAD := 3.0` (the near plane this far west of the student), `const ROOF_GROUP := "DjdnGlassRoof"`, `const LIGHTS_GROUP := "DjdnLights"`.
- `aps.gd`: `var djdn_in := 0.0`; it joins the inside weight (zoom to `INSIDE_WIDTH`, not `HALL_WIDTH`), faces east, corridor at the student, near plane at `student.x - CUT_AHEAD` (projected on the view), ceiling `UPPER_Y + 4.4` in the lobby; lights group on while in.

- [ ] **Step 1:** Checks: `walk_into_lobby` (from the forecourt holding W/D up the steps through the middle door: on `FLOOR_Y`, `djdn_in > 0.95`, the porch's columns nearer than `camera.near`, `_all_visible` on the student), `lobby_props` (the bust, the display boards and the stair's foot blocked; the wood door leaves block between the doorways).
- [ ] **Step 2:** Run: false.
- [ ] **Step 3:** Build the lobby: marble floor (`floor` tinted `e8dccb`), wood leaves with iron lanterns, the bust and marble pedestal with its plaque, display boards, the back arcade (yellow marbled columns, arches) and three steps down to the courtyard; the double height, the mezzanine slab and railings (iron, the photo's pattern) built here, walked in Task 6.
- [ ] **Step 4:** All true; captures vs `152847`, `152853`, `152904`, `152905`.
- [ ] **Step 5:** Commit `main building: the lobby, the bust and walking in`; push.

### Task 5: The courtyard (ground floor)

**Files:** Modify `areas/djdn.gd`, `world.gd`, `aps.gd`, `areas/student_center.gd` (the gate's back opens: `_courtyard_gate` stops drawing its glow card; the wall's gap leads on).

**Interfaces:**
- Produces: `const YARD := Rect2(-146.0, 97.4, 43.0, 20.6)`, `const STAGE := Rect2(-110.0, 100.0, 7.0, 15.4)` (curved steps on its west), `const THEATRE_X := -103.0`, `const MASTS: Array[Vector2]`, `const TREES: Array[Vector2] = [Vector2(-141.0, 100.5), Vector2(-141.0, 115.3)]`, `const GATE_PASSAGE := Rect2(-107.1, 88.4, 3.0, 9.0)`; `ROOF_GROUP` built here (trusses, purlins, glass panels, vine fringes).

- [ ] **Step 1:** Checks: `courtyard_walkable` (tiles at `YARD_Y`, the ground galleries at `FLOOR_Y`, the stage at `STAGE_Y` reached up its steps; the trees, masts and theatre front blocked), `courtyard_cutaway` (at (-125, 108): `djdn_in > 0.95`, the glass roof group faded (`SHADOWS_ONLY`), forward `.dot(Vector3.RIGHT) > 0.9`), `courtyard_gate_through` (from (-105.6, 86.0) holding S reaches z > 98 in the courtyard).
- [ ] **Step 2:** Run: false.
- [ ] **Step 3:** Build the floor (red tiles: `floor` tinted `c8684a`, grey bands as 5 mm-proud strips, the circle before the stage), the ground galleries (posts, teal doors, breeze-block panels, the wings' room walls), the theatre front (LAUS DEO SEMPER, 1933, 1953, swags as `rod` chains, three arches with dark glass and the ornate centre door, grey marbled columns), the stage and curved steps, the masts with vines, the trees in round planters, bins, potted plants, the glass roof in `ROOF_GROUP`, the vines over its west edge (seen from the front), the gate passage; fade wiring in `_collect_cutaways`; fast travel `["Main Building courtyard", Vector2(-125.0, 108.0), 22.0]`, `["Main Building lobby", Vector2(-152.5, 104.5), 18.0]`.
- [ ] **Step 4:** All true; captures vs `INSIDE DJN BUILDING.jpg`, `CLOSER VIEW INSIDE DJN.jpg`, `152902`, `152900`.
- [ ] **Step 5:** Commit `main building: the courtyard, the stage and the glass roof`; push.

### Task 6: Upstairs

**Files:** Modify `areas/djdn.gd`, `aps.gd`.

**Interfaces:**
- Produces: `const STAIRS: Array` (each `[x0, x1, z0, z1, bottom, top]`, rising along x): the lobby's (north wall, rising west to the mezzanine), the north gallery's (near the lobby, rising east), the south gallery's (near the theatre, rising east); `const UPPER: Array[Rect2]` (the north and south upper galleries, the front corridor x -149..-146, the mezzanine's west and south arms), all at `UPPER_Y`.

- [ ] **Step 1:** Checks: `gallery_upstairs` (climb each stair from its foot holding the direction: ends at `UPPER_Y`; walk the ring north gallery → front corridor → south gallery; `_all_visible` on the student on the north upper gallery and under it), `gallery_no_drop` (from the upper gallery's courtyard edge and the mezzanine's void edge, moving into the void is refused: `blocked(x, z, UPPER_Y)` true just past the railing line).
- [ ] **Step 2:** Run: false.
- [ ] **Step 3:** Stairs as solid floors (risers 0.2, treads 0.3; the north one with its corrugated underside cover), the upper floor slabs with railings, the white corrugated roofs sloping to the courtyard, upper doors and windows; `floors()` returns them; fast travel `["Main Building gallery", <a spot on the north upper gallery>, 22.0]` placed with level `UPPER_Y` (extend `_travel_to` to pass a fourth element, the level).
- [ ] **Step 4:** All true; captures from both galleries.
- [ ] **Step 5:** Commit `main building: the stairs and the galleries upstairs`; push.

### Task 7: The flag circle and the walk

**Files:** Create `src/drafts/aps-godot/areas/side_gate.gd`; modify `world.gd`, `aps.gd`.

**Interfaces:**
- Produces: `const CIRCLE := Vector2(-178.5, 86.9)`, `const CIRCLE_R := 6.4`, `const CIRCLE_Y := 0.45`, `const FENCE_A := Vector2(-207.6, 102.3)`, `const FENCE_B := Vector2(-168.0, 121.2)` (the fence line's ends, 25.6°), `const GATE := Vector2(-187.4, 111.9)` (on the fence line), `static func fence_local(x, z) -> Vector2` (x along the fence from `FENCE_A`, z inward positive) and `fence_world(lx, lz) -> Vector2`; `static func walkable/blocked/floor_height`; `static func gate_for(x, z) -> float`; `const GATE_TURNS: float` (the quarter turns that face square to the fence, found by test: forward ≈ `(-0.431, 0, 0.902)`).
- `aps.gd`: `var gate_view := 0.0` with `GATE_TURNS` in `_turns()`; near cut 4 m in front of the student; `djdn_front` yields where `gate_for` is on.

- [ ] **Step 1:** Checks: `flag_circle` (the plaza at `CIRCLE_Y`, up its steps from the zebra; the pedestal and the chained posts blocked), `gate_view_faces_gate` (on the walk: forward within 0.1 of `(-0.431, 0, 0.902)`, the gatehouse inside the frame), `walk_to_gate` (from the circle holding W the student reaches within 4 m of `GATE` and stops at the turnstiles).
- [ ] **Step 2:** Run: false.
- [ ] **Step 3:** Build the mound (yellow kerbs, the three flights), the plaza (light aggregate, the eight-point star in dark aggregate with white cobble borders), the central lawn ring, granite pedestal and flagpole with the flag, the eight chained posts, royal palms tied with rope, lamps, shrubs; the walk (diamond tiles: `slab`-style squares turned 45° with dark joints and white dots), benches, bollard lights, the low black fences, the lawns and the empty parking under trees between the walk and the drive; fast travel `["Flag circle", Vector2(-178.5, 84.0), 30.0]`.
- [ ] **Step 4:** All true; captures vs `152951`, `152954`, `152959`, `153003`.
- [ ] **Step 5:** Commit `side gate: the flag circle and the walk to the gate`; push.

### Task 8: The gatehouse, the colonnade, the fence and the car gate

**Files:** Modify `areas/side_gate.gd`, `world.gd`, `aps.gd`.

**Interfaces:**
- Produces: `const COLONNADE := Vector2(a, b)` (local x range along the fence), `const COL_DEPTH := Vector2(0.4, 4.0)` (local z, from the fence inward), `static func colonnade_for(x, z) -> float`, `static func colonnade_middle(x, z) -> Vector2`, `const COL_CEILING := 3.0`, `const COL_CUT := 0.85`; the car gate at the drive's end, the guardhouse and the angel on its pedestal.
- `aps.gd`: the covered-walk cutaway branch handles `colonnade_for` (corridor = `colonnade_middle`, cut and ceiling from these).

- [ ] **Step 1:** Checks: `side_gate_built` (gatehouse, fence and car gate nodes; the fence line blocked along its length; the car gate closed), `colonnade_cutaway` (walking into the colonnade: weight > 0.95, the inner row nearer than `camera.near`, `_all_visible` on the student).
- [ ] **Step 2:** Run: false.
- [ ] **Step 3:** Build under a pivot turned to the fence: the gatehouse (white piers, the band with LAUS DEO SEMPER 1933 inside and HOLY ANGEL UNIVERSITY plus the seal outside, the glass pyramid on its frame, three steps, the turnstiles and the guard's desk, the iron gates), the colonnade (pillars with dark inset panels, cream beams, dark slat ceiling, X-pattern floor, benches, lamps), the terracotta pavilions, the iron fence with rings on cream piers over a low wall, the car gate (closed), the guardhouse, the bronze angel on its red pedestal on its lawn; fast travel `["Side gate", <inside the gatehouse's foot>, 26.0]`, `["Side gate colonnade", <under it>, 22.0]`.
- [ ] **Step 4:** All true; captures vs `153008`, `153020`, `153024`, `HAU SIDE GATE DESIGN.jpg`.
- [ ] **Step 5:** Commit `side gate: the gatehouse, the colonnade, the fence and the car gate`; push.

### Task 9: Review, documents, pull request

**Files:** `docs/godot-art-style.md` (Files table, World conventions, Camera, any new texture kind), `src/drafts/aps-godot/README.md`, `history/CONTEXT.md`, `history/sessions/2026-11-20-main-building-and-side-gate.md`.

- [ ] **Step 1:** Captures at morning, noon, afternoon, night, wide and close, at every new spot; side by side with the photos; fix what differs (separate commits per fix).
- [ ] **Step 2:** `tools\run-aps-godot.cmd --headless -- --test` all true; `npm run check`; `npm run build`.
- [ ] **Step 3:** Write the documents; commit `history: the Main Building and the side gate`; push.
- [ ] **Step 4:** Open the pull request to `main` (no AI attribution in its body).
