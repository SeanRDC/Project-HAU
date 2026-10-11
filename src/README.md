# Source Code & Architecture

This folder contains the core game engine project and source code for Project HAU. 

## The `drafts/` Sandbox
The `src/drafts/` folder is your coding playground. Use this space for:
* Testing out a new movement controller.
* Prototyping a quest dialogue system.
* Trying out experimental engine features.
Code in this folder will not be included in the final game build, so feel free to break things!

## Production Code (`core/`)
Once a system (like the player controller or dialogue manager) is tested and approved, it should be rewritten cleanly and moved into the `src/core/` directory.

## Technical Stack
* **Engine (for now):** our own, written from scratch in TypeScript on the browser canvas. No game libraries.
* **Tooling:** Vite + TypeScript (dev dependencies only)
* **Later:** port to Godot 4 once the prototype feels right
* **Version Control:** Git

## Layout
* `engine/` - reusable parts that know nothing about HAU: display buffer, game loop, input, camera, lighting, particles, time of day, audio, pixel drawing helpers.
* `game/campus/` - the campus plan. `plan.ts` says where every building is, in metres from the chapel; `streets.ts` turns that into where things go in each scene. **Change positions here, not in the scenes.** See `docs/campus-layout.md`.
* `game/art/` - everything you see is drawn by code here (buildings, props, characters, sky). There are no image files yet.
* `game/scenes/` - one file per location. The first five (`gate`, `park`, `plaza`, `lobby`, `courtyard`) and the seven campus streets (`walkway`, `lane`, `halls`, `aps`, `lawn`, `sjh`, `gym`). `kit.ts` has the parts the streets share.
* `game/story/` - NPCs, dialogue, cutscene scripts and the checklist. **Writers: this is the folder to edit.**
* `game/ui/` - speech bubbles, phone, title screen.
* `game/cutscene.ts` - plays a cutscene: a list of steps like `{ walk: 300 }`, `{ say: [...] }`, `{ pause: 1 }`, `{ sound: 'beep' }`. See the `Step` type in `game/types.ts`, and `story/gate.ts` for a worked example.

## Dev Shortcuts
Add these to the URL to jump straight somewhere while testing:

`http://localhost:5173/?area=courtyard&x=500&hour=19&talk=bea`

* `area` - `gate`, `park`, `plaza`, `lobby`, `courtyard`, `walkway`, `lane`, `halls`, `aps`, `lawn`, `sjh` or `gym` (`?area=gate` with no flags plays the bag check cutscene; add `&flags=passed_bag_check` to skip it)
* `x` - where to stand
* `hour` - time of day, 0 to 24
* `talk` - start talking to an NPC by id
* `flags` - comma-separated story flags to set
* `phone` - open the phone
* `map` - open the campus map
* `warm` - simulate this many seconds before the first frame

Any of these also turns the save game off for that run, so testing never touches your real progress.

In the game, **C** opens the campus map. W/S picks a place and E jumps there (a stand-in until the whole campus is joined up on foot; switch it off with `TELEPORT` in `game/ui/map.ts`). The minimap in the top right is the same map, zoomed in.

## Checking the Scene Links
With `npm run dev` running, `npm run check:links` opens a headless Chrome, presses E on every hotspot in every area and reports what each one does. It fails if a way out points at an area or spawn point that does not exist, if a hotspot cannot be reached, or if a street has no way back. Run it after adding or re-joining scenes. It needs Chrome installed; see the top of `tools/check-links.mjs`.

In the dev server the running game is also available in the browser console as `hau`.

## Future Coding Standards
* Keep scripts modular (e.g., the quest tracker should be completely separate from the player movement script).
* Comment your code heavily, especially around complex quest triggers and UI interactions.