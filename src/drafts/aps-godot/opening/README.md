# The opening

A quiet memory of HAU before the game starts, told like a black-and-white manga page by
page (`opening.gd`). Panels fade in one by one and drift slowly; the narration types out
in Tagalog beside them. Any key or click moves on; holding Space (or Esc) skips. It plays on a plain launch
(no arguments, e.g. F5 in the editor); `--opening` forces it after other arguments.

To look at one page without playing it all:

```
tools\run-aps-godot.cmd -- --opening-capture=page.png --opening-page=2
```

(`--opening-page=9` is the title card.)

## Where each panel's picture comes from

1. `panels/<id>.png` if it exists: a drawn panel, shown as it is (greyed onto the paper).
2. `photos/<id>.jpg`: a campus photo from `assets/images/buildings/`, inked into pen,
   screentone and hatching by `shaders/manga.gdshader`. These stand in until drawn.
3. Otherwise a grey card that names the file to make and what it shows.

Drop a finished picture into `panels/` with the right name and it is used the next run.
Nothing else changes.

## The pictures to make

All black and white, pen and ink with screentone, like a quiet realistic slice-of-life
manga: fine lines, lots of white paper, careful backgrounds, no colour. PNG, any size
about 1600 px on the long side; each panel crops to its frame (cover), so keep the
subject near the middle. The ones marked **photo** already have a stand-in; make them
anyway for the final look, using that photo as the reference.

| File | Shape | What it shows |
|---|---|---|
| `alaala.png` | wide 3:1, no frame | Pencil only, soft grey: the side silhouette of a teenage boy's face lying down, looking up, filling the bottom; specks of pencil dust above. |
| `langit.png` | very wide 4:1 | Thin wispy clouds drawn with short broken pen strokes across a pale sky. Nothing else. |
| `fountain.png` | wide 16:9 | **photo** HAU Boulevard from the angel fountain, the bronze angel statue on the left, the road and covered walkways going off towards the chapel. |
| `walkway.png` | wide 16:9 | **photo** The covered walkway on PGN's side: terracotta pillars, white slatted roof, hedges, red octagon pavers. |
| `chapel.png` | 3:2 | **photo** Looking down the boulevard to the chapel at the end, trees on both sides. |
| `aps.png` | 3:2 | **photo** The APS building from the road: a long white five-storey block, cars parked in front, wires overhead. |
| `hallway.png` | tall 2:5 | **photo** The APS ground-floor hallway, students in white uniforms walking away towards the canteen. |
| `stairs.png` | tall 2:5 | **photo** A steep tiled school stair going up into shadow, a metal railing. |
| `corridor.png` | tall 2:5 | **photo** The second-floor open corridor, long and empty, light falling across the floor. |
| `canteen.png` | wide 16:9 | **photo** The APS canteen patio: brick floor, round tables, orange chairs and big umbrellas. |
| `gym.png` | wide 16:9 | **photo** The front of the Immaculate Heart Gym in afternoon sun, students crossing. |
| `kaibigan.png` | wide 16:9 | Close-up, face only: a Filipino teenage boy in a white HAU polo, sweaty after basketball, grinning straight at the viewer. (The friend.) |
| `ako.png` | wide 16:9 | Close-up: the player boy (wavy brown hair, white polo), looking down and away, shy, not answering. |
| `litrato.png` | wide 16:9 | A phone held up in someone's hand, its screen showing a selfie of the two boys in front of the angel fountain. |
| `ulan.png` | wide 3:1 | Rain over the boulevard: long rain strokes, the covered walkway empty, puddles on the pavers. |
| `mata.png` | wide 16:9 on black | Extreme close-up of the player boy's eyes, wide open, a tear at the corner, heavy hatching around, the panel edges black. |

A prompt that works as a base (add the row's "what it shows"):

> black and white manga panel, pen and ink, screentone shading, fine hatching, realistic
> seinen slice-of-life style, quiet and nostalgic, lots of white paper, no colour, no text,
> Holy Angel University campus in Angeles City, Philippines, ...

Faces (`kaibigan`, `ako`, `mata`) should match the game's characters: the player boy's
look is in `assets/drafts/characters/boy/pxl-new/source/`.

## Changing the story

The pages, panels and lines are the `PAGES` list at the top of `opening.gd`: each panel's
`rect` is its place on the page (0..1), each line has a corner (`L`, `R`, `BL`, `BR`, `C`).
Lines stay Taglish with a little Kapampangan, like the NPCs.
