# Development Tools & Workflows

This directory is reserved for custom scripts, build automation tools, or utility software that helps us develop Project HAU, but won't be included in the final game.

## Approved Software Stack
Since we are a small 4-person team, keeping our tools standardized is crucial so we can easily share files. We are currently using:

* **Task Management / Design:** [E.g., Trello, Notion, Figma]
* **Communication:** [E.g., Discord]
* **Pixel Art Production:** [E.g., Aseprite, Photoshop]
* **Game Engine:** [Engine Name]
* **Audio Production:** [E.g., Audacity, FL Studio]

If anyone needs to introduce a new tool into the pipeline (like a specific tilemap editor or audio plugin), let the team know first so we don't run into compatibility issues.

## Custom Scripts

* `check-aps-browser.mjs` - checks the isolated browser 2.5D trial using Chrome.
  Start `npm run dev`, then run `npm run check:aps-browser`. Covers full-building
  framing, moving-shadow stability, sunlight/awning occlusion, canteen access,
  steps, movement, pillar collision, character switching, day/night lights,
  reset, phone control overlap, touch movement, and the separate original game.
  `-- --capture` saves review images under ignored `builds/aps-browser-review/`.
  `CHROME` overrides the executable; `GAME_URL` overrides the server address.
  Use `-- --production` against `npm run preview` for the built-page smoke check.

* `run-aps-godot.cmd` - opens the standalone APS 2.5D graphics trial in
  `src/drafts/aps-godot/`. Uses the local portable Godot 4.7.2 in ignored
  `builds/godot-tools/`, `GODOT` if set to an executable, or `godot` in PATH.
  Append `--editor` to inspect it in the editor. The main game still runs with
  `npm run dev`.
* `check-links.mjs` - presses E on every hotspot in every area and checks that each way out leads somewhere real and has a way back. Start the game with `npm run dev`, then run `npm run check:links` in a second terminal. Needs Chrome; set the `CHROME` environment variable to its path if it is not found, and `GAME_URL` if the dev server is not on `http://localhost:5173`.
