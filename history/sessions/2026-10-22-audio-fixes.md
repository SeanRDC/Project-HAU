# Audio fixes

**Who:** Mikko, with Claude Code.

## What was asked

"I hear a wind or flap sound on audio, and it's like flickering. Fix the audio and tell me
suggestions on sounds."

## What was wrong

- The looping sounds (the students' murmur, the rain) were joined end to start with a
  linear crossfade. Between two unrelated stretches of noise that halves the power in
  the middle, so the level dipped each time the loop came round (every 7 s for the
  murmur, every 4 s for the rain): the flicker.
- The murmur was bursts of band-passed noise chopped into syllables, and the footsteps
  were 80 ms bursts of band-passed noise. Both read as wind and flapping, not voices and
  feet.

## What changed (audio.gd)

- `_seamless` crossfades with sine and cosine, which keeps the power even through the join.
- `_murmur`: seven voiced "speakers" (a buzz at a low or a higher pitch with a little
  intonation, shaped into soft syllables in phrases with breaths between, through two
  vowel formants), mixed and low-passed at 1.8 kHz as if across the lawn, 8 s loop.
  Measured over the loop in 0.25 s windows its level stays within about 2x with no dip
  at the join. It renders in about 0.9 s on the worker thread, as before.
- `_footstep`: a low thud and a tick, tried and then put back as it was (below).
- `_rain`: white noise thinned at the top (a soft low hiss), a 6 s loop.

## After Mikko listened

"I hear a buzzing sound; I don't [like] the footstep audio and the birds flying away."
Asked, Mikko chose:
- Crowd: much softer, no buzz. Each voice is now a soft rounded tone (a sine with a little
  of its octave and twelfth), low-passed at 900 Hz, at under half the level (0.025).
- Footsteps: the old ones, back exactly as they were.
- The flock's flutter: softer and shorter, 3-4 wingbeats at under a third of the level.

## The crowd taken out

Mikko still heard a soft buzz "like cotton", by the APS front (the busiest spot, where
the crowd sound is loudest), and chose "find and silence it". The crowd murmur is gone
(`murmur`, `_murmur`); `crowd` is still set, for a crowd sound later. The rain loop also
pauses once it has faded out in dry weather, rather than idling at -80 dB.

## Checks

`--test`: all true (`campus_sounds`, `footsteps_while_walking`). `npm run check` and `npm run build` pass.
Not listened to here: Mikko to listen.

## Suggestions given

Wind in the trees for the "windy" weather, rain on the canopies and kiosk roofs, the
chapel bell at the hours, distant traffic past the gates, the canteen's clatter and
chatter, a ball bouncing at the Covered Court, room tone and a fan in corridors, cats
and birds tied to where they are, doors and turnstiles, a school bell between classes.
