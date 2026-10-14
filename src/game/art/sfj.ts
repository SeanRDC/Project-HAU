// The San Francisco de Javier Building and the fountain in front of it,
// drawn from `SFJ BUILDING AND FOUNTAIN.jpg` and `SFJ BUILDING CORNER
// VIEW.jpg` in `assets/images/other references/`: a tall bay of green glass over the entrance, a tan
// pylon beside it that rises past the roof, cream wings with long strips of
// the same glass, a two-storey glass podium carrying the building's name,
// and a flat canopy on columns across the whole front. The round plaza the
// fountain sits in is from the aerial photo `FOUNTAIN IN FRONT OF SFJ.png`.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { ellipse, line, poly, px, rect, signCentered, signWidth } from '../../engine/pix';
import { P, shade } from './palette';

const GROUND_H = 36;
const FLOOR_H = 26;
/** the entrance sits this far above the plaza, up the broad front steps */
const RISE = 16;

const CREAM = '#ece6d4';
const CREAM_HI = '#f8f4e6';
const CREAM_LO = '#c4bda8';
const GLASS = '#35a394';
const GLASS_HI = '#6fcdbc';
const GLASS_LO = '#1f7468';
const MULLION = '#d9ede6';
const TAN = '#a98554';
const TAN_HI = '#c4a070';
const TAN_LO = '#836640';
const LIT = '#ffe9b0';

/** A strip of green glass, some panes catching the sky. */
function ribbon(c: Ctx, g: Ctx, x: number, y: number, w: number, h: number, rand: () => number): void {
  rect(c, x, y, w, h, GLASS);
  rect(c, x, y, w, 2, GLASS_LO);
  for (let wx = x; wx < x + w; wx += 9) {
    if (rand() > 0.55) rect(c, wx + 1, y + 2, 8, h - 3, GLASS_HI);
    if (rand() > 0.7) rect(g, wx + 1, y + 2, 8, h - 3, LIT);
    rect(c, wx, y, 1, h, GLASS_LO);
  }
  rect(c, x, y + Math.round(h / 2), w, 1, GLASS_LO);
}

/** A wing: `floors` storeys of cream bands and ribbon windows above the ground floor. Returns the y of its top. */
function wing(c: Ctx, g: Ctx, x: number, w: number, floor: number, floors: number, seed: number): number {
  const rand = rng(seed);
  const top = floor - GROUND_H - floors * FLOOR_H - 9;
  rect(c, x, top, w, floor - top, CREAM);
  for (let i = 0; i < floors; i++) {
    const y = floor - GROUND_H - (i + 1) * FLOOR_H;
    ribbon(c, g, x + 4, y + 2, w - 8, 13, rand);
    rect(c, x, y + 15, w, 1, CREAM_HI);
    rect(c, x, y + FLOOR_H - 1, w, 1, CREAM_LO);
  }
  rect(c, x, top, 3, floor - top, CREAM_HI);
  rect(c, x - 1, top - 2, w + 2, 3, CREAM_HI);
  rect(c, x - 1, top + 1, w + 2, 1, CREAM_LO);
  return top - 2;
}

export interface Sfj {
  /** scene x of the main doors, under the glass bay */
  door: number;
}

/**
 * Draws the front of the building with its left edge at `x`, `w` wide,
 * standing on `base`: the plaza level, at the foot of its steps.
 */
export function drawSFJ(c: Ctx, g: Ctx, x: number, w: number, base: number): Sfj {
  const floor = base - RISE;
  const rand = rng(331);
  const leftW = Math.round(w * 0.3);
  const slabW = Math.round(w * 0.075);
  const bayW = Math.round(w * 0.17);
  const linkW = Math.round(w * 0.065);
  const pylonW = Math.round(w * 0.13);
  const slabX = x + leftW;
  const bayX = slabX + slabW;
  const linkX = bayX + bayW;
  const pylonX = linkX + linkW;
  const rightX = pylonX + pylonW;
  const rightW = x + w - rightX;

  // the wings either side: the left one a floor taller than the right
  const leftTop = wing(c, g, x, leftW, floor, 4, 332);
  wing(c, g, rightX, Math.round(rightW * 0.55), floor, 4, 333);
  // the right wing stops short; the rest of that side is only the podium
  rect(c, rightX + Math.round(rightW * 0.55) - 4, floor - GROUND_H - 4 * FLOOR_H - 9, 4, 4 * FLOOR_H + 9, CREAM_LO);

  // the plain slab between the left wing and the glass
  const bayTop = leftTop - 12;
  rect(c, slabX, bayTop, slabW, floor - bayTop, '#d6cbb0');
  rect(c, slabX, bayTop, 2, floor - bayTop, CREAM_HI);
  rect(c, slabX + slabW - 3, bayTop, 3, floor - bayTop, '#b3a88c');
  rect(c, slabX - 1, bayTop - 2, slabW + 2, 3, CREAM_HI);

  // the glass bay over the entrance, a grid of panes with a brighter frame down the middle
  rect(c, bayX, bayTop + 2, bayW, floor - bayTop - 2, GLASS);
  const paneW = bayW / 4;
  for (let y = bayTop + 2, row = 0; y < floor - GROUND_H; y += 16, row++) {
    for (let k = 0; k < 4; k++) {
      const px0 = Math.round(bayX + k * paneW);
      const inner = k === 1 || k === 2;
      if (inner || rand() > 0.6) rect(c, px0 + 1, y + 1, Math.round(paneW) - 1, 15, inner && row > 1 ? GLASS_HI : shade(GLASS, 0.18));
      if (rand() > 0.62) rect(g, px0 + 1, y + 1, Math.round(paneW) - 1, 15, LIT);
    }
    rect(c, bayX, y, bayW, 1, GLASS_LO);
  }
  for (let k = 0; k <= 4; k++) rect(c, Math.round(bayX + k * paneW) - (k === 4 ? 1 : 0), bayTop + 2, 1, floor - bayTop - 2, k === 1 || k === 3 ? MULLION : GLASS_LO);
  rect(c, bayX, bayTop, bayW, 3, '#cfd8d4');

  // the link between the glass and the pylon: a window on each floor
  const linkTop = bayTop + 6;
  rect(c, linkX, linkTop, linkW, floor - linkTop, CREAM);
  for (let i = 0; i < 4; i++) ribbon(c, g, linkX + 2, floor - GROUND_H - (i + 1) * FLOOR_H + 2, linkW - 4, 13, rand);
  rect(c, linkX, linkTop - 2, linkW, 3, CREAM_HI);

  // the tan pylon, taller than everything, with its dark sloped cap
  const pylonTop = bayTop - 14;
  rect(c, pylonX, pylonTop, pylonW, floor - pylonTop, TAN);
  rect(c, pylonX, pylonTop, 4, floor - pylonTop, TAN_HI);
  rect(c, pylonX + pylonW - 6, pylonTop, 6, floor - pylonTop, TAN_LO);
  poly(c, [[pylonX - 2, pylonTop], [pylonX + pylonW + 2, pylonTop], [pylonX + pylonW + 2, pylonTop - 7], [pylonX - 2, pylonTop - 13]], '#3b3a40');
  line(c, pylonX - 2, pylonTop - 13, pylonX + pylonW + 1, pylonTop - 7, '#6a6972', 1);
  rect(c, pylonX - 2, pylonTop, pylonW + 4, 2, '#55545c');

  // the podium: two storeys of glass under a band with the building's name
  const podX = pylonX + 4;
  const podW = x + w - podX;
  const podTop = floor - GROUND_H - 2 * FLOOR_H;
  rect(c, podX, podTop, podW, floor - GROUND_H - podTop, GLASS);
  for (let wx = podX; wx < podX + podW; wx += 11) {
    for (let y = podTop + 10; y < floor - GROUND_H; y += 13) {
      if (rand() > 0.5) rect(c, wx + 1, y + 1, 10, 12, GLASS_HI);
      if (rand() > 0.65) rect(g, wx + 1, y + 1, 10, 12, LIT);
    }
    rect(c, wx, podTop + 10, 1, floor - GROUND_H - podTop - 10, GLASS_LO);
  }
  for (let y = podTop + 10; y < floor - GROUND_H; y += 13) rect(c, podX, y, podW, 1, GLASS_LO);
  rect(c, podX - 2, podTop, podW + 2, 10, CREAM_HI);
  rect(c, podX - 2, podTop + 10, podW + 2, 1, CREAM_LO);
  const name = 'SAN FRANCISCO DE JAVIER BUILDING';
  if (signWidth(name) < podW - 6) signCentered(c, name, podX + podW / 2, podTop + 3, '#5c5a52');
  else {
    signCentered(c, 'SAN FRANCISCO', podX + podW / 2, podTop - 3, '#5c5a52');
    signCentered(c, 'DE JAVIER BUILDING', podX + podW / 2, podTop + 3, '#5c5a52');
  }

  // ground floor: the lobby glass set back in shade, the dark stone base under the left wing
  const gy = floor - GROUND_H;
  rect(c, x, gy, w, GROUND_H, '#2c3a3c');
  const stoneW = Math.round(leftW * 0.72);
  rect(c, x, gy, stoneW, GROUND_H, '#6f665c');
  rect(c, x, gy, stoneW, 2, '#8a8176');
  for (let sy = gy + 8; sy < floor; sy += 8) rect(c, x, sy, stoneW, 1, '#5a5249');
  for (let wx = x + stoneW + 3; wx < x + w - 4; wx += 13) {
    rect(c, wx, gy + 6, 11, GROUND_H - 6, '#4f8f88');
    rect(c, wx, gy + 6, 11, 1, '#8fc7bd');
    rect(c, wx + 5, gy + 6, 1, GROUND_H - 6, '#2c3a3c');
  }
  // the main doors, warm with light, under the glass bay
  const door = Math.round(bayX + bayW / 2);
  rect(c, door - 20, gy + 5, 40, GROUND_H - 5, '#8a6a44');
  rect(c, door - 18, gy + 7, 17, GROUND_H - 7, '#c99a5c');
  rect(c, door + 1, gy + 7, 17, GROUND_H - 7, '#c99a5c');
  rect(c, door - 10, gy + 7, 1, GROUND_H - 7, '#8a6a44');
  rect(c, door + 9, gy + 7, 1, GROUND_H - 7, '#8a6a44');
  rect(g, door - 20, gy + 5, 40, GROUND_H - 5, '#ffd27a');
  rect(g, x + stoneW + 3, gy + 6, w - stoneW - 7, GROUND_H - 6, '#e0b070');

  // the flat canopy on its columns
  const canX = x + Math.round(leftW * 0.5);
  const canW = x + w - canX + 6;
  for (let cx = canX + 8; cx < canX + canW - 6; cx += 30) {
    if (Math.abs(cx - door) < 22) continue;
    rect(c, cx, gy + 4, 4, GROUND_H - 4, '#e9edf0');
    rect(c, cx + 3, gy + 4, 1, GROUND_H - 4, '#aeb6bd');
  }
  rect(c, canX, gy - 2, canW, 6, '#d5dbe0');
  rect(c, canX, gy - 2, canW, 1, '#f4f6f8');
  rect(c, canX, gy + 4, canW, 2, '#8d969e');

  // the white ribbon sculpture against the stone wall
  const sx = x + Math.round(stoneW * 0.6);
  for (let a = 0; a < 40; a++) {
    const t = (a / 40) * Math.PI * 2;
    const rx0 = sx + Math.sin(t) * 9;
    const ry0 = floor - 12 + Math.sin(t * 2) * 6;
    rect(c, rx0, ry0, 2, 3, a % 5 ? '#f1f1f1' : '#c9c9cf');
  }
  rect(c, sx - 4, floor - 3, 9, 3, '#d8d8dc');

  // the front steps, the full width of the canopy, and the rails down them
  // each step is a pale tread over the shadow of its riser, and comes out further than the one above
  rect(c, x, floor, canX - x - 6, RISE, '#5a5249');
  for (let i = 0; i < RISE / 2; i++) {
    const sx0 = canX - 6 - i * 4;
    rect(c, sx0, floor + i * 2, canW + 6 + i * 4, 1, '#eceae3');
    rect(c, sx0, floor + i * 2 + 1, canW + 6 + i * 4, 1, '#7f7e7a');
    rect(c, sx0, floor + i * 2, 1, 2, '#f6f5f0');
  }
  // a landing at the top, in front of the doors
  rect(c, canX - 6, floor - 1, canW + 6, 1, '#d6d4cc');
  for (const rx0 of [door - 62, door - 30, door + 30, door + 62]) {
    line(c, rx0, floor - 9, rx0 + 10, base - 8, P.iron, 1);
    rect(c, rx0, floor - 9, 1, 9, P.iron);
    rect(c, rx0 + 5, floor - 1, 1, 8, P.iron);
    rect(c, rx0 + 10, base - 8, 1, 8, P.iron);
  }
  return { door };
}

/** The plaza's radius out to its white ring: about 10.5 m, measured off the campus aerial. */
export const PLAZA_R = 96;
/** how much the low camera flattens a circle on the ground */
const FLAT = 0.2;
// the rings of the plaza as fractions of its radius, read off the aerial photo
const BAND = 0.77;
const LAWN = 0.41;
const RIM = 0.29;
const WATER = 0.25;

const BAND_GREY = '#84858b';
const DISC = '#cdccc7';
const STRAP = '#f4f3ee';
const ARC = '#7e7f86';
const RING = '#e3e1db';

/** What the paving is at a point of the plaza, with the plaza's radius as 1. Null outside the white ring. */
function paving(u: number, v: number): 'ring' | 'band' | 'strap' | 'arc' | 'disc' | null {
  const r = Math.hypot(u, v);
  if (r > 1) return null;
  if (r > 0.95) return 'ring';
  if (r > BAND) return 'band';
  // pale straps: a square set inside the disc, its corners on the dark band
  for (let k = 0; k < 4; k++) {
    const a = 0.2 + Math.PI / 4 + (k * Math.PI) / 2;
    if (Math.abs(u * Math.cos(a) + v * Math.sin(a) - BAND / Math.SQRT2) < 0.034) return 'strap';
  }
  // eight circles outlined in dark grey round the lawn, running out under the band
  for (let k = 0; k < 8; k++) {
    const a = 0.2 + (k * Math.PI) / 4;
    if (Math.abs(Math.hypot(u - Math.cos(a) * 0.6, v - Math.sin(a) * 0.6) - 0.21) < 0.011) return 'arc';
  }
  return 'disc';
}

/**
 * The round plaza the fountain stands in, flattened by the low camera: a
 * white ring, a band of darker concrete inside it, then a pale disc with a
 * square of lighter straps and eight outlined circles round the lawn.
 * `cy` is the middle of the pool. Draw `jetPool` over it.
 */
export function fountainPlaza(c: Ctx, g: Ctx, x: number, cy: number): void {
  const rand = rng(336);
  const ry = Math.round(PLAZA_R * FLAT);
  const tone = { disc: DISC, arc: ARC, strap: STRAP, band: BAND_GREY, ring: RING };
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -PLAZA_R; dx <= PLAZA_R; dx++) {
      // a ground pixel covers far more depth than width, so look at three depths and keep the thin lines
      const at = (sub: number) => paving(dx / PLAZA_R, (dy + sub) / (PLAZA_R * FLAT));
      let best = at(0);
      if (!best) continue;
      if (best === 'disc' || best === 'arc') {
        const near = [at(-0.33), at(0.33)];
        if (near.includes('strap')) best = 'strap';
        else if (near.includes('arc')) best = 'arc';
      }
      let col = tone[best];
      if (best !== 'strap' && best !== 'ring' && rand() > 0.9) col = shade(col, rand() > 0.5 ? 0.07 : -0.07);
      px(c, x + dx, cy + dy, col);
    }
  }
  // the low black lamps that stand round the ring and the lawn; the near ones would be in front of you
  const post = (r: number, a: number) => {
    const bx = x + Math.cos(a) * PLAZA_R * r;
    const by = cy + Math.sin(a) * PLAZA_R * r * FLAT;
    rect(c, bx, by - 3, 1, 4, '#22242a');
    px(c, bx, by - 4, '#3a3d45');
    px(g, bx, by - 4, LIT);
  };
  for (let k = 0; k < 7; k++) post(0.93, Math.PI + 0.2 + (k * (Math.PI - 0.4)) / 6);
  for (let k = 0; k < 5; k++) post(LAWN + 0.03, Math.PI + 0.1 + (k * (Math.PI - 0.2)) / 4);
}

/** How far out from the middle of the pool the ring of jets stands, as [x, y] offsets. */
export const POOL_JETS: [number, number][] = Array.from({ length: 8 }, (_, i) => {
  const t = (i / 8) * Math.PI * 2 + 0.39;
  return [Math.round(Math.cos(t) * PLAZA_R * WATER * 0.62), Math.round(Math.sin(t) * PLAZA_R * WATER * FLAT * 0.62)];
});

/**
 * The round pool in the middle of the plaza: a ring of lawn, a rim of grey
 * stone slabs, green water and a stone bowl in the middle. The jets are
 * animated by the scene. `cy` is the middle of the water.
 */
export function jetPool(c: Ctx, x: number, cy: number): void {
  const lawn = PLAZA_R * LAWN;
  const rim = PLAZA_R * RIM;
  const water = PLAZA_R * WATER;
  ellipse(c, x, cy + 1, lawn, lawn * FLAT, P.grassDark);
  ellipse(c, x, cy, lawn, lawn * FLAT, P.grass);
  ellipse(c, x - 4, cy - 2, lawn * 0.8, lawn * FLAT * 0.6, P.grassHi);
  // the rim: wedge-shaped slabs with dark joints between them
  ellipse(c, x, cy + 1, rim, rim * FLAT, '#4a4d55');
  ellipse(c, x, cy, rim, rim * FLAT, '#8f949c');
  ellipse(c, x, cy - 1, rim - 1, rim * FLAT - 0.5, '#aab0b8');
  for (let a = 0; a < 16; a++) {
    const t = (a / 16) * Math.PI * 2;
    line(c, x + Math.cos(t) * water, cy + Math.sin(t) * water * FLAT, x + Math.cos(t) * rim, cy + Math.sin(t) * rim * FLAT, '#5f646c', 1);
  }
  ellipse(c, x, cy, water, water * FLAT, '#1f4f55');
  ellipse(c, x, cy - 1, water, water * FLAT - 0.5, '#2f7b7c');
  ellipse(c, x - 4, cy - 2, water * 0.6, water * FLAT * 0.45, '#45989a');
  ellipse(c, x + 7, cy + 2, water * 0.4, 1.2, '#3a8a8b');
  // the bowl in the middle
  ellipse(c, x, cy + 1, 7, 2, '#3d4148');
  rect(c, x - 5, cy - 4, 11, 5, '#8f949c');
  rect(c, x - 5, cy - 4, 3, 5, '#b4bac1');
  rect(c, x + 3, cy - 4, 3, 5, '#6b7078');
  ellipse(c, x, cy - 4, 6, 1.6, '#c3c8ce');
  ellipse(c, x, cy - 4, 4, 1, '#3f8f90');
}
