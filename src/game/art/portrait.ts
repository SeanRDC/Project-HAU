// The close-up shown beside a speech bubble: head and shoulders, about three
// times the size of the walking sprite, drawn from the same Look so it always
// matches, with room on the face for the expression to read clearly.

import { Ctx, makeCanvas } from '../../engine/display';
import { px, rect } from '../../engine/pix';
import { Face, Look } from './character';
import { shade } from './palette';

export const PORTRAIT_SIZE = 26;

const INK = '#2a2030';
const MOUTH = '#5a2630';
const TONGUE = '#c85a5a';
const WHITE = '#f6f3ec';
const BLUSH = '#e8868a';
const SWEAT = '#9fd0f0';

const [canvas, c] = makeCanvas(PORTRAIT_SIZE, PORTRAIT_SIZE);

/** Rows of a three-pixel brow over each eye, outer pixel first, for each face. */
const BROWS: Record<Face, [number, number, number]> = {
  neutral: [8, 8, 8],
  happy: [7, 7, 7],
  sad: [9, 8, 7],
  angry: [7, 8, 9],
  surprised: [6, 6, 6],
  worried: [9, 8, 7],
  shy: [8, 8, 8],
  smug: [8, 8, 8],
};

/**
 * Draws the portrait onto a shared canvas and returns it; copy it out before
 * drawing the next one. `talk` opens the mouth, `blink` closes the eyes.
 */
export function portrait(look: Look, face: Face, talk: boolean, blink: boolean): HTMLCanvasElement {
  c.clearRect(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE);
  const skin = look.skin;
  const skinLo = shade(skin, -0.18);
  const hair = look.hair;
  const hairLo = shade(hair, -0.3);
  const hairHi = shade(hair, 0.12);
  const lip = shade(skin, -0.35);
  const sad = face === 'sad' ? 1 : 0;

  // long hair falls behind the shoulders
  if (look.hairStyle === 'long') rect(c, 4, 6, 18, 18, hairLo);
  if (look.hairStyle === 'shoulder') rect(c, 4, 6, 18, 14, hairLo);

  // shoulders and collar, sagging a pixel when sad
  const top = look.vest ? '#6f7278' : look.top;
  rect(c, 2, 21 + sad, 22, 5, top);
  rect(c, 3, 20 + sad, 20, 1, top);
  rect(c, 2, 21 + sad, 3, 5, shade(top, -0.2));
  if (look.vest) {
    rect(c, 5, 21 + sad, 3, 5, look.vest);
    rect(c, 18, 21 + sad, 3, 5, look.vest);
  }
  if (look.bag) {
    rect(c, 5, 20 + sad, 2, 6, shade(look.bag, -0.2));
    rect(c, 19, 20 + sad, 2, 6, shade(look.bag, -0.2));
  }
  // neck, the collar either side of it, the ID lace
  rect(c, 11, 19, 4, 3, skinLo);
  rect(c, 9, 20 + sad, 2, 2, shade(top, 0.15));
  rect(c, 15, 20 + sad, 2, 2, shade(top, 0.15));
  if (look.lace) {
    px(c, 10, 22 + sad, look.lace);
    px(c, 15, 22 + sad, look.lace);
    rect(c, 11, 23 + sad, 1, 2, look.lace);
    rect(c, 14, 23 + sad, 1, 2, look.lace);
  }

  // the head: a rounded box, a little shade down the left, the ears
  const hy = 5 + sad;
  rect(c, 7, hy, 12, 14, skin);
  rect(c, 8, hy + 14, 10, 1, skin);
  rect(c, 7, hy, 1, 14, skinLo);
  rect(c, 8, hy + 13, 10, 2, skinLo);
  rect(c, 8, hy + 13, 10, 1, skin);
  rect(c, 6, hy + 6, 1, 3, skinLo);
  rect(c, 19, hy + 6, 1, 3, skin);

  // the hair goes on first, so the brows can show over a fringe
  hairOn(c, look, hy, hair, hairLo, hairHi);

  // eyes
  const ey = hy + 6;
  for (const ex of [9, 15]) {
    if (blink && face !== 'happy') {
      rect(c, ex, ey + 1, 2, 1, INK);
    } else if (face === 'happy') {
      // smiling eyes, closed in an arc
      rect(c, ex, ey, 2, 1, INK);
      px(c, ex - 1, ey + 1, INK);
      px(c, ex + 2, ey + 1, INK);
    } else if (face === 'angry' || face === 'smug') {
      rect(c, ex, ey + 1, 2, 1, INK);
      px(c, ex + (ex < 12 ? 1 : 0), ey + 1, WHITE);
    } else if (face === 'sad' || face === 'shy') {
      // looking down
      rect(c, ex, ey + 1, 2, 2, INK);
      rect(c, ex - 1, ey, 4, 1, skinLo);
    } else if (face === 'surprised') {
      rect(c, ex - 1, ey - 1, 4, 4, WHITE);
      rect(c, ex, ey, 2, 2, INK);
    } else {
      rect(c, ex, ey, 2, 3, INK);
      px(c, ex + 1, ey, WHITE);
    }
  }

  // brows, the hair colour
  const rows = BROWS[face];
  // smug raises just the one
  const raise = face === 'smug' ? 1 : 0;
  for (let i = 0; i < 3; i++) {
    px(c, 8 + i, hy + rows[i] - 4, hair);
    px(c, 17 - i, hy + rows[i] - 4 - raise, hair);
  }

  // nose
  px(c, 13, hy + 9, skinLo);
  px(c, 12, hy + 10, skinLo);

  // mouth
  const my = hy + 12;
  if (face === 'surprised') {
    rect(c, 12, my - 1, 2, 3, MOUTH);
  } else if (talk) {
    const wide = face === 'happy' || face === 'angry' ? 4 : 2;
    rect(c, 13 - wide / 2, my, wide, 2, MOUTH);
    if (face === 'angry') rect(c, 11, my, 4, 1, WHITE);
    else rect(c, 12, my + 1, 2, 1, TONGUE);
  } else if (face === 'happy') {
    rect(c, 11, my, 4, 1, MOUTH);
    px(c, 10, my - 1, MOUTH);
    px(c, 15, my - 1, MOUTH);
  } else if (face === 'smug') {
    rect(c, 11, my, 3, 1, lip);
    px(c, 14, my - 1, lip);
  } else if (face === 'sad') {
    rect(c, 11, my, 4, 1, MOUTH);
    px(c, 10, my + 1, MOUTH);
    px(c, 15, my + 1, MOUTH);
  } else if (face === 'angry') {
    rect(c, 10, my, 6, 1, MOUTH);
  } else if (face === 'worried') {
    // teeth clenched in a nervous grimace
    rect(c, 10, my, 6, 2, MOUTH);
    rect(c, 11, my, 4, 1, WHITE);
  } else {
    rect(c, 12, my, 3, 1, lip);
  }

  // cheeks
  if (face === 'happy' || face === 'shy') {
    const w = face === 'shy' ? 3 : 2;
    rect(c, 8, hy + 10, w, 1, BLUSH);
    rect(c, 18 - w, hy + 10, w, 1, BLUSH);
  }

  // the little extras drawn over everything
  if (face === 'worried') {
    rect(c, 20, hy + 2, 1, 3, SWEAT);
    px(c, 21, hy + 4, SWEAT);
  }
  if (face === 'sad') {
    px(c, 9, ey + 3, SWEAT);
    px(c, 9, ey + 4, SWEAT);
  }
  if (face === 'angry') {
    // the cross of a throbbing vein
    for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) px(c, 18 + dx, hy - 1 + dy, '#d8443a');
  }
  return canvas;
}

/** Hair over the top of the head and the brow, by style. */
function hairOn(c: Ctx, look: Look, hy: number, hair: string, lo: string, hi: string): void {
  switch (look.hairStyle) {
    case 'short':
      rect(c, 7, hy - 2, 12, 4, hair);
      rect(c, 6, hy - 1, 2, 7, hair);
      rect(c, 18, hy - 1, 2, 5, hair);
      rect(c, 9, hy + 2, 5, 1, hair);
      rect(c, 6, hy + 3, 1, 3, lo);
      rect(c, 10, hy - 2, 4, 1, hi);
      break;
    case 'long':
    case 'shoulder':
      rect(c, 7, hy - 2, 12, 4, hair);
      rect(c, 5, hy - 1, 3, look.hairStyle === 'long' ? 19 : 15, hair);
      rect(c, 18, hy - 1, 3, look.hairStyle === 'long' ? 19 : 15, hair);
      rect(c, 8, hy + 2, 3, 1, hair);
      rect(c, 15, hy + 2, 3, 1, hair);
      rect(c, 5, hy + 4, 1, 10, lo);
      rect(c, 10, hy - 2, 5, 1, hi);
      break;
    case 'bun':
      rect(c, 7, hy - 2, 12, 4, hair);
      // pulled back, but a few strands frame the face down to the jaw
      rect(c, 6, hy - 1, 2, 10, hair);
      rect(c, 18, hy - 1, 2, 10, hair);
      rect(c, 6, hy + 5, 1, 4, lo);
      rect(c, 9, hy - 5, 8, 4, hair);
      rect(c, 9, hy - 2, 8, 1, lo);
      rect(c, 11, hy - 5, 3, 1, hi);
      break;
    case 'cap':
      rect(c, 6, hy + 1, 2, 5, lo);
      rect(c, 18, hy + 1, 2, 5, lo);
      rect(c, 7, hy - 3, 12, 5, hair);
      rect(c, 5, hy + 2, 16, 1, shade(hair, -0.25));
      rect(c, 9, hy - 3, 6, 1, hi);
      break;
    case 'bald':
      rect(c, 6, hy + 3, 1, 4, hair);
      rect(c, 19, hy + 3, 1, 4, hair);
      rect(c, 10, hy, 4, 1, shade(look.skin, 0.15));
      break;
  }
}
