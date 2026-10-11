# Project Context

Last updated: 2026-10-11

## What This Is
A free-roam, side-view pixel art game set on the Holy Angel University campus in Angeles City. It is inspired by the feel of *Until Then* (everyday Filipino student life, soft lighting, speech bubbles, a phone) without copying it. It is a student project, not an official university product, and every character is fictional.

## Decisions So Far
| Decision | Choice | Why |
| --- | --- | --- |
| Camera | Side-view with parallax layers | Closest to the look we want; free roam comes from doors and connected scenes |
| Engine | Our own, TypeScript on the browser canvas | Wanted everything written from scratch; easy to run and share |
| Later | Port to Godot 4 | Decided up front; do it once the prototype's look and feel are settled |
| Language | Taglish with a little Kapampangan | Sounds like actual students here |
| Scope | One area at a time | Done: DJN Building, Epiphany of Angels park. Next: School of Computing (needs reference photos first) |
| Saving | Autosave to the browser | No menus to build; Enter continues, N starts over |
| Art | Drawn by code, no image files yet | Lets the time-of-day lighting recolour everything; replace with real sprites later |

## What Exists
Four connected areas that form a loop (plaza -> lobby -> courtyard -> park -> plaza):

* **Plaza** (`src/game/scenes/plaza.ts`) - driveway, fountain, Guardian Angel statue, Gate 1. NPCs: Kuya Ramil (guard), Mang Dado (tricycle), Trisha, Jopet.
* **Lobby** (`src/game/scenes/lobby.ts`) - bust of Juan D. Nepomuceno, bulletin board, Center for Kapampangan Studies door. NPC: Ate Liza.
* **Courtyard** (`src/game/scenes/courtyard.ts`) - Laus Deo Semper arch, trees, string lights. NPCs: Bea, Migs, Mingming the cat.
* **Park** (`src/game/scenes/park.ts`) - covered walk, Memorare stone, Holy Guardian Angel and seven archangels, the seal in the road. NPCs: Kath, Mang Bong, Enzo.

Systems: time-of-day cycle, light map with lamps and window glow, particles (fountain, leaves, fireflies, dust), speech-bubble dialogue with choices, phone with an eight-item checklist, title screen, synthesised audio, autosave.

## Where Things Live
* `src/engine/` - generic engine parts. Knows nothing about HAU.
* `src/game/art/` - all drawing code (building, props, characters, sky, palette).
* `src/game/scenes/` - one file per location.
* `src/game/story/` - NPCs, dialogue, checklist. **Writers edit here.**
* `src/game/ui/` - bubbles, HUD, phone, title.
* `src/game/game.ts` - ties it together: scene travel, flags, tasks, audio.

See `src/README.md` for the URL shortcuts that jump to any scene, position and time of day while testing.

## How Story State Works
* Flags are plain strings in a set (`met_bea`, `saw_bust`, ...). A dialogue line can set one with `set: 'flag'`.
* `src/game/story/tasks.ts` lists the checklist; each task is ticked by a flag.
* An area can name a `visitFlag` that is set the first time the player walks in.
* Progress autosaves to `localStorage` (`project-hau-save-v1`). If you rename or remove flags, bump that key so old saves are ignored.
* An NPC's `talk(game)` returns the lines to say, so it can branch on `game.has('flag')`.

## Needs Checking by a Human
* **Dialogue:** written by a non-native speaker. Proofread all Taglish and especially the Kapampangan phrases ("Mayap a gatpanapun", "Dakal a salamat").
* **History facts** in the lobby dialogue (built 1940, founded 1933 with 78 students, used as barracks in the war) came from Wikipedia, the HAU history page and the Angeles City tourism site. Verify before showing this officially.
* **Interiors** are an interpretation from a few photos, not the real floor plan.
* **Memorare text** in the park is a paraphrase of the marker. Check it against the real stone.
* **Archangel names** are not in the game; the plaques were unreadable in the photos.
* **Audio** has never been listened to critically. It may need rebalancing.
* **University permission** for using the HAU name and likeness has not been asked for yet.

## Not Done Yet
* No touch controls (it loads on a phone but you cannot move).
* School of Computing area (signposted in the park, coned off). Needs reference photos before it can be drawn.
* University Chapel and the library building, both mentioned in sources but not built.
* Real sprite art and recorded audio.
* The Godot 4 port.
* The older `docs/`, `assets/` and `tools/` READMEs still describe the original top-down plan in places.
