# 2026-10-11 - Main Gate, bag check and ID turnstile

**Who:** Mclaren, working with Claude Code (model: Claude Opus 5.5) on their own PC. First session on a branch, since `main` is protected.

## What was asked

> i want to add new features on the game a cut scene where you'll need to enter the hau using the id scanner and all guards checking bags also add the entrance in the main gate of hau. read the history file and also don't change the game assets. commit it one by one and also push it. make it based on the assets that is provided

## Decisions
* **"Don't change the game assets" means no existing file in `src/game/art/` was edited.** The new area reuses the props already there (boom barrier, lamp posts, hedges, palms, trees, palette). The new pieces (gateway, wall, tent, tables, turnstile, reader) are in a new file, `src/game/art/gate.ts`, drawn in the same style. There are still no image files in `assets/`.
* **The Main Gate is the outside of Gate 1.** The plaza already had Gate 1 on its right edge with a "STO. ROSARIO ST." sign, so the new area joins there: left edge is the boom barrier inside Gate 1, right edge is the street.
* **New games start on the street.** The bag check plays as a cutscene on the way in. Tapping the ID is left to the player (press E at the reader), so "you need to enter using the ID scanner" is something you actually do. The turnstile blocks you until you do.
* **The first tap fails on purpose.** The ID is still in its plastic case and Ate Joy tells you to take it out. It gives the scene a small beat and a reason for Ella to tease you later.
* **Cutscenes are data, not code.** A cutscene is a list of steps in the story file, so writers can change the scene the same way they change dialogue.
* **Branch and pull request instead of pushing to `main`**, as `history/README.md` asks. Commits are under Mclaren's name with no AI co-author line.

## What changed
* `src/game/cutscene.ts` (new) plays steps: `walk`, `place`, `face`, `say`, `pause`, `sound`, `look`, `run`. The types are in `src/game/types.ts`.
* `src/game/area.ts`: cutscenes can walk the player and NPCs, turn them, and swap the player's look (bag off while it's on the table). New `drawFront` hook for things that go in front of the characters (the turnstile arm, the ID card).
* `src/game/game.ts`: runs cutscenes, letterbox bars, area `intro` and `barrier`, no saving mid-cutscene, new game starts at `gate`/`street`.
* `src/engine/audio.ts`: reader beep and buzz, turnstile clack, zipper. All synthesised like the rest.
* `src/game/scenes/gate.ts` and `src/game/story/gate.ts` (new): the area, Kuya Nonoy, Ate Joy, Ella, Manong Taho, and the two cutscenes.
* Plaza: the Gate 1 hotspot now leads out to the Main Gate instead of refusing to.
* Checklist: new first task "I-tap ang ID sa main gate" (`scanned_id`). The phone is a little taller to fit nine tasks.

## Tested
Headless Chrome with real key presses: new game from the title screen into the arrival cutscene, the bag check with its choice, the turnstile blocking you, the failed tap and the good tap, walking through, Gate 1 to the plaza and back, the phone with nine tasks. Day and night screenshots. No console errors apart from the missing favicon. Type check and production build pass.

## Left unfinished
* The gate was drawn without photos. See "Needs Checking by a Human" in `../CONTEXT.md`.
* Saves from before this change have no `scanned_id`, so that task stays open until the player walks out through Gate 1 and taps in.
* Kuya Ramil in the plaza still asks for your ID, even though you just tapped it at the gate. It could be rewritten as a friendly check instead.
* Dialogue at the gate needs the same Taglish proofreading as the rest.
