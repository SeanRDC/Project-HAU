# 2026-10-12 - Girl character, character picker, player name

**Who:** Mikko, working with Claude Code (model: Claude Sonnet 5.5) on their own PC. Done on branches with pull requests, since `main` is protected. The picker went in earlier as pull request #3; the name entry is the second part.

## What was asked

> BUILD THE CHARACTER IMPLEMENTATION GIRL OR BOY

(then a detailed brief for the Girl character and a picker after the title screen, and later:)

> ADD CHARACTER NAME

## Decisions
* **The girl is a new `Look`, not a new renderer.** She uses the existing character rig with a skirt, a new `shoulder` hair style (hair ends swing a pixel with the stride) and a navy skirt. NPCs are untouched.
* **The chosen character is the player's base look.** `Area.enter()` and cutscene `look` steps used to reset to a fixed `PLAYER_LOOK`; they now use `baseLook()` from `src/game/art/player.ts`, so costume swaps (bag off at the inspection table) still work for both. The bag prop on the gate table uses the same look's bag colour.
* **Picker and name entry sit on the title screen**, so the title keeps its design. Continue skips them. N with a save only wipes the save after you confirm, so Esc is safe.
* **Saves were not wiped or re-keyed.** `character` and `name` are new optional fields; old saves load as the boy with no name.
* **The name is required, and only labels the player's own speech bubbles** (a maroon tab, like NPCs have). NPCs don't address the player by name yet.
* **Typing is a mode in `Input`.** While `input.typing` is on, letters, digits and Space are text, so A/D/E/Q/T/M/N don't trigger game actions. Enter and Esc still work.

## What changed
* New: `src/game/art/player.ts` (looks, chosen character, name), `src/game/ui/select.ts` (picker and name screens).
* `src/game/art/character.ts`: `shoulder` hair style.
* `src/game/game.ts`: picker and name flow, save and load of `character` and `name`, `?char=` and `?name=` dev shortcuts.
* `src/game/area.ts`, `src/game/cutscene.ts`, `src/game/scenes/gate.ts`: use `baseLook()`.
* `src/game/dialogue.ts`: the player's bubbles show the name tab.
* `src/engine/input.ts`: `typing` mode and `takeTyped()`.

## Tested
Type check and production build pass. Headless Chrome with real key presses: title to picker, switching boy and girl, Esc back, confirming into the Main Gate cutscene as the girl, continuing from a save with `character: "girl"`, an old save without it (loads as the boy), and typing a name (including A and D) with an empty name refused. No console errors. The name tab on speech bubbles and a save/reload round trip with a name were not checked by hand; a person should playtest them.

## Left unfinished
* Girl and boy share body proportions and the backpack shape; only colours, skirt and hair differ.
* NPCs never use the player's name.
* The title screen's background still shows a small player figure that changes look on confirm.
* No way to change character or name in the middle of a game, except N for a new game.
