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
* `check-links.mjs` - presses E on every hotspot in every area and checks that each way out leads somewhere real and has a way back. Start the game with `npm run dev`, then run `npm run check:links` in a second terminal. Needs Chrome; set the `CHROME` environment variable to its path if it is not found, and `GAME_URL` if the dev server is not on `http://localhost:5173`.
