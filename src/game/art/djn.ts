// The Don Juan D. Nepomuceno Building: cream walls, white trim, and the
// four-column portico with HOLY ANGEL UNIVERSITY across the entablature.
// Drawn from photo reference, simplified to what reads at this pixel size.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, line, poly, px, rect, signCentered } from '../../engine/pix';
import { P } from './palette';
import { urn } from './props';

export const DJN_WIDTH = 620;
const WING = 220;
const PORTICO = 180;
/** height of the wings from the ground to the top of the cornice */
const WALL_H = 126;
/** the portico floor sits this far above the ground, up the front steps */
export const PORTICO_RISE = 12;

const WARM = '#e9b45e';

function cornice(c: Ctx, x: number, y: number, w: number, overhang = 3): void {
  rect(c, x - overhang, y - 6, w + overhang * 2, 2, P.trim);
  rect(c, x - overhang, y - 4, w + overhang * 2, 1, P.trimShade);
  rect(c, x - overhang + 1, y - 3, w + overhang * 2 - 2, 3, P.trim);
  rect(c, x, y, w, 2, P.trimShade);
  for (let i = x + 1; i < x + w - 1; i += 3) rect(c, i, y, 2, 2, P.trim); // dentils
  rect(c, x, y + 2, w, 2, P.trim);
  rect(c, x, y + 4, w, 1, P.trimDeep);
  rect(c, x, y + 5, w, 3, P.wallShade); // shadow the cornice throws on the wall
}

function windowPair(c: Ctx, glow: Ctx, x: number, y: number, h: number, lit: boolean): void {
  for (const wx of [x, x + 13]) {
    rect(c, wx - 1, y - 1, 11, h + 2, P.trim);
    rect(c, wx - 2, y + h + 1, 13, 2, P.trim);
    rect(c, wx - 2, y + h + 3, 13, 1, P.wallShade);
    rect(c, wx, y, 9, h, P.glass);
    rect(c, wx, y, 9, 2, '#1f2532');
    line(c, wx + 1, y + h - 4, wx + 6, y + 3, P.glassHi, 1);
    line(c, wx + 4, y + h - 3, wx + 7, y + 6, '#46536c', 1);
    rect(c, wx + 4, y, 1, h, P.trim);
    rect(c, wx, y + Math.floor(h * 0.4), 9, 1, P.trim);
    if (lit) {
      rect(glow, wx, y, 9, h, WARM);
      rect(glow, wx + 4, y, 1, h, '#000');
      rect(glow, wx, y + Math.floor(h * 0.4), 9, 1, '#000');
    }
  }
}

function wing(c: Ctx, glow: Ctx, x: number, base: number, seed: number): void {
  const top = base - WALL_H;
  const rand = rng(seed);
  rect(c, x, top, WING, WALL_H, P.wall);
  // faint weathering so the wall isn't one flat block
  for (let i = 0; i < 260; i++) px(c, x + rand() * WING, top + rand() * WALL_H, rand() > 0.5 ? P.wallLit : '#e3cb85');
  rect(c, x, top, WING, 22, P.wallLit);
  rect(c, x, top + 22, WING, 1, '#f0dc9f');

  // parapet above the cornice
  rect(c, x, top - 12, WING, 7, P.wall);
  rect(c, x, top - 13, WING, 2, P.trim);
  cornice(c, x, top, WING);

  // belt course between the two floors
  const belt = top + 64;
  rect(c, x, belt, WING, 3, P.trim);
  rect(c, x, belt + 3, WING, 1, P.trimShade);
  rect(c, x, belt + 4, WING, 2, P.wallShade);

  // plinth
  rect(c, x, base - 9, WING, 9, P.trimShade);
  rect(c, x, base - 9, WING, 1, P.trim);
  rect(c, x, base - 2, WING, 2, P.trimDeep);

  // corner pilasters
  for (const pxl of [x, x + WING - 8]) {
    rect(c, pxl, top + 8, 8, WALL_H - 17, P.trim);
    rect(c, pxl + 6, top + 8, 2, WALL_H - 17, P.trimShade);
  }

  const bays = 4;
  const bayW = (WING - 16) / bays;
  for (let i = 0; i < bays; i++) {
    const bx = Math.round(x + 8 + bayW * i + bayW / 2 - 11);
    windowPair(c, glow, bx, top + 25, 30, rand() > 0.35);
    windowPair(c, glow, bx, top + 80, 30, rand() > 0.5);
  }
}

function column(c: Ctx, cx: number, top: number, bottom: number): void {
  const x = cx - 6;
  rect(c, x, top + 6, 12, bottom - top - 10, P.trim);
  rect(c, x, top + 6, 2, bottom - top - 10, '#ffffff');
  rect(c, x + 8, top + 6, 3, bottom - top - 10, P.trimShade);
  rect(c, x + 11, top + 6, 1, bottom - top - 10, P.trimDeep);
  for (let fy = top + 10; fy < bottom - 8; fy += 2) px(c, x + 5, fy, P.trimShade); // fluting hint
  // ionic capital
  rect(c, x - 2, top, 16, 2, P.trim);
  rect(c, x - 3, top + 2, 18, 3, P.trim);
  rect(c, x - 3, top + 4, 3, 2, P.trimShade);
  rect(c, x + 12, top + 4, 3, 2, P.trimDeep);
  px(c, x - 2, top + 3, P.trimDeep);
  px(c, x + 13, top + 3, P.trimDeep);
  rect(c, x - 1, top + 5, 14, 1, P.trimShade);
  // base
  rect(c, x - 1, bottom - 4, 14, 2, P.trim);
  rect(c, x - 2, bottom - 2, 16, 2, P.trimShade);
}

function door(c: Ctx, glow: Ctx, cx: number, floor: number, w: number, h: number, open: boolean): void {
  const x = Math.round(cx - w / 2);
  rect(c, x - 3, floor - h - 3, w + 6, h + 3, P.trim);
  rect(c, x - 3, floor - h - 3, 1, h + 3, P.trimShade);
  poly(c, [[x - 5, floor - h - 3], [x + w + 5, floor - h - 3], [cx, floor - h - 11]], P.trim);
  rect(c, x - 5, floor - h - 4, w + 10, 1, P.trimShade);
  rect(c, x, floor - h, w, h, P.door);
  if (open) {
    rect(c, x, floor - h, w, h, '#3d2d2a');
    rect(c, x + 2, floor - h + 4, w - 4, h - 4, '#5a4032');
    rect(c, x + 2, floor - 6, w - 4, 6, '#7a5a40');
    rect(glow, x, floor - h, w, h, '#d99a4a');
  } else {
    rect(c, x + Math.floor(w / 2), floor - h, 1, h, '#17131c');
    rect(c, x + 2, floor - h + 3, Math.floor(w / 2) - 3, h - 12, '#3a3246');
    rect(c, x + Math.floor(w / 2) + 2, floor - h + 3, Math.floor(w / 2) - 3, h - 12, '#3a3246');
  }
}

function seal(c: Ctx, x: number, y: number): void {
  disc(c, x, y, 7, P.maroon);
  disc(c, x, y, 6, P.gold);
  disc(c, x, y, 4, P.maroon);
  rect(c, x - 2, y - 1, 5, 3, P.trim);
  px(c, x, y - 3, P.trim);
  px(c, x - 3, y, P.trim);
  px(c, x + 3, y, P.trim);
}

function portico(c: Ctx, glow: Ctx, x: number, base: number): void {
  const top = base - WALL_H;
  const floor = base - PORTICO_RISE;
  const mid = x + PORTICO / 2;

  // taller block behind the pediment
  rect(c, x - 10, top - 46, PORTICO + 20, 48, P.wall);
  rect(c, x - 10, top - 46, PORTICO + 20, 14, P.wallLit);
  rect(c, x + PORTICO - 4, top - 46, 14, 48, P.wallShade);
  cornice(c, x - 10, top - 46, PORTICO + 20, 2);

  // recessed back wall, in the shade of the porch roof
  rect(c, x, top, PORTICO, WALL_H - PORTICO_RISE, P.wallShade);
  rect(c, x, top, PORTICO, 26, P.wallDeep);
  rect(c, x, top + 26, PORTICO, 8, '#b9a064');
  rect(c, x, floor - 6, PORTICO, 6, P.trimDeep);

  door(c, glow, mid - 52, floor, 16, 40, false);
  door(c, glow, mid + 52, floor, 16, 40, false);
  door(c, glow, mid, floor, 24, 46, true);
  // brass plaques either side of the main door
  rect(c, mid - 24, floor - 30, 5, 7, '#8a7340');
  rect(c, mid + 20, floor - 30, 5, 7, '#8a7340');
  // wall lanterns
  for (const lx of [mid - 28, mid + 28]) {
    rect(c, lx - 1, floor - 52, 3, 5, P.iron);
    rect(c, lx, floor - 51, 1, 3, P.lamp);
    rect(glow, lx - 1, floor - 52, 3, 5, P.lamp);
  }

  // porch floor
  rect(c, x - 4, floor, PORTICO + 8, 2, P.trim);

  // entablature with the lettering
  rect(c, x - 4, top - 2, PORTICO + 8, 18, P.trim);
  rect(c, x - 4, top + 14, PORTICO + 8, 2, P.trimShade);
  rect(c, x - 4, top + 16, PORTICO + 8, 1, P.trimDeep);
  signCentered(c, 'HOLY ANGEL UNIVERSITY', mid, top + 5, '#3b3029', 1);

  // pediment
  const py = top - 2;
  poly(c, [[x - 8, py], [x + PORTICO + 8, py], [mid, py - 34]], P.trim);
  poly(c, [[x + 8, py - 3], [x + PORTICO - 8, py - 3], [mid, py - 28]], P.wall);
  poly(c, [[x + 8, py - 3], [mid, py - 3], [mid, py - 28]], P.wallLit);
  for (let i = x + 10; i < x + PORTICO - 10; i += 3) rect(c, i, py - 5, 2, 2, P.trim);
  rect(c, x - 8, py - 1, PORTICO + 16, 3, P.trim);
  rect(c, x - 8, py + 2, PORTICO + 16, 1, P.trimShade);
  line(c, x - 8, py - 1, mid, py - 35, '#ffffff', 1);
  line(c, x + PORTICO + 8, py - 1, mid, py - 35, P.trimShade, 1);
  seal(c, mid, py - 13);

  for (const cx of [x + 13, x + 58, x + PORTICO - 58, x + PORTICO - 13]) column(c, cx, top + 16, floor);

  // front steps
  const steps = 6;
  for (let i = 0; i < steps; i++) {
    const sy = floor + 2 + i * 3;
    const sx = x - 8 - i * 3;
    const sw = PORTICO + 16 + i * 6;
    rect(c, sx, sy, sw, 3, i % 2 ? P.step : P.stepDark);
    rect(c, sx, sy, sw, 1, P.stepHi);
  }
  // cheek walls with urns
  for (const side of [-1, 1]) {
    const wx = side < 0 ? x - 30 : x + PORTICO + 14;
    rect(c, wx, floor - 8, 16, base - floor + 16, P.wall);
    rect(c, wx + 12, floor - 8, 4, base - floor + 16, P.wallShade);
    rect(c, wx - 1, floor - 10, 18, 3, P.trim);
    rect(c, wx - 1, floor - 7, 18, 1, P.trimShade);
    urn(c, wx + 8, floor - 10);
  }
}

/**
 * Draws the whole building with its left edge at `x`, standing on `base`.
 * Lit windows and the open door are drawn onto `glow`, which the scene adds
 * on top after dark.
 */
export function drawDJN(c: Ctx, glow: Ctx, x: number, base: number): void {
  wing(c, glow, x, base, 11);
  wing(c, glow, x + WING + PORTICO, base, 23);
  portico(c, glow, x + WING, base);
}

/** World x of the main door, relative to the building's left edge. */
export const DJN_DOOR_X = WING + PORTICO / 2;
