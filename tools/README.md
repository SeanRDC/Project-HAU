# Development Tools & Workflows

Scripts that help us build and check Project HAU. None of them ship with the game.

## Software We Use
* **Game engine:** Godot 4.7.2 stable (the standard build, Forward+). Not committed: put the portable editor in the ignored `builds/godot-tools/4.7.2/`, have `godot` in PATH, or set `GODOT` to your executable.
* **Character sprites:** PixelLab (redraws and walks), pxl (pixel art as code, for clean-ups), and the C# rig scripts in `assets/drafts/characters/`.
* **Browser prototype:** Node.js 20 or newer, Vite, TypeScript.
* **Checks that use a browser:** Google Chrome.

If you bring in a new tool, tell the team first so we stay compatible.

## Godot
* `run-aps-godot.cmd` - runs the Godot game in `src/drafts/aps-godot/`. Uses the portable Godot in `builds/godot-tools/4.7.2/`, `GODOT` if set, or `godot` in PATH. Anything after it goes to Godot:
  * `tools\run-aps-godot.cmd` plays the game.
  * `tools\run-aps-godot.cmd -e` (or `--editor`) opens it in the editor.
  * `tools\run-aps-godot.cmd --headless -- --test` runs the checks and prints a JSON report; every check must be `true`. A broken script can make it hang, so give it a timeout and read the first Parse Error.
* `preview-opening.cmd` - saves every screen of the opening cutscene (each page finished, then the title) into `builds/opening-preview/` in one Godot run, puts them on one numbered sheet (`opening-preview.png`) and opens it, so you can check the opening without playing it. `-NoOpen` only makes the files.
  * After pulling new sprites, run Godot once with `--headless --import` (or open the editor) so the new images load.
* `capture-aps-godot.sh` - `sh tools/capture-aps-godot.sh [name ...]` takes review shots on the GPU into the ignored `builds/aps-godot-review/port/` (all of them with no names). Each shot's options are in the script.
* `export-godot-plan.mjs` - `npm run export:godot-plan` writes `src/drafts/aps-godot/campus_plan.gd` from the campus plan (`src/game/campus/plan.ts` and `osm.ts`): every building's real outline and the named places, in Godot metres, and which ones Godot already draws (`BUILT`). Run it whenever the plan changes or a building is merged. Uses the esbuild that comes with Vite.

## Campus Plan
* `import-osm.mjs` - `npm run import:osm` pulls the campus buildings from OpenStreetMap into `src/game/campus/osm.ts`. Run `npm run export:godot-plan` after it.

## Browser Prototype (frozen)
* `check-links.mjs` - presses E on every hotspot in every area and checks that each way out leads somewhere real and has a way back. Start the game with `npm run dev`, then run `npm run check:links` in a second terminal. Needs Chrome; set `CHROME` to its path if it is not found, and `GAME_URL` if the dev server is not on `http://localhost:5173`.
* `check-translations.mjs` - `npm run check:translations` confirms the Tagalog is untouched and lists any line with no English yet.
* `check-aps-browser.mjs` - checks the Three.js APS trial (`aps-3d.html`) in Chrome. Start `npm run dev`, then `npm run check:aps-browser`. `-- --capture` saves review images under ignored `builds/aps-browser-review/`; `-- --production` checks the built page against `npm run preview`. `CHROME` and `GAME_URL` work as above.
