# Project Context

Last updated: 2026-10-12 (Baon and rain; character and name; real building outlines from OpenStreetMap)

## What This Is
A free-roam, side-view pixel art game set on the Holy Angel University campus in Angeles City. It is inspired by the feel of *Until Then* (everyday Filipino student life, soft lighting, speech bubbles, a phone) without copying it. It is a student project, not an official university product, and every character is fictional.

## Decisions So Far
| Decision | Choice | Why |
| --- | --- | --- |
| Camera | Side-view with parallax layers | Closest to the look we want; free roam comes from doors and connected scenes |
| Engine | Our own, TypeScript on the browser canvas | Wanted everything written from scratch; easy to run and share |
| Later | Port to Godot 4 | Decided up front; do it once the prototype's look and feel are settled |
| Language | Taglish with a little Kapampangan | Sounds like actual students here |
| Scope | The whole campus outdoors first, interiors after | Done: all 21 buildings from the outside, on ten connected outdoor scenes. Interiors (other than the DJN lobby and courtyard) wait for reference photos of each one |
| Layout | One-to-one with the real campus, anchored on the chapel | Buildings come from OpenStreetMap (`npm run import:osm` writes `src/game/campus/osm.ts`); gates, junctions, GGN and the Formation Center from an aerial photo. All of it goes into `src/game/campus/plan.ts` and the scenes are placed from it. Scale set by one Google Earth measurement (140.36 m, rotunda statue to the chapel), which OSM confirmed to 0.6% |
| Scale | 9 game pixels per metre | The DJN Building and the angel pedestals were already drawn at about this |
| Camera per street | Each street picks the side with the most to see | A side view only shows one side of a road. Buildings behind the camera get a sign and a "look back" hotspot |
| Saving | Autosave to the browser | No menus to build; Enter continues, N starts over |
| Art | Drawn by code, no image files yet | Lets the time-of-day lighting recolour everything; replace with real sprites later |
| Player | Choose Boy or Girl, then type a name, before a new game | Same rig for both (`Look`), so the girl is just a different look; the name only labels the player's speech bubbles |
| Opening | New games start outside the Main Gate with a cutscene | Bag check and ID tap are the first thing every HAU student does each day |
| Cutscenes | A list of steps in the story files, played by `src/game/cutscene.ts` | Writers can script scenes without touching the engine; no timeline editor to build |
| Map teleport | Pick any place on the C map and jump there | Stand-in while the campus is only partly walkable. Switch off with `TELEPORT` in `src/game/ui/map.ts` once it is all joined up on foot |

## What Exists
Twelve connected areas. See `docs/campus-layout.md` for the plan they are built from and a diagram of how they join.

The first five, with people and story:

* **Main Gate** (`src/game/scenes/gate.ts`, art in `src/game/art/gate.ts`) - Sto. Rosario St. sidewalk, the gateway with the HAU name board, the bag inspection tent with two tables, the ID turnstile, and the boom barrier on the inside. NPCs: Kuya Nonoy and Ate Joy (guards), Ella (freshman), Manong Taho. Cutscenes: walking in and getting your bag checked (`gateArrival`), then pressing E at the reader to tap your ID (the first tap fails because it's still in its plastic case). The turnstile won't let you in until `scanned_id` is set. Leads in to the Epiphany of Angels.
* **Epiphany of Angels** (`src/game/scenes/park.ts`) - the road in from the main gate: four stone angels on each side, the covered shed, the seal in the pavers, the Memorare stone, and the fountain plaza in front of SFJ. NPCs: Kath, Mang Bong, Enzo. Leads on to the front of the Main Building.
* **Plaza** (`src/game/scenes/plaza.ts`) - the front of the Main Building: the rotunda with the Holy Guardian Angel statue fountain, the DJN Building, the bronze guardian angel on its lawn beside the building, St. Barachiel Gate (vehicles only). NPCs: Kuya Ramil (guard), Mang Dado (tricycle), Trisha, Jopet. The parking lane, the chapel walkway and the Epiphany all leave from the rotunda.
* **Lobby** (`src/game/scenes/lobby.ts`) - bust of Juan D. Nepomuceno, bulletin board, Center for Kapampangan Studies door. NPC: Ate Liza.
* **Courtyard** (`src/game/scenes/courtyard.ts`) - Laus Deo Semper arch, trees, string lights. NPCs: Bea, Migs, Mingming the cat. Its gate comes out on the chapel walkway.

The seven campus streets, outsides only, no people yet:

* **Chapel Walkway** (`walkway.ts`) - brick sidewalk from the rotunda to the lawn, past STL and the PGN tower. Lamps and waving flags.
* **Parking Lane** (`lane.ts`) - STL with the PGN tower over it; SFJ is behind the camera.
* **Back Road** (`halls.ts`) - warehouse, Yellow Food Court, St. Gabriel, St. Raphael and St. Michael Halls, GGN.
* **APS** (`aps.ts`) - the Archbishop Pedro Santos Building and Sacred Heart.
* **Chapel lawn** (`lawn.ts`) - the Chapel of the Holy Guardian Angel across its lawn, the formation center behind. The junction the campus turns on.
* **St. Joseph Hall** (`sjh.ts`) - SJH, MGN and the corner of the gym. The School of Computing sign is here.
* **Gym lane** (`gym.ts`) - Covered Court, Immaculate Heart Gymnasium, the annex.

Every building's door names it, gives its number on the 2022 campus map and the offices inside, and says it is not open yet.

Systems: time-of-day cycle, light map with lamps and window glow, particles (fountain, leaves, fireflies, dust), speech-bubble dialogue with choices, cutscenes with letterbox bars, phone with a nine-item checklist, campus map on the C key (pixel art, painted from the plan, with teleport) and a minimap in the top right, baon (allowance) money, rain that comes and goes with umbrellas, title screen, character picker and name entry, synthesised audio, autosave.

## Where Things Live
* `src/engine/` - generic engine parts. Knows nothing about HAU.
* `src/game/campus/` - the campus plan: where every building is (`plan.ts`) and how that becomes scenes (`streets.ts`). **Move things here, not in the scenes.**
* `src/game/art/` - all drawing code (buildings, props, characters, sky, palette). `buildings.ts` is the facade painter for everything that is not the DJN.
* `src/game/scenes/` - one file per location. `kit.ts` has what the street scenes share.
* `src/game/story/` - NPCs, dialogue, checklist. **Writers edit here.**
* `src/game/ui/` - bubbles, HUD, phone, title, character picker (`select.ts`).
* `src/game/game.ts` - ties it together: scene travel, flags, tasks, audio.
* `tools/check-links.mjs` - `npm run check:links` presses E on every hotspot and checks the scenes still join up.

See `src/README.md` for the URL shortcuts that jump to any scene, position and time of day while testing.

## How Story State Works
* Flags are plain strings in a set (`met_bea`, `saw_bust`, ...). A dialogue line can set one with `set: 'flag'`.
* `src/game/story/tasks.ts` lists the checklist; each task is ticked by a flag.
* An area can name a `visitFlag` that is set the first time the player walks in.
* Progress autosaves to `localStorage` (`project-hau-save-v1`). If you rename or remove flags, bump that key so old saves are ignored. The save also holds `character` (`boy` or `girl`), `name`, `pesos`, the last purchase and the weather; saves without them load as the boy with no name, ₱150 and dry weather, so the key was not bumped.
* The player's look: `src/game/art/player.ts` holds both looks and the chosen one (`baseLook()`). Areas and cutscenes reset to it, so never use a fixed look for the player. Dev shortcuts: `?char=girl&name=Mikko`.
* Title flow: Enter continues a save, or opens the picker (A/D, Enter), then the name box (type, Enter). N with a save opens the picker too and only wipes the save once you confirm; Esc backs out.
* An NPC's `talk(game)` returns the lines to say, so it can branch on `game.has('flag')`.
* A cutscene is `game.play(steps)` from a hotspot, or an area's `intro(game, x)` that returns steps when you walk in. Steps: `walk`, `place`, `face`, `say`, `pause`, `sound`, `look` (swap what the player wears) and `run` (anything else). The game never saves in the middle of one.
* An area can have a `barrier`: an x the player can't cross leftwards until a flag is set.
* Main Gate flags: `passed_bag_check`, `id_fumble`, `scanned_id`, `met_joy`, `met_ella`.
* **Money:** a line with `pesos: -20, item: 'Taho'` spends ₱20 when it is shown (positive gives money). `g.pesos()` says how much is left, so a talk function can offer a cheaper line when the player is short. `buy()` in `story/streets.ts` makes a menu choice that does both. New games start with ₱150 (`BAON` in `game.ts`).
* **Weather:** `g.raining()` is true while it rains, for lines like Manong Taho's and Mang Bong's. Rain is in `src/game/weather.ts`.
* `gave_piso` is set when you give Jopet a coin (his quest draft uses it).
* Campus flags: `visited_chapel` (walked onto the lawn), `saw_chapel` (looked at the chapel). Neither is a checklist task yet.

## Needs Checking by a Human
* **Dialogue:** written by a non-native speaker. Proofread all Taglish and especially the Kapampangan phrases ("Mayap a gatpanapun", "Dakal a salamat").
* **History facts** in the lobby dialogue (built 1940, founded 1933 with 78 students, used as barracks in the war) came from Wikipedia, the HAU history page and the Angeles City tourism site. Verify before showing this officially.
* **Interiors** are an interpretation from a few photos, not the real floor plan.
* **The campus plan.** Buildings now come from OpenStreetMap and are good to a metre or two. Still guesses: GGN and the Formation Center (not in OSM; trace them there and re-run `npm run import:osm`), building 1 (unnamed in OSM), and which of halls 7 and 8 is St. Gabriel (OSM and the 2022 campus map disagree). `docs/campus-layout.md` lists the rest.
* **What the buildings look like.** Only the DJN, the Epiphany, the rotunda statue and the walkway were drawn from photos. Every other building uses a generic facade with guessed colours and floor counts.
* **Door text** on every building lists offices from the 2022 campus map. Offices move; check them.
* **Main Gate** was drawn without reference photos, from how campus gates here usually look. The name board, tent, tables and turnstile layout are guesses. Compare with the real gate and fix the art in `src/game/art/gate.ts`. The main gate is the Sto. Rosario Gate; the "GATE 1" lettering on the guard house at St. Barachiel Gate is left over and should be renamed.
* **Memorare text** in the park is a paraphrase of the marker. Check it against the real stone.
* **Archangel names** are not in the game; the plaques were unreadable in the photos.
* **Audio** has never been listened to critically. It may need rebalancing.
* **University permission** for using the HAU name and likeness has not been asked for yet.

## Planned Next
See `sessions/2026-10-12-minimap-teleport-and-plans.md` for the details.
* **Photo trip, Tuesday 2026-10-13.** The shot list is in that session file. Fix the maps from the photos afterwards, Main Gate first.
* **Characters easier to tell apart.** One signature feature each (hair, glasses, build, accessories), then talking and idle animations. Trisha, Bea, Kath and Ella currently look almost the same.
* **Close-up cutscenes** with portraits drawn by code from each `Look`, replaced later by hand-drawn art.
* **Quest "Ang Ikaapat na Piso"** (Jopet), drafted in `docs/drafts/` on branch `quest-ikaapat-na-piso`. It needs a day system, close-ups, the library and the SOC org room.

## Not Done Yet
* **Interiors of every building except the DJN.** Waiting on reference photos of each one. Do not guess at them.
* **People on the seven new streets.** They are empty.
* The plaza and the main gate scenes are not to scale (see `docs/campus-layout.md`).
* The other gates on the gate-area diagram: Guardian Angel, St. Raphael, St. Uriel and the pedestrian gate.
* No touch controls (it loads on a phone but you cannot move).
* Real sprite art and recorded audio.
* The Godot 4 port.
* The reference images in `assets/` are not committed (they are Google Earth and university material). Share them with the team another way.
* The older `docs/`, `assets/` and `tools/` READMEs still describe the original top-down plan in places.
