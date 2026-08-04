# Project HAU (Working Title)

> **The Elevator Pitch:** A 2D pixel art adventure that lets players explore the Holy Angel University campus, complete student-life quests, and uncover university secrets.

## Project Status: Concept & Prototyping
We are currently in the pre-production and prototyping phase. The team is drafting the core campus layout, designing the 2D pixel art style, and testing initial quest mechanics.

## The Core Vision
* **Genre:** 2D Top-Down Adventure / RPG
* **Art Style:** Retro 2D Pixel Art
* **Setting:** The Holy Angel University campus (including key landmarks, the School of Computing, library, etc.)
* **Core Loop:** Explore the campus, interact with NPCs (students/professors), and complete fetch quests, puzzles, and minigames.

## Repository Navigation
* `docs/` - Game Design Document (GDD), quest outlines, and campus lore.
* `assets/` - Pixel art sprites, tilesets, and audio (includes a `drafts/` folder for WIP art).
* `src/` - The codebase (includes a `drafts/` folder for prototype scripts).
* `tools/` - Development utilities and software stack info.
* `builds/` - Playable campus prototypes and milestone releases.

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