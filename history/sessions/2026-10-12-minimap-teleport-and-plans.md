# 2026-10-11 to 10-12 - Minimap, map teleport, and plans for characters and the photo trip

**Who:** Mclaren, working with Claude Code on their own PC. Two sittings, Sunday evening and Monday.

This session produced three branches. Each one needs a pull request and Sean's approval before it reaches `main`:

| Branch | What |
| --- | --- |
| `campus-map` | Pixel-art campus map, minimap, teleport (this file) |
| `add-play-script` | `npm run play` |
| `quest-ikaapat-na-piso` | Quest draft in `docs/drafts/` |

## What was asked
1. How to run the game. Mclaren's PowerShell blocked `npm` ("running scripts is disabled"), and they wanted one command that also opens the browser.
2. A plan for what to add next: the maps are inaccurate and the team is taking reference photos on **Tuesday 2026-10-13**; until then, character animations and making characters easier to tell apart.
3. Whether close-up cutscenes would get full character art.
4. An emotional quest storyline with the feeling of *3 Idiots*, without copying it, drawn from Filipino college experiences.
5. Using the 2022 official campus map as a reference:

> can u add a map on the top right where u can see where u are [...] also the map can let u teleport on wherever u want until the whole campus is implemented. make also the art of the map relate or fit to the art style of the game pixel art

## Decisions

### Running the game
* **`npm run play`** starts the dev server and opens the browser (`vite --open`). `npm run dev` is unchanged, so nobody's habits break. On branch `add-play-script`.
* **Windows "running scripts is disabled":** fix it once per user with `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then open a new terminal. Or use `npm.cmd run dev`. Worth adding to the README if a teammate hits it too.

### Campus map (branch `campus-map`)
* **One painter for both maps.** `src/game/art/campusmap.ts` paints the campus from above as pixel art, straight from `campus/plan.ts`, at any zoom. The C map and the minimap are the same picture at two zoom levels, so moving a building in the plan moves it on both.
* **Looks like the official map, in our pixel style.** Roofs with a strip of front wall and windows, roof colours taken from the official map (red Bldg. 1, yellow food court, dark PGN, glass skylight on the Main Building), the round white chapel on its lawn, and the maroon number tags. A building whose position is still a guess gets a dotted maroon outline.
* **Teleport is a list, not a cursor.** W/S picks one of the 12 places you can walk to, E goes there through the normal scene fade, so intros and visit flags still fire. It lands on an existing spawn point, so landing somewhere odd can't break anything.
* **Teleport is temporary.** `TELEPORT` in `src/game/ui/map.ts` turns it off. Turn it off once every part of the campus is joined up on foot.
* **Teleport does not care about story flags.** You can jump inside before the bag check. That is fine for a stand-in; it goes away with `TELEPORT`.
* **The minimap hides** during cutscenes, dialogue and with the phone open, the same as the clock, and dims after dark.

### Characters (planned, not built)
* **Problem found:** Trisha, Bea, Kath and Ella all wear the same uniform with long hair or a bun and differ only by bag colour and a pixel of skin tone. Kuya Ramil and Kuya Nonoy differ only by 1 pixel of height. Faces are one eye pixel. The only animations are walk, idle bob and blink.
* **Plan:** give every character one signature you can read from across the screen, shape first and colour second. New options for `Look` in `src/game/art/character.ts`: more hair styles (ponytail, pigtails, bangs, curly), glasses, mouth and brows, build, accessories, held items. Suggested signatures are in the plan Mclaren has; adjust them to each character's dialogue.
* **Animation order:** talking (mouth while the bubble types), personal idle loops, a real run pose, gestures as cutscene steps, emotes, sitting, then story actions (bag check, ID tap).
* **Close-ups:** build a close-up portrait system drawn by code from the same `Look`, with expressions and a cutscene step, as placeholders. Hand-drawn portraits from the team's artist replace them later, one character at a time. Needs the new face details first.

### Quest draft (branch `quest-ikaapat-na-piso`)
* **"Ang Ikaapat na Piso"** in `docs/drafts/quest_ang_ikaapat_na_piso.md`. Jopet's story, built from what is already in the game (the fountain coins, the "Tutor needed: Calculus" poster). Six acts over six days, ending on a 3.0.
* **Not copied from *3 Idiots*:** no genius hero, no villain professor, and **no student death or self-harm**, because the game uses a real university's name and its players include real students under exam pressure.
* **Reddit could not be read** (it blocks the tools). The details come from common Filipino student experiences, not from anyone's post, and no real person's story should be retold.
* **Needs a day system**, close-ups, and two new places: the library (in SFJ, building 3) and the SOC org room. The official map puts the School of Computing in St. Joseph Hall (17) and Engineering in Sacred Heart (18).

## Tuesday 2026-10-13 photo trip: shot list
The game is side-view, so the useful photos are **straight-on and parallel to each building**, not at an angle.
* Every area: a side-on panorama walking past, each building front, the ground and the sky edge.
* Main Gate: name board, bag-check tent and tables, turnstile and barrier layout.
* Epiphany: every archangel plaque up close, and the whole Memorare stone.
* Interiors: one wide shot from each wall.
* New places: School of Computing (SJH), the chapel, the library (SFJ), the SOC org room, Sacred Heart.
* Details: signs, benches, lamps, bins, plants, floor tiles, wall colours.
* People, for reference only: uniforms, bags, what guards and vendors wear. No faces.
* Counts: windows, steps and columns per building, and paced lengths, for proportions.

## What changed
* `src/game/art/campusmap.ts` (new): the pixel-art campus painter.
* `src/game/ui/map.ts`: rewritten on the new painter. Destination list with "Malapit dito" (the three nearest numbered buildings), blinking pick ring, a you-are-here pin with an arrow the way you face, and the corner minimap.
* `src/game/game.ts`: builds the list of stops from each scene's title and spawn, handles W/S/E while the map is open, draws the minimap.
* `src/README.md`: map keys and the `TELEPORT` switch.
* On the other branches: `package.json` and `README.md` (`npm run play`), and `docs/drafts/quest_ang_ikaapat_na_piso.md`.

## Tested
* `npm run check`, `npm run build` and `npm run check:links` pass on `campus-map`.
* Headless Chrome screenshots: the map open on the walkway, after a teleport to the gym, and the minimap on the walkway, at the gym and at night on the Epiphany. Teleport from the walkway six places down lands in the gym with the map closed and no errors.
* Not tested: a full play-through by hand.

## Left unfinished
* No mouse or touch on the map: keyboard only, like the rest of the game.
* The lobby and courtyard have no position of their own on the plan yet, so their pin sits in the middle of the Main Building.
* The character work, close-ups and the quest are plans only.
* Two commits in this session were first made with an AI co-author line, against the commit conventions. Both were fixed before or by force-pushing their own branch; nothing on `main` was touched.
