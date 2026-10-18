# The opening cutscene (test)

**Who:** Mclaren (Aistwobig), with Claude Code.

## What was asked

A cutscene like Until Then, as a test: shaped like the manga pages Mclaren shared (a
quiet memory, establishing shots of places with narration beside them, close-ups,
blank remembered pages), but about HAU, in Tagalog, as the game's opening. And a list of
the pictures to generate for it.

## Decisions

- **A manga memory, page by page.** Panels fade in one at a time and drift slowly; the
  narration types out in a narrow column in a panel corner, upper-case, with a soft low
  blip. Any key moves on, Esc skips. It ends on a "PROJECT HAU" title card and fades into
  the game, which waits paused behind it (the music keeps playing).
- **The story:** the player remembers the campus (the boulevard and the angel fountain,
  the covered walkways, the chapel, APS, its hallway and stairs, Ate Lorna's turon, the
  gym) and a friend met at the gym who always greeted "Mayap a abak!", a photo at the
  fountain, the rainy season, and "Bakit ka umalis noon?". It closes on "Pero sigurado
  ako... nakita kita." A hook for a story, not a decided plot: change it freely.
- **Pictures fall back in three steps** so the test plays before anything is drawn: a
  drawn panel in `opening/panels/<id>.png`; else one of the team's campus photos inked
  into pen, screentone and hatching by `shaders/manga.gdshader`; else a grey card that
  names the file to make. Drawn panels need no code change.
- **Plays on a plain launch only** (no arguments, so F5 in the editor and the shipped
  game). Every run with arguments (`--test`, `--view=`, captures) skips it; `--opening`
  forces it. `--opening-capture=<png> --opening-page=<n>` saves one finished page.

## What changed

- New `opening.gd` (pages, panels, narration, timing, captures) and
  `shaders/manga.gdshader`.
- New `opening/photos/` (nine campus photos, shrunk to 1280 px) and `opening/README.md`
  (the 16 pictures to make, their shapes, and a base prompt).
- `aps.gd`: plays the opening on a plain launch; new check `opening_panels`.
- `docs/godot-art-style.md`: the manga shader and an "opening (cutscenes)" section.

## Left unfinished / known problems

- Seven panels are still grey cards (`alaala`, `langit`, `kaibigan`, `ako`, `litrato`,
  `ulan`, `mata`); the photo panels want drawn versions for the final look.
- The friend has no name or sprite yet. The lettering font is Comic Sans from the
  system (falls back to Godot's font where it is missing).
- No skip-forever setting yet: the opening plays on every plain launch.
