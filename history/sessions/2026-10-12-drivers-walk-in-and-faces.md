# 2026-10-12 - Drivers in the traffic, walking into the gate, faces and portraits

**Who:** Mclaren, working with Claude Code.

## What was asked
> can u make the cars slight big also put some drivers on it

> also can u make an sprite of people when facing front and back in the side gate when coming to school they should walk towards the entrance not walking left and just fading

> hmm can u still fix bcs when walking towards it looks like they're floating / ella still floats

> the art style is good i just want to give emphasize to the characters cause they look plain and no emotions

## Decisions
* **Keep the art style, give the characters feelings.** We talked about the 2.5D pixel look of the laundromat game Mclaren showed. The rooms could be done in code, but characters that detailed need a real artist. So the characters stay drawn in code, in the same style, and get expressions, body language, emotes and a portrait instead.
* **Portraits are drawn from each character's `Look`**, so they always match the sprite and every NPC gets one for free. They can be swapped for hand-drawn ones later.
* **A face is set per line** and kept while others talk, so listeners show their reaction. Everyone goes back to a plain face when the conversation ends.

## What changed
* **Traffic** (`art/traffic.ts`, `scenes/gate.ts`): lanes at 1.4 and 1.7 times, up from 1.25 and 1.5. A driver in every vehicle, the tricycle driver on the motorcycle. Parked cars stay empty.
* **Front and back views** (`drawCharacterFacing` in `art/character.ts`).
* **Walking into the gate** (`area.ts`, `story/gate.ts`): after the turnstile you turn your back and walk up between the gate leaves, fading only once past them. Coming back from the Main Building you walk out towards the camera. `walkIn` takes `to` and `rise`; `walkOut` is the new step for the other way. The walk keeps a steady pace, the steps match the ground covered, and it stops at the back of the gatehouse floor whatever depth the person stands at. That fixed the floating, Ella's included.
* **Faces** (`art/character.ts`): neutral, happy, sad, angry, surprised, worried, shy, smug, on the side, front and back views. Standing still the arm shows it too, and surprise, happiness and anger come with a jump, a bounce or a shake.
* **Emotes** (`area.ts`): !, ?, ..., a note, an anger vein, a sweat drop, a heart, beside the head.
* **Portraits** (`art/portrait.ts`, `dialogue.ts`): a close-up in each speech bubble, with a moving mouth, blinking and a hop when the face changes.
* **The side gate lines** are tagged with faces as the example.

## Tested
* `npm run check` and `npm run build` pass.
* Screenshots of the walk in and out (boy, girl and Ella), Ate Joy's and Ella's conversations with portraits and emotes, and every face on six characters side by side.

## Needs a human
* **Which face goes with which line** in `story/gate.ts` was picked by Claude. Change any that feel wrong.
* **The rest of the dialogue** has no faces yet.
* The portraits are small (26 px). If they read too small on a laptop screen, they can be drawn bigger.
