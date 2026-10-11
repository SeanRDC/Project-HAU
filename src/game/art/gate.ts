// The gate students come in by: the gatehouse itself, the fence either side
// of it, the barricades at the kerb, the bag inspection tent and the ID
// turnstile. The gatehouse, fence and barricades are drawn from
// `HAU SIDE GATE DESIGN.jpg` in `assets/`; the checkpoint furniture is still
// from memory of how campus gates here usually look.

import { Ctx } from '../../engine/display';
import { disc, line, poly, px, rect, sign, signCentered } from '../../engine/pix';
import { P, shade } from './palette';

const STEEL = '#b9bcc4';
const STEEL_HI = '#e2e4e8';
const STEEL_DARK = '#7d808a';
const TARP = '#f3efe4';

const WHITE = '#f4f3ee';
const WHITE_HI = '#ffffff';
const WHITE_LO = '#cfcfd0';
const WHITE_DEEP = '#a9aab0';
const PILLAR = '#e6dfc6';
const PILLAR_HI = '#f4efdc';
const PILLAR_LO = '#bdb596';

export const ARCH_WIDTH = 152;

/**
 * The fence along the street: a low cream kerb wall, black iron railings with
 * a band of scrollwork along the top and bottom, and a square cream pillar
 * every so often with a lantern box on its face.
 */
export function perimeterWall(c: Ctx, x0: number, x1: number, ground: number): void {
  const w = x1 - x0;
  const top = ground - 58;
  for (let x = x0 + 2; x < x1 - 1; x += 4) rect(c, x, top + 2, 1, 50, P.iron);
  // rails, with a band of scrollwork under the top one and over the bottom one
  for (const y of [top, top + 9, ground - 20, ground - 11]) rect(c, x0, y, w, 1, P.iron);
  for (let x = x0 + 2; x < x1 - 5; x += 8) {
    for (const y of [top + 1, ground - 19]) {
      rect(c, x + 1, y + 2, 5, 1, P.iron);
      rect(c, x + 1, y + 5, 5, 1, P.iron);
      rect(c, x + 1, y + 2, 1, 4, P.iron);
      rect(c, x + 5, y + 2, 1, 4, P.iron);
      px(c, x + 3, y + 3, P.ironHi);
    }
  }
  for (let x = x0 + 2; x < x1 - 1; x += 4) px(c, x, top - 2, P.iron);
  rect(c, x0, ground - 9, w, 9, PILLAR);
  rect(c, x0, ground - 9, w, 1, PILLAR_HI);
  rect(c, x0, ground - 2, w, 2, PILLAR_LO);
  for (let x = x0; x < x1 - 10; x += 92) {
    rect(c, x, top - 8, 13, ground - top + 8, PILLAR);
    rect(c, x, top - 8, 3, ground - top + 8, PILLAR_HI);
    rect(c, x + 10, top - 8, 3, ground - top + 8, PILLAR_LO);
    rect(c, x - 2, top - 11, 17, 3, PILLAR_HI);
    rect(c, x - 2, top - 8, 17, 1, PILLAR_LO);
    rect(c, x + 4, top + 14, 5, 12, '#3a3d44');
    rect(c, x + 5, top + 15, 3, 10, '#efe6c8');
  }
}

/**
 * The gatehouse, seen from the street: two thick white piers, a white beam
 * across them with the university seal and HOLY ANGEL UNIVERSITY in black
 * letters, and a low pyramid of glass for a roof. The way through is left
 * open so the layers behind show through; the iron leaves are folded back.
 */
export function gateArch(c: Ctx, cx: number, ground: number): void {
  const half = ARCH_WIDTH / 2;
  const pierW = 24;
  const beamTop = ground - 110;
  const beamH = 38;
  const pier = (x: number) => {
    rect(c, x, beamTop + beamH, pierW, ground - beamTop - beamH, WHITE);
    rect(c, x, beamTop + beamH, 4, ground - beamTop - beamH, WHITE_HI);
    rect(c, x + pierW - 6, beamTop + beamH, 6, ground - beamTop - beamH, WHITE_LO);
    rect(c, x - 1, ground - 6, pierW + 2, 6, WHITE_LO);
    // the glass notice case on the face of the pier
    rect(c, x + 8, ground - 44, 8, 22, '#3a3d44');
    rect(c, x + 9, ground - 43, 6, 20, '#7d8a98');
    rect(c, x + 9, ground - 43, 2, 20, '#a9b6c2');
  };
  // what you see through the gateway: the far piers of the covered way and its ceiling
  rect(c, cx - half + pierW, beamTop + beamH, ARCH_WIDTH - pierW * 2, 12, WHITE_DEEP);
  rect(c, cx - half + pierW, beamTop + beamH + 12, ARCH_WIDTH - pierW * 2, 2, '#8f9096');
  for (const dx of [-30, 24]) {
    rect(c, cx + dx, beamTop + beamH + 14, 7, ground - beamTop - beamH - 14, WHITE_LO);
    rect(c, cx + dx, beamTop + beamH + 14, 2, ground - beamTop - beamH - 14, WHITE);
  }
  pier(cx - half);
  pier(cx + half - pierW);

  // the beam
  rect(c, cx - half - 3, beamTop, ARCH_WIDTH + 6, beamH, WHITE);
  rect(c, cx - half - 3, beamTop, ARCH_WIDTH + 6, 2, WHITE_HI);
  rect(c, cx - half - 3, beamTop + beamH - 2, ARCH_WIDTH + 6, 2, WHITE_LO);
  rect(c, cx + half - 4, beamTop, 7, beamH, WHITE_LO);
  // the seal: a white ring, the shield in maroon and gold inside it
  disc(c, cx, beamTop + 12, 9, '#9a9ca2');
  disc(c, cx, beamTop + 12, 8, WHITE_HI);
  disc(c, cx, beamTop + 12, 6, '#c9cbd0');
  rect(c, cx - 3, beamTop + 8, 7, 6, P.maroon);
  poly(c, [[cx - 3, beamTop + 14], [cx + 4, beamTop + 14], [cx + 0.5, beamTop + 18]], P.maroon);
  rect(c, cx - 3, beamTop + 10, 7, 1, P.gold);
  rect(c, cx, beamTop + 8, 1, 8, P.gold);
  signCentered(c, 'HOLY ANGEL UNIVERSITY', cx, beamTop + 26, '#1c1c22');
  // spotlights on the corners of the beam
  for (const dx of [-half + 4, half - 9]) {
    rect(c, cx + dx, beamTop - 1, 6, 3, '#55585f');
  }

  // cornice and the glass roof
  rect(c, cx - half - 8, beamTop - 5, ARCH_WIDTH + 16, 5, WHITE);
  rect(c, cx - half - 8, beamTop - 5, ARCH_WIDTH + 16, 1, WHITE_HI);
  rect(c, cx - half - 8, beamTop - 1, ARCH_WIDTH + 16, 1, '#b9a878');
  const roofTop = beamTop - 34;
  const glass = '#cfe3ea';
  poly(c, [[cx - half - 4, beamTop - 5], [cx + half + 4, beamTop - 5], [cx + 26, roofTop], [cx - 26, roofTop]], glass);
  poly(c, [[cx - half - 4, beamTop - 5], [cx - 20, beamTop - 5], [cx - 8, roofTop], [cx - 26, roofTop]], '#e6f2f5');
  poly(c, [[cx + 30, beamTop - 5], [cx + half + 4, beamTop - 5], [cx + 26, roofTop], [cx + 12, roofTop]], '#a9c6d0');
  // glazing bars: the hips, then the rafters fanning down from the ridge
  for (let k = -4; k <= 4; k++) line(c, cx + k * 6.5, roofTop, cx + k * (half + 4) / 4, beamTop - 6, '#8fa9b3', 1);
  for (let y = roofTop + 8; y < beamTop - 6; y += 8) {
    const t = (y - roofTop) / (beamTop - 5 - roofTop);
    const hw = 26 + (half + 4 - 26) * t;
    rect(c, cx - hw, y, hw * 2, 1, '#8fa9b3');
  }
  rect(c, cx - 26, roofTop - 1, 53, 2, '#f4f8f9');

  // gate leaves swung open against the piers
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? cx - half + pierW : cx + half - pierW - 14;
    for (const y of [ground - 66, ground - 36, ground - 4]) rect(c, x0, y, 14, 1, P.iron);
    for (let i = 0; i < 14; i += 3) rect(c, x0 + i, ground - 66, 1, 66, i % 6 ? P.iron : P.ironHi);
    for (let i = 0; i < 14; i += 3) px(c, x0 + i, ground - 68, P.iron);
  }
}

/**
 * One of the steel barricades stood along the kerb: a pale yellow frame of
 * mesh on splayed feet with a HAU plate on it. `base` is the road it stands on.
 */
export const BARRICADE_W = 46;

export function barricade(c: Ctx, x: number, base: number): void {
  const frame = '#d9c98a';
  const hi = '#efe2a8';
  const lo = '#a8996a';
  const top = base - 21;
  // mesh
  for (let mx = x + 2; mx < x + BARRICADE_W - 1; mx += 3) rect(c, mx, top + 2, 1, 15, 'rgba(168,153,106,0.75)');
  for (let my = top + 3; my < top + 17; my += 3) rect(c, x + 1, my, BARRICADE_W - 2, 1, 'rgba(168,153,106,0.75)');
  rect(c, x, top, BARRICADE_W, 2, hi);
  rect(c, x, top + 16, BARRICADE_W, 2, frame);
  rect(c, x, top, 2, 18, hi);
  rect(c, x + BARRICADE_W - 2, top, 2, 18, lo);
  rect(c, x + BARRICADE_W / 2 - 1, top, 2, 18, frame);
  // feet
  for (const fx of [x + 1, x + BARRICADE_W - 2]) {
    line(c, fx, top + 18, fx - 3, base, lo, 2);
    line(c, fx, top + 18, fx + 3, base, frame, 2);
  }
  // the plate
  rect(c, x + BARRICADE_W / 2 - 8, top + 5, 16, 8, '#f4f1ea');
  rect(c, x + BARRICADE_W / 2 - 8, top + 5, 16, 1, '#2a2a32');
  rect(c, x + BARRICADE_W / 2 - 8, top + 12, 16, 1, '#2a2a32');
  sign(c, 'HAU', x + BARRICADE_W / 2 - 5, top + 7, '#2a2a32');
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
