# Project Context

Last updated: 2026-10-14 (the campus map redrawn to match the aerial photo; before that, the fountain plaza in front of SFJ, buildings from photos, the side gate and the opening screens)

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
| Campus map | Follows the aerial photo where OSM disagrees with it; roofs in the photo's colours | Sean wants the C map to look like `Aerial shot of HAU enclosed in red line.png`. OSM is 7 to 14 m off the photo on the west side. Traced outlines are `TRACED` in `plan.ts`; only the map uses them, the scenes still use `blocks`. The map keeps its angle (walkway left to right), Sean's choice |
| Map teleport | Pick any place on the C map and jump there | Stand-in while the campus is only partly walkable. Switch off with `TELEPORT` in `src/game/ui/map.ts` once it is all joined up on foot |

## What Exists
Twelve connected areas. See `docs/campus-layout.md` for the plan they are built from and a diagram of how they join.

The first five, with people and story:

* **Side Gate** (`src/game/scenes/gate.ts`, art in `src/game/art/gate.ts` and `src/game/art/traffic.ts`; the scene id is still `gate`) - the gate by the Main Building that students come in by, seen from the street and drawn from a photo: the white gatehouse with the seal, HOLY ANGEL UNIVERSITY in black letters and the glass roof, the iron fence, the barricades at the kerb, and cars, jeepneys and tricycles going by between you and the camera. A red pickup is parked up on the sidewalk by a NO PARKING sign. **The checkpoint is under the gatehouse roof**: two bag tables and two ID turnstiles. NPCs: Enforcer Dante (ACTDO), Mikko Panergo (the pickup's owner, named for our teammate at Sean's asking), Kuya Nonoy and Ate Joy (guards), Manong Taho; Ella is here only for the arrival cutscene. Cutscenes: `gateArrival` (you come up to the pickup and complain to the enforcer, the owner runs up saying "sandali lang po" and gets his ticket anyway, then you walk in and get your bag checked), then pressing E at the reader to tap your ID (the first tap fails because it's still in its plastic case). **Tapping in walks you through the gate, away from the camera, and sets you down in front of the Main Building.** The turnstiles are as far as you can walk in this scene. On the campus map the scene sits at the gate beside the Main Building.
* **Epiphany of Angels** (`src/game/scenes/park.ts`) - the road in from the main gate: four stone angels on each side, the covered shed, the seal in the pavers, the Memorare stone, the road stops at a stand of trees, and past them is the round patterned plaza with the pool of jets in the middle, in front of the steps of the San Francisco de Javier Building, all drawn from photos (`src/game/art/sfj.ts`). NPCs: Kath, Mang Bong, Enzo. Leads on to the front of the Main Building.
* **Plaza** (`src/game/scenes/plaza.ts`) - the front of the Main Building: the rotunda with the Holy Guardian Angel statue in its brick fountain basin (from a photo), the DJN Building, the bronze guardian angel on its lawn beside the building, and the gate at the right-hand end, which is where you arrive from the gate scene and where you go back out. NPCs: Ella (the freshman from the gate line), Kuya Ramil (guard), Mang Dado (tricycle), Trisha, Jopet. The parking lane, the chapel walkway and the Epiphany all leave from the rotunda.
* **Lobby** (`src/game/scenes/lobby.ts`) - bust of Juan D. Nepomuceno, bulletin board, Center for Kapampangan Studies door. NPC: Ate Liza.
* **Courtyard** (`src/game/scenes/courtyard.ts`) - drawn from two photos: the old theatre front with LAUS DEO SEMPER between 1933 and 1953 under its garlands, the stage with curved terrazzo steps, a staircase each side up to the second-floor corridor, the steel and glass roof and the hanging vines. NPCs: Bea, Migs, Mingming the cat. Its gate comes out on the chapel walkway.

The seven campus streets, outsides only, no people yet:

* **Chapel Walkway** (`walkway.ts`) - brick sidewalk from the rotunda to the lawn, past STL and the PGN tower. Lamps and waving flags.
* **Parking Lane** (`lane.ts`) - STL with the PGN tower over it; SFJ is behind the camera.
* **Back Road** (`halls.ts`) - warehouse, Yellow Food Court, St. Gabriel, St. Raphael and St. Michael Halls, GGN.
* **APS** (`aps.ts`) - the Archbishop Pedro Santos Building and Sacred Heart.
* **Chapel lawn** (`lawn.ts`) - the Chapel of the Holy Guardian Angel across its lawn, the formation center behind. The junction the campus turns on.
* **St. Joseph Hall** (`sjh.ts`) - SJH, MGN and the corner of the gym. The School of Computing sign is here.
* **Gym lane** (`gym.ts`) - Covered Court, Immaculate Heart Gymnasium, the annex.

Every building's door names it, gives its number on the 2022 campus map and the offices inside, and says it is not open yet.

Systems: time-of-day cycle, light map with lamps and window glow, particles (fountain, leaves, fireflies, dust), speech-bubble dialogue with choices and a portrait of the speaker, faces and emotes, cutscenes with letterbox bars, phone with a nine-item checklist, campus map on the C key (pixel art, painted from the plan, with teleport) and a minimap in the top right, baon (allowance) money, rain that comes and goes with umbrellas, title screen, character picker and name entry, synthesised audio, autosave.

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
* **Faces:** a line can say how the speaker looks, `face: 'happy'` (neutral, happy, sad, angry, surprised, worried, shy, smug). It shows on the sprite, in the arms when standing still, and in the bubble's portrait (`art/portrait.ts`), and pops an emote unless the line picks its own with `emote` ('!', '?', '...', 'note', 'anger', 'sweat', 'heart', 'none'). Only the side gate lines are tagged so far.
* A cutscene is `game.play(steps)` from a hotspot, or an area's `intro(game, x)` that returns steps when you walk in. Steps: `walk`, `place`, `face`, `say`, `pause`, `sound`, `look` (swap what the player wears), `walkIn` / `walkOut` (into or out of a doorway, seen from behind or the front) and `run` (anything else). The game never saves in the middle of one.
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
* **The campus plan.** Buildings come from OpenStreetMap, except where the aerial photo disagrees: on the map, buildings 1, 2, 5 to 10, 15 and 16 are traced off the photo (2026-10-14). The street scenes did not move with them, so the Back Road scene has the halls about 12 m from where the map shows them. Still a guess: which of halls 7 and 8 is St. Gabriel (OSM and the 2022 campus map disagree; the photo labels the whole courtyard building St. Gabriel). `docs/campus-layout.md` lists the rest.
* **What the buildings look like.** The DJN and its courtyard, the Epiphany, the rotunda statue and fountain, the walkway, St. Joseph Hall (`art/sjh.ts`), SFJ and its pool (`art/sfj.ts`) and the gatehouse were drawn from photos. Floor counts on SJH and SFJ were counted off one photo each and squeezed to fit the screen, so check them. Every other building uses a generic facade with guessed colours and floor counts.
* **Door text** on every building lists offices from the 2022 campus map. Offices move; check them.
* **The gate.** The gatehouse, fence and barricades are from the photo `HAU SIDE GATE DESIGN.jpg`; the tent, tables and turnstile are still guesses. The scene is still called "Main Gate" on Sto. Rosario St. and the photo's file name says "side gate": **confirm which gate this is and which street it is on**, and whether the Epiphany's gate is a different one. Until then the gate scene opens on to the Main Building and also keeps a path to the Epiphany. The guard house at the plaza end still says "GATE 1".
* **Memorare text** in the park is a paraphrase of the marker. Check it against the real stone.
* **Archangel names** are not in the game; the plaques were unreadable in the photos.
* **Audio** has never been listened to critically. It may need rebalancing.
* **University permission** for using the HAU name and likeness has not been asked for yet.

## Planned Next
See `sessions/2026-10-12-minimap-teleport-and-plans.md` for the details.
* **Photo trip, Tuesday 2026-10-13.** The shot list is in that session file. Fix the maps from the photos afterwards, Main Gate first.
* **Characters easier to tell apart.** One signature feature each (hair, glasses, build, accessories), then talking and idle animations. Trisha, Bea, Kath and Ella currently look almost the same.
* **Close-up cutscenes.** Bubble portraits drawn by code from each `Look` exist now; full-screen close-ups do not. Hand-drawn art may replace both later.
* **Faces on the rest of the dialogue.** Only `story/gate.ts` (and Ella) are tagged.
* **Quest "Ang Ikaapat na Piso"** (Jopet), drafted in `docs/drafts/` on branch `quest-ikaapat-na-piso`. It needs a day system, close-ups, the library and the SOC org room.

## Not Done Yet
* **Interiors of every building except the DJN.** Waiting on reference photos of each one. Do not guess at them.
* **People on the seven new streets.** They are empty.
* The plaza and the main gate scenes are not to scale (see `docs/campus-layout.md`).
* The other gates on the gate-area diagram: Guardian Angel, St. Raphael, St. Uriel and the pedestrian gate.
* No touch controls (it loads on a phone but you cannot move).
* Real sprite art and recorded audio. `assets/drafts/girl-test/` is a test of sprite sheets made from one AI-generated girl image (idle, front walk, talking with expressions). The game does not use it.
* The Godot 4 port.
* The reference images in `assets/` are committed as of 2026-10-12, at Sean's decision, so the team shares them. They are Google Earth, university and found-online material, references only: the game does not load them.
* The older `docs/`, `assets/` and `tools/` READMEs still describe the original top-down plan in places.
