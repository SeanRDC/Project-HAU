// The east end of APS and the canteen in it, drawn from the photos in
// `assets/PANERGO AND GIL APS BUILDING/` and `assets/APS WALK FROM CHAPEL LAWN/`.
// Outside, walking towards the gym lane: the tall block where the long wing
// ends, its floors wrapped in deep balcony slabs with rounded edges over
// arched openings; a plain white stair tower; then the canteen block, cream,
// with a deep white box under every window and the canteen itself open on
// the ground floor under a blue-grey awning with a scalloped white edge, on
// square pillars faced in stacked tan stone. The brick patio with its
// umbrellas runs along the front of all three. Inside: white floor tiles, a
// black ceiling with white dropped panels, downlights and dome lamps, and the
// stalls along the back wall: Yum-Yum's, Granny Jing's, Rina's Food Station
// and Byfrost.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, line, poly, px, rect, signCentered, signWidth } from '../../engine/pix';
import { shade } from './palette';
import { foliage } from './props';

const WHITE = '#f1f0eb';
const WHITE_HI = '#ffffff';
const WHITE_LO = '#cfceca';
const LIT = '#ffd98a';
export const STONE = '#b39a74';
const STONE_HI = '#cdb48c';
const STONE_LO = '#8c7656';
const TILE = '#e6e2d8';
const TILE_LINE = '#c9c4b8';
const AWNING = '#ece9f2';
const AWNING_LO = '#c8c3d8';
const TRUSS = '#e9e6de';
const STRIPE = '#d0503c';

/** A square pillar faced in stacked tan stone from the floor up `h` pixels. */
export function stonePillar(c: Ctx, x: number, base: number, w: number, h: number): void {
  rect(c, x, base - h, w, h, STONE);
  rect(c, x, base - h, 2, h, STONE_HI);
  rect(c, x + w - 2, base - h, 2, h, STONE_LO);
  for (let sy = base - h + 2, k = 0; sy < base - 1; sy += 3, k++) {
    rect(c, x + 1, sy, w - 2, 1, shade(STONE, -0.12));
    rect(c, x + (k % 2 ? 3 : Math.round(w * 0.6)), sy - 2, 1, 2, STONE_LO);
    if (k % 3 === 1) rect(c, x + 3, sy - 1, Math.max(2, w - 8), 1, STONE_HI);
  }
}

/** The awning's scalloped plastic edge, `w` long, hanging from `y`. */
export function scallops(c: Ctx, x: number, y: number, w: number): void {
  rect(c, x, y, w, 3, AWNING);
  rect(c, x, y + 2, w, 1, AWNING_LO);
  for (let sx = x + 3; sx < x + w; sx += 7) {
    disc(c, sx, y + 3, 3.5, AWNING);
    rect(c, sx - 2, y + 6, 4, 1, AWNING_LO);
  }
}

/** The steel truss under the awning, with the red stripe along its edge beam. */
function truss(c: Ctx, x: number, y: number, w: number): void {
  rect(c, x, y, w, 1, TRUSS);
  rect(c, x, y + 6, w, 1, TRUSS);
  for (let tx = x; tx < x + w - 6; tx += 6) {
    line(c, tx, y + 6, tx + 3, y + 1, TRUSS, 1);
    line(c, tx + 3, y + 1, tx + 6, y + 6, TRUSS, 1);
  }
  rect(c, x, y + 7, w, 1, STRIPE);
}

/** A canteen table with its benches fixed to the same frame, seen side on. */
export function canteenTable(c: Ctx, x: number, base: number, top: string, w = 30, h = 12): void {
  const leg = '#3a3a42';
  const legHi = '#8a8d95';
  // the frame: legs, and the bar joining the benches to the table
  rect(c, x + 3, base - h, 2, h, leg);
  rect(c, x + w - 5, base - h, 2, h, leg);
  rect(c, x + 3, base - h, 1, h, legHi);
  rect(c, x - 6, base - Math.round(h * 0.45), w + 12, 1, leg);
  // the top, thick enough to read, with its lit front edge
  rect(c, x, base - h - 3, w, 3, top);
  rect(c, x, base - h - 3, w, 1, shade(top, 0.3));
  rect(c, x, base - h, w, 1, shade(top, -0.35));
  // a bench at each end, lower than the table
  for (const bx of [x - 9, x + w + 1]) {
    rect(c, bx, base - Math.round(h * 0.55) - 2, 8, 2, top);
    rect(c, bx, base - Math.round(h * 0.55) - 2, 8, 1, shade(top, 0.3));
    rect(c, bx + 3, base - Math.round(h * 0.55), 1, Math.round(h * 0.55), leg);
  }
}

/** A screen of dark lattice with a white diamond pattern, as behind the patio tables. */
function lattice(c: Ctx, x: number, y: number, w: number, h: number): void {
  const hi = '#d9d0c4';
  rect(c, x, y, w, h, '#3a2f2c');
  for (let ly = y + 2; ly < y + h - 4; ly += 6) {
    for (let lx = x + 1; lx < x + w - 5; lx += 6) {
      px(c, lx + 2, ly, hi);
      px(c, lx + 1, ly + 1, hi);
      px(c, lx + 3, ly + 1, hi);
      px(c, lx, ly + 2, hi);
      px(c, lx + 4, ly + 2, hi);
      px(c, lx + 1, ly + 3, hi);
      px(c, lx + 3, ly + 3, hi);
      px(c, lx + 2, ly + 4, hi);
    }
  }
  rect(c, x, y, w, 1, '#241c1a');
}

/**
 * The tall block where the long wing of APS ends: seven floors, two wide bays
 * either side of a column with a downpipe down it. Each floor is an open
 * corridor behind a deep white balcony slab with rounded edges, and the
 * openings between the slabs have curved corners, so every bay reads as a
 * row of flattened arches. The top floor is a plain wall with rows of small
 * windows over a band of rain stains. The ground floor is set back behind a
 * white planter wall with a steel rail, its windows dark behind white
 * geometric grilles. Left edge at `x`, `w` wide, standing on `base`.
 * Returns the y of its top.
 */
export function balconyBlock(c: Ctx, g: Ctx, x: number, w: number, base: number, seed = 91): number {
  const rand = rng(seed);
  const GROUND_H = 40;
  const FLOOR_H = 20;
  const FLOORS = 5;
  const TOP_H = 18;
  const gy = base - GROUND_H;
  const topY = gy - FLOORS * FLOOR_H - TOP_H;
  const COL = 6;
  const mid = x + Math.round(w / 2);
  const bays: [number, number][] = [[x + COL, mid - COL / 2], [mid + COL / 2, x + w - COL]];

  // the top floor: a plain wall, rows of small white-framed windows, the stained soffit under it
  rect(c, x, topY, w, TOP_H, '#eceae4');
  for (const [b0, b1] of bays) {
    for (let k = 0; k < 2; k++) {
      const wx = Math.round(b0 + 8 + k * ((b1 - b0) / 2));
      const ww = Math.round((b1 - b0) / 2 - 16);
      rect(c, wx - 1, topY + 3, ww + 2, 8, '#f8f7f3');
      rect(c, wx, topY + 4, ww, 6, '#3d4250');
      for (let mx = wx + 3; mx < wx + ww; mx += 4) rect(c, mx, topY + 4, 1, 6, '#f8f7f3');
      if (rand() > 0.6) rect(g, wx, topY + 4, ww, 6, LIT);
    }
  }
  rect(c, x, topY + TOP_H - 4, w, 4, '#8f8b80');
  for (let sx = x; sx < x + w; sx += 2) rect(c, sx, topY + TOP_H - 4, 1, 1 + Math.round(rand() * 3), '#6f6c64');
  // the roof edge
  rect(c, x - 2, topY - 4, w + 4, 4, WHITE);
  rect(c, x - 2, topY - 4, w + 4, 1, WHITE_HI);
  rect(c, x - 2, topY - 1, w + 4, 1, WHITE_LO);

  // the balcony floors
  for (let i = 0; i < FLOORS; i++) {
    const y = gy - (i + 1) * FLOOR_H;
    for (const [b0, b1] of bays) {
      const bw = b1 - b0;
      // the corridor behind, in shade: the pale back wall, a band of classroom windows low on it
      const oh = FLOOR_H - 9;
      rect(c, b0, y, bw, oh, '#8d8a92');
      rect(c, b0, y, bw, 2, '#6a6670');
      rect(c, b0 + 4, y + 5, bw - 8, 4, '#3d4250');
      for (let mx = b0 + 4; mx < b1 - 4; mx += 5) rect(c, mx, y + 5, 1, 4, '#2a2730');
      for (let lx = b0 + 6; lx < b1 - 14; lx += 22) if (rand() > 0.6) rect(g, lx, y + 5, 14, 4, LIT);
      // the opening is an arch: big curved corners where the slab above meets the columns
      for (let k = 0; k < 7; k++) {
        const r = Math.round(7 - Math.sqrt(49 - (7 - k) * (7 - k)) + (k < 1 ? 1 : 0));
        if (r <= 0) continue;
        rect(c, b0, y + k, r, 1, WHITE);
        rect(c, b1 - r, y + k, r, 1, WHITE);
        px(c, b0 + r, y + k, WHITE_LO);
      }
      // the steel rail along the top of the slab
      rect(c, b0, y + oh - 3, bw, 1, '#9a9aa0');
      for (let rx = b0 + 4; rx < b1; rx += 10) rect(c, rx, y + oh - 3, 1, 3, '#9a9aa0');
      // the slab: a deep white band that bulges out past the columns, rounded top and bottom
      const sy = y + oh;
      rect(c, b0 - 2, sy, bw + 4, 9, WHITE);
      rect(c, b0 - 1, sy, bw + 2, 1, WHITE_HI);
      rect(c, b0 - 3, sy + 2, bw + 6, 5, WHITE);
      rect(c, b0 - 3, sy + 2, 1, 5, WHITE_LO);
      rect(c, b0 + bw + 2, sy + 2, 1, 5, WHITE_LO);
      rect(c, b0 - 2, sy + 1, bw + 4, 1, WHITE_HI);
      rect(c, b0 - 1, sy + 7, bw + 2, 1, WHITE_LO);
      rect(c, b0 + 1, sy + 8, bw - 2, 1, shade(WHITE_LO, -0.18));
      // a few rust streaks running down from the drains
      if (rand() > 0.5) rect(c, Math.round(b0 + 8 + rand() * (bw - 16)), sy + 3, 1, 4, '#d8d2c2');
    }
  }

  // the ground floor: set back, arched openings, grilled windows, behind a planter wall
  rect(c, x, gy, w, GROUND_H, '#4a4650');
  rect(c, x, gy, w, 3, '#2f2c34');
  const arch = Math.max(30, Math.round((w - COL) / 6));
  for (let ax = x + COL; ax < x + w - COL; ax += arch) {
    const aw = Math.min(arch - 5, x + w - COL - ax);
    if (aw < 12) continue;
    lattice(c, ax + 4, gy + 10, aw - 8, 16);
    if (rand() > 0.5) rect(g, ax + 4, gy + 10, aw - 8, 16, '#c89a5a');
    for (let k = 0; k < 7; k++) {
      const r = 7 - k;
      rect(c, ax, gy + k, r, 1, WHITE);
      rect(c, ax + aw - r, gy + k, r, 1, WHITE);
    }
    rect(c, ax + aw, gy, 5, GROUND_H - 12, WHITE);
    rect(c, ax + aw + 4, gy, 1, GROUND_H - 12, WHITE_LO);
  }
  rect(c, x, base - 12, w, 12, WHITE);
  rect(c, x, base - 12, w, 1, WHITE_HI);
  rect(c, x, base - 2, w, 2, WHITE_LO);
  // young plants along the top of the planter wall
  for (let px0 = x + 4; px0 < x + w - 4; px0 += 5) rect(c, px0, base - 14, 1, 2 + (px0 % 3), '#6f9a4a');
  rect(c, x, base - 18, w, 1, '#b4b4b9');
  for (let rx = x + 6; rx < x + w; rx += 15) rect(c, rx, base - 18, 1, 6, '#9a9aa0');

  // the columns between the bays, and the downpipe down the middle one
  for (const cx of [x, mid - COL / 2, x + w - COL]) {
    rect(c, cx, topY + TOP_H, COL, base - 12 - topY - TOP_H, WHITE);
    rect(c, cx + COL - 1, topY + TOP_H, 1, base - 12 - topY - TOP_H, WHITE_LO);
  }
  rect(c, mid + 1, topY + TOP_H, 1, base - topY - TOP_H - 2, '#a9a9ae');
  return topY - 4;
}

/**
 * The stair tower between the tall block and the canteen block: a plain white
 * tower rising a floor above both, its stucco gone grey and green with damp
 * near the ground. The narrow side facing the tall block has a slit window at
 * every landing and a dark doorway at the bottom; the wide face to the road is
 * blank but for two pairs of moulded ledges, and the far corner steps in a
 * little at every floor. Left edge at `x`, `w` wide, `h` tall.
 */
export function stairTower(c: Ctx, x: number, w: number, base: number, h: number, seed = 95): void {
  const rand = rng(seed);
  const top = base - h;
  const SIDE = 12;
  const face = '#f3f2ee';
  // the side, in shade, with the landing windows
  rect(c, x, top, SIDE, h, '#dedcd5');
  rect(c, x, top, 1, h, WHITE_LO);
  for (let wy = top + 12; wy < base - 40; wy += 20) {
    rect(c, x + 3, wy, 6, 13, '#3a3e4a');
    rect(c, x + 3, wy, 6, 1, '#26242a');
    rect(c, x + 2, wy + 13, 8, 1, WHITE_HI);
  }
  rect(c, x + 2, base - 26, 9, 26, '#2f2c34');
  rect(c, x + 2, base - 26, 9, 1, '#1f1d22');
  // the face to the road
  rect(c, x + SIDE, top, w - SIDE, h, face);
  for (let i = 0; i < (w - SIDE) * h * 0.04; i++) {
    px(c, x + SIDE + rand() * (w - SIDE), top + rand() * h, rand() > 0.5 ? '#e6e4dd' : '#fafaf7');
  }
  // the two pairs of ledges
  for (const ly of [base - 104, base - 98, base - 58, base - 52]) {
    rect(c, x + SIDE, ly, w - SIDE, 2, WHITE_HI);
    rect(c, x + SIDE, ly + 2, w - SIDE, 1, '#c9c7bf');
    for (let sx = x + SIDE; sx < x + w; sx += 3) if (rand() > 0.6) px(c, sx, ly + 3, '#d4d2ca');
  }
  // the far corner stepping in at each floor
  for (let ry = top + 16; ry < base - 20; ry += 20) {
    rect(c, x + w - 5, ry, 5, 2, WHITE_HI);
    rect(c, x + w - 5, ry + 2, 5, 1, WHITE_LO);
  }
  rect(c, x + w - 2, top, 2, h, '#e2e0d9');
  // the cap, and the damp stain along the bottom
  rect(c, x - 1, top - 3, w + 2, 3, WHITE);
  rect(c, x - 1, top - 3, w + 2, 1, WHITE_HI);
  for (let sx = x + SIDE; sx < x + w; sx++) {
    const dh = 4 + Math.round(rand() * 4);
    rect(c, sx, base - dh, 1, dh, rand() > 0.5 ? '#c4c6b4' : '#b5bba3');
  }
}

/**
 * The canteen block, the wing of APS that comes forward towards the lawn:
 * five floors in a creamier white than the rest, stained grey along its roof
 * edge. Every window is a wide dark-framed one with blinds behind it, sitting
 * on a deep white box with rounded corners. The canteen is the ground floor,
 * open to the patio under a blue-grey awning on a steel truss with a red
 * stripe and a scalloped white edge, on square pillars faced in stacked tan
 * stone, up three tiled steps. Left edge at `x`, `w` wide, standing on
 * `base`. Returns the x of the steps, where you walk in.
 */
export function canteenBlock(c: Ctx, g: Ctx, x: number, w: number, base: number, seed = 81): number {
  const rand = rng(seed);
  const GROUND_H = 60;
  const FLOOR_H = 22;
  const FLOORS = 4;
  const CREAM = '#eee8da';
  const gy = base - GROUND_H;
  const top = gy - FLOORS * FLOOR_H;
  const n = Math.max(2, Math.round(w / 44));
  const bay = (w - 4) / n;

  rect(c, x, top, w, gy - top, CREAM);
  for (let i = 0; i < FLOORS; i++) {
    const y = gy - (i + 1) * FLOOR_H;
    for (let k = 0; k < n; k++) {
      const bx = Math.round(x + 4 + k * bay);
      const bw = Math.round(bay) - 4;
      // the window: dark frame, a transom, mullions, blinds pulled halfway in some
      rect(c, bx + 2, y + 3, bw - 4, 11, '#2f2a28');
      rect(c, bx + 3, y + 4, bw - 6, 9, '#566170');
      rect(c, bx + 3, y + 7, bw - 6, 1, '#2f2a28');
      for (let mx = bx + 3 + 6; mx < bx + bw - 4; mx += 7) rect(c, mx, y + 4, 1, 9, '#2f2a28');
      if (rand() > 0.4) {
        const drop = 2 + Math.round(rand() * 5);
        for (let by = y + 8; by < y + 8 + drop; by += 2) rect(c, bx + 3, by, bw - 6, 1, '#a9a49a');
      }
      if (rand() > 0.6) rect(g, bx + 3, y + 4, bw - 6, 9, LIT);
      // the deep box under it, rounded at the bottom corners
      rect(c, bx, y + 14, bw, 6, '#f8f6f0');
      rect(c, bx, y + 14, bw, 1, WHITE_HI);
      rect(c, bx + 1, y + 20, bw - 2, 1, '#f8f6f0');
      rect(c, bx + 2, y + 21, bw - 4, 1, '#c9c4b6');
      px(c, bx, y + 19, CREAM);
      px(c, bx + bw - 1, y + 19, CREAM);
      // a stain run down the wall below it
      if (rand() > 0.5) rect(c, Math.round(bx + 4 + rand() * (bw - 8)), y + 22, 1, 3 + Math.round(rand() * 4), '#d8cfb8');
    }
  }
  // piers between the bays
  for (let k = 0; k <= n; k++) {
    const px0 = Math.round(x + k * bay);
    rect(c, px0, top, 4, gy - top, '#f6f1e6');
    rect(c, px0 + 3, top, 1, gy - top, '#d6cfbf');
  }
  // the parapet, stained dark along its top edge
  rect(c, x - 2, top - 6, w + 4, 6, '#f2ede2');
  rect(c, x - 2, top - 6, w + 4, 2, '#8a8a86');
  for (let sx = x - 2; sx < x + w + 2; sx += 2) rect(c, sx, top - 4, 1, 1 + Math.round(rand() * 2), '#a8a69e');

  // the canteen, open to the patio: dark under the awning, the lit back wall of the stalls further in
  const fl = base - 14;
  rect(c, x, gy, w, GROUND_H, '#2a282e');
  rect(c, x, gy + 17, w, fl - gy - 17, '#d9d4c8');
  rect(c, x, gy + 17, w, 2, shade('#d9d4c8', -0.35));
  // the stalls along the back: a sign, a counter with its glass case of food
  const signs = [['YUM-YUMS', '#f6efe2', '#2f4f9a'], ['GRANNY JINGS', '#e8806a', '#f6efe2'], ['BYFROST', '#3f6fc8', '#ffffff']] as const;
  const stallW = Math.floor((w - 8) / signs.length);
  signs.forEach(([name, bg, fg], i) => {
    const sx = x + 4 + i * stallW;
    rect(c, sx + 9, gy + 19, stallW - 16, 9, bg);
    rect(c, sx + 9, gy + 19, stallW - 16, 1, shade(bg, 0.3));
    rect(c, sx + 9, gy + 27, stallW - 16, 1, shade(bg, -0.35));
    if (signWidth(name) < stallW - 18) signCentered(c, name, sx + 9 + (stallW - 16) / 2, gy + 21, fg);
    // the counter, its glass case lit, a row of food behind the glass
    rect(c, sx + 9, gy + 30, stallW - 16, fl - gy - 30, '#e8dcc4');
    rect(c, sx + 9, gy + 30, stallW - 16, 1, '#f6eedc');
    rect(c, sx + 11, gy + 31, stallW - 20, 5, '#b4d6dc');
    for (let fx = sx + 12; fx < sx + stallW - 10; fx += 4) rect(c, fx, gy + 34, 3, 2, ['#c98a3a', '#e0c070', '#a83a2a'][(fx >> 2) % 3]);
    rect(c, sx + 11, gy + 36, stallW - 20, 1, '#c8342f');
    rect(g, sx + 9, gy + 30, stallW - 16, fl - gy - 30, LIT);
  });
  // the tiled floor and the three steps up to it
  rect(c, x, fl, w, 6, TILE);
  for (let k = 0; k < 3; k++) {
    rect(c, x, base - 8 + k * 3 - 1, w, 1, TILE_LINE);
    rect(c, x, base - 8 + k * 3, w, 2, k % 2 ? TILE : shade(TILE, 0.05));
  }
  for (let fx = x + 2; fx < x + w; fx += 8) rect(c, fx, fl, 1, 6, TILE_LINE);
  // pillars faced in stone up to head height, white above; one painted yellow by Byfrost's stall
  for (let k = 0; k <= signs.length; k++) {
    const px0 = Math.min(x + w - 9, x + k * stallW);
    rect(c, px0, gy, 9, fl - 20 - gy, WHITE);
    rect(c, px0 + 7, gy, 2, fl - 20 - gy, WHITE_LO);
    if (k === 3) {
      rect(c, px0, fl - 20, 9, 20, '#e8c43a');
      rect(c, px0 + 7, fl - 20, 2, 20, '#c8a42a');
    } else stonePillar(c, px0, fl, 9, 20);
  }
  // the awning: blue-grey sheeting over a steel truss, the red stripe, the scalloped edge
  rect(c, x - 2, gy - 4, w + 4, 5, '#4f6a8a');
  rect(c, x - 2, gy - 4, w + 4, 1, '#7a92ae');
  for (let ax = x; ax < x + w; ax += 4) rect(c, ax, gy - 3, 1, 4, '#3f5872');
  truss(c, x, gy + 1, w);
  scallops(c, x - 2, gy + 9, w + 4);
  // the black railing along the front, with a gap at the steps
  const gapL = x + Math.round(w * 0.4);
  const gapR = gapL + 30;
  for (const [r0, r1] of [[x, gapL], [gapR, x + w]]) {
    rect(c, r0, base - 9, r1 - r0, 1, '#26242a');
    rect(c, r0, base - 5, r1 - r0, 1, '#26242a');
    for (let rx = r0; rx < r1; rx += 6) rect(c, rx, base - 9, 1, 9, '#26242a');
  }
  return gapL + 15;
}

/**
 * The far end of the canteen block, where it meets the lane to the covered
 * court (photos 21 and 22 of the walk): the plain end wall seen at an angle,
 * a black steel fire escape zigzagging up it from a white concrete box at
 * first-floor height with security cameras under it, and at the bottom the
 * canteen's back doors with coolers, crates and a water drum stacked
 * outside. `x` is where the block's front ends, `w` how much of the end wall
 * shows, and the block is `h` tall.
 */
export function canteenEnd(c: Ctx, g: Ctx, x: number, w: number, base: number, h: number, seed = 87): void {
  const rand = rng(seed);
  const top = base - h;
  const box = base - 62;
  // the end wall, in shade, grubby with rain
  rect(c, x, top, w, base - top, '#d9d2c2');
  rect(c, x, top, w, 3, '#8a8a86');
  for (let i = 0; i < w * h * 0.05; i++) px(c, x + rand() * w, top + 3 + rand() * (h - 3), rand() > 0.5 ? '#cfc7b6' : '#e2dccd');
  rect(c, x + 2, top + 3, 1, h - 3, '#b8b2a4');
  rect(c, x + w - 4, top + 6, 2, h - 6, '#c9c2b2');
  // a window on each landing, dark
  for (let wy = box - 22; wy > top + 8; wy -= 22) rect(c, x + 6, wy - 14, 7, 11, '#3a3e4a');
  // the ground floor under the box: the back doors, a grilled window, everything stacked outside
  rect(c, x, box, w, base - box, '#e6e0d2');
  rect(c, x + 4, base - 30, 13, 30, '#3a3540');
  rect(c, x + 4, base - 30, 13, 1, '#26242a');
  rect(c, x + 20, base - 30, 9, 9, '#3a3e4a');
  for (let gx = x + 21; gx < x + 29; gx += 2) rect(c, gx, base - 30, 1, 9, '#e8e6e0');
  rect(g, x + 5, base - 29, 11, 29, '#c89a5a');
  // the white box at first-floor height that the fire escape lands on, the cameras under its corner
  rect(c, x - 4, box - 14, w + 12, 16, '#f2f0ea');
  rect(c, x - 4, box - 14, w + 12, 1, '#ffffff');
  rect(c, x - 4, box + 1, w + 12, 1, '#c9c4b6');
  rect(c, x - 4, box + 2, w + 12, 1, 'rgba(40, 30, 44, 0.25)');
  for (const cx of [x - 2, x + 6]) {
    rect(c, cx, box + 2, 1, 2, '#6a6670');
    rect(c, cx - 1, box + 4, 4, 2, '#e4e4e0');
    px(c, cx + 2, box + 5, '#26242a');
  }
  // coolers, crates, a pink tub and the blue water drum
  const stack: [number, number, number, number, string][] = [
    [-14, 9, 13, 9, '#2f5fb0'], [-12, 17, 9, 8, '#2f5fb0'], [-1, 8, 9, 8, '#e8b33a'], [8, 6, 7, 6, '#e88aa8'],
    [w - 9, 15, 9, 15, '#2a6ab0'], [w - 18, 7, 9, 7, '#5fae3a'],
  ];
  for (const [dx, dy, bw, bh, col] of stack) {
    rect(c, x + dx, base - dy, bw, bh, col);
    rect(c, x + dx, base - dy, bw, 1, shade(col, 0.3));
    rect(c, x + dx, base - dy + bh - 1, bw, 1, shade(col, -0.3));
  }
  rect(c, x + w - 9, base - 12, 9, 1, shade('#2a6ab0', -0.3));

  // the fire escape: a landing at every floor, flights zigzagging between them, brackets into the wall
  const steel = '#26242a';
  const steelHi = '#4a4650';
  const fx0 = x + 2;
  const fw = w + 8;
  const levels: number[] = [];
  for (let ly = box - 14; ly > top + 10; ly -= 22) levels.push(ly);
  levels.forEach((ly, k) => {
    rect(c, fx0, ly, fw, 2, steel);
    rect(c, fx0, ly, fw, 1, steelHi);
    // the rail round the landing
    rect(c, fx0, ly - 8, fw, 1, steel);
    for (let rx = fx0; rx <= fx0 + fw; rx += 3) rect(c, rx, ly - 8, 1, 8, steel);
    // the bracket under it
    line(c, fx0 + 1, ly + 7, fx0 + 9, ly + 2, steel, 1);
    // the flight up to the next landing
    const next = levels[k + 1];
    if (next !== undefined) {
      const [ax, bx] = k % 2 ? [fx0 + fw - 2, fx0 + 2] : [fx0 + 2, fx0 + fw - 2];
      line(c, ax, ly - 1, bx, next + 2, steel, 2);
      line(c, ax, ly - 9, bx, next - 6, steel, 1);
      const n = 6;
      for (let s = 1; s < n; s++) {
        const sx = ax + ((bx - ax) * s) / n;
        const sy = ly - 1 + ((next + 2 - ly + 1) * s) / n;
        rect(c, sx - 1, sy - 1, 3, 1, steelHi);
        rect(c, sx, sy - 8, 1, 8, steel);
      }
    }
  });
}

/**
 * The covered court's white gabled roof, seen over the pergola: the gable end
 * faces you, glazed in a grid of panes, the long white roof running back.
 */
export function courtGable(c: Ctx, x: number, w: number, base: number): void {
  const eave = base - 48;
  const peak = base - 82;
  const gw = Math.round(w * 0.55);
  const px0 = x + gw / 2;
  // the walls under the eaves
  rect(c, x, eave, w, base - eave, '#e6e9eb');
  rect(c, x, eave, w, 2, '#c9ced3');
  for (let yy = peak; yy < eave; yy++) {
    const half = ((yy - peak) / (eave - peak)) * (gw / 2);
    // the long roof running back to the right, ridged
    rect(c, px0 + half, yy, x + w - px0 - half, 1, yy % 3 ? '#e1e5e8' : '#cdd2d6');
    // the gable end facing you
    rect(c, px0 - half, yy, half * 2, 1, '#f3f5f6');
  }
  // the glazing in the gable: a grid of panes inside the triangle
  for (let yy = peak + 8; yy < eave - 2; yy += 5) {
    const half = ((yy - peak) / (eave - peak)) * (gw / 2) - 4;
    for (let gx = px0 - half; gx + 4 <= px0 + half; gx += 5) rect(c, gx, yy, 4, 4, '#8fa6b8');
  }
  line(c, x - 2, eave + 1, px0, peak - 1, '#c2c8cd', 1);
  line(c, px0, peak - 1, x + gw + 2, eave + 1, '#c2c8cd', 1);
}

/**
 * The long pergola beside the lane: square wooden posts on concrete feet,
 * beams across the top, and a thick roof of creeper that hangs down in
 * strands. Tables and benches stand under it.
 */
export function pergola(c: Ctx, x0: number, x1: number, base: number, seed: number): void {
  const rand = rng(seed);
  const top = base - 40;
  const wood = '#6a5038';
  // tables and green benches in its shade
  for (let tx = x0 + 18; tx < x1 - 20; tx += 46) {
    rect(c, tx, base - 10, 22, 2, '#7a5a40');
    rect(c, tx + 2, base - 8, 1, 8, '#3a2f2a');
    rect(c, tx + 19, base - 8, 1, 8, '#3a2f2a');
    rect(c, tx - 4, base - 6, 30, 2, '#3f7a4a');
  }
  // the posts
  for (let px0 = x0; px0 <= x1; px0 += 32) {
    rect(c, px0, top, 5, base - top, wood);
    rect(c, px0, top, 1, base - top, '#8a6a4c');
    rect(c, px0 - 1, base - 6, 7, 6, '#b8b2a4');
  }
  // the beams, and the creeper over them
  rect(c, x0 - 4, top - 2, x1 - x0 + 8, 3, '#4f3a2a');
  for (let i = 0; i < (x1 - x0) / 3; i++) {
    const fx = x0 - 4 + rand() * (x1 - x0 + 8);
    foliage(c, fx, top - 4 + rand() * 4, 5 + rand() * 5, 3 + rand() * 3, seed + i, VINE);
  }
  for (let i = 0; i < (x1 - x0) / 4; i++) {
    const hx = Math.round(x0 + rand() * (x1 - x0));
    const len = 3 + Math.round(rand() * 12);
    rect(c, hx, top, 1, len, rand() > 0.5 ? VINE.dark : VINE.mid);
    if (len > 6) px(c, hx + (rand() > 0.5 ? 1 : -1), top + len - 2, VINE.lit);
  }
}

const VINE = { deep: '#24402a', dark: '#2f5434', mid: '#3f6e3e', lit: '#5a8a4a', hi: '#78a85a' };

/**
 * An areca palm in the ground in front of the canteen: a clump of thin
 * ringed yellow-green stems, each with a few long fronds arching out and
 * down, the leaflets hanging off them in fine strokes.
 */
export function arecaPalm(c: Ctx, x: number, base: number, h: number, seed: number): void {
  const rand = rng(seed);
  const stems = 5;
  for (let i = 0; i < stems; i++) {
    const off = (i - (stems - 1) / 2) * 3;
    const sh = Math.round(h * (0.55 + rand() * 0.3));
    const tx = x + off * 2.4 + (rand() - 0.5) * 4;
    const ty = base - sh;
    line(c, x + off, base, tx, ty, '#a7a04c', 1);
    for (let ry = base - 4; ry > ty + 2; ry -= 4) px(c, Math.round(x + off + ((tx - x - off) * (base - ry)) / sh), ry, '#6f7a34');
    // the fronds out of the top of the stem
    const fronds = 3 + Math.floor(rand() * 2);
    for (let f = 0; f < fronds; f++) {
      const dir = f % 2 ? 1 : -1;
      const reach = h * (0.22 + rand() * 0.14);
      const lift = 3 + rand() * 6;
      let lx = tx;
      let ly = ty;
      for (let k = 1; k <= 8; k++) {
        const u = k / 8;
        const nx = tx + dir * reach * u;
        const ny = ty - lift * Math.sin(u * Math.PI * 0.8) + u * u * reach * 0.5;
        line(c, lx, ly, nx, ny, '#4f7a2c', 1);
        // leaflets hang off both sides of the rib
        const drop = Math.round(2 + u * 3);
        line(c, nx, ny, nx - dir, ny + drop, k % 2 ? '#6f9a34' : '#89b444', 1);
        line(c, nx, ny, nx + dir, ny + drop - 1, '#5f8a30', 1);
        lx = nx;
        ly = ny;
      }
    }
  }
}

/** The big campus map on its two posts, with a spotlight on each, by the bust in front of the tall block. */
export function campusMapBoard(c: Ctx, x: number, base: number): void {
  const W = 58;
  rect(c, x + 3, base - 16, 2, 16, '#6a6670');
  rect(c, x + W - 5, base - 16, 2, 16, '#6a6670');
  rect(c, x, base - 44, W, 29, '#d9d6cf');
  rect(c, x, base - 44, W, 1, '#ffffff');
  rect(c, x + 2, base - 42, W - 4, 25, '#f2f2ee');
  // the spotlights on top of the frame
  for (const lx of [x + 10, x + W - 14]) {
    rect(c, lx, base - 47, 1, 3, '#6a6670');
    rect(c, lx - 1, base - 50, 5, 3, '#4a4650');
  }
  // the key down the left, the map on the right: roads, a green patch for the lawn, the buildings in red and grey
  rect(c, x + 3, base - 41, 18, 3, '#3a3a40');
  for (let ky = base - 36; ky < base - 19; ky += 3) {
    rect(c, x + 3, ky, 2, 2, '#c8342f');
    rect(c, x + 6, ky, 13, 1, '#9a9488');
  }
  rect(c, x + 24, base - 33, 30, 2, '#c9c4b6');
  rect(c, x + 38, base - 41, 2, 22, '#c9c4b6');
  rect(c, x + 42, base - 30, 9, 7, '#7fb858');
  for (const [bx, by, bw, bh, col] of [[25, 40, 10, 5, '#c8342f'], [26, 28, 8, 6, '#7a8a9c'], [44, 40, 8, 4, '#c8342f'], [30, 23, 6, 3, '#c8342f'], [44, 22, 8, 3, '#7a8a9c']] as const) {
    rect(c, x + bx, base - by, bw, bh, col);
  }
}

// --- inside ------------------------------------------------------------------

/** A stall's counter and the glass case of food on it. */
function counter(c: Ctx, g: Ctx, x: number, w: number, floor: number, body: string): void {
  rect(c, x, floor - 26, w, 26, body);
  rect(c, x, floor - 26, w, 2, shade(body, 0.25));
  rect(c, x, floor - 4, w, 4, shade(body, -0.3));
  rect(c, x + 4, floor - 40, w - 8, 14, '#cfe3e8');
  rect(c, x + 4, floor - 40, w - 8, 1, '#ffffff');
  rect(c, x + 4, floor - 29, w - 8, 3, '#c8342f');
  const rand = rng(Math.round(x));
  for (let fx = x + 6; fx < x + w - 10; fx += 8) {
    rect(c, fx, floor - 33, 6, 3, ['#c98a3a', '#7a4a2a', '#e0c070', '#a83a2a'][Math.floor(rand() * 4)]);
  }
  rect(g, x + 4, floor - 40, w - 8, 14, '#fff0c8');
}

/** The menu board and shelves behind a counter: a pale back wall with a few things on it. */
function backWall(c: Ctx, x: number, w: number, top: number, floor: number, wall: string): void {
  rect(c, x, top, w, floor - top, wall);
  rect(c, x + 6, top + 6, w - 12, 2, shade(wall, -0.2));
  rect(c, x + 6, top + 18, w - 12, 2, shade(wall, -0.2));
  const rand = rng(Math.round(x) + 7);
  for (let sx = x + 8; sx < x + w - 10; sx += 7) {
    rect(c, sx, top + 1, 5, 5, ['#e8d27a', '#c8342f', '#4f8fc8', '#f0f0e8'][Math.floor(rand() * 4)]);
    rect(c, sx, top + 13, 5, 5, ['#7ac87a', '#e88a3a', '#f0f0e8'][Math.floor(rand() * 3)]);
  }
}

/** The stall sign over a counter: a coloured board with the stall's name. */
function stallSign(c: Ctx, cx: number, y: number, lines: string[], bg: string, fg: string): void {
  const w = Math.max(...lines.map((l) => signWidth(l, l === lines[0] ? 2 : 1))) + 12;
  const h = 6 + 12 + (lines.length - 1) * 7;
  rect(c, cx - w / 2, y, w, h, bg);
  rect(c, cx - w / 2, y, w, 1, shade(bg, 0.3));
  rect(c, cx - w / 2, y + h - 1, w, 1, shade(bg, -0.35));
  lines.forEach((l, i) => signCentered(c, l, cx, y + 3 + (i ? 12 + (i - 1) * 7 : 0), fg, i ? 1 : 2));
}

export function yumYums(c: Ctx, g: Ctx, x: number, w: number, floor: number): void {
  backWall(c, x, w, floor - 70, floor, '#f2e6d0');
  stallSign(c, x + w / 2, floor - 92, ['YUM-YUMS', 'ALL-DAY EATS'], '#f6efe2', '#c8342f');
  disc(c, x + w / 2 - signWidth('YUM-YUMS', 2) / 2 - 10, floor - 85, 4, '#c8342f');
  counter(c, g, x + 4, w - 8, floor, '#e8c9a0');
}

export function grannyJings(c: Ctx, g: Ctx, x: number, w: number, floor: number): void {
  backWall(c, x, w, floor - 70, floor, '#e9ecef');
  stallSign(c, x + w / 2, floor - 96, ['GRANNY JINGS', 'FOOD STATION'], '#e8806a', '#f8f4e8');
  // the vine garland along the bottom of the sign
  for (let vx = x + 2; vx < x + w - 2; vx += 3) px(c, vx, floor - 71 + (vx % 2), '#4f8a3a');
  // snacks in strips hanging down beside the counter
  for (const sx of [x + 6, x + w - 10]) {
    for (let sy = floor - 66; sy < floor - 30; sy += 4) rect(c, sx, sy, 4, 3, sy % 8 ? '#e8b33a' : '#c8342f');
  }
  counter(c, g, x + 12, w - 24, floor, '#d8d4cc');
}

export function rinas(c: Ctx, g: Ctx, x: number, w: number, floor: number): void {
  backWall(c, x, w, floor - 70, floor, '#f4f1ea');
  stallSign(c, x + w / 2, floor - 90, ['RINAS', 'FOOD STATION'], '#c8342f', '#f2d66b');
  // the drinks fridge
  rect(c, x + 6, floor - 60, 26, 60, '#d9dde2');
  rect(c, x + 8, floor - 58, 22, 46, '#9fc4d6');
  for (let sy = floor - 56; sy < floor - 14; sy += 8) {
    for (let bx = x + 9; bx < x + 29; bx += 4) rect(c, bx, sy, 2, 6, ['#c8342f', '#3a7a3a', '#2a2a30', '#e8b33a'][(bx + sy) % 4]);
  }
  rect(g, x + 8, floor - 58, 22, 46, '#dff2ff');
  counter(c, g, x + 36, w - 40, floor, '#c8342f');
}

export function byfrost(c: Ctx, g: Ctx, x: number, w: number, floor: number): void {
  // a yellow stall with a blue sign and menu posters on its side
  rect(c, x, floor - 74, w, 74, '#e8cf4a');
  rect(c, x, floor - 74, 3, 74, shade('#e8cf4a', 0.2));
  rect(c, x + w - 3, floor - 74, 3, 74, shade('#e8cf4a', -0.25));
  stallSign(c, x + w / 2, floor - 98, ['BYFROST', 'SOFT SERVE'], '#3f6fc8', '#ffffff');
  for (const [i, col] of ['#f6f1e4', '#f3e2c8'].entries()) {
    const mx = x + 8 + i * 20;
    rect(c, mx, floor - 64, 16, 22, col);
    rect(c, mx + 2, floor - 62, 12, 3, i ? '#c8342f' : '#3f6fc8');
    for (let ry = floor - 57; ry < floor - 44; ry += 3) rect(c, mx + 2, ry, 12, 1, '#8a6a4a');
  }
  rect(c, x + w - 30, floor - 50, 26, 12, '#cfe3e8');
  rect(g, x + w - 30, floor - 50, 26, 12, '#fff0c8');
  // blue and white coolers stacked in front
  for (const [i, cx] of [x + 6, x + 28].entries()) {
    rect(c, cx, floor - 16, 18, 16, '#2f5fb0');
    rect(c, cx, floor - 20, 18, 5, '#f4f4f0');
    if (i === 0) {
      rect(c, cx, floor - 34, 18, 13, '#2f5fb0');
      rect(c, cx, floor - 38, 18, 5, '#f4f4f0');
    }
  }
  // the coloured plastic trays
  for (const [i, col] of ['#5fae3a', '#e8508a', '#8a55c8'].entries()) rect(c, x + w - 26 + i * 4, floor - 34, 3, 12, col);
}

/**
 * The HAU Coop Canteen's own stall in the back hallway (photos 24 and 25 of
 * the walk): a blue-framed kiosk under a long yellow sign, HAU COOP CANTEEN
 * in red over EAT, DRINK, ENJOY, with the coop's seal at one end. Every inch
 * of it is hung with snacks in bright packets, over a glass case of bread
 * and shelves of drinks.
 */
export function coopStall(c: Ctx, g: Ctx, x: number, w: number, floor: number): void {
  const rand = rng(Math.round(x) + 3);
  const blue = '#2f6fc0';
  // the kiosk's frame and the shelves inside
  rect(c, x, floor - 76, w, 76, '#e9e4d8');
  rect(c, x, floor - 76, 4, 76, blue);
  rect(c, x + w - 4, floor - 76, 4, 76, blue);
  for (let sy = floor - 66; sy < floor - 34; sy += 8) {
    rect(c, x + 4, sy + 6, w - 8, 2, '#c9c4b6');
    for (let bx = x + 6; bx < x + w - 8; bx += 4) rect(c, bx, sy, 3, 6, ['#c8342f', '#3a7a3a', '#2a2a30', '#e8b33a', '#4f8fc8', '#f0f0e8'][Math.floor(rand() * 6)]);
  }
  // packets of chips and sweets hanging in strips down the front
  for (let hx = x + 3; hx < x + w - 3; hx += 5) {
    const len = 2 + Math.floor(rand() * 4);
    for (let k = 0; k < len; k++) {
      rect(c, hx, floor - 74 + k * 5, 4, 4, ['#e8c43a', '#c8342f', '#e88a3a', '#8a55c8', '#5fae3a', '#f0f0e8'][Math.floor(rand() * 6)]);
      px(c, hx + 1, floor - 74 + k * 5, '#ffffff');
    }
  }
  // the counter: a glass case of bread over a blue front
  rect(c, x + 4, floor - 30, w - 8, 30, blue);
  rect(c, x + 4, floor - 30, w - 8, 2, shade(blue, 0.3));
  rect(c, x + 6, floor - 42, w - 12, 12, '#cfe3e8');
  rect(c, x + 6, floor - 42, w - 12, 1, '#ffffff');
  for (let fx = x + 8; fx < x + w - 12; fx += 6) rect(c, fx, floor - 36, 5, 4, ['#d8a060', '#c08040', '#e8c890'][Math.floor(rand() * 3)]);
  rect(g, x + 6, floor - 42, w - 12, 12, '#fff0c8');
  // the long yellow sign along the top
  const sy = floor - 102;
  rect(c, x - 4, sy, w + 8, 26, '#f2d33a');
  rect(c, x - 4, sy, w + 8, 1, '#fff1a0');
  rect(c, x - 4, sy + 25, w + 8, 1, '#c8a42a');
  rect(c, x - 4, sy - 2, w + 8, 2, blue);
  disc(c, x + 8, sy + 13, 8, '#c8a050');
  disc(c, x + 8, sy + 13, 6, '#e8c878');
  disc(c, x + 8, sy + 13, 3, '#a8803a');
  signCentered(c, 'HAU COOP', x + w / 2 + 8, sy + 3, '#c8342f', 2);
  signCentered(c, 'CANTEEN', x + w / 2 + 8, sy + 15, '#2f4f9a');
  rect(c, x + w - 18, sy + 4, 10, 18, '#f6f1e4');
  rect(c, x + w - 16, sy + 6, 6, 7, '#c98a3a');
  rect(c, x + w - 15, sy + 15, 4, 5, '#e8e8e0');
}

/**
 * The view out of the back of the canteen (photos 26 to 28): across the
 * parking lot, Building 18, Sacred Heart: beige concrete gone grey with rain,
 * two floors of dark-framed windows with air conditioners hanging under some
 * of them, and a row of shrubs along its foot. Drawn between `y0` (the top of
 * the opening) and `ground` (where the lot meets the building).
 */
export function building18Back(c: Ctx, x0: number, x1: number, y0: number, ground: number, seed: number): void {
  const rand = rng(seed);
  const wall = '#d6ccb6';
  rect(c, x0, y0, x1 - x0, ground - y0, wall);
  for (let i = 0; i < (x1 - x0) * (ground - y0) * 0.04; i++) px(c, x0 + rand() * (x1 - x0), y0 + rand() * (ground - y0), rand() > 0.5 ? '#cbc0a8' : '#ddd4c0');
  // the slab between the floors, and the columns
  const mid = Math.round((y0 + ground) / 2) - 4;
  rect(c, x0, mid, x1 - x0, 3, '#e4dccb');
  rect(c, x0, mid + 3, x1 - x0, 1, '#b8ad96');
  for (let cx = x0 + 10; cx < x1; cx += 58) rect(c, cx, y0, 5, ground - y0, '#ded5c2');
  // two rows of windows, dark brown frames over dark glass, an aircon under some
  for (const wy of [y0 + 6, mid + 8]) {
    for (let wx = x0 + 20; wx < x1 - 30; wx += 58) {
      const ww = 40;
      const wh = Math.min(16, ground - wy - 14);
      if (wh < 6) continue;
      rect(c, wx, wy, ww, wh, '#3a2f2c');
      rect(c, wx + 1, wy + 1, ww - 2, wh - 2, '#4f4a52');
      for (let mx = wx + 10; mx < wx + ww; mx += 10) rect(c, mx, wy, 1, wh, '#3a2f2c');
      rect(c, wx + 1, wy + 1, ww - 2, 2, '#6a6670');
      if (rand() > 0.45) {
        rect(c, wx + ww - 14, wy + 2, 10, 6, '#ecebe6');
        rect(c, wx + ww - 13, wy + 3, 8, 1, '#b9b8b2');
      }
    }
  }
  // shrubs along the foot of the wall
  for (let bx = x0 + 6; bx < x1; bx += 14 + rand() * 10) foliage(c, bx, ground - 5, 5 + rand() * 3, 5 + rand() * 3, seed + Math.round(bx));
  rect(c, x0, ground - 2, x1 - x0, 2, '#b8ad96');
}

/** The covered walkway from the lot to Sacred Heart: a curved translucent roof on a steel frame, between white gate pillars. */
export function coveredWalk(c: Ctx, x: number, w: number, ground: number): void {
  const top = ground - 40;
  for (let k = 0; k <= w; k++) {
    const t = k / w;
    const yy = Math.round(top + 6 - Math.sin(t * Math.PI * 0.9) * 8);
    rect(c, x + k, yy, 1, 4, '#e2d6bc');
    px(c, x + k, yy + 4, '#a8987a');
  }
  for (let fx = x + 4; fx < x + w; fx += 14) rect(c, fx, top + 6, 1, 34, '#8a8d95');
  for (const gx of [x + 2, x + w - 8]) {
    rect(c, gx, ground - 24, 7, 24, '#f1efe8');
    rect(c, gx - 1, ground - 26, 9, 2, '#ffffff');
    rect(c, gx + 5, ground - 24, 2, 24, '#d6d3ca');
  }
  for (let rx = x + 10; rx < x + w - 10; rx += 3) rect(c, rx, ground - 16, 1, 16, '#3a3a40');
  rect(c, x + 10, ground - 16, w - 20, 1, '#3a3a40');
}

/** The old awning outside the back of the canteen: a rusty steel frame under faded sheeting, a scalloped white edge. */
export function backAwning(c: Ctx, x: number, w: number, y: number): void {
  rect(c, x, y, w, 6, '#cdbfb2');
  rect(c, x, y, w, 1, '#e4d9ce');
  for (let fx = x + 4; fx < x + w; fx += 22) {
    line(c, fx, y + 1, fx + 10, y + 5, '#8a5a3a', 1);
    rect(c, fx, y, 1, 6, '#7a4a32');
  }
  rect(c, x, y + 5, w, 1, '#7a4a32');
  scallops(c, x, y + 6, w);
}

/**
 * The canteen has no walls: it is one open floor under the building, the
 * stalls standing back to back in the middle of it. So behind the stalls of
 * one hallway you see straight through to the other, and out the far side
 * into daylight. This paints that far view between `ceil` and `floor`.
 * 'back' is the view from the front hallway: the back hallway's tables and
 * pillars, its low wall, and Sacred Heart across the lot. 'front' is the view
 * from the back hallway: the front hallway, the steps and the bright patio
 * with its umbrellas.
 */
export function throughView(c: Ctx, x0: number, x1: number, ceil: number, floor: number, kind: 'back' | 'front', seed: number): void {
  const rand = rng(seed);
  const w = x1 - x0;
  const horizon = floor - 30;
  // the far side, in daylight
  if (kind === 'back') {
    rect(c, x0, ceil, w, horizon - ceil, '#d8e6ee');
    building18Back(c, x0, x1, ceil + 22, horizon - 8, seed + 1);
    rect(c, x0, horizon - 8, w, 8, '#c9c6be');
    rect(c, x0, horizon - 8, w, 1, '#e4e2dc');
    rect(c, x0, horizon - 13, w, 1, '#8a8d95');
  } else {
    rect(c, x0, ceil, w, horizon - ceil, '#eef2ee');
    for (let tx = x0 + 10; tx < x1; tx += 60 + rand() * 30) foliage(c, tx, horizon - 30, 18, 14, seed + Math.round(tx));
    for (let ux = x0 + 30; ux < x1; ux += 70) {
      rect(c, ux, horizon - 22, 1, 20, '#3a2f2a');
      for (let k = 0; k < 6; k++) rect(c, ux - 2 - k * 2, horizon - 28 + k, 5 + k * 4, 1, k < 5 ? '#b0604a' : '#7a3a2a');
    }
    rect(c, x0, horizon - 4, w, 4, '#a8573f');
  }
  // the far ceiling: black, its white panels and downlights seen from below
  rect(c, x0, ceil, w, 12, '#1c1b20');
  for (let px0 = x0 + 6; px0 < x1; px0 += 48) {
    rect(c, px0, ceil + 8, 34, 4, '#e9e7e2');
    px(c, px0 + 8, ceil + 11, '#fff6d8');
    px(c, px0 + 26, ceil + 11, '#fff6d8');
  }
  // the far floor, its pillars and tables, small with distance
  rect(c, x0, horizon, w, floor - horizon, '#dcd8ce');
  for (const y of [horizon + 8, horizon + 18]) rect(c, x0, y, w, 1, '#ccc7bb');
  for (let px0 = x0 + 40; px0 < x1; px0 += 120) {
    rect(c, px0, ceil + 12, 8, horizon - ceil - 12, '#e6e5e0');
    rect(c, px0, horizon - 26, 8, 26, STONE);
    rect(c, px0 + 6, horizon - 26, 2, 26, STONE_LO);
  }
  for (let tx = x0 + 12; tx < x1 - 20; tx += 50 + rand() * 20) {
    canteenTable(c, tx, horizon + 14 + rand() * 6, ['#2f5fb0', '#d0407a', '#5fae3a'][Math.floor(rand() * 3)], 18, 8);
  }
  // a little haze, the far side is further away
  rect(c, x0, ceil, w, floor - ceil, 'rgba(240, 238, 230, 0.22)');
}

/** A small sign hanging from the ceiling on two wires, pointing the way between the hallways. */
export function hangingSign(c: Ctx, cx: number, top: number, drop: number, text: string, bg: string, fg: string): void {
  const w = signWidth(text) + 10;
  rect(c, cx - w / 2 + 3, top, 1, drop, '#3a3a40');
  rect(c, cx + w / 2 - 4, top, 1, drop, '#3a3a40');
  rect(c, cx - w / 2, top + drop, w, 10, bg);
  rect(c, cx - w / 2, top + drop, w, 1, shade(bg, 0.3));
  rect(c, cx - w / 2, top + drop + 9, w, 1, shade(bg, -0.35));
  signCentered(c, text, cx, top + drop + 2, fg);
}

/** Cartons and shrink-wrapped water stacked by a pillar. */
export function stock(c: Ctx, x: number, floor: number): void {
  for (let k = 0; k < 3; k++) {
    rect(c, x, floor - 10 - k * 10, 18, 10, '#c9a46a');
    rect(c, x, floor - 10 - k * 10, 18, 1, '#e0c08a');
    rect(c, x + 8, floor - 10 - k * 10, 2, 10, '#a8844a');
  }
  for (let wx = x + 20; wx < x + 40; wx += 4) {
    for (let wy = floor - 18; wy < floor; wy += 6) {
      rect(c, wx, wy, 3, 5, '#a8d4ee');
      px(c, wx + 1, wy, '#3f8fc8');
    }
  }
}

/** The floor: white square tiles going back from the camera. */
export function tiledFloor(c: Ctx, x0: number, x1: number, floor: number, bottom: number): void {
  rect(c, x0, floor, x1 - x0, bottom - floor, TILE);
  rect(c, x0, floor, x1 - x0, 2, shade(TILE, 0.08));
  for (const y of [floor + 6, floor + 14, floor + 26, floor + 42]) if (y < bottom) rect(c, x0, y, x1 - x0, 1, TILE_LINE);
  const mid = (x0 + x1) / 2;
  for (let x = x0 - 300; x < x1 + 300; x += 22) line(c, x, floor, x + (x - mid) * 0.5, bottom, TILE_LINE, 1);
}

/** The black ceiling with its white dropped panels in steps, and the downlights in them. */
export function ceiling(c: Ctx, g: Ctx, x0: number, x1: number, bottom: number): number[] {
  rect(c, x0, 0, x1 - x0, bottom, '#1c1b20');
  for (let x = x0; x < x1; x += 40) rect(c, x, 0, 2, bottom - 14, '#141317');
  const lamps: number[] = [];
  for (let x = x0 + 10; x < x1 - 40; x += 120) {
    poly(c, [[x, bottom - 14], [x + 90, bottom - 14], [x + 96, bottom], [x - 6, bottom]], '#e9e7e2');
    rect(c, x - 6, bottom - 1, 102, 1, '#bdb9b0');
    rect(c, x, bottom - 14, 90, 1, '#bdb9b0');
    for (const dx of [16, 72]) {
      rect(c, x + dx, bottom - 3, 4, 2, '#fff6d8');
      rect(g, x + dx - 1, bottom - 3, 6, 3, LIT);
      lamps.push(x + dx + 2);
    }
  }
  return lamps;
}

/** A grey metal dome lamp hanging on its cable. Returns where the light comes out. */
export function domeLamp(c: Ctx, g: Ctx, x: number, top: number, drop: number): [number, number] {
  rect(c, x, top, 1, drop, '#3a3a40');
  poly(c, [[x - 7, top + drop + 6], [x + 8, top + drop + 6], [x + 4, top + drop], [x - 3, top + drop]], '#8a8d95');
  rect(c, x - 3, top + drop, 7, 1, '#a9adb5');
  rect(c, x - 6, top + drop + 6, 13, 1, '#dff2ff');
  rect(g, x - 6, top + drop + 6, 13, 2, '#dff2ff');
  return [x, top + drop + 8];
}
