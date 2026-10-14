# 2026-10-14: characters in a softer, outlined pixel art style (draft v1)

**Who:** Mclaren, with Claude Code.

## What was asked
Make the characters look like a reference image: a sunny campus scene in detailed pixel art with small students in uniform. Characters first, the rest of the art later.

## Decisions
* **Same rig, same size.** Characters stay 33 px tall at 9 px a metre, so nothing else (bubbles, emotes, doorways, scenes) had to change. Only the way the rig is drawn changed.
* **A dark 1 px outline round every character.** The body is drawn on a small canvas, then stamped over a dark copy of itself nudged a pixel each way (`outlined()` in `character.ts`). It works for every look, pose, umbrella and the walk-in and walk-out views without drawing outlines by hand.
* **Three tones on everything:** a lit edge, the base colour and a shaded back, as in the reference.
* **Colours kept.** The uniforms keep the game's colours (the girl's skirt stays navy); only the style changed.

## What changed
* `src/game/art/character.ts`: rounder heads with a narrower chin; fuller hair with a shine and a fringe; collar, creases and a puffed short sleeve on shirts; a belt and buckle on trousers; pleats on the skirt, which swings with the stride; shoes with a toe shine and a dark sole; backpacks with a pocket, a lit top and a strap across the chest. Both the side view and the front and back views. Every NPC gets the new look too, since they all use the same rig.

`npm run check` and `npm run build` pass.

## Left unfinished / known problems
* The talking portraits in the speech bubbles (`art/portrait.ts`) still use the old style.
* The scenes and buildings have not been restyled to match the reference yet.
