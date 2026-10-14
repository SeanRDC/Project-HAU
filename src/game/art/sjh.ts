// St. Joseph Hall, drawn from the photos `SJH BUILDING.jpg` and
// `SJH BUILDING BESIDE CHAPEL.jpg` in `assets/other references/`, and the
// straight-on front in `assets/SJH BUILDING/01_front...`: two long wings of
// open corridors behind white balcony walls, brown piers along the classroom
// walls behind, teal panels stepping across the middle floors, a first floor
// clad in silver metal over a ground floor under a white awning on thin
// posts, a strip of blue glass under the roof, and a terracotta stair tower
// closing each end. Over the entrance, a tower of silver panels round cream
// stone and dark glass, then a brown band of windows, the name in white on
// black across brown stone, and a curved canopy over the doors.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { ellipse, line, rect, signCentered } from '../../engine/pix';
import { P, shade } from './palette';

const GROUND_H = 38;
const FLOOR_H = 20;
const BAY = 28;

const WHITE = '#f1efe8';
const WHITE_LO = '#cfcdc8';
const TEAL = '#6aa9a3';
const TEAL_HI = '#8cc2bb';
const TEAL_LO = '#4a8580';
const VOID = '#4b4853';
const TERRA = '#a8573e';
const TERRA_HI = '#c06a4e';
const TERRA_LO = '#83412e';
const CREAM = '#efe6cf';
const SKY_GLASS = '#4f7fb8';
const PIER = '#7a4636';
const SILVER = '#a9b5c2';
const SILVER_HI = '#c8d1db';
const SILVER_LO = '#8996a5';
const STONE = '#8f7662';
const LIT = '#ffd98a';

/**
 * What each corridor floor's balcony wall looks like, lowest first: `clad` is
 * the silver metal of the first floor; [from, to] is where it is teal, along
 * the wing from 0 at the tower end to 1 at the far end; null is plain white.
 */
type Floor = 'clad' | [number, number] | null;
const LEFT_FLOORS: Floor[] = ['clad', [0.42, 0.75], [0.4, 0.72], [0, 0.68], [0, 0.64], null];
const RIGHT_FLOORS: Floor[] = ['clad', [0.34, 0.6], [0.3, 0.58], [0, 0.56], [0, 0.54], null];

/** Silver metal panels with their seams and a few rain streaks. */
function silver(c: Ctx, x: number, y: number, w: number, h: number, seed: number): void {
  const rand = rng(seed);
  rect(c, x, y, w, h, SILVER);
  for (let sx = x + 7; sx < x + w; sx += 8) rect(c, sx, y, 1, h, SILVER_LO);
  for (let sy = y + 6; sy < y + h; sy += 7) rect(c, x, sy, w, 1, SILVER_LO);
  rect(c, x, y, w, 1, SILVER_HI);
  for (let i = 0; i < w / 10; i++) rect(c, x + rand() * w, y + 1, 1, 2 + rand() * (h - 3), shade(SILVER, -0.12));
}

/** One wing of open corridors. `inner` is which side the tower is on. Returns the y of its roof. */
function wing(c: Ctx, g: Ctx, x: number, w: number, base: number, floors: Floor[], inner: 1 | -1, seed: number): number {
  const rand = rng(seed);
  const top = base - GROUND_H - (floors.length + 1) * FLOOR_H;
  rect(c, x, top, w, base - top, VOID);

  floors.forEach((floor, i) => {
    const y = base - GROUND_H - (i + 1) * FLOOR_H;
    // the classroom wall at the back of the corridor: brown piers, doors and windows, some lit
    for (let wx = x + 6; wx < x + w - 14; wx += BAY) {
      rect(c, wx, y, 3, 10, PIER);
      rect(c, wx + 14, y, 3, 10, PIER);
      rect(c, wx + 5, y + 2, 5, 8, '#38343f');
      rect(c, wx + 18, y + 3, 7, 5, '#66718a');
      if (rand() > 0.6) rect(g, wx + 18, y + 3, 7, 5, LIT);
    }
    if (floor === 'clad') {
      // the first floor's balcony is walled in silver panels the whole length
      silver(c, x, y + 6, w, 14, seed + i);
      rect(c, x, y + 19, w, 1, shade(SILVER_LO, -0.3));
      return;
    }
    // the balcony wall, white with a shadow line under the slab
    rect(c, x, y + 9, w, 11, WHITE);
    rect(c, x, y + 9, w, 1, '#ffffff');
    rect(c, x, y + 17, w, 1, WHITE_LO);
    rect(c, x, y + 19, w, 1, shade(WHITE_LO, -0.25));
    if (floor) {
      const a = Math.round(floor[0] * w);
      const b = Math.round(floor[1] * w);
      const tx = inner > 0 ? x + w - b : x + a;
      rect(c, tx, y + 5, b - a, 14, TEAL);
      rect(c, tx, y + 5, b - a, 2, TEAL_HI);
      rect(c, tx, y + 17, b - a, 2, TEAL_LO);
      for (let sx = tx + BAY; sx < tx + b - a - 2; sx += BAY) rect(c, sx, y + 5, 1, 14, TEAL_LO);
    }
  });
  // columns running the height of the corridors, above the clad floor
  for (let cx = x; cx < x + w - 2; cx += BAY) {
    for (let i = 1; i < floors.length; i++) {
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

  // ground floor: rooms in the shade behind the columns, under a white awning on thin posts,
  // with a steel rail along the front
  const gy = base - GROUND_H;
  rect(c, x, gy, w, GROUND_H, '#333d4b');
  for (let wx = x + 4; wx < x + w - 6; wx += BAY / 2) {
    rect(c, wx, gy + 12, BAY / 2 - 2, GROUND_H - 17, rand() > 0.4 ? '#5d7890' : '#6f8ea6');
    if (rand() > 0.55) rect(g, wx, gy + 12, BAY / 2 - 2, GROUND_H - 17, LIT);
  }
  rect(c, x, gy + 22, w, 1, '#333d4b');
  rect(c, x, base - 5, w, 5, '#9a958a');
  for (let cx = x; cx < x + w - 2; cx += BAY) rect(c, cx, gy, 4, GROUND_H, '#5a5f6a');
  rect(c, x, gy + 6, w, 4, '#f6f5f0');
  rect(c, x, gy + 6, w, 1, '#ffffff');
  rect(c, x, gy + 10, w, 1, WHITE_LO);
  rect(c, x, gy + 11, w, 2, 'rgba(20,20,30,0.35)');
  // the awning hangs on slanted steel struts, leaning out from the foot of the rail
  for (let px0 = x + 3; px0 < x + w - 8; px0 += 14) line(c, px0, base - 7, px0 + 6, gy + 10, '#e8e8e4', 1);
  rect(c, x, base - 10, w, 1, '#c9ccd2');
  rect(c, x, base - 7, w, 1, '#aeb2b9');
  return top - 2;
}

/**
 * The end of the hall (photos 03 to 07 of `assets/SJH BUILDING/`): a terracotta
 * stair tower with its landings open in a stack of dark slots, a silver strip
 * down its outer side, and past that a cream block a little taller than the
 * wings, each floor's window framed by a projecting cream fin, standing on
 * two floors of terracotta tile. `outer` is which way the cream block faces.
 */
function endBlock(c: Ctx, g: Ctx, x: number, towerW: number, creamW: number, top: number, base: number, outer: 1 | -1): void {
  const tx = outer > 0 ? x : x + creamW;
  const cx = outer > 0 ? x + towerW + 3 : x;
  // the stair tower
  rect(c, tx, top, towerW, base - top, TERRA);
  rect(c, tx, top, 2, base - top, TERRA_HI);
  rect(c, tx + towerW - 3, top, 3, base - top, TERRA_LO);
  rect(c, tx - 1, top - 2, towerW + 2, 2, WHITE);
  const sx = outer > 0 ? tx + 4 : tx + towerW - 12;
  for (let y = top + 8; y < base - GROUND_H - 4; y += FLOOR_H) {
    rect(c, sx, y, 8, 13, '#3a2e30');
    rect(c, sx, y + 9, 8, 1, '#8a5a44');
    rect(g, sx, y + 2, 8, 6, LIT);
  }
  // the silver strip between the tower and the cream block
  const stx = outer > 0 ? tx + towerW : cx + creamW;
  rect(c, stx, top + 4, 3, base - top - 4, SILVER);
  rect(c, stx, top + 4, 1, base - top - 4, SILVER_HI);
  // the cream block, its windows in a stack of fins, on a terracotta tiled base
  const ctop = top - 4;
  rect(c, cx, ctop, creamW, base - ctop, CREAM);
  rect(c, cx, ctop, creamW, 2, '#fbf5e4');
  rect(c, outer > 0 ? cx + creamW - 4 : cx, ctop, 4, base - ctop, shade(CREAM, -0.18));
  const tileTop = base - GROUND_H - FLOOR_H;
  const wx = cx + Math.round(creamW / 2) - 4;
  for (let y = ctop + 8; y < tileTop - 8; y += FLOOR_H) {
    rect(c, wx, y + 3, 8, 12, '#5f86b0');
    rect(c, wx, y + 3, 2, 12, '#8fb0d0');
    rect(g, wx, y + 4, 8, 10, LIT);
    rect(c, wx - 3, y + 1, 14, 2, '#f8f1de');
    rect(c, wx - 3, y + 3, 14, 1, shade(CREAM, -0.3));
    rect(c, wx - 3, y + 15, 14, 2, '#f8f1de');
  }
  rect(c, cx, tileTop, creamW, base - tileTop, TERRA);
  rect(c, cx, tileTop, creamW, 2, '#efe6cf');
  for (let y = tileTop + 7; y < base; y += 6) rect(c, cx, y, creamW, 1, TERRA_LO);
  for (let k = 0, y = tileTop + 2; y < base; y += 6, k++) {
    for (let vx = cx + (k % 2 ? 5 : 0); vx < cx + creamW; vx += 10) rect(c, vx, y, 1, 5, TERRA_LO);
  }
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
  const end = 22;
  const annex = 30;
  const towerW = Math.round(w * 0.13);
  const towerX = x + Math.round(w * 0.36);
  const leftX = x + annex + end + 3;
  const leftW = towerX - leftX;
  const rightX = towerX + towerW;
  const rightW = x + w - end - annex - 3 - rightX;
  /** the top of corridor floor `i`, 0 being the silver-clad first floor */
  const fy = (i: number): number => base - GROUND_H - (i + 1) * FLOOR_H;
  const gy = base - GROUND_H;

  const leftTop = wing(c, g, leftX, leftW, base, LEFT_FLOORS, 1, 811);
  const rightTop = wing(c, g, rightX, rightW, base, RIGHT_FLOORS, -1, 812);

  // the ends: a terracotta stair tower and a cream block each, mirrored
  endBlock(c, g, x, end, annex, leftTop - 4, base, -1);
  endBlock(c, g, rightX + rightW, end, annex, rightTop - 4, base, 1);

  // the tower over the entrance: silver panels framing a strip of cream stone with a dark
  // window across each of the three floors under the roof, and the lift room on top
  const tw = (f: number): number => towerX + Math.round(towerW * f);
  const towerTop = rightTop - 4;
  const shoulder = fy(2) - 4;
  silver(c, towerX, towerTop, towerW, shoulder - towerTop, 821);
  rect(c, towerX, towerTop, 2, shoulder - towerTop, SILVER_HI);
  rect(c, towerX + towerW - 3, towerTop, 3, shoulder - towerTop, SILVER_LO);
  rect(c, towerX - 1, towerTop - 2, towerW + 2, 2, SILVER_HI);
  rect(c, tw(0.14), fy(5), tw(0.86) - tw(0.14), shoulder - fy(5), '#e4dac2');
  rect(c, tw(0.14), fy(5), 2, shoulder - fy(5), '#f2ead6');
  rect(c, tw(0.86) - 2, fy(5), 2, shoulder - fy(5), '#c7bba1');
  for (let i = 3; i <= 5; i++) {
    const y = fy(i) + 3;
    rect(c, tw(0.28), y, tw(0.72) - tw(0.28), 13, '#2c3038');
    rect(c, tw(0.28), y, tw(0.72) - tw(0.28), 1, '#4a5260');
    rect(c, tw(0.28) + 3, y + 3, 2, 8, '#4f5a6c');
    rect(c, tw(0.28), y + 13, tw(0.72) - tw(0.28), 1, '#c7bba1');
    rect(g, tw(0.28), y + 6, tw(0.72) - tw(0.28), 7, '#9a7440');
  }
  const liftX = tw(0.32);
  const liftW = tw(0.68) - liftX;
  rect(c, liftX, towerTop - 16, liftW, 14, '#e9e1cf');
  rect(c, liftX, towerTop - 16, 2, 14, '#f6f0e2');
  rect(c, liftX + liftW - 3, towerTop - 16, 3, 14, '#c9bfa8');
  rect(c, liftX, towerTop - 11, liftW, 3, '#7a4a35');
  rect(c, liftX - 1, towerTop - 18, liftW + 2, 2, WHITE);

  // under the tower, the front of the entrance block, a little wider: a cream band, a brown
  // band with four windows, another cream band, then brown stone with the name across it
  const ex = towerX - 3;
  const ew = towerW + 6;
  const mid = towerX + Math.round(towerW / 2);
  rect(c, ex, shoulder, ew, 4, '#eadfb8');
  rect(c, ex, fy(2), ew, fy(1) - 4 - fy(2), '#6e4a3a');
  rect(c, ex, fy(2), ew, 1, '#8a6250');
  const winW = Math.floor((ew - 10) / 4);
  for (let k = 0; k < 4; k++) {
    const wx = ex + 6 + k * winW;
    rect(c, wx, fy(2) + 4, winW - 4, 8, '#3a4050');
    rect(c, wx, fy(2) + 4, winW - 4, 1, '#d8d8d0');
    for (let mx = wx + 3; mx < wx + winW - 5; mx += 4) rect(c, mx, fy(2) + 5, 1, 7, '#8a96a8');
    rect(g, wx, fy(2) + 5, winW - 4, 7, LIT);
  }
  rect(c, ex, fy(1) - 4, ew, 4, '#eadfb8');
  rect(c, ex, fy(1), ew, base - fy(1), STONE);
  rect(c, ex, fy(1), 2, base - fy(1), shade(STONE, 0.18));
  rect(c, ex + ew - 3, fy(1), 3, base - fy(1), shade(STONE, -0.2));
  for (let sy = fy(1) + 6; sy < gy; sy += 6) rect(c, ex, sy, ew, 1, shade(STONE, -0.08));
  // the name, white on a black band
  rect(c, ex, fy(1) + 5, ew, 11, '#1f2228');
  rect(c, ex, fy(1) + 5, ew, 1, '#3a3e46');
  signCentered(c, 'ST. JOSEPH HALL', mid, fy(1) + 8, '#f4f2ea');
  // the dark recess over the canopy, with the brown louvres in the middle
  rect(c, ex + 8, fy(0) + 3, ew - 16, gy - fy(0) - 5, '#26262b');
  const lx = tw(0.24);
  const lw = tw(0.76) - lx;
  rect(c, lx, fy(0) + 4, lw, gy - fy(0) - 7, '#5e4434');
  for (let ly = fy(0) + 5; ly < gy - 3; ly += 2) rect(c, lx, ly, lw, 1, '#7a5a44');

  // the doors: dark glass between grey stone piers, lit from inside at night
  rect(c, ex + 4, gy + 6, ew - 8, base - gy - 6, '#5f5b56');
  rect(c, ex + 12, gy + 10, ew - 24, base - gy - 10, '#262d38');
  for (let dx = ex + 14; dx < ex + ew - 22; dx += 13) {
    rect(c, dx, gy + 14, 10, base - gy - 16, '#3f4e60');
    rect(c, dx, gy + 14, 10, 1, '#7d93ab');
    rect(c, dx + 2, gy + 16, 1, base - gy - 20, '#56687e');
  }
  rect(g, ex + 12, gy + 10, ew - 24, base - gy - 10, '#e0a85a');
  // the canopy, a long curved slab of dark grey-green metal with rounded ends
  const cx0 = ex - 6;
  const cw = ew + 12;
  rect(c, cx0 + 2, gy - 2, cw - 4, 1, '#9fb0ad');
  rect(c, cx0, gy - 1, cw, 6, '#4d5d5b');
  rect(c, cx0 + 1, gy + 5, cw - 2, 1, '#38423f');
  rect(c, cx0 + 2, gy, cw - 4, 1, '#71837f');
  rect(c, cx0, gy + 6, cw, 2, 'rgba(20,20,30,0.35)');
  // the steps up to the doors
  rect(c, ex + 2, base - 4, ew - 4, 2, P.stepHi);
  rect(c, ex - 2, base - 2, ew + 4, 2, shade(P.stepHi, -0.12));

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

/**
 * The statue of Mary at the right-hand end of the hall (photos 03 and 04),
 * "A Mother's Prayer for her Unborn Child": white, a pale blue mantle, arms
 * held open, on a white pedestal with a black plaque and a ring of flowers.
 */
export function maryStatue(c: Ctx, x: number, base: number): void {
  // her shadow on the grass (the island itself is the scene's, see scenes/sjh.ts)
  ellipse(c, x + 3, base - 1, 14, 2, 'rgba(20,40,20,0.35)');

  // the pedestal: eight-sided, so a lit face, a broad front and a shaded face, under a moulded cap
  const pw = 22;
  const ph = 16;
  const pt = base - ph;
  rect(c, x - pw / 2, pt, pw, ph, '#e9e7e1');
  rect(c, x - pw / 2, pt, 4, ph, '#fbfaf6');
  rect(c, x + pw / 2 - 5, pt, 5, ph, '#c4c2bb');
  rect(c, x + pw / 2 - 5, pt, 1, ph, '#d6d4cd');
  rect(c, x - pw / 2 - 2, pt - 3, pw + 4, 2, '#f6f5f0');
  rect(c, x - pw / 2 - 2, pt - 1, pw + 4, 1, '#c9c7c0');
  rect(c, x - pw / 2 - 1, base - 2, pw + 2, 2, '#cfcdc6');
  // the black plaque with its prayer
  rect(c, x - 7, pt + 3, 12, 11, '#1d1f24');
  rect(c, x - 7, pt + 3, 12, 1, '#3a3d45');
  rect(c, x - 5, pt + 5, 8, 1, '#d8d4c8');
  for (let k = 0; k < 3; k++) rect(c, x - 4 + (k % 2), pt + 8 + k * 2, 6 - (k % 2) * 2, 1, '#7d808a');

  // the flowers round her feet: a mound of dark leaves, yellow and white blooms
  const fy = pt - 3;
  ellipse(c, x, fy, 13, 3, '#2f5e2a');
  ellipse(c, x - 1, fy - 1, 11, 2, '#447a35');
  const blooms: [number, number, string][] = [
    [-11, 0, '#f2d34a'], [-8, -2, '#fbfaf2'], [-5, -1, '#f2d34a'], [-2, -3, '#f6e27a'], [1, -1, '#fbfaf2'],
    [4, -2, '#f2d34a'], [7, -1, '#fbfaf2'], [10, 0, '#f2d34a'], [-6, 1, '#fbfaf2'], [5, 1, '#f6e27a'],
  ];
  for (const [dx, dy, col] of blooms) rect(c, x + dx, fy + dy, 2, 2, col);

  // Mary, standing on the flowers. Rows are counted up from her feet; the light comes from the left
  const feet = fy - 2;
  const hi = '#ffffff';
  const robe = '#e6eaef';
  const fold = '#ccd4dd';
  const shadow = '#aab5c2';
  const blue = '#93b8dc';
  const blueLo = '#6d94c0';
  const row = (k: number, l: number, r: number): void => {
    const y = feet - k;
    rect(c, x - l, y, l + r + 1, 1, robe);
    rect(c, x - l, y, 2, 1, hi);
    rect(c, x + r - 2, y, 3, 1, shadow);
  };
  // the robe, falling straight from the bodice and flaring a little at the hem
  for (let k = 0; k < 22; k++) {
    const hw = Math.round(7 - k * 0.09);
    row(k, hw, hw);
    // two long soft folds down the front
    if (k > 1 && k < 19) rect(c, x - 3, feet - k, 1, 1, fold);
    if (k < 16) rect(c, x + 2, feet - k, 1, 1, fold);
  }
  rect(c, x - 7, feet, 15, 1, '#c3ccd6');
  // the bodice and shoulders
  for (let k = 22; k < 30; k++) row(k, k < 28 ? 5 : 6, k < 28 ? 5 : 6);
  // where the veil meets her shoulders, the neck and the neckline of the robe
  rect(c, x - 5, feet - 30, 11, 1, blue);
  rect(c, x + 4, feet - 30, 2, 1, blueLo);
  rect(c, x - 1, feet - 30, 3, 1, '#eef0f3');
  // the heart on her breast, ringed with thorns
  rect(c, x - 1, feet - 26, 3, 3, '#c7ccd3');
  rect(c, x, feet - 25, 1, 1, '#9aa3ae');
  rect(c, x - 2, feet - 25, 1, 1, '#b3bac4');
  rect(c, x + 2, feet - 25, 1, 1, '#b3bac4');
  // the mantle: pale blue, from the veil down both sides behind her, darker on the shaded side
  for (let k = 3; k < 31; k++) {
    const hw = k < 22 ? Math.round(7 - k * 0.09) : k < 28 ? 5 : 6;
    rect(c, x - hw - 1, feet - k, 1, 1, blue);
    rect(c, x + hw + 1, feet - k, 2, 1, k > 6 ? blueLo : blue);
  }
  // the arms held out and a little down, in wide bell sleeves, the hands turned palm out
  for (const s of [-1, 1]) {
    for (let i = 0; i <= 8; i++) {
      const ax = x + s * (5 + i);
      const ay = feet - 27 + Math.round(i * 0.5);
      rect(c, ax, ay, 1, 3 + Math.floor(i / 3), s < 0 ? robe : '#d9dfe6');
      rect(c, ax, ay, 1, 1, s < 0 ? hi : robe);
      rect(c, ax, ay + 2 + Math.floor(i / 3), 1, 1, shadow);
    }
    rect(c, x + s * 14 - (s < 0 ? 1 : 0), feet - 24, 2, 2, '#eceef1');
  }
  // the head: a soft oval face framed by long hair, under a rounded blue veil that falls
  // to her shoulders and on into the mantle
  const hy = feet - 39;
  const veil: [number, number][] = [[-1, 1], [-2, 2], [-3, 3], [-3, 3], [-3, 3], [-3, 3], [-4, 3], [-4, 4], [-5, 4]];
  veil.forEach(([l, rr], i) => {
    rect(c, x + l, hy + i, rr - l + 1, 1, blue);
    rect(c, x + rr, hy + i, 1, 1, blueLo);
  });
  rect(c, x - 1, hy, 2, 1, '#b4d0ea');
  rect(c, x - 2, hy + 2, 4, 6, '#cdd3db');
  rect(c, x - 1, hy + 2, 3, 5, '#f1f2f4');
  rect(c, x - 1, hy + 2, 1, 4, '#ffffff');
  rect(c, x - 1, hy + 4, 1, 1, '#c8ced6');
  rect(c, x + 1, hy + 4, 1, 1, '#c8ced6');
  rect(c, x, hy + 7, 1, 1, '#e6e9ed');

}

export interface MgnOptions {
  /** height of each corridor floor */
  fh?: number;
  /** height of the open ground floor */
  groundH?: number;
  seed?: number;
}

/**
 * The Mamerto G. Nepomuceno Building, from `assets/MGN BUILDING/`: plain
 * white, four floors of open corridors over an open ground floor. At its left
 * end (by SJH) a white service block with a grey rounded tank on the roof,
 * small dark windows and a dark awning over a little balcony; at its right
 * end a wing with a stack of deep box windows and an open stair climbing up
 * under it. Draws it with its left edge at `x`, `w` wide, standing on
 * `base`. Returns the x of its door.
 */
export function drawMGN(c: Ctx, g: Ctx, x: number, w: number, base: number, o: MgnOptions = {}): number {
  const fh = o.fh ?? 20;
  const groundH = o.groundH ?? 30;
  const rand = rng(o.seed ?? 82);
  const white = '#f3f2ec';
  const lo = '#d3d1ca';
  const shadeCol = '#bdbbb4';
  const floors = 4;
  const top = base - groundH - floors * fh;
  const endW = Math.round(fh * 2.2);
  const wingW = Math.round(fh * 4.4);
  const midX = x + endW;
  const midW = w - endW - wingW;
  const wingX = midX + midW;

  // the long middle: corridors deep in shade, thick white balcony walls with a thin rail on top
  rect(c, midX, top, midW, base - top, '#45424c');
  for (let i = 0; i < floors; i++) {
    const y = base - groundH - (i + 1) * fh;
    rect(c, midX, y, midW, Math.round(fh * 0.45), '#3a3741');
    for (let wx = midX + 6; wx < midX + midW - 20; wx += Math.round(fh * 1.1)) {
      rect(c, wx + 2, y + 3, 4, Math.round(fh * 0.4), '#2c2a31');
      rect(c, wx + 8, y + 4, 7, 3, '#5d687e');
      if (rand() > 0.6) rect(g, wx + 8, y + 4, 7, 3, LIT);
    }
    const wy = y + Math.round(fh * 0.5);
    const wh = fh - Math.round(fh * 0.5);
    rect(c, midX, wy, midW, wh, white);
    rect(c, midX, wy, midW, 1, '#ffffff');
    rect(c, midX, wy - 2, midW, 1, '#a9a6a0');
    rect(c, midX, wy + wh - 2, midW, 2, lo);
  }
  for (let cx = midX; cx < midX + midW - 2; cx += Math.round(fh * 2.2)) {
    rect(c, cx, top, 3, base - groundH - top, white);
    rect(c, cx + 2, top, 1, base - groundH - top, lo);
  }
  // the roof edge, a deep white fascia
  rect(c, midX - 2, top - 5, midW + 4, 5, white);
  rect(c, midX - 2, top - 5, midW + 4, 1, '#ffffff');
  rect(c, midX - 2, top, midW + 4, 1, shadeCol);

  // the open ground floor: rooms in the shade behind the columns, the door in the middle
  const gy = base - groundH;
  rect(c, midX, gy, midW, groundH, '#3e3c44');
  for (let wx = midX + 8; wx < midX + midW - 20; wx += Math.round(fh * 1.6)) {
    rect(c, wx, gy + 8, 12, groundH - 10, '#55657a');
    if (rand() > 0.5) rect(g, wx, gy + 8, 12, groundH - 10, LIT);
  }
  for (let cx = midX; cx < midX + midW - 2; cx += Math.round(fh * 2.2)) rect(c, cx, gy, 4, groundH, white);
  const door = midX + Math.round(midW * 0.55);
  rect(c, door - 9, gy + 6, 19, groundH - 6, '#26252b');
  rect(c, door - 8, gy + 8, 8, groundH - 8, '#4d5d72');
  rect(c, door + 1, gy + 8, 8, groundH - 8, '#4d5d72');
  rect(g, door - 9, gy + 6, 19, groundH - 6, '#e0a85a');

  // the service block at the left end
  mgnEnd(c, g, x, endW, base, fh, groundH, floors);

  // the wing at the right end: deep square window boxes stacked up its face, an open stair under it
  const wt = top - 6;
  rect(c, wingX, wt, wingW, base - groundH - wt, white);
  rect(c, wingX, wt, 3, base - groundH - wt, shadeCol);
  rect(c, wingX - 2, wt - 4, wingW + 4, 4, white);
  rect(c, wingX - 2, wt, wingW + 4, 1, shadeCol);
  rect(c, wingX + 8, wt - 12, wingW - 30, 8, '#b4b9bf');
  rect(c, wingX + 9, wt - 14, wingW - 32, 2, '#c9cdd2');
  for (let i = 0; i < floors; i++) {
    const y = base - groundH - (i + 1) * fh;
    const bx = wingX + Math.round(wingW * 0.3);
    const bw = Math.round(wingW * 0.42);
    rect(c, bx - 2, y + 2, bw + 4, fh - 4, '#ffffff');
    rect(c, bx, y + 4, bw, fh - 8, '#2e2c33');
    rect(c, bx, y + 4, bw, 2, '#1f1e24');
    rect(c, bx, y + fh - 6, bw, 1, '#8a8f98');
    rect(c, bx - 2, y + fh - 3, bw + 4, 2, lo);
    rect(c, wingX + wingW - 10, y + 6, 6, fh - 10, '#2e2c33');
  }
  // its ground floor: open on columns, the stair climbing from right to left behind them
  rect(c, wingX, gy, wingW, groundH, '#e9e7e0');
  rect(c, wingX, gy, wingW, 4, white);
  rect(c, wingX, gy + 4, wingW, 1, shadeCol);
  for (let k = 0; k < 10; k++) {
    const sx = wingX + wingW - 12 - k * 4;
    rect(c, sx, base - 3 - k * 2, 5, 2, '#bdbbb4');
  }
  // the stair's handrail and its posts
  const r0: [number, number] = [wingX + wingW - 8, base - 10];
  const r1: [number, number] = [wingX + wingW - 50, base - 30];
  line(c, r0[0], r0[1], r1[0], r1[1], '#3a3741', 1);
  for (let t = 0; t <= 1; t += 0.2) rect(c, Math.round(r0[0] + (r1[0] - r0[0]) * t), Math.round(r0[1] + (r1[1] - r0[1]) * t), 1, 6, '#3a3741');
  for (const cx of [wingX + 4, wingX + Math.round(wingW * 0.5), wingX + wingW - 5]) rect(c, cx, gy + 4, 4, groundH - 4, white);
  rect(c, x, base - 2, w, 2, '#bdb9b0');
  return door;
}

/**
 * The end of MGN nearest SJH (the part outlined on `assets/MGN BUILDING/05_left-side`):
 * a narrow white service block with a grey ribbed tank on the roof, small dark
 * windows and a little balcony under a dark slanted awning. From in front of
 * SJH this end is all you see of MGN, since the rest of it runs off at right
 * angles, away along the road.
 */
export function mgnEnd(c: Ctx, g: Ctx, x: number, endW: number, base: number, fh: number, groundH: number, floors = 4): void {
  const white = '#f3f2ec';
  const shadeCol = '#bdbbb4';
  const top = base - groundH - floors * fh;
  const et = top - 6;
  rect(c, x, et, endW, base - et, white);
  rect(c, x, et, 2, base - et, '#ffffff');
  rect(c, x + endW - 4, et, 4, base - et, shadeCol);
  rect(c, x - 1, et - 3, endW + 2, 3, white);
  rect(c, x - 1, et, endW + 2, 1, shadeCol);
  rect(c, x + 3, et - 11, endW - 8, 8, '#b4b9bf');
  rect(c, x + 4, et - 13, endW - 10, 2, '#c9cdd2');
  for (let rx = x + 5; rx < x + endW - 6; rx += 3) rect(c, rx, et - 11, 1, 8, '#9ea4ab');
  for (let i = 0; i < floors; i++) {
    const y = base - groundH - (i + 1) * fh;
    rect(c, x + 6, y + 4, 4, 7, '#2c2a31');
    if (i === 1) {
      // the little balcony under its dark awning
      rect(c, x + endW - 14, y + 8, 14, fh - 8, '#3a3741');
      rect(c, x + endW - 14, y + fh - 4, 14, 2, white);
      rect(c, x + endW - 16, y + 3, 17, 3, '#2a2d34');
      rect(c, x + endW - 16, y + 6, 17, 1, '#4a4e58');
    }
  }
  rect(c, x + 6, base - groundH + 6, 6, 12, '#2c2a31');

}
