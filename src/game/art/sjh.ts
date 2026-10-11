// St. Joseph Hall, drawn from the photos `SJH BUILDING.jpg` and
// `SJH BUILDING BESIDE CHAPEL.jpg` in `assets/`: two long wings of open
// corridors behind white balcony walls, with teal panels stepping down
// towards the middle, a grey-blue tower over the entrance, a strip of blue
// glass under the roof and a tan stair tower closing each end. The right
// wing is a floor taller than the left.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { rect, signCentered } from '../../engine/pix';
import { P, shade } from './palette';

const GROUND_H = 38;
const FLOOR_H = 20;
const BAY = 28;

const WHITE = '#f1efe8';
const WHITE_LO = '#cfcdc8';
const TEAL = '#5fa59c';
const TEAL_HI = '#7cbdb2';
const TEAL_LO = '#3f7f78';
const VOID = '#4b4853';
const TAN = '#c98a52';
const TAN_HI = '#dba46c';
const TAN_LO = '#a56c3e';
const CREAM = '#efe6cf';
const SKY_GLASS = '#4f7fb8';
const PIER = '#9a4a3a';
const PANEL = '#8f9db8';
const LIT = '#ffd98a';

/** [from, to] along a wing, 0 at the tower end and 1 at the far end, where each floor's balcony wall is teal */
type Bands = ([number, number] | null)[];
const LEFT_BANDS: Bands = [[0.45, 0.7], [0.45, 0.7], [0, 0.7], [0, 0.7], null];
const RIGHT_BANDS: Bands = [[0.3, 0.58], [0.3, 0.58], [0, 0.58], [0, 0.58], null, null];

/** One wing of open corridors. `inner` is which side the tower is on. Returns the y of its roof. */
function wing(c: Ctx, g: Ctx, x: number, w: number, base: number, bands: Bands, inner: 1 | -1, seed: number): number {
  const rand = rng(seed);
  const floors = bands.length;
  const top = base - GROUND_H - (floors + 1) * FLOOR_H;
  rect(c, x, top, w, base - top, VOID);

  bands.forEach((band, i) => {
    const y = base - GROUND_H - (i + 1) * FLOOR_H;
    // the classroom wall at the back of the corridor: doors and windows, some lit
    for (let wx = x + 6; wx < x + w - 14; wx += BAY) {
      rect(c, wx + 5, y + 2, 5, 9, '#38343f');
      rect(c, wx + 13, y + 3, 9, 5, '#66718a');
      if (rand() > 0.6) rect(g, wx + 13, y + 3, 9, 5, LIT);
    }
    // the balcony wall, white with a shadow line under the slab
    rect(c, x, y + 9, w, 11, WHITE);
    rect(c, x, y + 9, w, 1, '#ffffff');
    rect(c, x, y + 17, w, 1, WHITE_LO);
    rect(c, x, y + 19, w, 1, shade(WHITE_LO, -0.25));
    if (band) {
      const a = Math.round(band[0] * w);
      const b = Math.round(band[1] * w);
      const tx = inner > 0 ? x + w - b : x + a;
      rect(c, tx, y + 5, b - a, 14, TEAL);
      rect(c, tx, y + 5, b - a, 2, TEAL_HI);
      rect(c, tx, y + 17, b - a, 2, TEAL_LO);
      for (let sx = tx + BAY; sx < tx + b - a - 2; sx += BAY) rect(c, sx, y + 5, 1, 14, TEAL_LO);
    }
  });
  // columns running the height of the corridors
  for (let cx = x; cx < x + w - 2; cx += BAY) {
    for (let i = 0; i < floors; i++) {
      const y = base - GROUND_H - (i + 1) * FLOOR_H;
      rect(c, cx, y, 3, 9, WHITE);
      rect(c, cx + 2, y, 1, 9, WHITE_LO);
    }
  }

  // the top floor: a strip of blue glass between brown piers, under a thin maroon roof
  rect(c, x, top, w, FLOOR_H, WHITE);
  rect(c, x, top + 5, w, 11, SKY_GLASS);
  rect(c, x, top + 5, w, 2, shade(SKY_GLASS, -0.3));
  for (let wx = x; wx < x + w; wx += 14) {
    rect(c, wx, top + 4, 4, 13, PIER);
    rect(c, wx, top + 4, 1, 13, shade(PIER, 0.25));
    if (rand() > 0.5) rect(c, wx + 5, top + 8, 8, 7, shade(SKY_GLASS, 0.3));
    if (rand() > 0.6) rect(g, wx + 4, top + 7, 10, 9, LIT);
  }
  rect(c, x, top + 17, w, 1, WHITE_LO);
  rect(c, x - 1, top - 1, w + 2, 3, P.maroon);
  rect(c, x - 1, top - 2, w + 2, 1, P.maroonHi);

  // ground floor: glass set back behind a row of columns
  const gy = base - GROUND_H;
  rect(c, x, gy, w, GROUND_H, '#333d4b');
  for (let wx = x + 4; wx < x + w - 6; wx += BAY / 2) {
    rect(c, wx, gy + 9, BAY / 2 - 2, GROUND_H - 14, rand() > 0.4 ? '#5d7890' : '#6f8ea6');
    if (rand() > 0.55) rect(g, wx, gy + 9, BAY / 2 - 2, GROUND_H - 14, LIT);
  }
  rect(c, x, gy + 20, w, 1, '#333d4b');
  rect(c, x, base - 5, w, 5, '#9a958a');
  rect(c, x, gy, w, 6, WHITE);
  rect(c, x, gy + 6, w, 2, '#8f8d93');
  for (let cx = x; cx < x + w - 2; cx += BAY) {
    rect(c, cx - 1, gy + 8, 5, GROUND_H - 8, WHITE);
    rect(c, cx + 3, gy + 8, 1, GROUND_H - 8, WHITE_LO);
  }
  return top - 2;
}

/** A stair tower closing the end of a wing: tan, with a tall thin strip of glass. */
function stairTower(c: Ctx, g: Ctx, x: number, w: number, top: number, base: number): void {
  rect(c, x, top, w, base - top, TAN);
  rect(c, x, top, 3, base - top, TAN_HI);
  rect(c, x + w - 4, top, 4, base - top, TAN_LO);
  rect(c, x - 1, top - 2, w + 2, 3, WHITE);
  const sx = x + Math.round(w / 2) - 2;
  rect(c, sx, top + 12, 5, base - top - 34, '#6f98c4');
  rect(c, sx, top + 12, 1, base - top - 34, '#a9c6e2');
  for (let y = top + 22; y < base - 24; y += 10) rect(c, sx, y, 5, 1, TAN_LO);
  rect(g, sx, top + 12, 5, base - top - 34, '#ffe9b0');
}

/** A side door through the colonnade, with a flat canopy over it. */
function sideDoor(c: Ctx, g: Ctx, cx: number, base: number): void {
  rect(c, cx - 14, base - GROUND_H + 8, 28, GROUND_H - 8, WHITE);
  rect(c, cx - 11, base - 28, 22, 28, P.door);
  rect(c, cx - 10, base - 27, 9, 14, '#5d7890');
  rect(c, cx + 1, base - 27, 9, 14, '#5d7890');
  rect(c, cx, base - 28, 1, 28, WHITE_LO);
  rect(g, cx - 11, base - 28, 22, 28, '#e0a85a');
  rect(c, cx - 19, base - GROUND_H + 4, 38, 4, '#5c6b5e');
  rect(c, cx - 19, base - GROUND_H + 8, 38, 1, '#3f4a42');
  rect(c, cx - 14, base - 2, 28, 2, P.stepHi);
}

export interface Sjh {
  /** scene x of the three ways in: the left wing, the main entrance under the tower, the right wing */
  doors: [number, number, number];
  /** scene x of the middle of the tower, for placing things in front of the entrance */
  tower: number;
}

/**
 * Draws the hall with its left edge at `x`, `w` wide, standing on `base`.
 * Lit windows go on `g` for the night glow.
 */
export function drawSJH(c: Ctx, g: Ctx, x: number, w: number, base: number): Sjh {
  const end = 24;
  const annex = 30;
  const towerW = Math.round(w * 0.15);
  const towerX = x + Math.round(w * 0.36);
  const leftX = x + end;
  const leftW = towerX - leftX;
  const rightX = towerX + towerW;
  const rightW = x + w - end - annex - rightX;

  const leftTop = wing(c, g, leftX, leftW, base, LEFT_BANDS, 1, 811);
  const rightTop = wing(c, g, rightX, rightW, base, RIGHT_BANDS, -1, 812);

  // the ends: a tan stair tower each, and the cream block past the right one
  stairTower(c, g, x, end, leftTop - 4, base);
  const rx = rightX + rightW;
  rect(c, rx, rightTop, 3, base - rightTop, '#a9c0d8');
  stairTower(c, g, rx + 3, end - 3, rightTop - 6, base);
  const ax = rx + end;
  rect(c, ax, rightTop + 12, annex, base - rightTop - 12, CREAM);
  rect(c, ax + annex - 5, rightTop + 12, 5, base - rightTop - 12, shade(CREAM, -0.2));
  rect(c, ax, rightTop + 10, annex, 3, WHITE);
  for (let y = rightTop + 24; y < base - 40; y += FLOOR_H) {
    rect(c, ax + 6, y, 5, 8, '#55617a');
    rect(c, ax + 16, y, 5, 8, '#55617a');
  }
  rect(c, ax, base - 30, annex, 30, '#b5653f');
  rect(c, ax, base - 30, annex, 2, '#cf8560');

  // the tower over the entrance: a grey-blue panel with balconies let into it,
  // a stack of white balconies beside it, and the lift room in tan on top
  const panelW = Math.round(towerW * 0.56);
  const towerTop = rightTop - 6;
  rect(c, towerX, towerTop, panelW, base - towerTop, PANEL);
  rect(c, towerX, towerTop, 3, base - towerTop, shade(PANEL, 0.25));
  rect(c, towerX + panelW - 4, towerTop, 4, base - towerTop, shade(PANEL, -0.2));
  rect(c, towerX, towerTop, panelW, 2, shade(PANEL, 0.35));
  const liftW = Math.round(panelW * 0.62);
  rect(c, towerX + 5, towerTop - 15, liftW, 15, TAN);
  rect(c, towerX + 5, towerTop - 15, 3, 15, TAN_HI);
  rect(c, towerX + 5 + liftW - 4, towerTop - 15, 4, 15, TAN_LO);
  rect(c, towerX + 4, towerTop - 17, liftW + 2, 2, WHITE);
  for (let y = towerTop + 16; y < base - GROUND_H - 2 * FLOOR_H - 12; y += FLOOR_H) {
    rect(c, towerX + 12, y, panelW - 24, 14, '#3a3742');
    rect(c, towerX + 12, y + 9, panelW - 24, 5, WHITE);
    rect(c, towerX + 12, y + 13, panelW - 24, 1, WHITE_LO);
    rect(g, towerX + 14, y + 1, panelW - 28, 7, LIT);
  }
  const stackX = towerX + panelW;
  const stackW = towerW - panelW;
  rect(c, stackX, towerTop + 8, stackW, base - towerTop - 8, VOID);
  for (let y = towerTop + 8; y < base - GROUND_H - 2 * FLOOR_H - 8; y += FLOOR_H) {
    rect(c, stackX, y, stackW, 10, WHITE);
    rect(c, stackX, y, stackW, 1, '#ffffff');
    rect(c, stackX, y + 9, stackW, 1, WHITE_LO);
    rect(c, stackX + 6, y + 12, 6, 8, '#38343f');
    rect(c, stackX + 16, y + 12, stackW - 24, 5, '#66718a');
  }
  rect(c, stackX + stackW - 3, towerTop + 8, 3, base - towerTop - 8, WHITE);

  // the entrance block at its foot: tan, a brown band of windows, the name, and the doors under a flat canopy
  const ex = towerX - 5;
  const ew = towerW + 10;
  const ey = base - GROUND_H - 2 * FLOOR_H - 4;
  const mid = towerX + Math.round(towerW / 2);
  rect(c, ex, ey, ew, base - ey, '#cfae76');
  rect(c, ex, ey, 3, base - ey, '#e2c690');
  rect(c, ex + ew - 5, ey, 5, base - ey, '#a88a58');
  rect(c, ex - 1, ey - 2, ew + 2, 3, WHITE);
  rect(c, ex + 4, ey + 5, ew - 8, 13, '#7a4a35');
  for (let wx = ex + 9; wx < ex + ew - 16; wx += 13) {
    rect(c, wx, ey + 7, 9, 9, '#44506a');
    rect(c, wx + 4, ey + 7, 1, 9, '#7a4a35');
    rect(g, wx, ey + 7, 9, 9, LIT);
  }
  for (let wx = ex + 12; wx < ex + ew - 16; wx += 20) rect(c, wx, ey + 24, 10, 7, '#55617a');
  rect(c, ex + 6, ey + 36, ew - 12, 11, '#2f2a33');
  rect(c, ex + 6, ey + 36, ew - 12, 1, '#55505c');
  signCentered(c, 'ST. JOSEPH HALL', mid, ey + 39, '#efe6c8');
  // the doorway
  rect(c, ex + 8, base - 32, ew - 16, 32, '#262b36');
  for (let dx = ex + 12; dx < ex + ew - 22; dx += 14) {
    rect(c, dx, base - 29, 11, 29, '#5d7890');
    rect(c, dx, base - 29, 11, 1, '#8fb0c8');
    rect(c, dx + 5, base - 29, 1, 29, '#262b36');
  }
  rect(g, ex + 8, base - 32, ew - 16, 32, '#e0a85a');
  rect(c, ex - 8, base - 37, ew + 16, 5, '#5c6b5e');
  rect(c, ex - 8, base - 38, ew + 16, 1, '#7d8c7e');
  rect(c, ex - 8, base - 32, ew + 16, 1, '#3f4a42');
  for (const px0 of [ex - 5, ex + ew + 2]) rect(c, px0, base - 32, 3, 32, WHITE);
  rect(c, ex + 4, base - 2, ew - 8, 2, P.stepHi);

  // the red and white mast on the left wing's roof
  const mx = leftX + Math.round(leftW * 0.42);
  for (let y = leftTop - 44, k = 0; y < leftTop; y += 6, k++) rect(c, mx, y, 2, 6, k % 2 ? '#f1efe8' : '#c8342f');
  rect(c, mx - 3, leftTop - 30, 8, 1, '#8a8d95');
  rect(g, mx, leftTop - 46, 2, 2, '#ff5a4a');

  const doors: [number, number, number] = [
    leftX + Math.round(leftW * 0.45 / BAY) * BAY + BAY / 2 + 1,
    mid,
    rightX + Math.round(rightW * 0.62 / BAY) * BAY + BAY / 2 + 1,
  ];
  sideDoor(c, g, doors[0], base);
  sideDoor(c, g, doors[2], base);
  return { doors, tower: mid };
}

/** The statue of St. Joseph that stands in front of the hall, on a low plinth. */
export function josephStatue(c: Ctx, x: number, base: number): void {
  const stone = '#b9bcc2';
  const hi = '#dfe1e5';
  const lo = '#8a8d95';
  rect(c, x - 9, base - 5, 18, 5, lo);
  rect(c, x - 7, base - 20, 14, 15, '#cfc9ba');
  rect(c, x - 7, base - 20, 3, 15, '#e6e1d4');
  rect(c, x - 9, base - 22, 18, 2, '#e6e1d4');
  rect(c, x - 4, base - 44, 8, 22, stone);
  rect(c, x - 4, base - 44, 3, 22, hi);
  rect(c, x + 2, base - 44, 2, 22, lo);
  rect(c, x - 3, base - 50, 6, 6, stone);
  rect(c, x - 3, base - 50, 2, 6, hi);
  rect(c, x - 3, base - 51, 6, 2, lo);
  // the staff in one hand, the child on the other arm
  rect(c, x + 6, base - 54, 1, 32, lo);
  rect(c, x - 7, base - 40, 4, 8, stone);
  rect(c, x - 7, base - 43, 3, 3, hi);
}
