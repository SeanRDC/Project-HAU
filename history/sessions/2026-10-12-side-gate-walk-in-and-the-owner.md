# 2026-10-12 - The side gate: the pickup's owner, two turnstiles, walking in to the Main Building

**Who:** Sean, working with Claude Code.

## What was asked
> on the red car, when the ticket is almost being issue there is a guy who's going to walk like running on the car saying sorry, sandali lang po, like that, the guys name is Mikko Panergo, then afterwards I want the side gate to look like this, so the turn stile instead of 1 do 2 turnstiles and after that, when the student scans their id, it should not just walk to the left, it should walk towards like entering the gate [...] play a fade like animation there for a smooth transition so when the student enters the student will land on the DJN building, not on the epiphany, so update the map instead of the main gate, put the student on the side gate near the main building

## What changed
* **The owner.** Just as the enforcer is about to sign the ticket, Mikko Panergo comes running up the sidewalk to the pickup: "Sorry po! Sorry! Sandali lang po, Sir!" He asks to talk it over, gives his name, and gets the ticket anyway. Your complaint (one choice of two) is now said to him. He stands by the pickup afterwards and can be talked to. He is named for our teammate because Sean asked for that; everyone else in the game is still made up.
* **Two turnstiles** under the gatehouse, one lane behind the other.
* **Walking in.** Tapping your ID no longer walks you off to the left. The arm drops, you step through, turn away from the camera and walk in through the gate, getting smaller and fading, and the screen fades to the front of the Main Building. Ella does the same ahead of you in the arrival cutscene and is waiting on the drive inside, where her conversation now happens. Tapping again on a later visit takes you in the same way.
* **The scene ends at the turnstiles.** The stretch of drive that used to be to the left of them is still drawn but can't be walked; the two ways out that were there are gone.
* **On the map** the gate scene sits at the gate beside the Main Building instead of the gate at the end of the Epiphany of Angels. The scene is titled Side Gate; the checklist says "I-tap ang ID sa side gate".
* **The Epiphany's gate** is now a closed gate you can look at. The Epiphany is reached from the rotunda, as before.

## How it works
* `Area.walkIn(who)` and the cutscene step `{ walkIn: 'you' }` (or an NPC id): the walker moves up the screen, shrinks and fades over about a second. An NPC is gone from the scene afterwards. `{ walk, who, run: true }` makes an NPC run.
* `goIn` in `story/gate.ts` is the shared bit: arm down, step through, walk in. `tapId` adds the travel to the plaza.
* `ella()` in `story/gate.ts` builds her for both scenes.
* `tools/check-links.mjs` now plays a cutscene through when a hotspot starts one, so a way out that happens at the end of a cutscene is still counted.

## Tested
* `npm run check`, `npm run build`, `npm run check:links` pass (12 areas; the gate has 5 hotspots and its way to the plaza is found through the cutscene).
* The whole opening played through in fast-forward with screenshots: the owner arriving, the bag check, the walk-in half way, and the arrival at the Main Building with the minimap showing the right place.

## Needs a human
* **The new lines** for Mikko and the enforcer are Taglish written by Claude: proofread `parkedPickup` in `story/gate.ts`.
* **Which gate the side gate is and what street it is on.** The map puts it at the plan's `barachielGate` spot, the one beside the Main Building; the street name was taken out of the scene until someone checks.
* **The plaza end you arrive at** still shows the old guard house lettered "GATE 1" and a boom barrier, not the inside of the new gatehouse.
* There was no new picture for "look like this", so the gatehouse itself is unchanged apart from the second turnstile.
