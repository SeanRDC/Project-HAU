# The opening's story

**Who:** Mclaren (Aistwobig), with Claude Code.

## What was asked

Rewrite the manga opening around a real story, draft that story, use the team's campus
photos for the pages, and make the opening easy to check without replaying the game.

## Decisions

- **The story** (full draft in `opening/STORY.md`): Lance, a third-year at HAU, lost Ysha
  (an irregular student) to depression on November 11, 2026. Twelve years later he falls
  asleep in his old classroom and wakes in June 2026 with only his memories and a family
  photo from his future: him, his wife Pat (his childhood friend) and their baby, born on
  November 11, 2036, signed by Pat on the back. Four endings. Nothing about Ysha's death is
  ever shown; the story is about noticing, listening and getting help, and every release
  opens with a content warning and ends with help information (NCMH 1553).
- **The opening now tells that story** (`opening/SCRIPT.md`): the campus as he remembers it
  (pages 1 to 5), the small things he missed (6 and 7), November 11 and every "sana" ending
  on "sana sinagot ko" (8), "kung pwede lang bumalik" (9), and a new page 10 where he wakes
  in the classroom: "Huy. Gising na. Late ka na naman." "Ikaw" is never named, so the
  viewer can't tell whether he means Pat or Ysha.
- **Campus photos stand in for drawn panels:** the classroom, the Coop canteen, the Student
  Center tables, a bench under the walkway, students by the Main Building, and the
  boulevard with rain drawn over it. Unused photos and placeholders were removed.
- **Preview:** `tools\preview-opening.cmd` saves every screen in one Godot run and puts them
  on one sheet (`builds\opening-preview\`).

## What changed

- `opening.gd`: the new `PAGES` (10 pages); `--opening-page=all` captures every screen.
- `opening/photos/`: `klase`, `kantina`, `tawanan`, `bangko`, `lakad`, `tagulan` added;
  `aps` and `canteen` removed. `opening/panels/`: placeholders for `alaala` and `mata`, the
  drawn `langit` clouds.
- `opening/README.md`, `SCRIPT.md`, `STORY.md`; `tools/preview-opening.*`, `tools/README.md`.

## Left unfinished / known problems

- Still to draw: `alaala`, `mata`, `gising`.
- The game itself doesn't start in the classroom yet; the opening ends there.
- Permission for "Totoong Tayo" (Jin DC), named in the story, is needed before release.
