// The rest of the campus buildings. Until there are close-up photos of each
// one, they are drawn from the same handful of facade styles, coloured and
// sized from the aerial photo and the 2022 campus map. Only the outsides:
// no interiors yet.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { ellipse, line, poly, rect, sign, signCentered, signWidth } from '../../engine/pix';
import { P, shade } from './palette';

/** the ground floor is taller so a door fits a student */
export const GROUND_FLOOR = 38;
export const FLOOR = 22;

const LIT = '#ffd98a';

export type FacadeStyle =
  /** white slabs and long strips of glass: the newer high-rises */
  | 'ribbon'
  /** plain wall with rows of windows */
  | 'grid'
  /** open corridors with railings, classroom doors behind */
  | 'corridor'
  /** all glass */
  | 'curtain'
  /** windows behind coloured vertical fins */
  | 'fins';

export interface Facade {
  floors: number;
  style: FacadeStyle;
  wall: string;
  /** slab edges, frames and the parapet */
  trim?: string;
  glass?: string;
  /** railings, fins and door canopies */
  accent?: string;
  /** a tiled roof on top instead of a flat parapet */
  roof?: string;
  /** where the entrances go, as x offsets from the left edge */
  doors?: number[];
  /** lettering over the first entrance */
  name?: string;
  seed?: number;
}

export function facadeHeight(f: Facade): number {
  return GROUND_FLOOR + (f.floors - 1) * FLOOR + 6;
}

/** One building front. `base` is the ground line. Lit windows go on `g` for the night glow. Returns the y of its top. */
export function facade(c: Ctx, g: Ctx, x: number, w: number, base: number, f: Facade): number {
  const rand = rng(f.seed ?? Math.round(x * 13 + w));
  const trim = f.trim ?? P.trim;
  const glass = f.glass ?? '#4c5a72';
  const accent = f.accent ?? P.maroon;
  const top = base - facadeHeight(f);
  const wallHi = shade(f.wall, 0.22);
  const wallLo = shade(f.wall, -0.22);

  rect(c, x, top, w, base - top, f.wall);
  rect(c, x, top, 3, base - top, wallHi);

  for (let i = 1; i < f.floors; i++) {
    const y = base - GROUND_FLOOR - i * FLOOR;
    switch (f.style) {
      case 'ribbon': {
        rect(c, x - 2, y, w + 4, 5, trim);
        rect(c, x - 2, y + 5, w + 4, 1, shade(trim, -0.3));
        rect(c, x + 3, y + 6, w - 6, FLOOR - 10, shade(glass, -0.15));
        for (let wx = x + 4; wx < x + w - 9; wx += 8) {
          rect(c, wx, y + 7, 6, FLOOR - 12, rand() > 0.3 ? glass : shade(glass, 0.3));
          if (rand() > 0.55) rect(g, wx, y + 7, 6, FLOOR - 12, LIT);
        }
        break;
      }
      case 'grid': {
        rect(c, x, y, w, 1, wallLo);
        for (let wx = x + 7; wx < x + w - 12; wx += 15) {
          rect(c, wx - 1, y + 4, 10, 13, trim);
          rect(c, wx, y + 5, 8, 11, glass);
          rect(c, wx + 3, y + 5, 1, 11, trim);
          rect(c, wx - 2, y + 17, 12, 1, shade(trim, -0.25));
          if (rand() > 0.5) rect(g, wx, y + 5, 8, 11, LIT);
        }
        break;
      }
      case 'corridor': {
        // the corridor is in shade, with the classroom wall at the back of it
        rect(c, x + 3, y + 3, w - 6, FLOOR - 3, shade(f.wall, -0.42));
        for (let wx = x + 9; wx < x + w - 18; wx += 30) {
          rect(c, wx, y + 5, 7, FLOOR - 5, '#3a2f38'); // door
          rect(c, wx + 11, y + 6, 12, 7, shade(glass, -0.1));
          if (rand() > 0.5) rect(g, wx + 11, y + 6, 12, 7, LIT);
        }
        rect(c, x, y, w, 3, trim);
        rect(c, x + 3, y + FLOOR - 7, w - 6, 1, trim); // rail
        for (let wx = x + 4; wx < x + w - 4; wx += 3) rect(c, wx, y + FLOOR - 6, 1, 6, accent);
        for (let wx = x; wx < x + w - 2; wx += 30) {
          rect(c, wx, y + 3, 4, FLOOR - 3, f.wall);
          rect(c, wx, y + 3, 1, FLOOR - 3, wallHi);
        }
        break;
      }
      case 'curtain': {
        rect(c, x + 3, y, w - 6, FLOOR, glass);
        rect(c, x + 3, y, w - 6, 2, shade(glass, -0.35));
        for (let wx = x + 3; wx < x + w - 3; wx += 10) {
          rect(c, wx, y, 1, FLOOR, shade(glass, -0.3));
          if (rand() > 0.6) rect(c, wx + 1, y + 2, 9, FLOOR - 2, shade(glass, 0.22));
          if (rand() > 0.6) rect(g, wx + 1, y + 3, 9, FLOOR - 4, LIT);
        }
        break;
      }
      case 'fins': {
        rect(c, x, y, w, 3, trim);
        rect(c, x + 3, y + 3, w - 6, FLOOR - 3, shade(glass, -0.2));
        for (let wx = x + 5; wx < x + w - 6; wx += 12) if (rand() > 0.5) rect(g, wx, y + 5, 6, FLOOR - 8, LIT);
        for (let wx = x + 4, k = 0; wx < x + w - 5; wx += 6, k++) {
          rect(c, wx, y + 3, 3, FLOOR - 3, k % 3 === 0 ? accent : k % 3 === 1 ? P.gold : f.wall);
        }
        break;
      }
    }
  }

  // ground floor
  const gy = base - GROUND_FLOOR;
  rect(c, x - 2, gy, w + 4, 4, trim);
  rect(c, x - 2, gy + 4, w + 4, 1, shade(trim, -0.3));
  if (f.style === 'corridor') {
    rect(c, x + 3, gy + 5, w - 6, GROUND_FLOOR - 5, shade(f.wall, -0.42));
    for (let wx = x + 9; wx < x + w - 18; wx += 30) {
      rect(c, wx, gy + 11, 9, GROUND_FLOOR - 11, '#3a2f38');
      rect(c, wx + 13, gy + 12, 12, 10, shade(glass, -0.1));
      if (rand() > 0.6) rect(g, wx + 13, gy + 12, 12, 10, LIT);
    }
    for (let wx = x; wx < x + w - 2; wx += 30) {
      rect(c, wx, gy + 5, 5, GROUND_FLOOR - 5, f.wall);
      rect(c, wx, gy + 5, 1, GROUND_FLOOR - 5, wallHi);
    }
  } else {
    for (let wx = x + 8; wx < x + w - 20; wx += 24) {
      rect(c, wx - 1, gy + 9, 16, 19, trim);
      rect(c, wx, gy + 10, 14, 17, f.style === 'curtain' ? shade(glass, 0.1) : glass);
      rect(c, wx + 7, gy + 10, 1, 17, trim);
      if (rand() > 0.6) rect(g, wx, gy + 10, 14, 17, LIT);
    }
    rect(c, x, base - 5, w, 5, wallLo);
  }

  // shaded return on the right so blocks read as solid
  rect(c, x + w - 6, top, 6, base - top, wallLo);

  // entrances
  (f.doors ?? []).forEach((dx, i) => {
    const cx = x + dx;
    rect(c, cx - 15, gy + 5, 30, GROUND_FLOOR - 5, f.wall);
    rect(c, cx - 12, base - 31, 24, 31, trim);
    rect(c, cx - 10, base - 29, 20, 29, P.door);
    rect(c, cx, base - 29, 1, 29, trim);
    rect(c, cx - 9, base - 28, 8, 12, shade(glass, 0.15));
    rect(c, cx + 2, base - 28, 8, 12, shade(glass, 0.15));
    rect(g, cx - 10, base - 29, 20, 29, '#e0a85a');
    // canopy
    rect(c, cx - 20, gy + 2, 40, 4, accent);
    rect(c, cx - 20, gy + 6, 40, 1, shade(accent, -0.35));
    rect(c, cx - 14, base - 2, 28, 2, P.stepHi);
    if (i === 0 && f.name) {
      const tw = signWidth(f.name) + 6;
      rect(c, cx - tw / 2, gy - 8, tw, 9, trim);
      rect(c, cx - tw / 2, gy, tw, 1, shade(trim, -0.3));
      signCentered(c, f.name, cx, gy - 6, accent);
    }
  });

  // top: parapet or tiled roof
  if (f.roof) {
    poly(c, [[x - 6, top + 2], [x + w + 6, top + 2], [x + w - 10, top - 12], [x + 10, top - 12]], f.roof);
    poly(c, [[x - 6, top + 2], [x + w * 0.5, top + 2], [x + w * 0.5, top - 12], [x + 10, top - 12]], shade(f.roof, 0.16));
    for (let rx = x - 2; rx < x + w + 4; rx += 5) line(c, rx, top + 1, rx + (rx < x + w / 2 ? 3 : -3), top - 11, shade(f.roof, -0.2), 1);
    rect(c, x - 6, top + 2, w + 12, 2, shade(f.roof, -0.3));
  } else {
    rect(c, x - 2, top - 2, w + 4, 6, trim);
    rect(c, x - 2, top + 4, w + 4, 1, shade(trim, -0.3));
    rect(c, x - 2, top - 2, w + 4, 1, shade(trim, 0.4));
  }
  return f.roof ? top - 12 : top - 2;
}

/**
 * The Chapel of the Holy Guardian Angel: a round white building made of
 * stacked rings, each a little smaller than the one below, with dark glass
 * between them and a cross on top. `w` is its full width.
 */
export function chapel(c: Ctx, g: Ctx, cx: number, base: number, w: number): void {
  const white = '#f4f3ee';
  const whiteLo = '#c9cbd0';
  const glass = '#3d4a63';
  const blue = '#2f4f9c';
  const tiers = 5;
  const tierH = Math.round(w * 0.085);
  for (let i = 0; i < tiers; i++) {
    const tw = w * (1 - i * 0.13);
    const y = base - (i + 1) * tierH;
    const x = cx - tw / 2;
    // each ring is mostly white: a deep eave, then a band of glass behind white fins
    const eave = Math.round(tierH * 0.55);
    rect(c, x + 5, y + eave, tw - 10, tierH - eave, glass);
    rect(c, x + tw * 0.7, y + eave, tw * 0.3 - 5, tierH - eave, shade(glass, -0.25));
    rect(c, x + 5, y + tierH - 2, tw - 10, 1, blue);
    if (i < 3) for (let wx = x + 12; wx < x + tw - 14; wx += 12) rect(g, wx, y + eave + 1, 8, tierH - eave - 2, '#ffe2a0');
    for (let wx = x + 8; wx < x + tw - 8; wx += 6) rect(c, wx, y + eave, 2, tierH - eave, wx > x + tw * 0.7 ? whiteLo : white);
    rect(c, x, y, tw, eave, white);
    rect(c, x, y + eave - 1, tw, 1, whiteLo);
    rect(c, x + tw * 0.7, y, tw * 0.3, eave, whiteLo);
    rect(c, x, y + Math.round(eave / 2), tw * 0.7, 1, '#e2e3e6');
    rect(c, x, y, tw, 1, '#ffffff');
  }
  // roof cap and cross
  const capW = w * (1 - tiers * 0.13);
  const capY = base - tiers * tierH;
  ellipse(c, cx, capY, capW / 2 - 6, tierH * 0.35, white);
  rect(c, cx - capW / 2, capY, capW, 2, whiteLo);
  rect(c, cx - 1, capY - tierH * 0.35 - 16, 2, 16, '#8a8d95');
  rect(c, cx - 5, capY - tierH * 0.35 - 12, 10, 2, '#8a8d95');
  // entrance: glass doors under a flat canopy
  const dw = Math.round(w * 0.2);
  rect(c, cx - dw / 2, base - tierH - 4, dw, tierH + 4, '#26303f');
  for (let dx = cx - dw / 2 + 2; dx < cx + dw / 2 - 4; dx += 9) rect(c, dx, base - tierH - 2, 6, tierH + 2, '#52648a');
  rect(g, cx - dw / 2, base - tierH - 4, dw, tierH + 4, '#ffd27a');
  rect(c, cx - dw / 2 - 8, base - tierH - 9, dw + 16, 5, white);
  rect(c, cx - dw / 2 - 8, base - tierH - 4, dw + 16, 1, whiteLo);
  rect(c, cx - dw / 2 - 6, base - 2, dw + 12, 2, whiteLo);
}

/** A big hall under one low roof: the gymnasium. */
export function gymHall(c: Ctx, g: Ctx, x: number, w: number, base: number, name: string): void {
  const wall = '#e9e2cf';
  const h = 96;
  rect(c, x, base - h, w, h, wall);
  rect(c, x, base - h, 4, h, shade(wall, 0.25));
  rect(c, x + w - 8, base - h, 8, h, shade(wall, -0.22));
  // buttress piers and the high windows between them
  for (let px0 = x + 6; px0 < x + w - 10; px0 += 44) {
    rect(c, px0, base - h + 8, 6, h - 8, shade(wall, -0.12));
    rect(c, px0 + 12, base - h + 16, 26, 22, '#55647e');
    rect(c, px0 + 24, base - h + 16, 1, 22, wall);
    rect(c, px0 + 12, base - h + 26, 26, 1, wall);
    rect(g, px0 + 12, base - h + 16, 26, 22, LIT);
    rect(c, px0 + 12, base - 40, 26, 3, shade(wall, -0.18)); // vent louvres
    rect(c, px0 + 12, base - 34, 26, 3, shade(wall, -0.18));
  }
  rect(c, x, base - 8, w, 8, P.maroon);
  rect(c, x, base - 9, w, 1, P.maroonHi);
  // roof: long, low and white
  poly(c, [[x - 8, base - h], [x + w + 8, base - h], [x + w - 6, base - h - 20], [x + 6, base - h - 20]], '#dfe2e6');
  poly(c, [[x - 8, base - h], [x + w * 0.5, base - h], [x + w * 0.5, base - h - 20], [x + 6, base - h - 20]], '#f3f4f6');
  for (let rx = x; rx < x + w; rx += 9) line(c, rx, base - h - 1, rx, base - h - 19, '#c5c9cf', 1);
  rect(c, x - 8, base - h, w + 16, 3, '#aeb3ba');
  // name across the wall
  const tw = signWidth(name) + 10;
  rect(c, x + w / 2 - tw / 2, base - 62, tw, 11, P.maroon);
  signCentered(c, name, x + w / 2, base - 59, P.goldHi);
  // double doors
  for (const dx of [w * 0.25, w * 0.75]) {
    rect(c, x + dx - 13, base - 34, 26, 34, P.trim);
    rect(c, x + dx - 11, base - 32, 22, 32, P.door);
    rect(c, x + dx, base - 32, 1, 32, P.trim);
    rect(g, x + dx - 11, base - 32, 22, 32, '#e0a85a');
  }
}

/** The covered court: a roof on steel columns, open on every side, with the court and bleachers under it. */
export function coveredCourt(c: Ctx, g: Ctx, x: number, w: number, base: number): void {
  const steel = '#7f8a96';
  const h = 84;
  // the far side: bleachers and the painted floor
  rect(c, x + 6, base - 30, w - 12, 30, '#4d5a4f');
  for (let i = 0; i < 4; i++) rect(c, x + 6, base - 30 + i * 6, w - 12, 2, i % 2 ? '#8b3a40' : '#c9b06a');
  rect(c, x + 6, base - 6, w - 12, 6, '#3f7a5a');
  rect(c, x + 6, base - 6, w - 12, 1, '#e8e4d6');
  // a hoop at each end
  for (const [hx, dir] of [[x + 26, 1], [x + w - 26, -1]] as const) {
    rect(c, hx, base - 44, 2, 44, steel);
    rect(c, hx + dir * 2 - (dir < 0 ? 9 : 0), base - 50, 9, 8, '#f0efe9');
    rect(c, hx + dir * 10 - (dir < 0 ? 6 : 0), base - 44, 6, 1, '#e8742c');
  }
  // roof: trusses and a shallow arch of sheeting
  for (let cx = x; cx <= x + w; cx += Math.round(w / 6)) {
    rect(c, cx - 2, base - h, 4, h, steel);
    rect(c, cx - 2, base - h, 1, h, shade(steel, 0.3));
    line(c, cx, base - h + 12, cx + 12, base - h, shade(steel, -0.2), 1);
    line(c, cx, base - h + 12, cx - 12, base - h, shade(steel, -0.2), 1);
  }
  poly(c, [[x - 10, base - h], [x + w + 10, base - h], [x + w - 4, base - h - 18], [x + 4, base - h - 18]], '#d8dade');
  poly(c, [[x - 10, base - h], [x + w * 0.45, base - h], [x + w * 0.45, base - h - 18], [x + 4, base - h - 18]], '#eef0f2');
  for (let rx = x - 4; rx < x + w + 6; rx += 7) line(c, rx, base - h - 1, rx, base - h - 17, '#bcc0c6', 1);
  rect(c, x - 10, base - h, w + 20, 3, '#9aa0a8');
  // floodlights under the roof
  for (let lx = x + 30; lx < x + w - 20; lx += 60) {
    rect(c, lx - 3, base - h + 4, 6, 3, '#f4f2ec');
    rect(g, lx - 3, base - h + 6, 6, 2, P.lamp);
  }
}

/** The Yellow Food Court: a long yellow roof on posts with stalls underneath. */
export function foodCourt(c: Ctx, g: Ctx, x: number, w: number, base: number): void {
  const yellow = '#e9b82c';
  const h = 50;
  rect(c, x + 4, base - h + 6, w - 8, h - 6, '#6b5a48');
  for (let sx = x + 8, k = 0; sx < x + w - 30; sx += 34, k++) {
    // a stall: counter, menu board, light
    rect(c, sx, base - 16, 28, 16, k % 2 ? '#c9c4b6' : '#e2dccb');
    rect(c, sx, base - 17, 28, 2, '#8a5a3a');
    rect(c, sx + 2, base - 38, 24, 9, k % 2 ? P.maroon : '#2f5f9e');
    rect(c, sx + 4, base - 35, 14, 1, P.goldHi);
    rect(c, sx + 4, base - 32, 9, 1, P.trim);
    rect(g, sx, base - 28, 28, 11, '#ffd98a');
  }
  for (let px0 = x; px0 <= x + w; px0 += 34) {
    rect(c, px0, base - h, 3, h, '#f4f2ec');
    rect(c, px0 + 2, base - h, 1, h, '#b8b5ae');
  }
  poly(c, [[x - 8, base - h], [x + w + 8, base - h], [x + w, base - h - 12], [x, base - h - 12]], yellow);
  poly(c, [[x - 8, base - h], [x + w * 0.5, base - h], [x + w * 0.5, base - h - 12], [x, base - h - 12]], shade(yellow, 0.25));
  for (let rx = x - 4; rx < x + w + 6; rx += 6) line(c, rx, base - h - 1, rx + 1, base - h - 11, shade(yellow, -0.2), 1);
  rect(c, x - 8, base - h, w + 16, 2, shade(yellow, -0.35));
}

/** A plain shed with a roll-up door: the warehouse and carpentry shop. */
export function shed(c: Ctx, x: number, w: number, base: number): void {
  const wall = '#b9b4a6';
  const h = 54;
  rect(c, x, base - h, w, h, wall);
  for (let sx = x + 3; sx < x + w; sx += 4) rect(c, sx, base - h, 1, h, shade(wall, -0.14));
  rect(c, x + w - 6, base - h, 6, h, shade(wall, -0.25));
  rect(c, x + w * 0.5 - 20, base - 36, 40, 36, '#6f7780');
  for (let ry = base - 34; ry < base; ry += 4) rect(c, x + w * 0.5 - 20, ry, 40, 1, '#565d66');
  poly(c, [[x - 5, base - h], [x + w + 5, base - h], [x + w * 0.5, base - h - 16]], '#8f4a3a');
  poly(c, [[x - 5, base - h], [x + w * 0.5, base - h], [x + w * 0.5, base - h - 16]], '#a85a46');
  rect(c, x - 5, base - h, w + 10, 2, '#6c382d');
  // timber stacked outside
  for (let i = 0; i < 4; i++) rect(c, x + 6, base - 4 - i * 3, 22 - i * 2, 2, i % 2 ? '#a8804f' : '#c29a62');
}

/** Building name on a low wall by the road, the way the campus marks each one. */
export function nameWall(c: Ctx, x: number, base: number, lines: string[]): void {
  const w = Math.max(...lines.map((l) => signWidth(l))) + 12;
  const h = lines.length * 7 + 7;
  rect(c, x - w / 2 - 3, base - 4, w + 6, 4, P.stoneDark);
  rect(c, x - w / 2, base - 4 - h, w, h, P.maroon);
  rect(c, x - w / 2, base - 4 - h, w, 1, P.maroonHi);
  rect(c, x - w / 2, base - 5 - h, w, 1, P.gold);
  lines.forEach((l, i) => sign(c, l, x - signWidth(l) / 2, base - h + i * 7, P.goldHi));
}
