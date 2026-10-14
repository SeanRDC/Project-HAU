// The Immaculate Heart Gymnasium from outside, drawn from the photos in
// `assets/images/buildings/ih_gym immaculate heart/`.
//
// The front is its long south-west side, on the parking lot: a two-storey
// cream block with rows of white awning windows over a slatted band, a deep
// flat roof with HOLY ANGEL UNIVERSITY along its fascia, and the tall hall
// rising behind. Two ways in: on the left, steps up under a grey box canopy
// into the corridor past the equipment room; on the right, a glass door under
// the seal and HOLY ANGEL UNIVERSITY GYM, straight onto the court.
//
// The left side is its north-west end, facing the covered court: the gable
// of the hall in white panels under a band of grey ones, three tall louvred
// windows, a big grey box canopy over the wide opening, a maroon band and
// walls of grey stone tiles either side of it.
//
// The annex in front of the far end of the front is a dark ribbed shed with
// the university seal painted big on its side.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, line, poly, px, rect, sign, signCentered, signWidth } from '../../engine/pix';
import { shade } from './palette';

export const CREAM = '#ece6d4';
const CREAM_LIT = '#f6f1e2';
const CREAM_SHADE = '#cfc7b0';
const CREAM_DEEP = '#aea68f';
export const MAROON_BAND = '#97393b';
const STONE = '#5d5a5c';
const PANEL_GREY = '#9ea2a6';
const FRAME = '#f4f4f0';
const PANE = '#5f7488';
const PANE_LIT = '#8fa6bb';
export const SEAL_GOLD = '#c9a03a';

/**
 * The university seal: a maroon shield with a white angel spreading its
 * wings over a gold band. `r` is about half its height.
 */
export function seal(c: Ctx, cx: number, cy: number, r: number): void {
  const w = Math.round(r * 1.5);
  const top = Math.round(cy - r);
  // the shield: straight sides, then curving in to a point
  for (let y = 0; y <= r * 2; y++) {
    const k = y / (r * 2);
    const half = k < 0.55 ? w / 2 : (w / 2) * Math.sqrt(Math.max(0, 1 - ((k - 0.55) / 0.45) ** 2));
    rect(c, cx - half, top + y, half * 2, 1, k < 0.05 ? SEAL_GOLD : '#5e1f2b');
    px(c, cx - half, top + y, SEAL_GOLD);
    px(c, cx + half - 1, top + y, SEAL_GOLD);
  }
  // the gold band low across it
  line(c, cx - w / 2 + 1, cy + r * 0.6, cx + w / 2 - 1, cy + r * 0.2, SEAL_GOLD, Math.max(1, Math.round(r / 6)));
  // the angel: two white wings swept up to the shield's top corners, a small body between them
  const ww = w / 2 - 1;
  for (const s of [-1, 1]) {
    poly(c, [[cx + s * 1, cy + r * 0.25], [cx + s * ww * 0.35, cy - r * 0.15], [cx + s * ww, cy - r * 0.85], [cx + s * ww * 0.95, cy - r * 0.35], [cx + s * ww * 0.55, cy + r * 0.1]], '#f4f1ea');
    for (let k = 1; k < 3; k++) line(c, cx + s * ww * (0.3 + k * 0.18), cy - r * (0.05 + k * 0.22), cx + s * ww * (0.5 + k * 0.18), cy + r * (0.05 - k * 0.12), '#c9c4ba', 1);
  }
  rect(c, cx - Math.max(1, r * 0.1), cy - r * 0.35, Math.max(2, r * 0.2), r * 0.75, '#f4f1ea');
  disc(c, cx, cy - r * 0.45, Math.max(1, r * 0.13), '#f0d9b5');
}

/** A grid of white-framed awning windows, a few of them pushed open. */
export function awningGrid(c: Ctx, x: number, y: number, cols: number, rows: number, pw: number, ph: number, seed: number): void {
  const rand = rng(seed);
  const w = cols * pw + 1;
  const h = rows * ph + 1;
  rect(c, x - 1, y - 1, w + 2, h + 2, FRAME);
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const px0 = x + k * pw + 1;
      const py0 = y + r * ph + 1;
      rect(c, px0, py0, pw - 1, ph - 1, r === 0 ? PANE_LIT : PANE);
      rect(c, px0, py0, pw - 1, 1, shade(PANE, -0.25));
      // an open pane tilts out at the bottom: a pale sliver under it
      if (rand() < 0.3) {
        rect(c, px0, py0 + ph - 3, pw - 1, 2, '#d9e2ea');
        rect(c, px0, py0 + ph - 1, pw - 1, 1, FRAME);
      }
    }
  }
}

/** Grey stone tiles laid in a staggered pattern, a few lighter ones mixed in. */
export function stoneTiles(c: Ctx, x0: number, x1: number, top: number, bottom: number, seed: number): void {
  const rand = rng(seed);
  rect(c, x0, top, x1 - x0, bottom - top, STONE);
  for (let y = top; y < bottom; y += 6) {
    rect(c, x0, y, x1 - x0, 1, '#48464a');
    const off = ((y - top) / 6) % 2 ? 7 : 0;
    for (let x = x0 + off; x < x1; x += 14) {
      rect(c, x, y, 1, Math.min(6, bottom - y), '#48464a');
      if (rand() < 0.12) rect(c, x + 1, y + 1, Math.min(13, x1 - x - 1), Math.min(5, bottom - y - 1), rand() > 0.5 ? '#8b8781' : '#6f6b6b');
    }
  }
}

/** A wall-mounted light: a small white box. */
function wallLamp(c: Ctx, g: Ctx, x: number, y: number): void {
  rect(c, x, y, 3, 4, '#e8e8e4');
  rect(c, x, y + 4, 3, 1, '#9a9a9a');
  rect(g, x, y + 4, 3, 2, '#fff1c8');
}

/** A cream box of louvres, the kind that hides an air-conditioning unit. */
function ventBox(c: Ctx, x: number, y: number, w: number, h: number): void {
  rect(c, x, y, w, h, '#d9d0b6');
  rect(c, x, y, w, 1, '#efe8d4');
  for (let ly = y + 2; ly < y + h - 1; ly += 2) rect(c, x + 1, ly, w - 2, 1, '#a99f84');
}

/** The tall hall seen over the front block: white panel wall under its grey cap. */
function hallBehind(c: Ctx, x0: number, x1: number, top: number, bottom: number): void {
  rect(c, x0, top + 10, x1 - x0, bottom - top - 10, '#e3dfd4');
  for (let x = x0 + 12; x < x1; x += 30) rect(c, x, top + 10, 1, bottom - top - 10, '#cbc6b8');
  rect(c, x0, top, x1 - x0, 10, PANEL_GREY);
  rect(c, x0, top, x1 - x0, 1, '#c2c5c8');
  for (let x = x0 + 6; x < x1; x += 16) rect(c, x, top + 1, 1, 9, '#86898e');
  rect(c, x0, top + 10, x1 - x0, 1, '#7d8085');
}

export interface GymFront {
  /** the steps up into the left entrance, and the glass door on the right */
  leftDoor: number;
  rightDoor: number;
}

/**
 * The front of the gym from `x0` to `x1`, standing on `base`. Returns where
 * the two doors are.
 */
export function gymFront(c: Ctx, g: Ctx, x0: number, x1: number, base: number): GymFront {
  const rand = rng(1957);
  const w = x1 - x0;
  const roof = base - 98;
  const upper = base - 48;
  hallBehind(c, x0 + 14, x1, base - 150, roof);

  // the block
  rect(c, x0, roof, w, base - roof, CREAM);
  rect(c, x0, roof, 4, base - roof, CREAM_LIT);
  // the slatted band under the upper windows, all the way along
  rect(c, x0, upper - 2, w, 8, '#c9c3b2');
  for (let y = upper - 1; y < upper + 6; y += 2) rect(c, x0, y, w, 1, '#ada796');

  // the piers between the bays, each standing a little proud of the wall
  const bay = 64;
  const bays: number[] = [];
  for (let x = x0 + 30; x < x1 - 20; x += bay) bays.push(x);
  for (const bx of bays) {
    rect(c, bx, roof + 8, 6, base - roof - 8, CREAM_LIT);
    rect(c, bx + 5, roof + 8, 2, base - roof - 8, CREAM_SHADE);
  }
  // the upper windows between them, one grid to a bay, except the plain one over the right door that carries the seal
  const rightDoor = x1 - 52;
  for (let i = 0; i + 1 < bays.length; i++) {
    if (bays[i] < rightDoor && bays[i + 1] > rightDoor - 8) continue;
    const gx = bays[i] + 12;
    const gw = Math.floor((bays[i + 1] - bays[i] - 18) / 8);
    awningGrid(c, gx, roof + 16, gw, 3, 8, 9, 300 + i);
  }

  // the deep flat roof: its corrugated underside, the white fascia with the name on it
  rect(c, x0 - 6, roof + 6, w + 10, 4, '#8f8a7f');
  for (let x = x0 - 6; x < x1 + 4; x += 3) px(c, x, roof + 7, '#b7b1a3');
  rect(c, x0 - 8, roof - 4, w + 14, 10, '#f3f0e8');
  rect(c, x0 - 8, roof - 4, w + 14, 1, '#ffffff');
  rect(c, x0 - 8, roof + 5, w + 14, 1, '#bdb8ac');
  const name = 'HOLY ANGEL UNIVERSITY';
  const nx = Math.round(x0 + w * 0.64 - signWidth(name, 1) * 0.5 * 1.5);
  // the letters stand apart on the fascia
  for (let i = 0; i < name.length; i++) sign(c, name[i], nx + i * 6, roof - 2, '#7c2a32');

  // ground storey: the maroon band and the wall of stone tiles at the left end, by the left entrance
  const leftDoor = x0 + 64;
  rect(c, x0, upper + 6, leftDoor - 18 - x0, 12, MAROON_BAND);
  stoneTiles(c, x0 + 14, leftDoor - 18, upper + 18, base, 11);
  // three white fins at the corner
  for (const fx of [x0 + 2, x0 + 7]) {
    rect(c, fx, upper + 4, 4, base - upper - 4, '#f7f6f2');
    rect(c, fx + 3, upper + 4, 1, base - upper - 4, '#c9c6bd');
  }
  wallLamp(c, g, x0 + 30, upper + 22);

  // the left entrance: steps up into the corridor, a slatted transom, a grey box canopy over it
  const dw = 28;
  rect(c, leftDoor - dw / 2 - 3, upper + 2, dw + 6, base - upper - 8, '#e4ddc8');
  rect(c, leftDoor - dw / 2, upper + 14, dw, base - upper - 20, '#2a2a2f');
  // deep in the corridor: lockers and the light at the far end
  rect(c, leftDoor - 6, upper + 22, 6, base - upper - 30, '#6a6a6a');
  rect(c, leftDoor + 2, upper + 26, 3, 6, '#d9d2b8');
  rect(c, leftDoor - dw / 2, upper + 6, dw, 7, '#d0cbbd');
  for (let y = upper + 7; y < upper + 13; y += 2) rect(c, leftDoor - dw / 2, y, dw, 1, '#8c877b');
  for (let i = 0; i < 4; i++) {
    const sw = dw + 8 + i * 6;
    rect(c, leftDoor - sw / 2, base - 6 + i * 2 - 2, sw, 2, i % 2 ? '#7b7a7e' : '#8f8e91');
  }
  rect(c, leftDoor - dw / 2 - 8, upper - 8, dw + 16, 9, '#a9adb2');
  rect(c, leftDoor - dw / 2 - 8, upper - 8, dw + 16, 1, '#d4d7da');
  rect(c, leftDoor - dw / 2 - 8, upper + 1, dw + 16, 2, '#6f7378');
  rect(c, leftDoor - 1, upper + 1, 3, 2, '#2a2a30');
  rect(g, leftDoor - 1, upper + 3, 3, 1, '#fff1c8');

  // along the middle: plain cream wall with small awning windows and a grey door now and then
  let x = leftDoor + 40;
  while (x < x1 - 180) {
    if (rand() < 0.25) {
      rect(c, x, base - 34, 14, 34, '#b9bcc2');
      rect(c, x + 1, base - 33, 12, 33, '#c9ccd2');
      px(c, x + 11, base - 17, '#5a5a5a');
      x += 30;
    } else {
      awningGrid(c, x, upper + 18, 2, 2, 7, 7, 400 + x);
      x += 34;
    }
  }

  // the right entrance: a flat canopy on thin posts over the seats, then the door under the seal
  const canopyL = rightDoor - 120;
  rect(c, canopyL, upper + 4, 96, 5, '#d9d6cf');
  rect(c, canopyL, upper + 4, 96, 1, '#f2f0ea');
  rect(c, canopyL, upper + 9, 96, 1, '#8f8c86');
  for (const px0 of [canopyL + 6, canopyL + 48, canopyL + 90]) rect(c, px0, upper + 10, 2, base - upper - 10, '#b9bcc2');
  rect(c, canopyL + 10, base - 9, 30, 3, '#a39a8a');
  rect(c, canopyL + 12, base - 6, 2, 6, '#7d766a');
  rect(c, canopyL + 36, base - 6, 2, 6, '#7d766a');
  // a pale door and a small window under the canopy
  rect(c, canopyL + 52, base - 32, 14, 32, '#c9cdd3');
  awningGrid(c, canopyL + 70, upper + 22, 2, 2, 7, 7, 77);

  // the glass door, its little box canopy, the steps with their yellow and black edge
  rect(c, rightDoor - 14, upper + 12, 28, base - upper - 12, '#e8e2cf');
  rect(c, rightDoor - 11, upper + 18, 22, base - upper - 22, '#2b3038');
  rect(c, rightDoor - 10, upper + 19, 9, base - upper - 24, '#4b5866');
  rect(c, rightDoor + 1, upper + 19, 9, base - upper - 24, '#3d4856');
  rect(g, rightDoor - 10, upper + 19, 20, base - upper - 24, '#ffe2a8');
  rect(c, rightDoor - 16, upper + 4, 32, 8, '#bfc3c8');
  rect(c, rightDoor - 16, upper + 4, 32, 1, '#e3e5e8');
  rect(c, rightDoor - 16, upper + 12, 32, 1, '#7b7f85');
  for (let i = 0; i < 3; i++) rect(c, rightDoor - 18 - i * 3, base - 6 + i * 2, 36 + i * 6, 2, i % 2 ? '#a7a196' : '#b8b2a6');
  for (let sx = rightDoor - 26; sx < rightDoor - 16; sx += 4) rect(c, sx, base - 2, 2, 2, sx % 8 ? '#e2c13a' : '#26262a');
  // a blue door beyond it
  rect(c, rightDoor + 22, base - 32, 13, 32, '#8fb2cf');
  rect(c, rightDoor + 22, base - 32, 13, 1, '#c9dbe9');

  // up above the door: the seal, and the name in gold
  seal(c, rightDoor + 1, roof + 21, 9);
  signCentered(c, 'HOLY ANGEL', rightDoor + 1, roof + 33, '#a7741f');
  signCentered(c, 'UNIVERSITY', rightDoor + 1, roof + 40, '#a7741f');
  signCentered(c, 'GYM', rightDoor + 1, roof + 47, '#4a4440');

  // a dark line at the foot of the wall
  rect(c, x0, base - 1, w, 1, CREAM_DEEP);
  return { leftDoor, rightDoor };
}

/** The green canvas canopy over a table, as there are along the front. */
export function greenTent(c: Ctx, x: number, base: number, w = 44): void {
  const top = base - 30;
  poly(c, [[x - w / 2 - 3, top + 6], [x + w / 2 + 3, top + 6], [x + w / 2 - 6, top], [x - w / 2 + 6, top]], '#2f6e4f');
  poly(c, [[x - w / 2 - 3, top + 6], [x, top + 6], [x, top], [x - w / 2 + 6, top]], '#3d8762');
  rect(c, x - w / 2 - 3, top + 6, w + 6, 2, '#24563d');
  for (const lx of [x - w / 2 + 2, x + w / 2 - 3]) rect(c, lx, top + 8, 1, base - top - 8, '#9aa0a6');
  rect(c, x - 12, base - 10, 24, 2, '#3f6a52');
  rect(c, x - 10, base - 8, 1, 8, '#2c3a33');
  rect(c, x + 9, base - 8, 1, 8, '#2c3a33');
}

/** Old tyres stacked up, painted and used as seats and planters. */
export function tyreStack(c: Ctx, x: number, base: number, n: number): void {
  for (let i = 0; i < n; i++) {
    const y = base - 4 - i * 4;
    rect(c, x - 8, y, 16, 4, '#25252a');
    rect(c, x - 8, y, 16, 1, '#3d3d44');
    rect(c, x - 3, y + 1, 6, 2, '#141418');
  }
}

/** A rusty wire-mesh barrier on its feet. */
export function meshBarrier(c: Ctx, x: number, base: number, w = 30): void {
  const rust = '#a3683f';
  rect(c, x, base - 22, w, 1, rust);
  rect(c, x, base - 4, w, 1, rust);
  rect(c, x, base - 22, 1, 18, rust);
  rect(c, x + w - 1, base - 22, 1, 18, rust);
  for (let k = 3; k < w; k += 3) line(c, x + k, base - 21, x + k - 3, base - 5, '#c08b5f', 1);
  line(c, x, base - 4, x - 3, base, rust, 1);
  line(c, x + w - 1, base - 4, x + w + 2, base, rust, 1);
}

/**
 * The left side of the gym, its north-west end, from `x0` to `x1`. Returns
 * the middle of the wide opening under the canopy.
 */
export function gymGable(c: Ctx, g: Ctx, x0: number, x1: number, base: number): number {
  const w = x1 - x0;
  const top = base - 170;
  const shoulder = base - 132;
  const chamfer = 64;
  // the white panel wall of the gable, its top following the roof: up at the corners, flat across
  poly(c, [[x0, base], [x0, shoulder], [x0 + chamfer, top], [x1 - chamfer, top], [x1, shoulder], [x1, base]], '#ebe8df');
  for (let x = x0 + 30; x < x1 - 20; x += 34) rect(c, x, top + 18, 1, base - top - 18, '#d6d2c6');
  for (let y = top + 34; y < base - 60; y += 22) rect(c, x0 + 6, y, w - 12, 1, '#dcd8cc');
  // the band of grey panels along the top edge
  const band = 14;
  for (let i = 0; i < band; i++) {
    const y = top + i;
    const lx = x0 + chamfer - (chamfer * i) / (shoulder - top);
    rect(c, Math.round(lx), y, Math.round(x1 - chamfer + (chamfer * i) / (shoulder - top) - lx), 1, i < 2 ? '#c4c7ca' : PANEL_GREY);
  }
  for (let i = 0; i < shoulder - top; i++) {
    const y = top + i;
    const lx = x0 + chamfer - (chamfer * i) / (shoulder - top);
    rect(c, Math.round(lx), y, band, 1, i % 6 ? PANEL_GREY : '#86898e');
    rect(c, Math.round(x1 - chamfer + (chamfer * i) / (shoulder - top) - band), y, band, 1, i % 6 ? '#8e9296' : '#787b80');
  }
  for (let x = x0 + chamfer; x < x1 - chamfer; x += 18) rect(c, x, top, 1, band, '#86898e');
  // a dark strip of louvres up the right-hand corner, as in the photo of the left side
  rect(c, x1 - 10, shoulder + 4, 10, base - shoulder - 60, '#4d5056');
  for (let y = shoulder + 6; y < base - 58; y += 4) rect(c, x1 - 10, y, 10, 1, '#2f3136');

  // three tall louvred windows, the middle one widest, each between white pilasters
  const louvre = (cx: number, lw: number, y0: number, y1: number) => {
    rect(c, cx - lw / 2 - 4, y0 - 3, lw + 8, y1 - y0 + 6, '#f6f4ee');
    rect(c, cx - lw / 2, y0, lw, y1 - y0, '#d3d2cd');
    for (let k = 0; k < lw; k += Math.round(lw / 5)) rect(c, cx - lw / 2 + k, y0, 2, y1 - y0, '#f8f7f3');
    for (let y = y0 + 2; y < y1; y += 3) rect(c, cx - lw / 2, y, lw, 1, '#b6b5b0');
  };
  louvre(x0 + 72, 40, top + 30, base - 74);
  louvre(x0 + w / 2, 64, top + 20, base - 74);
  louvre(x1 - 72, 40, top + 30, base - 74);

  // the grey belt across the whole end at canopy height
  rect(c, x0, base - 70, w, 8, '#c7cacd');
  rect(c, x0, base - 70, w, 1, '#e1e3e5');
  for (let x = x0 + 8; x < x1; x += 24) rect(c, x, base - 70, 1, 8, '#a7aaae');

  // ground floor: the maroon band, the stone-tile walls, the vents at the ends
  const openL = x0 + w / 2 - 52;
  const openR = x0 + w / 2 + 52;
  rect(c, x0, base - 62, w, 14, '#9c4743');
  for (let x = x0 + 2; x < x1; x += 7) px(c, x, base - 55, '#b45a52');
  stoneTiles(c, x0 + 42, openL, base - 48, base, 21);
  stoneTiles(c, openR, x1 - 42, base - 48, base, 22);
  // the lower walls at the ends: grey siding, with the vent boxes
  for (const [a, b] of [[x0, x0 + 42], [x1 - 42, x1]] as const) {
    rect(c, a, base - 48, b - a, 48, '#c9cccf');
    for (let y = base - 46; y < base; y += 4) rect(c, a, y, b - a, 1, '#aeb1b5');
    ventBox(c, a + 6, base - 46, 30, 14);
  }
  for (const lx of [x0 + 64, openL - 22, openR + 20, x1 - 66]) wallLamp(c, g, lx, base - 40);

  // the opening: dark inside, the lit windows at the far end of the court, a hoop on its frame
  rect(c, openL - 3, base - 48, openR - openL + 6, 48, '#e6e1d4');
  rect(c, openL, base - 46, openR - openL, 46, '#2d2c30');
  rect(c, openL, base - 46, openR - openL, 6, '#1c1c20');
  rect(c, openL + 2, base - 16, openR - openL - 4, 16, '#4a4848');
  for (const wx of [openL + 40, openL + 56]) {
    rect(c, wx, base - 34, 12, 10, '#d9dfe6');
    rect(c, wx + 5, base - 34, 1, 10, '#8c939b');
    rect(g, wx, base - 34, 12, 10, '#fff1c8');
  }
  line(c, openL + 50, base - 24, openL + 44, base - 6, '#c9ccd2', 1);
  line(c, openL + 50, base - 24, openL + 56, base - 6, '#c9ccd2', 1);
  rect(c, openL + 46, base - 28, 8, 5, '#eef0f2');
  rect(c, openL + 44, base - 6, 14, 4, '#2c3f8a');

  // the big grey box canopy over it all
  const cl = openL - 38;
  const cr = openR + 38;
  rect(c, cl, base - 82, cr - cl, 20, '#bfc3c7');
  rect(c, cl, base - 82, cr - cl, 2, '#dfe2e4');
  for (let x = cl + 22; x < cr; x += 24) rect(c, x, base - 82, 1, 20, '#a3a7ab');
  rect(c, cl, base - 62, cr - cl, 5, '#8d9196');
  for (let x = cl + 2; x < cr - 2; x += 3) px(c, x, base - 60, '#b7bbbf');
  for (const lx of [cl + 30, openL + 30, openR - 32, cr - 32]) {
    rect(c, lx, base - 57, 4, 1, '#f8f4e2');
    rect(g, lx, base - 57, 4, 2, '#fff1c8');
  }
  return x0 + w / 2;
}

/**
 * The dark ribbed annex in front of the far end of the front, with the
 * university seal painted big on the side that faces the lot.
 */
export function darkAnnex(c: Ctx, g: Ctx, x0: number, x1: number, base: number): number {
  const w = x1 - x0;
  const eave = base - 76;
  // the wall: dark grey sheeting with its ribs catching the light
  rect(c, x0, eave, w, base - eave, '#3f424a');
  for (let x = x0 + 2; x < x1; x += 4) rect(c, x, eave, 1, base - eave, '#575b64');
  // the roof sloping up from the right, its white fascia
  poly(c, [[x0 - 4, eave], [x1 + 2, eave], [x1 + 2, eave - 10], [x0 + 40, eave - 22], [x0 - 4, eave - 8]], '#4a4e57');
  line(c, x0 - 4, eave - 8, x0 + 40, eave - 22, '#e9e9e6', 2);
  line(c, x0 + 40, eave - 22, x1 + 2, eave - 10, '#e9e9e6', 2);
  // a black glass door and its number
  const door = x0 + 22;
  rect(c, door - 10, base - 40, 20, 40, '#16171b');
  rect(c, door - 9, base - 39, 8, 38, '#23262d');
  rect(c, door + 6, base - 24, 1, 6, '#9a9ca2');
  rect(c, door - 12, base - 46, 24, 4, '#e8e8e4');
  sign(c, 'IE-01', door - 9, base - 52, '#e8e8e4');
  // the seal, painted big: a white disc, a maroon ring with the motto, the shield in the middle
  const cx = x0 + Math.round(w * 0.64);
  const cy = base - 40;
  const r = 30;
  disc(c, cx, cy, r + 2, '#d9d6cf');
  disc(c, cx, cy, r, '#f3f1ec');
  disc(c, cx, cy, r - 1, '#6b1e2c');
  disc(c, cx, cy, r - 8, '#f3f1ec');
  // the motto round the ring, as a run of pale marks
  for (let a = 0; a < Math.PI * 2; a += 0.16) {
    if (Math.abs(a - Math.PI / 2) < 0.4) continue;
    px(c, cx + Math.cos(a) * (r - 4.5), cy + Math.sin(a) * (r - 4.5), '#e9dcc8');
  }
  seal(c, cx, cy + 1, 16);
  sign(c, '19', cx - 21, cy + 10, '#6b1e2c');
  sign(c, '33', cx + 14, cy + 10, '#6b1e2c');
  // a concrete planter of shrubs along its foot
  rect(c, x0 + 40, base - 12, w - 42, 12, '#a7a49d');
  rect(c, x0 + 40, base - 12, w - 42, 1, '#c9c6bf');
  return door;
}
