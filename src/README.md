# Source Code & Architecture

This folder holds all of Project HAU's code. There are two games in it:

* **`drafts/aps-godot/` - the game, in Godot 4.7.2 (2.5D).** All new work goes here. See its [README](drafts/aps-godot/README.md) and, before changing anything, [`docs/godot-art-style.md`](../docs/godot-art-style.md).
* **`game/` and `engine/` - the first browser prototype (2D side view, TypeScript).** Frozen: it still runs and is kept as a reference, but it gets no new features.
* `drafts/aps-browser/` - the Three.js 2.5D trial of APS (`aps-3d.html`), also frozen. It was the step between the two.

## Technical Stack
* **Engine:** Godot 4.7.2 stable, Forward+ renderer. Everything is built from GDScript: no imported 3D models and no photo textures.
* **Characters:** sprite sheets in `drafts/aps-godot/sprites/`, built from the sources in `assets/drafts/characters/`.
* **Campus plan:** the team's plan in `game/campus/plan.ts` (from OpenStreetMap and the aerial photo) is exported to Godot as `drafts/aps-godot/campus_plan.gd` by `npm run export:godot-plan`. Both games stand on it.
* **Browser prototype:** our own engine in TypeScript on the canvas, Vite for dev and builds (dev dependencies only). Three.js only in the APS trial.
* **Version Control:** Git, a branch and a pull request per change.

## The Godot Game (`drafts/aps-godot/`)
* `aps.gd` - the pixel buffer, camera and its zones, time of day, UI, input, the headless checks and captures, and the fast-travel places.
* `world.gd` - APS, the canteen, patio and street, and the shared helpers: materials, procedural textures, `framed_window()`, collision and floor heights.
* `areas/` - one file per building or area, each on its own plot of the campus plan: `chapel`, `hallway`, `gym`, `gym_interior`, `sjh`, `mgn`, `middle_road`, and `plots` for the buildings not built yet.
* `roads.gd` - the loop road round the chapel lawn.
* `student.gd`, `npc.gd`, `npcs.gd` - the player, one NPC, and the cast with their talk scripts.
* `audio.gd`, `atmosphere.gd` - synthesised sound (no audio files), and rain, wet ground, light shafts and leaves.
* `shaders/` - edges, leaves, sky, light shafts and the display grade.

To add a building, follow "Adding a new building or area" in `docs/godot-art-style.md`: it goes in `areas/<id>.gd` on its plot, gets a camera zone, its fast-travel spots and checks.

## Checks
* Godot: `tools\run-aps-godot.cmd --headless -- --test` prints a JSON report; every check must be `true`.
* Everything: `npm run check` (type check) and `npm run build` must both pass.

## The Browser Prototype (frozen)
Run it with `npm install`, then `npm run dev`, and open http://localhost:5173.

* `engine/` - reusable parts that know nothing about HAU: display buffer, game loop, input, camera, lighting, particles, time of day, audio, pixel drawing helpers.
* `game/campus/` - the campus plan. `plan.ts` says where every building is, in metres from the chapel; `streets.ts` turns that into where things go in each scene. **Change positions here, not in the scenes.** See `docs/campus-layout.md`. The Godot game reads this plan too.
* `game/art/` - everything you see is drawn by code here (buildings, props, characters, sky).
* `game/sprites/` - the boy's and girl's PixelLab sprite sheets.
* `game/scenes/` - one file per location. `kit.ts` has the parts the streets share.
* `game/story/` - NPCs, dialogue, cutscene scripts and the checklist.
* `game/ui/` - speech bubbles, phone, title screen, character picker, campus map.
* `game/cutscene.ts` - plays a cutscene: a list of steps like `{ walk: 300 }`, `{ say: [...] }`, `{ pause: 1 }`, `{ sound: 'beep' }`. See the `Step` type in `game/types.ts`, and `story/gate.ts` for a worked example.

### Dev Shortcuts
Add these to the URL to jump straight somewhere while testing:

`http://localhost:5173/?area=courtyard&x=500&hour=19&talk=bea`

* `area` - `gate`, `park`, `plaza`, `lobby`, `courtyard`, `walkway`, `lane`, `halls`, `aps`, `lawn`, `mgn`, `sjh`, `gym`, `canteen` or `apslobby` (`?area=gate` with no flags plays the bag check cutscene; add `&flags=passed_bag_check` to skip it)
* `x` - where to stand
* `hour` - time of day, 0 to 24
* `talk` - start talking to an NPC by id
* `flags` - comma-separated story flags to set
* `phone` - open the phone
* `map` - open the campus map
* `rain` - start raining, 0 to 1 (`rain=1` is a downpour)
* `pesos` - how much baon to start with (default 150)
* `warm` - simulate this many seconds before the first frame
* `lang` - `en` plays in English, `tl` in Tagalog (doesn't change the language saved on this browser)

Any of these also turns the save game off for that run, so testing never touches your real progress.

**L** switches between Tagalog and English, on the title screen or in the game. See `game/lang.ts`; `npm run check:translations` checks the English (see `docs/translation-review.md`).

In the game, **C** opens the campus map. W/S picks a place and E jumps there. The minimap in the top right is the same map, zoomed in.

### Checking the Scene Links
With `npm run dev` running, `npm run check:links` opens a headless Chrome, presses E on every hotspot in every area and reports what each one does. It fails if a way out points at an area or spawn point that does not exist, if a hotspot cannot be reached, or if a street has no way back. It needs Chrome installed; see the top of `tools/check-links.mjs`.

In the dev server the running game is also available in the browser console as `hau`.

## Coding Standards
* Keep scripts modular: one building per area file, the cast separate from the NPC, sound separate from the scene.
* Comment the why, especially around camera zones, cutaways, collision and talk scripts.
* Match the code around you, and keep `main.tscn` a single node so diffs stay readable.
