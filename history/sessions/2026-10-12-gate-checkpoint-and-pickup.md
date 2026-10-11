# 2026-10-12 - The checkpoint under the gatehouse, the parked pickup, and the opening screens

**Who:** Sean, working with Claude Code.

## What was asked
> SO FOR the entrance, before the student reaech the id part, you must put that on the portion on the arch, not beside the arch it should be on the arch part so the students enters from there, before that when the opening scene proceeds the student walks beside the main gate, but its a side gate, put the asset > chevorlet car illegally parked there and the ACTDO officer issuing a ticket on that car, so the student encounters that car and the student rants about it, make this a part of the cutscene, then afterwards proceed with the main sequence, also fix the selection of the characters and names where in the transitions overlaps with each other

Two new pictures in `assets/` (not committed): `ACTDO.jpg`, a city traffic enforcer in uniform, and `chevrolet-high-country-storm-main-1560834757.jpg`, a red Chevrolet double-cab pickup.

## What changed
* **The checkpoint is under the gatehouse now.** The gatehouse is wider (250 px) and comes forward to the kerb. Its beam, glass roof and paved floor are drawn behind the people and its two front piers in front of them, so walking in passes behind a pier and you are seen under the roof. The ID turnstile stands by the inner pier and the two bag tables beside it, with Ate Joy and Kuya Nonoy at them. The striped tent is gone.
* **The street runs in front of the gatehouse**, as in the photo. The big foreground tree, which hides where the street meets the campus drive, moved to the inside of the gatehouse; traffic passes in front of the checkpoint.
* **The parked pickup.** A red Chevrolet pickup (`pickup` in `src/game/art/traffic.ts`: black bonnet stripe, roof rails, black wheels, the decal on the rear door, the bowtie) is up on the sidewalk beside a NO PARKING / TOW sign, with a ticket under its wiper.
* **The enforcer.** `ACTDO` in `story/cast.ts`: black cap, red polo, reflective vest (a new optional `vest` on `Look`), dark trousers and boots, from the photo. He is called Enforcer Dante and is made up, like everyone else; the name on the vest in the photo was not used.
* **The opening cutscene** (`parkedPickup` in `story/gate.ts`, played first by `gateArrival`): you walk up the sidewalk, stop at the pickup, complain about it to the enforcer (one choice of two), he sends you in, and the old sequence carries on: Ella at the next table, your bag check, then the ID tap. Sets the flag `saw_ticket`, which nothing reads yet. Afterwards you can talk to the enforcer and look at the pickup.
* **Opening screens.** The title, the character picker and the name box used to cross-fade, so for a moment two sets of lettering and two students were on top of each other; and on starting, the picker flashed back while the screen went black. Now only one is drawn at a time: it fades right out, then the next fades in (`screen` and `screenFade` in `game.ts`). The dark wash behind the picker and the name box is drawn once for both (`drawMenuBackdrop`), so it holds steady between them. A new game leaves from the name box under the fade and nothing of the menus comes back over the game.

## Decisions
* **Up on the sidewalk, not at the kerb.** Parked on the road the pickup sat at the bottom edge of the screen under the dialogue box. On the sidewalk it is in full view and is plainly in the way, which is the point of the scene.
* The pickup is drawn one and a half times the size of the passing traffic so it stands right against the people next to it.
* The scene is 20 px longer (1200) and you start 150 px right of the pickup.

## Tested
* `npm run check`, `npm run build` and `npm run check:links` pass (12 areas, the gate has 7 hotspots).
* The whole opening cutscene run through in fast-forward: it reaches the pickup lines, then the bag table, and ends.
* Screenshots of every step from the title to the first frame of the game, and of the gate from the street, under the gatehouse and from the inside, in headless Chrome.

## Needs a human
* **The dialogue.** The complaint and the enforcer's lines are new Taglish written by Claude. Proofread them in `parkedPickup` and the `actdo` entry in `story/gate.ts`.
* **ACTDO** is taken to be the Angeles City Traffic Development Office. Check the name and whether its enforcers write tickets at this gate.
* The gate's real name and street are still open (see the session log before this one). The scene is still titled Main Gate.

## Left unfinished
* The enforcer only stands there; he has no writing animation.
* The pickup never leaves and no tow truck comes.
