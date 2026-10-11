// The main gate on Sto. Rosario St.: the gateway itself, the perimeter wall,
// the bag inspection tent and the ID turnstile. Same palette and helpers as
// the rest of the campus; drawn from memory of how campus gates here usually
// look, not from photos of this one.

import { Ctx } from '../../engine/display';
import { disc, line, poly, px, rect, sign, signCentered } from '../../engine/pix';
import { P, shade } from './palette';

const STEEL = '#b9bcc4';
const STEEL_HI = '#e2e4e8';
const STEEL_DARK = '#7d808a';
const TARP = '#f3efe4';

export const ARCH_WIDTH = 132;

/** Cream wall with an iron fence on top, the same build as the wall by Gate 1. */
export function perimeterWall(c: Ctx, x0: number, x1: number, ground: number): void {
  const w = x1 - x0;
  rect(c, x0, ground - 40, w, 44, P.wall);
  rect(c, x0, ground - 40, w, 3, P.wallLit);
  rect(c, x0, ground - 4, w, 4, P.wallShade);
  rect(c, x0, ground - 44, w, 4, P.trim);
  rect(c, x0, ground - 44, w, 1, P.trimShade);
  for (let x = x0 + 3; x < x1 - 1; x += 5) rect(c, x, ground - 62, 1, 18, P.iron);
  rect(c, x0, ground - 62, w, 1, P.iron);
  rect(c, x0, ground - 54, w, 1, P.ironHi);
  // a pier every so often
  for (let x = x0; x < x1 - 8; x += 64) {
    rect(c, x, ground - 66, 9, 70, P.wallLit);
    rect(c, x + 6, ground - 66, 3, 70, P.wallShade);
    rect(c, x - 1, ground - 68, 11, 3, P.trim);
  }
}

/**
 * The gateway, seen face on: two piers, a maroon name board across the top
 * and the iron gate leaves folded back. The middle is left open so the
 * layers behind show through.
 */
export function gateArch(c: Ctx, cx: number, ground: number): void {
  const half = ARCH_WIDTH / 2;
  const top = ground - 118;
  const pier = (x: number) => {
    rect(c, x, top + 20, 20, ground - top - 20, P.wall);
    rect(c, x, top + 20, 5, ground - top - 20, P.wallLit);
    rect(c, x + 15, top + 20, 5, ground - top - 20, P.wallShade);
    rect(c, x - 3, ground - 10, 26, 10, P.trimShade);
    rect(c, x - 3, ground - 11, 26, 1, P.trim);
    // recessed panel and a lantern on each pier
    rect(c, x + 5, top + 52, 10, 34, P.wallShade);
    rect(c, x + 6, top + 53, 8, 32, P.wall);
    rect(c, x + 8, top + 38, 5, 8, '#efe6c8');
    rect(c, x + 7, top + 37, 7, 1, P.iron);
    rect(c, x + 7, top + 46, 7, 1, P.iron);
  };
  pier(cx - half);
  pier(cx + half - 20);

  // the name board
  rect(c, cx - half - 6, top, ARCH_WIDTH + 12, 4, P.trim);
  rect(c, cx - half - 4, top + 4, ARCH_WIDTH + 8, 22, P.maroon);
  rect(c, cx - half - 4, top + 4, ARCH_WIDTH + 8, 2, P.maroonHi);
  rect(c, cx - half - 4, top + 24, ARCH_WIDTH + 8, 2, shade(P.maroon, -0.3));
  rect(c, cx - half - 6, top + 26, ARCH_WIDTH + 12, 3, P.trim);
  rect(c, cx - half - 6, top + 29, ARCH_WIDTH + 12, 1, P.trimDeep);
  signCentered(c, 'HOLY ANGEL UNIVERSITY', cx, top + 9, P.goldHi);
  rect(c, cx - 30, top + 17, 60, 1, P.gold);
  signCentered(c, 'MAIN GATE', cx, top + 19, '#f0d9b0');
  // seal on a little pediment above the board
  poly(c, [[cx - 20, top], [cx + 20, top], [cx, top - 12]], P.trim);
  poly(c, [[cx - 20, top], [cx, top], [cx, top - 12]], P.trimShade);
  disc(c, cx, top - 3, 6, P.gold);
  disc(c, cx, top - 3, 4, P.maroon);
  disc(c, cx, top - 3, 2, P.goldHi);

  // gate leaves swung open against the piers
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? cx - half + 20 : cx + half - 20 - 16;
    rect(c, x0, ground - 76, 16, 1, P.iron);
    rect(c, x0, ground - 40, 16, 1, P.iron);
    rect(c, x0, ground - 4, 16, 1, P.iron);
    for (let i = 0; i < 16; i += 3) rect(c, x0 + i, ground - 76, 1, 76, i % 6 ? P.iron : P.ironHi);
    for (let i = 0; i < 16; i += 3) px(c, x0 + i, ground - 78, P.gold);
  }
}

/** The bag inspection tent: four poles and a striped maroon and white roof. */
export function canopy(c: Ctx, x0: number, x1: number, ground: number): void {
  const top = ground - 78;
  for (const x of [x0 + 2, x1 - 4]) {
    rect(c, x, top, 2, ground - top + 4, STEEL_DARK);
    rect(c, x, top, 1, ground - top + 4, STEEL);
  }
  // roof: a shallow pitch with stripes
  poly(c, [[x0 - 6, top + 2], [x1 + 6, top + 2], [x1 - 14, top - 14], [x0 + 14, top - 14]], TARP);
  for (let x = x0 - 2; x < x1 + 4; x += 16) {
    poly(c, [[x, top + 2], [x + 8, top + 2], [x + 8 - (x - (x0 + x1) / 2) * 0.12, top - 14], [x - (x - (x0 + x1) / 2) * 0.12, top - 14]], P.maroon);
  }
  rect(c, x0 - 6, top + 2, x1 - x0 + 12, 1, shade(P.maroon, -0.3));
  // scalloped valance
  for (let x = x0 - 6; x < x1 + 6; x += 8) {
    const col = Math.floor((x - x0) / 8) % 2 ? TARP : P.maroon;
    rect(c, x, top + 3, 8, 4, col);
    rect(c, x + 1, top + 7, 6, 1, col);
    rect(c, x + 2, top + 8, 4, 1, col);
  }
  // a bulb hanging from the middle
  const mid = Math.round((x0 + x1) / 2);
  rect(c, mid, top + 3, 1, 8, P.iron);
  rect(c, mid - 1, top + 11, 3, 3, '#fff1c8');
}

/** Folding table with a grey tray on it. Returns the y of the table top. */
export function bagTable(c: Ctx, x: number, base: number): number {
  const top = base - 15;
  rect(c, x - 16, top, 32, 2, '#f1eee6');
  rect(c, x - 16, top + 2, 32, 1, '#c9c4b8');
  line(c, x - 13, top + 3, x - 7, base, P.iron, 1);
  line(c, x - 7, top + 3, x - 13, base, P.iron, 1);
  line(c, x + 13, top + 3, x + 7, base, P.iron, 1);
  line(c, x + 7, top + 3, x + 13, base, P.iron, 1);
  // tray for phones and keys
  rect(c, x - 14, top - 2, 9, 2, '#8a8d96');
  rect(c, x - 14, top - 2, 9, 1, '#a6a9b0');
  return top;
}

/** "BAG INSPECTION" placard on a stand. */
export function inspectionSign(c: Ctx, x: number, base: number): void {
  rect(c, x, base - 24, 1, 24, P.iron);
  rect(c, x - 3, base - 1, 7, 1, P.iron);
  rect(c, x - 20, base - 40, 41, 17, P.trim);
  rect(c, x - 20, base - 40, 41, 3, P.maroon);
  rect(c, x - 20, base - 24, 41, 1, P.trimDeep);
  signCentered(c, 'BAG', x + 1, base - 35, P.maroon);
  signCentered(c, 'INSPECTION', x + 1, base - 29, P.maroon);
}

/** A bag sitting on the table, unzipped and open when `open` is set. */
export function bagOnTable(c: Ctx, x: number, tableTop: number, color: string, open: boolean): void {
  const dark = shade(color, -0.3);
  rect(c, x - 5, tableTop - 9, 11, 9, color);
  rect(c, x - 5, tableTop - 9, 2, 9, dark);
  rect(c, x - 3, tableTop - 11, 7, 2, dark); // handle
  if (open) {
    // flap folded back, the stuff inside peeking out
    rect(c, x - 5, tableTop - 10, 11, 2, '#2a2030');
    rect(c, x - 3, tableTop - 13, 4, 4, '#f4f1ea'); // notebook
    rect(c, x + 1, tableTop - 14, 2, 5, '#3d5a8a'); // umbrella
    rect(c, x + 3, tableTop - 12, 2, 3, '#e3b33b'); // lunch box
    rect(c, x + 6, tableTop - 8, 3, 7, dark); // flap
  } else {
    rect(c, x - 5, tableTop - 7, 11, 1, dark);
  }
}

/** Waist-high stainless turnstile cabinet with the card reader on top. */
export function turnstile(c: Ctx, x: number, base: number): void {
  rect(c, x - 7, base - 18, 14, 18, STEEL);
  rect(c, x - 7, base - 18, 3, 18, STEEL_HI);
  rect(c, x + 4, base - 18, 3, 18, STEEL_DARK);
  rect(c, x - 8, base - 20, 16, 2, STEEL_HI);
  rect(c, x - 7, base - 2, 14, 2, STEEL_DARK);
  // a yellow stripe and the arrow that says which way to go
  rect(c, x - 7, base - 8, 14, 2, '#d8c23a');
  poly(c, [[x - 3, base - 13], [x + 1, base - 16], [x + 1, base - 10]], '#4bbf6a');
  // hub the arms turn on
  disc(c, x + 7, base - 14, 2, STEEL_DARK);
  // card reader box, its screen is drawn live
  rect(c, x + 1, base - 25, 8, 5, '#2a2a32');
  rect(c, x + 1, base - 25, 8, 1, '#45454f');
}

export type ReaderState = 'idle' | 'ok' | 'deny';

/** The reader's little screen. Drawn every frame so it can light up. */
export function readerScreen(c: Ctx, x: number, base: number, state: ReaderState, time: number): void {
  const sx = x + 2;
  const sy = base - 24;
  const col = state === 'ok' ? '#4bdc78' : state === 'deny' ? '#ff4a4a' : Math.sin(time * 3) > 0 ? '#5aa0ff' : '#3a70c8';
  rect(c, sx, sy, 6, 4, col);
  if (state === 'ok') {
    px(c, sx + 1, sy + 2, '#eaffef');
    px(c, sx + 2, sy + 3, '#eaffef');
    px(c, sx + 3, sy + 2, '#eaffef');
    px(c, sx + 4, sy + 1, '#eaffef');
  } else if (state === 'deny') {
    line(c, sx + 1, sy, sx + 4, sy + 3, '#ffe0e0', 1);
    line(c, sx + 4, sy, sx + 1, sy + 3, '#ffe0e0', 1);
  }
}

/** The turnstile arm. `open` 0 is barring the way, 1 has dropped down out of it. */
export function turnstileArm(c: Ctx, x: number, base: number, open: number): void {
  const a = open * Math.PI * 0.5;
  const hx = x + 7;
  const hy = base - 14;
  line(c, hx, hy, hx + Math.cos(a) * 13, hy + Math.sin(a) * 13, STEEL_HI, 2);
  line(c, hx, hy + 1, hx + Math.cos(a) * 13, hy + 1 + Math.sin(a) * 13, STEEL_DARK, 1);
  disc(c, hx, hy, 1, STEEL_DARK);
}

/** The ID card held up to the reader. */
export function idCard(c: Ctx, x: number, y: number): void {
  rect(c, x, y, 4, 5, '#f4f1ea');
  rect(c, x, y, 4, 1, P.maroon);
  rect(c, x + 1, y + 2, 2, 2, '#c99468');
}

/** Metal stanchion and rail guiding the line to the turnstile. */
export function railing(c: Ctx, x0: number, x1: number, base: number): void {
  for (let x = x0; x <= x1; x += 24) {
    rect(c, x, base - 14, 2, 14, STEEL_DARK);
    rect(c, x, base - 14, 1, 14, STEEL);
  }
  rect(c, x0, base - 14, x1 - x0 + 2, 1, STEEL_HI);
  rect(c, x0, base - 8, x1 - x0 + 2, 1, STEEL);
}

/** Painted "NO ID, NO ENTRY" board for the wall. */
export function noIdBoard(c: Ctx, x: number, y: number): void {
  rect(c, x, y, 46, 15, P.trim);
  rect(c, x, y, 46, 1, P.trimShade);
  rect(c, x, y + 14, 46, 1, P.trimDeep);
  sign(c, 'NO ID', x + 13, y + 2, P.maroon);
  sign(c, 'NO ENTRY', x + 7, y + 8, P.maroon);
}
