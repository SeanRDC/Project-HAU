// The rest of the campus buildings. Until there are close-up photos of each
// one, they are drawn from the same handful of facade styles, coloured and
// sized from the aerial photo and the 2022 campus map. Only the outsides:
// no interiors yet.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { line, poly, rect, sign, signCentered, signWidth } from '../../engine/pix';
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
 * The Chapel of the Holy Guardian Angel, from the photo of its front
 * (`assets/APS WALK FROM CHAPEL LAWN/31_chapel-front...`): a low round
 * building crowned by four thin white rings stacked like a disc, the top one
 * widest, each curving away at its ends. Under them a plain white band, then
 * a glass front the whole width between two white end pillars with moulded
 * caps, up a flight of wide steps. A gold cross on top, and a yellow and
 * white flag on a pole either side. `w` is the width of the top ring; `base`
 * is the foot of the steps.
 */
export function chapel(c: Ctx, g: Ctx, cx: number, base: number, w: number): void {
  const white = '#f2f3f1';
  const whiteHi = '#ffffff';
  const whiteLo = '#c4c9cf';
  const core = '#8e959e';
  const half = w / 2;
  const floor = base - 8;
  const glassH = Math.round(w * 0.16);
  const glassTop = floor - glassH;
  const bandH = Math.round(w * 0.07);
  const rim = 6;
  const step = 14;
  const crownTop = glassTop - bandH - 4 * step - 4;
  // the round drum the rings are threaded on
  const rc = half * 0.8;
  const ringY = (i: number): number => crownTop + 8 + i * step;
  // the top of the top ring, where the cross stands
  const roofTop = Math.round(ringY(0) - half * 0.07) - rim;

  // the drum: a cylinder, lit from the upper left, rolling into shade at both edges. It starts
  // under the top ring, so its top follows that ring's curve
  for (let x = Math.round(cx - rc); x <= Math.round(cx + rc); x++) {
    const v = (x - cx) / rc;
    const top = Math.round(ringY(0) - half * 0.07 * Math.sqrt(Math.max(0, 1 - v * v)));
    rect(c, x, top, 1, glassTop - top, shade(core, 0.14 - 0.12 * v - 0.3 * v ** 6));
  }
  // the plain white band over the glass
  const fw = w * 0.84;
  rect(c, cx - fw / 2, glassTop - bandH, fw, bandH, '#e4e7ea');
  rect(c, cx - fw / 2, glassTop - bandH, fw, 2, '#b4bac2');
  rect(c, cx - fw / 2, glassTop - 2, fw, 2, whiteLo);
  rect(c, cx + fw / 2 - 14, glassTop - bandH + 2, 14, bandH - 4, '#d4d8dd');

  // the four rings, top one widest: flat discs ringing the drum, all above eye level, so we see
  // each from below. The front edge arches up in the middle and drops to the tips; the underside
  // shows as a grey crescent, a sliver across the front but deep at the sides, where the back
  // half of the ring comes round behind the drum. The higher the ring the more of its underside
  // shows. Drawn top down, since each lower ring hides the underside of the one above it.
  for (let i = 0; i < 4; i++) {
    const a = half * (1 - i * 0.035);
    const b = a * (0.07 - i * 0.011);
    const yc = ringY(i);
    for (let x = Math.round(cx - a); x <= Math.round(cx + a); x++) {
      const u = (x - cx) / a;
      const s = Math.sqrt(Math.max(0, 1 - u * u));
      const near = Math.round(yc - b * s);
      // past the drum the underside runs to the far rim; across the drum, to where it meets the drum
      const inDrum = Math.abs(x - cx) < rc;
      const v = (x - cx) / rc;
      const under = inDrum ? Math.round(yc - b * (rc / a) * Math.sqrt(Math.max(0, 1 - v * v))) : Math.round(yc + b * s);
      const lit = u < 0.5;
      // the underside, pale by the rim where light bounces up off the paving, darker in by the
      // drum, and darkest in the corner where the back of the ring tucks in behind it
      const tuck = inDrum ? 0 : Math.max(0, 1 - (Math.abs(x - cx) - rc) / 10);
      for (let y = near; y < under; y++) {
        const d = (y - near) / Math.max(1, under - near);
        rect(c, x, y, 1, 1, shade(lit ? '#c3c9d0' : '#b2b8c0', -0.22 * d - 0.16 * tuck));
      }
      // the back of the ring's rim, a thin bright line round the far side
      if (!inDrum) rect(c, x, under, 1, 1, lit ? '#e4e7ea' : '#cfd3d8');
      // the drum takes the ring's shadow just under it
      else rect(c, x, under, 1, 3, shade(core, -0.18 - 0.08 * v));
      // the front rim, white, with a highlight along its top edge and a soft fold under it
      const t = Math.max(2, Math.round(rim * Math.min(1, s * 4)));
      rect(c, x, near - t, 1, t, u > 0.55 ? '#e2e5e8' : white);
      rect(c, x, near - t, 1, 1, u > 0.7 ? white : whiteHi);
      rect(c, x, near - 1, 1, 1, '#d6dadf');
    }
  }
  // the bottom ring's shadow along the top of the band
  rect(c, cx - fw / 2, glassTop - bandH, fw, 1, '#9aa1aa');

  // the glass front between its end pillars: tall panes, reflections of the sky and trees
  const gx0 = cx - fw / 2 + 10;
  const gx1 = cx + fw / 2 - 10;
  // the inside, seen through the glass, so the front reads as a room and not a sheet: the ceiling
  // in shade, the far wall, rows of pews going back, the altar and its cross in the middle
  const ceil = glassTop + Math.round(glassH * 0.28);
  const floorY = glassTop + Math.round(glassH * 0.7);
  rect(c, gx0, glassTop, gx1 - gx0, ceil - glassTop, '#465468');
  for (let lx = gx0 + 8; lx < gx1 - 4; lx += 16) rect(c, lx, ceil - 3, 6, 1, '#7b8798');
  rect(c, gx0, ceil, gx1 - gx0, floorY - ceil, '#62708a');
  rect(c, gx0, ceil, gx1 - gx0, 1, '#56637a');
  rect(c, gx0, floorY, gx1 - gx0, glassTop + glassH - floorY, '#4e5b72');
  for (let k = 0; k < 4; k++) {
    const py = floorY + 2 + k * 3;
    for (const sd of [-1, 1]) {
      const p0 = sd < 0 ? gx0 + 6 : cx + 10;
      const p1 = sd < 0 ? cx - 10 : gx1 - 6;
      rect(c, p0 + (sd < 0 ? k * 2 : 0), py, p1 - p0 - k * 2, 2, '#3a4458');
    }
  }
  rect(c, cx - 10, floorY - 6, 21, 6, '#7c86a0');
  rect(c, cx - 10, floorY - 6, 21, 1, '#98a2ba');
  rect(c, cx - 1, ceil + 3, 3, floorY - ceil - 10, '#a8925a');
  rect(c, cx - 5, ceil + 7, 11, 2, '#a8925a');
  rect(g, cx - 6, ceil + 2, 13, floorY - ceil - 2, '#7a5a28');
  // the glass over it all: a cool tint, and streaks of sky reflected in it
  for (let x = gx0; x < gx1; x += 3) {
    const k = Math.sin(x * 0.07) + Math.sin(x * 0.023);
    if (k > 1.1) rect(c, x, glassTop + 2, 2, Math.round(glassH * 0.55), '#7f93ac');
  }
  for (let mx = gx0; mx <= gx1; mx += 24) rect(c, mx, glassTop, 1, glassH, '#dfe3e8');
  rect(c, gx0, glassTop + Math.round(glassH * 0.3), gx1 - gx0, 1, '#c9ced5');
  // at night the inside glows through the glass: pane by pane, so the mullions stay dark, dimmer up
  // under the ceiling and warmest low down where the lamps light the floor. The glow is added over
  // the scene, so these stay well short of white or the whole front burns out
  for (let mx = gx0; mx < gx1; mx += 24) {
    const pw = Math.min(24, gx1 - mx) - 1;
    for (let y = glassTop + 2; y < glassTop + glassH; y++) {
      const d = (y - glassTop) / glassH;
      rect(g, mx + 1, y, pw, 1, d < 0.3 ? '#4a3418' : d < 0.62 ? '#6a4c24' : '#8a6630');
    }
  }
  rect(g, gx0, glassTop + Math.round(glassH * 0.3), gx1 - gx0, 1, '#000000');
  // the end pillars, with their caps
  for (const px0 of [cx - fw / 2, cx + fw / 2 - 10]) {
    rect(c, px0, glassTop, 10, glassH, white);
    rect(c, px0 - 1, glassTop, 12, 3, whiteHi);
    rect(c, px0 - 1, glassTop + 3, 12, 1, whiteLo);
    rect(c, px0 + 8, glassTop + 4, 2, glassH - 4, whiteLo);
  }
  // the floor slab and the wide steps down to the paving
  rect(c, cx - fw / 2 - 2, floor, fw + 4, 2, '#d6d2c8');
  const sw0 = w * 0.42;
  for (let k = 0; k < 3; k++) {
    rect(c, cx - sw0 / 2 - k * 4, floor + 2 + k * 2, sw0 + k * 8, 2, k % 2 ? '#a88a6a' : '#b8987a');
  }

  // the gold cross on top
  rect(c, cx - 1, roofTop - 13, 3, 14, '#d8a838');
  rect(c, cx - 5, roofTop - 9, 11, 3, '#d8a838');
  rect(c, cx - 1, roofTop - 13, 1, 14, '#f2d06a');
  rect(c, cx - 5, roofTop - 9, 11, 1, '#f2d06a');

  // the papal flags either side, yellow and white
  for (const fx of [Math.round(cx - half * 0.98), Math.round(cx + half * 0.92)]) {
    rect(c, fx, glassTop - 34, 1, base - glassTop + 34, '#8a8d95');
    rect(c, fx + 1, glassTop - 33, 5, 18, '#e8c43a');
    rect(c, fx + 6, glassTop - 33, 5, 18, '#f6f4ee');
    rect(c, fx + 1, glassTop - 16, 10, 1, '#c8a42a');
  }
}

/**
 * What carries on behind the chapel, so it reads as a whole building and not
 * a front: a lower white body reaching back past the ends of the rings, its
 * roof edge dropping away as it goes, a row of tall narrow windows along it
 * (the side wall in `assets/CHAPEL/01_right-side-walk`), lit at night. Same
 * `cx`, `base` and `w` as `chapel()`; draw it first.
 */
export function chapelRear(c: Ctx, g: Ctx, cx: number, base: number, w: number): void {
  const glassTop = base - 8 - Math.round(w * 0.16);
  const bandTop = glassTop - Math.round(w * 0.07);
  for (const [x0, x1, s] of [[cx + w * 0.36, cx + w * 0.9, 1], [cx - w * 0.6, cx - w * 0.36, -1]] as const) {
    const near = s > 0 ? x0 : x1;
    const far = s > 0 ? x1 : x0;
    const span = Math.abs(far - near);
    for (let x = Math.round(Math.min(x0, x1)); x < Math.round(Math.max(x0, x1)); x++) {
      const t = Math.abs(x - near) / span;
      // the roof edge drops and the wall darkens as it goes back
      const top = Math.round(bandTop - 10 + t * 16);
      rect(c, x, top, 1, base - 4 - top, shade('#e9eaea', -0.06 - t * 0.14));
      rect(c, x, top, 1, 2, shade('#f6f6f4', -t * 0.12));
      rect(c, x, top + 2, 1, 1, shade('#b9bec6', -t * 0.1));
      rect(c, x, base - 6, 1, 2, '#b4b8bd');
    }
    // the tall windows in pairs, framed in cream, narrower and closer together as they go back;
    // dark glass catching a little sky by day, only some of them lit at night, and those dimly
    let wx = near + s * 12;
    let gap = 22;
    let k = 0;
    while (s > 0 ? wx < far - 6 : wx > far + 6) {
      const t = Math.abs(wx - near) / span;
      const top = Math.round(bandTop - 10 + t * 16) + 10;
      const bottom = base - 24;
      const ww = t > 0.55 ? 2 : 3;
      for (const dx of [0, ww + 2]) {
        const x = wx + s * dx;
        rect(c, x - 1, top - 1, ww + 2, bottom - top + 3, shade('#efe6cf', -t * 0.15));
        rect(c, x, top, ww, bottom - top, '#3e4450');
        rect(c, x, top + 2, 1, Math.round((bottom - top) * 0.4), '#6a7890');
        if (k % 3 !== 1) rect(g, x, top + Math.round((bottom - top) * 0.45), ww, Math.round((bottom - top) * 0.55), '#5a4226');
      }
      wx += s * gap;
      gap = Math.max(12, gap - 3);
      k++;
    }
  }
}

/** An orange traffic cone with its white band. */
export function trafficCone(c: Ctx, x: number, base: number): void {
  rect(c, x - 3, base - 1, 7, 1, '#3a3a40');
  for (let k = 0; k < 9; k++) {
    const hw = Math.round(3 - k * 0.3);
    rect(c, x - hw, base - 2 - k, hw * 2 + 1, 1, k === 4 || k === 5 ? '#f4f2ec' : k < 4 ? '#e86a2a' : '#f08a3a');
  }
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
