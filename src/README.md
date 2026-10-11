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
* `game/art/` - everything you see is drawn by code here (building, props, characters, sky). There are no image files yet.
* `game/scenes/` - one file per location: `plaza`, `lobby`, `courtyard`, `park`.
* `game/story/` - NPCs, dialogue and the checklist. **Writers: this is the folder to edit.**
* `game/ui/` - speech bubbles, phone, title screen.

## Dev Shortcuts
Add these to the URL to jump straight somewhere while testing:

`http://localhost:5173/?area=courtyard&x=500&hour=19&talk=bea`

* `area` - `plaza`, `lobby`, `courtyard` or `park`
* `x` - where to stand
* `hour` - time of day, 0 to 24
* `talk` - start talking to an NPC by id
* `flags` - comma-separated story flags to set
* `phone` - open the phone
* `warm` - simulate this many seconds before the first frame

Any of these also turns the save game off for that run, so testing never touches your real progress.

## Future Coding Standards
* Keep scripts modular (e.g., the quest tracker should be completely separate from the player movement script).
* Comment your code heavily, especially around complex quest triggers and UI interactions.