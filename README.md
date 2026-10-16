# Project HAU (Working Title)

> **The Elevator Pitch:** A 2.5D pixel art adventure that lets players explore the Holy Angel University campus, complete student-life quests, and uncover university secrets.

## Project Status: The Campus in Godot (2.5D)
The game is now built in **Godot 4.7.2** as a **2.5D** world: pixel art in a real 3D space, with lighting, shadows and a time-of-day cycle, seen through a side-view camera that turns to face each building. Everything stands on the team's real campus plan, at 1:1 scale, drawn from our own photos. The project lives in [`src/drafts/aps-godot/`](src/drafts/aps-godot/).

What you can explore so far:
* **APS (Archbishop Pedro Santos Building):** the full frontage, the ground-floor hallway with the bust and the campus map, the canteen with its stalls, and the brick patio.
* **The Chapel of the Holy Guardian Angel:** its plaza, oval parking and the lawn paths round it.
* **The Immaculate Heart Gymnasium:** outside at its real size, and **inside**: the court with the HAU seal, the bleachers on both sides (you can climb them), the curved stage with WELCOME ANGELITES, the balcony, the lobby, the equipment room, the corridors and the backstage rooms. Walking in glides the camera inside, and whatever is in the way fades out.
* **St. Joseph Hall:** its covered walkway, the Mary statue garden and the parking.
* **MGN**, on its plot by the west road.
* **Campus NPCs** who stroll, stand at their posts and talk.

Every other building is a reserved plot on the campus plan, waiting for its turn. The first browser prototype (a 2D side-view game on our own small engine) still runs, but new work goes into Godot.

## Play It
1. Get [Godot 4.7.2](https://godotengine.org/download/) (the standard build).
2. Either open `src/drafts/aps-godot/project.godot` in Godot and press **F5**, or run `tools\run-aps-godot.cmd` (set `GODOT` to your Godot executable first if it isn't in `builds/godot-tools/4.7.2/` or on your PATH).
3. After pulling new work, open the project in the Godot editor once so any new images are imported.

| Key | Action |
| --- | --- |
| `A` / `D`, `W` / `S` (or arrows) | Walk (relative to the camera) |
| `Shift` | Run |
| `E`, `Space` or `Enter` | Talk to someone nearby |
| Mouse wheel, `+` / `-` | Zoom |
| `1`-`9`, `0` | Framings: APS, building, corridor, canteen, close-up, chapel, IH Gym, gym side, St. Joseph Hall, inside the gym |
| `Q` / `E` | Turn the camera a little |
| `T` | Morning, noon, afternoon, night |
| `C` | Boy / girl |
| `M` | Mute |
| `P` | Pixel mode |
| `F1` | Fast travel (dev) |
| `R` / `F11` / `Tab` / `Esc` | Reset / fullscreen / hide controls / close |

Checks: `tools\run-aps-godot.cmd --headless -- --test` prints a JSON report; every check must be `true`.

### The browser prototype (frozen)
The original 2D prototype (the Side Gate, the DJN Building and the Epiphany of Angels park) still runs in the browser with [Node.js](https://nodejs.org) 20 or newer: `npm install`, then `npm run dev` and open http://localhost:5173. It is kept as a reference; new work goes into Godot.

## The Core Vision
* **Genre:** 2.5D Side-View Narrative Adventure (free roam)
* **Art Style:** Pixel art in a 3D world, with soft lighting, real shadows and a time-of-day cycle. Every rule is in [`docs/godot-art-style.md`](docs/godot-art-style.md).
* **Engine:** Godot 4 (everything is built in code, on the team's campus plan grid)
* **Setting:** The Holy Angel University campus in Angeles City, built 1:1 from the real buildings
* **Core Loop:** Walk around campus, go into buildings, talk to people, look at things, tick off small goals.
* **Language:** Taglish, with a bit of Kapampangan (an English setting is available in the browser prototype).

> This is a student project. It is not an official product of Holy Angel University, and every character in it is made up.

## Repository Navigation
* `src/drafts/aps-godot/` - **The game in Godot** (the scene, the buildings in `areas/`, the characters, the shaders).
* `docs/` - Game Design Document (GDD), quest outlines, campus lore, and the Godot style guide (`docs/godot-art-style.md`).
* `assets/` - Reference photos of every building, pixel art sprites, and audio (includes a `drafts/` folder for WIP art).
* `src/` - The code (the frozen browser prototype in `src/game/`, the Godot game in `src/drafts/aps-godot/`).
* `tools/` - Development utilities: run the Godot game, take review captures, export the campus plan.
* `builds/` - Playable prototypes and milestone releases.
* `history/` - Session logs and handoff notes. **Read `history/README.md` and `history/CONTEXT.md` every time you pull.**

## License
This is private work. Only the team and collaborators added by the repository owner may use, copy or contribute to it. See [`LICENSE`](LICENSE).

## The Team
A closed 7-person project developed within the School of Computing.

**Developers**
* **Sean Rhani Dela Cruz**
* **Mikko Brandon Panergo**
* **Jorel Kesse Marquez**

**The heart of the game: sprites, animation and story**
* **Gil Miranda**
* **Mclaren Ais Miranda**
* **Cyrel Lloyd Lasola**

**Documentation and organization**
* **Bernard Rodriguez Jr.**

## Team Workflow
To keep our repository clean and avoid merge conflicts, please follow these guidelines:
1. **Review Before Building:** Read `history/CONTEXT.md`, the newest session log, and `docs/godot-art-style.md` before starting anything new.
2. **Build on the Plan:** Every building goes on its own plot in the campus plan, in its own file in `src/drafts/aps-godot/areas/`.
3. **Work on a Branch:** Make a branch, open a pull request, and run the checks before asking for a merge. `main` needs the owner's approval.
4. **Use the Drafts:** Keep messy experiments, test code, and WIP sprites inside the `drafts/` folders in `src/` and `assets/`.
5. **Communicate:** Ping the group chat before pushing major changes or restructuring any core files.

## Git & .gitignore Rules
To prevent our repository from becoming bloated and to avoid breaking each other's local setups, we rely on a strict `.gitignore` policy.
* **No personal IDE settings:** Keep personal workspace configurations (like `.vscode/` settings) on your own machine.
* **No engine caches or logs:** Godot's `.godot/` folder, `*.import` files, crash logs and user preference files must not be committed. Do commit the `*.uid` files Godot creates next to scripts.
* **No compiled builds or engine binaries:** Exported executables, the Godot editor itself and playable versions inside `builds/` are ignored to save repository space.
* **Large Files:** Standard GitHub blocks files over 100MB. If you are adding massive audio tracks or uncompressed sprite sheets, let the team know so we can configure Git LFS (Large File Storage).
* *Note: If you install a new tool or plugin that generates temporary junk files, please update the `.gitignore` file immediately before committing.*
