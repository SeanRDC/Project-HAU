# Campus Layout

How the real Holy Angel University campus is laid out in the game, where the numbers come from, and how to correct them.

The goal is a one-to-one copy of the campus: every building in its real place, real distances between them, at one scale. This document describes the first pass. It was built from four sources and is only as good as they are. More photos will make it better.

## Sources

All in `assets/` (not committed, see "Reference images" below):

| File | What it gave us |
| --- | --- |
| `Aerial shot of HAU enclosed in red line.png` | Where every building is. **Every position in the game is a pixel read off this picture.** |
| `haucampusmap_2022.jpg` | The 21 building numbers and names, and which offices are in each. |
| `aerial diagram close to epiphany of angels.png` | The gates, the fountain plaza, the rotunda and the covered sheds around the Epiphany of Angels. |
| `epiphany begin...`, `epiphany end...`, `rotounda statue fountain.png`, `walkway going to the chapel.png` | What those places look like at eye level. |

Plus one measurement taken in Google Earth on 2026-10-11: **140.36 m from the rotunda statue to the nose of the chapel.** That single distance sets the scale for everything.

## The anchor: the chapel

The centre of the Chapel of the Holy Guardian Angel is (0, 0). Every other position is in metres from it.

Positions do not use north and east. The campus is built on a grid turned about 31 degrees from north, and the buildings line up with that grid, so the plan uses it too:

* **u** runs along the chapel walkway. Positive is towards the chapel and beyond it; the main gate is at about u = -274.
* **v** runs across the walkway. Positive is to your right as you walk to the chapel (the Main Building side); negative is the PGN side.

The scale works out to **0.454 m per aerial pixel**. In the scenes, **9 game pixels are one metre**. That was chosen because the DJN Building and the angel pedestals, drawn before any of this, already fit it.

## Where it lives in the code

* `src/game/campus/plan.ts` holds the data: each building's blocks, the gates, the junctions. Positions are written as aerial pixels and converted in code, so they can be checked against the photo.
* `src/game/campus/streets.ts` turns the plan into scenes. Each outdoor scene is one street, a line on the plan, plus the direction the camera looks. `xOf` and `frontage` say where a place or a building falls along that line.
* Each scene in `src/game/scenes/` asks those functions where to draw things. Nothing is typed in by hand.

So to move a building: open the aerial photo, read the new pixel, change it in `plan.ts`. The scene and the map both follow.

Press **C** in the game for the campus map. It is drawn from the same data, so it is the quickest check that the plan looks like the aerial.

## The streets

A side-view scene can only show one side of a road. Each street below says which way the camera looks; buildings on the other side are behind the camera and get a sign at the kerb and a "look back" hotspot instead of a facade.

| Scene | Street | Camera looks | Length | What you see |
| --- | --- | --- | --- | --- |
| `gate` | Sto. Rosario St. at the main gate | SE | not to scale | The gate, bag check, turnstile |
| `park` | Epiphany of Angels | NW | 69 m | Covered shed, St. Martha Hall (2) and the Red Building (1) beyond, SFJ (3) at the fountain plaza |
| `plaza` | Front of the Main Building | NE | not to scale | Rotunda, DJDN (12), St. Barachiel Gate |
| `walkway` | Rotunda to the chapel lawn | NW | 103 m | STL (4), PGN (11) |
| `lane` | Parking lane | NE | 74 m | STL (4), PGN tower over it; SFJ behind you |
| `halls` | Back road, west half | NW | 104 m | Warehouse (5), Food Court (6), SGH (7), SRH (8), SMH (9), GGN (10) |
| `aps` | Back road, east half | NW | 110 m | APS (13), Sacred Heart (18) |
| `lawn` | Road along the chapel lawn | NE | 101 m | End of APS, the Chapel (15), Formation Center (16) |
| `sjh` | Road in front of St. Joseph Hall | SE | 113 m | SJH (17), MGN (14), corner of the gym |
| `gym` | Lane behind the chapel | NE | 96 m | Covered Court (19), Gym (20), Annex (21) |

All 21 numbered buildings appear in at least one scene.

How they join:

```
Sto. Rosario St. -- gate -- park (Epiphany) -- plaza (rotunda, Main Bldg.) -- lobby -- courtyard
                                                  |        \                              |
                                                lane      walkway ------------------------+
                                                  |           |
                                                halls ----- lawn (chapel) ---- sjh
                                                  |           |                 |
                                                  +--------- aps ------------- gym
```

`npm run check:links` (with the dev server running) presses E on every hotspot and fails if any of these connections is broken.

## Buildings

Position is the centre of the building's main block, in metres from the chapel. Size is along the walkway by across it.

| No. | Building | u | v | Size (m) | Position |
| --- | --- | --- | --- | --- | --- |
| 1 | Plaza de Corazon Building (Red Bldg.) | -274 | -45 | 18 x 24 | Guess |
| 2 | St. Martha Hall | -246 | -30 | 20 x 50 | Confirmed |
| 3 | San Francisco de Javier Building | -211 | -30 | 33 x 48 | Confirmed |
| 4 | St. Therese of Lisieux Building | -156 | -38 | 24 x 33 | Confirmed |
| 5 | Warehouse & Carpentry | -189 | -113 | 11 x 39 | Guess |
| 6 | Yellow Food Court | -167 | -114 | 10 x 55 | Guess |
| 7 | St. Gabriel Hall | -151 | -110 | 15 x 73 | Confirmed |
| 8 | St. Raphael Hall | -132 | -109 | 15 x 73 | Confirmed |
| 9 | St. Michael Hall | -108 | -110 | 13 x 61 | Confirmed |
| 10 | Geromin G. Nepomuceno Building | -61 | -116 | 50 x 80 | Confirmed |
| 11 | Peter G. Nepomuceno Building | -80 | -38 | 33 x 51 | Confirmed |
| 12 | Don Juan D. Nepomuceno Building | -119 | 47 | 68 x 61 | Confirmed |
| 13 | Archbishop Pedro Santos Building | -15 | -61 | 101 x 15 | Confirmed |
| 14 | Mamerto G. Nepomuceno Building | -72 | 47 | 14 x 50 | Confirmed |
| 15 | Chapel of the Holy Guardian Angel | 0 | 0 | 48 x 43 | Anchor |
| 16 | Sister Josefina Nepomuceno Formation Center | 24 | -6 | 23 x 20 | Confirmed |
| 17 | St. Joseph Hall Building | -10 | 69 | 101 x 17 | Confirmed |
| 18 | Sacred Heart Building | 63 | -64 | 43 x 32 | Confirmed |
| 19 | Covered Court | 74 | -28 | 48 x 48 | Confirmed |
| 20 | Immaculate Heart Gymnasium | 83 | 45 | 37 x 78 | Confirmed |
| 21 | Immaculate Heart Gymnasium Annex | 82 | 87 | 37 x 11 | Confirmed |

"Confirmed" means the aerial photo labels it or Sean confirmed it on 2026-10-11. It does not mean the size is exact: positions and sizes were read by eye and are good to about 5 m.

## What is still a guess

* **Building sizes.** Every footprint is a rectangle on the grid. The real ones are not all rectangles (STL, PGN, MGN and Sacred Heart are L or T shapes; they are approximated with two or three blocks).
* **Buildings 1, 5 and 6.** The aerial does not label them. They are placed from the campus map drawing.
* **What every building looks like**, apart from the DJN, the Epiphany, the rotunda statue and the walkway. The others are drawn from five generic facade styles with colours and floor counts taken from the campus map drawing. Floor counts in particular are guesses.
* **Which side of each building the door is on.**
* **The courtyard gate** of the Main Building. The game puts it on the walkway side; this has not been checked.
* **The junction points** where roads meet. They were read off the aerial where the paving is visible, but trees hide parts of it.
* **Gate names.** The gate-area diagram names Sto. Rosario Gate (main), St. Barachiel Gate (vehicles), Guardian Angel Gate, a courtyard/pedestrian gate, St. Raphael Gate and St. Uriel Gate. Only the first two are in the game. The guard house at St. Barachiel Gate still says "GATE 1" from before.
* **The diagram calls building 1 "Plaza de Amor"** where the campus map says "Plaza de Corazon". The game uses the campus map's name.

## The two older scenes that are not to scale

`plaza` and `gate` were drawn before the plan existed. They keep their own spacing so their cutscenes and dialogue positions still work. `streets.ts` ties each to the plan by its two ends (see `FIXED`), which is enough for the map to show where you are. Bringing them to scale is a job for later; the plaza is about twice as long as the real road in front of the Main Building.

## Interiors

There are none beyond the DJN lobby and courtyard, on purpose. Each building's door tells you its name, its number on the campus map and what offices are inside, and that it is not open yet. Interiors wait for reference photos of the inside of each building.

## What would help most next

1. A second measurement in a different direction, to check the scale. For example the length of St. Joseph Hall end to end.
2. A photo of the front of each building, taken from the road, so the generic facades can be replaced.
3. A photo from the rotunda looking down each of its roads.
4. Where the doors are.

## Reference images

The pictures in `assets/` came from Google Earth, a Google Maps photo sphere and the university's own campus map. They are not ours to republish and this repository is public, so they were left out of the commits. Share them with the team another way, and keep them in `assets/` under the same file names so the notes in `plan.ts` still point at the right picture.
