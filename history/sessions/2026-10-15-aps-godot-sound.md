# 2026-10-15: sound in the APS Godot scene

**Who:** Mclaren, with Claude Code.

## What was asked
Bring the browser game's music, sound effects and walking sounds into the Godot APS scene.

## Decisions
* **Still no audio files.** The browser game synthesises everything with Web Audio (`src/engine/audio.ts`). `audio.gd` uses the same recipes: the same tones, envelopes, biquad filters and pentatonic melody. GDScript is too slow to synthesise live, so each sound is rendered once into a small `AudioStreamWAV`, a few per frame after start-up so nothing stutters.
* **The melody's echo** is an `AudioEffectDelay` on a `Music` bus that the script creates (0.42 s feedback, like the browser's).
* **Footsteps** come from the student's walked distance: two per 1.15 m walk cycle, so they match the animation. Floors above ground level (the entrance, kerbs, the canteen) give the hard click; the road, lawn edge and patio give the soft thud.
* **Indoors** means the canteen floor (0.45 m): the wind drops there, and the crickets (night only) stop.
* Only the sounds this scene can use were ported. The ID beep and buzz, turnstile clack, coins, zip and chime wait for the scenes that need them.

## What changed
* New `src/drafts/aps-godot/audio.gd`.
* `student.gd`: a `stepped` signal.
* `aps.gd`: creates the sound, footsteps, a blip on T, C and 1-5, M to mute, and two new checks (`footsteps_while_walking`, `ambience_playing`).
* `README.md` there: the M key and the file table.

`tools\run-aps-godot.cmd --headless -- --test`: all checks true.

## Left unfinished / known problems
* The mix has only been heard briefly. It may need rebalancing, like the browser audio.
* The echo is close to the browser's, not identical (Godot's delay only feeds back).
