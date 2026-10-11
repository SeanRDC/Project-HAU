# 2026-10-12 - Baon and rain

**Who:** Mclaren, working with Claude Code on their own PC.

## What was asked
From the list of things to add while the map waits for Tuesday's photos:

> add baon allowance weather

## Decisions

### Baon
* **₱150 a day**, shown next to the clock, with a floating −₱20 when you spend. `BAON` in `src/game/game.ts`. There is only one day for now; once days exist it should refill each morning.
* **Money moves through dialogue,** like flags do: a line with `pesos: -20, item: 'Taho'` takes ₱20 when it is shown. Writers check `g.pesos()` in a talk function to give a "kulang ang barya" line instead. `buy()` in `story/streets.ts` makes a priced menu choice.
* **It never goes below zero,** and nothing earns money yet.
* **Three places to spend it:**
  * Manong Taho at the gate, ₱20 (he lets you off till tomorrow if you are short).
  * The Yellow Food Court, open 7 AM to 7 PM: kwek-kwek ₱25, siomai rice ₱55, palamig ₱15, or eat the adobo from home (the bag check already found it).
  * Jopet's coin for the fountain, ₱1. Sets `gave_piso`, which Act 1 of his quest draft uses.
* **The phone** shows baon left and the last thing bought.
* Old saves load with ₱150.

### Rain
* **It comes and goes on its own** on the game clock: after 1.5 to 5 dry in-game hours, a 35% chance of 0.5 to 2 hours of rain, sometimes a downpour. Pressing T moves the weather along too. Saved with the game.
* **Rain changes the light, not just the overlay:** `Weather.mood()` greys the time of day (sky, haze, ambient light, no warm sun glow) before the scene is drawn, so the lamps and windows matter more. On top: slanted pixel streaks, splashes on the walk line, a wet sheen on the ground.
* **Umbrellas:** the player (the bag check found a payong) and every student NPC (anyone with an ID lace) put one up outdoors. Guards, vendors and Mang Bong do not; they have their tents and their work.
* **Sound:** a rain hiss outdoors, a dull muffled roar indoors. Indoors you see no rain.
* **Lines:** Manong Taho and Mang Bong say something different in the rain (`g.raining()`).
* A small umbrella next to the clock shows it is raining.

## What changed
* `src/game/weather.ts` (new).
* `src/game/game.ts`: wallet, saving and loading, weather clock, rain mood and drawing, `?rain=` and `?pesos=`.
* `src/game/types.ts`: `pesos` and `item` on a line; `pesos()` and `raining()` on the game.
* `src/game/dialogue.ts`: spends a line's pesos when it is shown.
* `src/game/art/character.ts`: `umbrella` on a look. `src/game/area.ts`: who gets one.
* `src/engine/audio.ts`: rain noise, a coin clink.
* `src/game/ui/hud.ts`, `src/game/ui/phone.ts`: wallet and umbrella icon; baon row on the phone (phone made 10 px taller).
* `src/game/story/gate.ts`, `streets.ts`, `plaza.ts`, `park.ts`: taho, food court, Jopet, Mang Bong.

## Tested
* `npm run check`, `npm run build` and `npm run check:links` pass.
* Headless Chrome: rain by day on the Epiphany and at night at the plaza (umbrellas on the player and the students, none on staff); buying taho takes ₱150 to ₱130; with ₱20 the ₱25 kwek-kwek is refused and the wallet stays; palamig takes ₱20 to ₱5 and shows on the phone; Jopet's coin takes ₱1 and sets `gave_piso`. No errors.
* Not tested: listening to the rain sound (headless Chrome has no audio), a full play-through by hand.

## Left unfinished
* All new Taglish lines need proofreading like the rest.
* Prices are a guess at what the food court charges. Check on Tuesday.
* No way to earn money, and no refill until there is a day system.
* NPCs do not walk for shelter or go indoors in the rain.
