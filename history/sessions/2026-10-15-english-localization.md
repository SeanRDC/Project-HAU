# 2026-10-15: an English language setting

**Who:** Jorel, with Claude Code.

## What was asked
Add a language setting so players can pick Tagalog or English, so non-Tagalog speakers can follow the story. The Tagalog must stay exactly as it is, since English is an addition beside it. Tagalog is the default. A line with no English shows its Tagalog, never a blank or a key. Work in batches, in play order, stopping for review after each.

## Questions asked, and Jorel's answers
* **Translate the UI too, or only dialogue?** Both.
* **Filipino words?** Conversational words (ha, 'no, naman, sige, pala, talaga, tara) are translated. Kuya, Ate (and Manong, Mang, Aling), food and baon are never translated.
* **Kapampangan?** It stays, with its meaning in English after it: "Mayap a gatpanapun! Good afternoon!"
* **Where is the toggle?** On the title screen, and on the L key in the game.

## Decisions
* **English sits beside the Tagalog:**
  * Lines and choices get an optional `en`, hotspots `labelEn`, areas `subtitleEn`. That matches the optional extras lines already have (`face`, `emote`, `set`).
  * Lines are built by code and have no ids, so a separate translation file would have needed ids on every line.
  * `tr(tagalog, english)` in `src/game/lang.ts` picks the English only when English is on and the line has some.
* **The choice is kept in its own `localStorage` key, `project-hau-lang`,** not in the save. The save format is unchanged, and a new game (N) keeps the language. URL shortcuts (`?lang=en`) and pressing L in a dev run don't store it.
* **Switching mid-line:** whatever is on screen changes at once. A line that is typing out carries on from the same share of the new text.
* **The speech bubble now fits its widest choice.** English choices can be longer than the 110 px minimum, and choice widths weren't measured before.
* **Flagged lines get no English in the code** until someone decides on them. They're listed in `docs/translation-review.md` with a proposal.

## What changed
* **New:**
  * `src/game/lang.ts`
  * `tools/check-translations.mjs` (`npm run check:translations`)
  * `docs/translation-review.md`
* **Engine and UI:**
  * `types.ts`: the optional English fields
  * `dialogue.ts`: `tr`, `relang()`, choice width
  * `game.ts`: the L key, `?lang=`, a toast that follows a switch, the subtitle
  * `engine/input.ts`: `KeyL`
  * `area.ts`: talk and hotspot prompts
  * `ui/title.ts`: "L  Tagalog · English", bottom right
  * `ui/hud.ts`: L in the controls hint
  * `ui/phone.ts`: checklist text
  * `story/campus.ts`: `wayTo` and `deadEnd` take English
  * `story/tasks.ts`: an `en` field
* **Translated (batch 1):** `story/gate.ts` and `story/entry.ts`. Two lines are flagged, see the review file.
* **Translated (batches 2 to 5), all the remaining dialogue:**
  * The Epiphany of Angels and the plaza: the archangels, the seal, the guardian angel statues, the Memorare marker, the fountains, Kath's quiz.
  * The DJN lobby (the bust of Don Juan) and the courtyard.
  * The streets, the walkway lanes, the canteen and the APS lobby.
  * The covered court, the aero lab and the IH Gym.

  Jorel asked for all of it at once, without stopping between batches.
  * The two lines flagged in batch 1 got their proposed English too, so no line is left in Tagalog. They're still on the review list.
  * `stall()` (the canteen) takes an English greeting.
  * `buy()` takes an English item name, for the two items with "at" in them.
  * The food rule was sharpened: Filipino food names stay as they are, and plain words around them (egg, soup, coffee, onions) are translated, so the meaning carries over.
  * A run in the game called every NPC, hotspot and cutscene under every time of day, weather, money and story state (about 19,500 lines and choices). It found no line without English apart from the ones already in English.
* **Translated (batch 6, done early):** every hotspot prompt and area subtitle, the title screen, the character picker, the controls hint, the phone (Bea's texts, the checklist), and the campus map.
  * Jorel found a prompt still in Tagalog ("Umakyat sa flagpole") while walking in English, so all the prompts came ahead of the remaining dialogue.
  * `closedDoor()` builds its English from the building data, so every closed door is translated.
  * Area titles are names and stay as they are. Subtitles that are names or Latin stay too.
  * Bea's first text runs onto the edge of its bubble on the phone. It does that in Tagalog too, so it's left as it was.

`npm run check`, `npm run build` and `npm run check:translations` pass. The check confirms that all 6,062 strings from `main` in `src/` are unchanged.

`npm run check:links` failed once with "nothing leads back" for plaza/entry and plaza/lobby, while the game was also being driven by another browser. Its own output showed both links working. Two reruns passed, and `main` passed.

## Left unfinished / known problems
* **The phone's "last bought" line** keeps the item's name as it was bought. For "Piso kay Jopet", "Pandesal at kape" and "Chips at softdrinks", that name is partly Tagalog. Changing it means changing what the save holds, so it waits for a decision.
* **Lines for a person to confirm** are in `docs/translation-review.md`. These include Kuya Nonoy's "Don Juan" joke, the pickup's "sticker pa ng putik", Manong Taho's "Bukas na lang" and the Kapampangan.
