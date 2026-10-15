# English localization brought up to date with main, 2026-10-16

**Who:** Jorel Marquez, with Claude Code.

**What was asked:** main had moved on 30 commits (the Godot campus, the IH gym, the
PixelLab student sprites, APS night lighting) since the English language setting
was added. Bring `feature/english-localization` up to date.

**Decisions**
* Merged main into the branch rather than rebasing, so the two localization
  commits keep their history.
* Dialogue bubble: main's portrait card size (`size`, from the student sprites)
  together with the branch's width for long English choices
  (`Math.max(110, choiceW)`), so both the bigger portraits and longer choices fit.

**What changed**
* Conflicts resolved in `package.json` (kept `check:aps-browser`,
  `check:translations`, `import:osm`, `export:godot-plan`), `src/game/area.ts`,
  `src/game/ui/select.ts` and `src/game/dialogue.ts` (kept both the sprite imports
  and `tr`), and `history/CONTEXT.md`.
* Main's browser-game changes were sprites and lighting, with no new dialogue, so
  no new lines needed English. `npm run check:translations`: 6,575 strings from
  main unchanged, 559 lines and labels have English.

**Left unfinished / known problems**
* After pulling, run `npm install`: main added `three`, and `npm run check` fails
  on `src/drafts/aps-browser/` without it.
* Not yet played through by hand with L on the character select and in a
  dialogue with the new student portraits.

**Follow-up: the phone's "last bought" line in English.** A double check found it
was the one place English players still saw Tagalog (`Pandesal at kape`,
`Chips at softdrinks`, `Piso kay Jopet`). A line can now carry `itemEn` beside
`item`; `buy()` passes its English name along, the save keeps it as `lastEn`, and
the phone picks it with `tr()`. Older saves show the Tagalog until the next buy.
Checked in the game: the phone reads "Pandesal and coffee −₱25" in English.
