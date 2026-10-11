# Project HAU (Working Title)

> **The Elevator Pitch:** A 2D pixel art adventure that lets players explore the Holy Angel University campus, complete student-life quests, and uncover university secrets.

## Project Status: First Playable Area
The day starts on the street outside the **Side Gate** by the Main Building, with the traffic going by: a short cutscene where you run into a pickup parked on the sidewalk and the enforcer ticketing it, the guards check your bag under the gatehouse, then you tap your ID at the turnstile, walk in through the gate, and come out in front of the Main Building. From there the **Don Juan D. Nepomuceno Building** and the **Epiphany of Angels** park are playable. You can walk the driveway out front, go into the lobby, hang out in the courtyard, then leave by the gate and loop back through the park. Progress saves on its own. It is a prototype running on our own small engine in the browser. The plan is to port it to Godot 4 once the look and feel are settled.

## Play It
You need [Node.js](https://nodejs.org) 20 or newer.

```
npm install
npm run dev
```

Then open http://localhost:5173 in your browser. Or run `npm run play` instead of `npm run dev` and the game opens in your browser on its own.

| Key | Action |
| --- | --- |
| `A` / `D` or arrow keys | Walk |
| `Shift` | Run |
| `E` / `Enter` | Talk, look, go through doors |
| `W` / `S` | Pick a dialogue choice |
| `Q` | Phone (first-day checklist) |
| `T` | Skip ahead 1.5 hours |
| `M` | Mute |
| `N` | New game (on the title screen) |

## The Core Vision
* **Genre:** 2D Side-View Narrative Adventure (free roam)
* **Art Style:** Pixel art with soft lighting and a time-of-day cycle
* **Setting:** The Holy Angel University campus in Angeles City, starting with the DJN Building
* **Core Loop:** Walk around campus, talk to people, look at things, tick off small goals on your phone.
* **Language:** Taglish, with a bit of Kapampangan.

> This is a student project. It is not an official product of Holy Angel University, and every character in it is made up.

## Repository Navigation
* `docs/` - Game Design Document (GDD), quest outlines, and campus lore.
* `assets/` - Pixel art sprites, tilesets, and audio (includes a `drafts/` folder for WIP art).
* `src/` - The codebase (includes a `drafts/` folder for prototype scripts).
* `tools/` - Development utilities and software stack info.
* `builds/` - Playable campus prototypes and milestone releases.
* `history/` - Session logs and handoff notes. **Read `history/README.md` every time you pull.**

## License
This is private work. Only the team and collaborators added by the repository owner may use, copy or contribute to it. See [`LICENSE`](LICENSE).

## The Team
This is a closed 4-person project developed within the School of Computing.
* **[Sean Rhani Dela Cruz]** - [Role, e.g., Lead Developer / Engine Architect]
* **[Bernard Rodriguez Jr.]** - [Role, e.g., Pixel Artist / Map Designer]
* **[Mclaren Ais Miranda]** - [Role, e.g., Quest Designer / Writer]
* **[Mikko Brandon Panergo]** - [Role, e.g., Audio / UI/UX]

## Team Workflow
To keep our repository clean and avoid merge conflicts, please follow these guidelines:
1. **Review Before Building:** Always check the `docs/` folder for the latest quest structures and campus map updates before starting a new feature.
2. **Use the Drafts:** Keep messy experiments, test code, and WIP sprites inside the respective `drafts/` folders in `src/` and `assets/`.
3. **Communicate:** Ping the group chat before pushing major changes to the `main` branch or if you are restructuring any core files.

## Git & .gitignore Rules
To prevent our repository from becoming bloated and to avoid breaking each other's local setups, we rely on a strict `.gitignore` policy. 
* **No personal IDE settings:** Keep personal workspace configurations (like `.vscode/` settings) on your own machine.
* **No engine caches or logs:** Temporary engine files, crash logs, and user-specific preference files must not be committed.
* **No compiled builds:** Exported executables and playable versions inside the `builds/` folder are ignored to save repository space.
* **Large Files:** Standard GitHub blocks files over 100MB. If you are adding massive audio tracks or uncompressed sprite sheets, let the team know so we can configure Git LFS (Large File Storage).
* *Note: If you install a new tool or plugin that generates temporary junk files, please update the `.gitignore` file immediately before committing.*