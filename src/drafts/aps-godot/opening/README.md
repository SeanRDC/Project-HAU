# The opening

A quiet memory of HAU before the game starts, told like a black-and-white manga page by
page (`opening.gd`). Panels fade in one by one and drift slowly; the narration types out
in Tagalog beside them. Any key or click moves on. The first time on a computer it cannot be
skipped; once it has been watched to the end (remembered in `user://opening.cfg`), holding
Space (or Esc) skips it. It plays on a plain launch (no arguments, e.g. F5 in the editor);
`--opening` forces it after other arguments, and `--opening-first` plays it as the
unskippable first time again. To reset for real, delete `opening.cfg` from Godot's user
data folder (Project > Open User Data Folder in the editor).

To see every screen at once without playing it, run `tools\preview-opening.cmd` (or
double-click it): one Godot run saves each page and the title into
`builds\opening-preview\` and opens `opening-preview.png`, all of them on one sheet.

To look at one page without playing it all:

```
tools\run-aps-godot.cmd -- --opening-capture=page.png --opening-page=2
```

(`--opening-page=10` is the title card.)

## Where each panel's picture comes from

1. `panels/<id>.png` if it exists: a drawn panel, shown as it is (greyed onto the paper).
2. `photos/<id>.jpg`: a campus photo from `assets/images/buildings/`, inked into pen,
   screentone and hatching by `shaders/manga.gdshader`. These stand in until drawn.
3. Otherwise a grey card that names the file to make and what it shows.

Drop a finished picture into `panels/` with the right name and it is used the next run.
Nothing else changes.

## The pictures to make

All black and white, pen and ink with screentone, like a quiet realistic slice-of-life
manga: fine lines, lots of white paper, careful backgrounds, no colour. PNG, 2000 px
wide (tall ones as sized). The sizes below are each panel's real shape on a 16:9
screen; a picture of another shape is cropped to fit (cover), and the slow drift hides
about 5% more at each edge, so keep the subject in the middle.

`panels/` holds a grey placeholder for each picture that has no photo yet: overwrite it
with your picture, same name. For the rows marked **photo**, add your picture to `panels/`
with that name and it replaces the photo.

| File | Page | Size | What it shows |
|---|---|---|---|
| `alaala.png` | 1 | 2000 x 490, no frame | Pencil only, soft grey: the side silhouette of Lance's face lying down, looking up; pencil dust above. |
| `langit.png` | 2 | 2000 x 390 | Drawn: thin wispy clouds of short broken pen strokes. |
| `mata.png` | 9 | 2000 x 860, on black | Extreme close-up of Lance's eyes, wide open, a tear at the corner, heavy hatching. |
| `gising.png` | 10 | 2000 x 520 | Lance lifting his head off a classroom desk, eyes opening, afternoon light. (No placeholder file: a grey card shows until drawn.) |
| `fountain.png` | 2 | 2000 x 650 | **photo** HAU Boulevard from the angel fountain. |
| `walkway.png` | 3 | 2000 x 500 | **photo** The covered walkway on PGN's side. |
| `chapel.png` | 3 | 2000 x 1100 | **photo** Down the boulevard to the chapel. |
| `klase.png` | 3, 10 | 2000 x 1100 | **photo** Their classroom, empty, in the afternoon light. |
| `corridor.png` | 4 | 900 x 1660 | **photo** The fifth-floor open corridor. |
| `stairs.png` | 4 | 900 x 1660 | **photo** The stairs going up. |
| `hallway.png` | 4 | 1100 x 1550 | **photo** The APS hallway, students walking to the canteen. |
| `kantina.png` | 5 | 2000 x 520 | **photo** The Coop canteen: tables, chairs, students. |
| `gym.png` | 5 | 2000 x 520 | **photo** The front of the IH Gym. |
| `tawanan.png` | 6 | 2000 x 520 | **photo** The Student Center study tables. |
| `bangko.png` | 6 | 2000 x 520 | **photo** An empty bench under the covered walkway. |
| `lakad.png` | 7 | 2000 x 600 | **photo** Students walking together by the Main Building. |
| `tagulan.png` | 7 | 2000 x 430 | **photo** (rain drawn over) The boulevard in a storm. |

Most image generators make 16:9 or 21:9 at most; that is fine for the wide ones if the
subject sits in the middle third, top to bottom. Or generate wide and crop to the size.

A prompt that works as a base (add the row's "what it shows"):

> black and white manga panel, pen and ink, screentone shading, fine hatching, realistic
> seinen slice-of-life style, quiet and nostalgic, lots of white paper, no colour, no text,
> Holy Angel University campus in Angeles City, Philippines, ...

Faces (`alaala`, `mata`, `gising`) should match Lance, the player boy: his look is in
`assets/drafts/characters/boy/pxl-new/source/`.

## Changing the story

The whole opening, page by page (every panel, picture and line, with an English gloss),
is written out in [SCRIPT.md](SCRIPT.md); keep it in step with `PAGES`. The story it
sets up (Lance, Pat and Ysha, November 11, the endings) is in [STORY.md](STORY.md).

The pages, panels and lines are the `PAGES` list at the top of `opening.gd`: each panel's
`rect` is its place on the page (0..1), each line has a corner (`L`, `R`, `BL`, `BR`, `C`).
Lines stay Taglish with a little Kapampangan, like the NPCs.
