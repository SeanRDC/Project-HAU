# Game Design & Documentation

This folder holds how the game is built and what goes in it: the Godot style guide, the campus plan, and quest ideas.

## Read First
* **`godot-art-style.md`** - the single source of truth for the Godot game: style pillars, world conventions, the campus plan and how to merge a building, the pixel pipeline, materials, geometry, foliage, lighting, weather, shadows, shaders, characters, the camera, collision and floors, interiors and the cutaway, and the checks to run before a pull request. **If you change a style value, update this file in the same change.**

## Master Documents
* `godot-art-style.md` - see above.
* `campus-layout.md` - how the real campus maps onto the game: the chapel anchor, the scale, the streets, the 21 buildings, and what is still a guess. The Godot game stands on the same plan (`campus_plan.gd`).
* `aps-visual-benchmark.md` - the Until Then-inspired pass on APS that started the 2.5D direction (browser era, kept for reference).
* `translation-review.md` - English lines in the browser prototype that need a person to decide.

## Current Objectives
* Build the remaining campus buildings in Godot, each on its reserved plot (`areas/<id>.gd`).
* Give the NPCs more to say, and have a native speaker check the Taglish and Kapampangan.
* Bring the browser prototype's story (the side gate arrival, the checklist, the baon) into Godot.
* Decide the wet-ground-in-rain exception to the matte rule (waiting for Sean).

## The `drafts/` Folder
If you have an idea for a quest or a campus secret, pitch it here:
1. Create a Markdown (`.md`) file in the `drafts/` subfolder.
2. Title it clearly (e.g., `quest_find_lost_usb.md` or `npc_cafeteria_vendor.md`).
3. Outline the idea and bring it up in our next team sync.

`drafts/quest_ang_ikaapat_na_piso.md` is the first one (Jopet's quest). It needs a day system, close-ups, the library and the SOC org room.

Approved ideas move up here to form our Game Design Document (GDD) and Quest Log.
