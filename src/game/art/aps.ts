// The Archbishop Pedro Santos Building, drawn from the photos in
// `assets/images/buildings/PANERGO AND GIL APS BUILDING/` and `assets/APS WALK FROM CHAPEL LAWN/`
// (the second set taken walking from the chapel lawn to the canteen, in order).
// The long wing is four white floors of open corridors. At the lawn end the
// bays of the two middle floors are closed off with tall white louvres; the
// rest of the wing is open corridor behind solid balcony walls. The top floor
// is open the whole way along, under a fascia of pale metal panels. The ground
// floor is set back behind white columns and a low planter wall, and at the
// canteen end, where the wing meets the tall block, a deep flat canopy on
// thick square pillars faced in tan stone runs out over the sidewalk. The
// tall block, the stair tower and the canteen block are in art/canteen.ts.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { ellipse, line, poly, px, rect, signCentered } from '../../engine/pix';
import { P, shade } from './palette';
import { foliage } from './props';

const GROUND_H = 38;
const FLOOR_H = 22;
const FASCIA_H = 12;
const BAY = 30;

const WHITE = '#f1f0eb';
const WHITE_HI = '#ffffff';
const WHITE_LO = '#cfceca';
const SHADE = '#6a6670';
const BACK = '#57535d';
const LOUVRE = '#e6e5e0';
const LOUVRE_LO = '#b3b2ae';
const PANEL = '#dfe1e2';
const PANEL_LO = '#b9bcbf';
const STONE = '#b39a74';
const STONE_HI = '#cdb48c';
const STONE_LO = '#8c7656';
const GLASS = '#5b6274';
const LIT = '#ffd98a';

/**
 * The back of an open corridor bay, in shade: a long band of classroom
 * windows in thin dark frames, a door now and then, and the track lights
 * along the corridor ceiling.
 */
function corridorBack(c: Ctx, g: Ctx, x: number, y: number, w: number, h: number, rand: () => number): boolean {
  rect(c, x, y, w, h, SHADE);
  // the slab above throws its shade a little way down the back wall
  rect(c, x, y, w, 2, shade(SHADE, -0.32));
  rect(c, x, y + 2, w, 2, shade(SHADE, -0.16));
  for (let lx = x + 4; lx < x + w - 2; lx += 8) rect(c, lx, y + 2, 2, 1, '#2a2730');
  const door = rand() < 0.3;
  const wx = door ? x + 10 : x + 2;
  if (door) rect(c, x + 3, y + 4, 5, h - 4, '#3a3540');
  rect(c, wx, y + 5, x + w - 2 - wx, 6, GLASS);
  for (let mx = wx; mx < x + w - 2; mx += 4) rect(c, mx, y + 5, 1, 6, '#2a2730');
  rect(c, wx, y + 5, x + w - 2 - wx, 1, '#2a2730');
  // the window sits back in the wall: a shaded reveal on the left, a pale sill under it
  rect(c, wx, y + 5, 1, 6, '#2a2730');
  rect(c, wx, y + 11, x + w - 2 - wx, 1, shade(SHADE, 0.22));
  // rooms in use at night, each lit a little differently
  if (rand() > 0.55) {
    const warm = [LIT, '#f0c878', '#d8b070', '#ffe4a8'][Math.floor(rand() * 4)];
    rect(g, wx, y + 5, x + w - 2 - wx, 6, warm);
    return true;
  }
  return false;
}

/** The balcony wall at the front of a corridor, with its thin rail above. */
function balcony(c: Ctx, x: number, y: number, w: number): void {
  rect(c, x, y, w, 9, WHITE);
  rect(c, x, y, w, 1, WHITE_HI);
  rect(c, x, y + 8, w, 1, WHITE_LO);
  rect(c, x, y - 4, w, 1, '#9a9aa0');
}

/** A bay closed with tall white louvres, two panels side by side. */
function louvres(c: Ctx, x: number, y: number, w: number, h: number): void {
  rect(c, x, y, w, h, LOUVRE_LO);
  for (let ly = y + 1; ly < y + h; ly += 2) rect(c, x, ly, w, 1, LOUVRE);
  const mid = x + Math.round(w / 2);
  rect(c, mid, y, 1, h, WHITE_LO);
  rect(c, x, y, 1, h, WHITE_LO);
  rect(c, x + w - 1, y, 1, h, WHITE_LO);
}

/**
 * The deep flat canopy over the main entrance, as seen from the road: a thick
 * white slab whose grey underside is streaked with rain stains, held up by
 * thick square pillars faced in stacked tan stone. Under it the open lobby
 * is in deep shade, the cashier's window and the doors only dim shapes at
 * the back; the lobby itself is its own scene (scenes/apslobby.ts).
 */
function canopy(c: Ctx, g: Ctx, cx: number, half: number, base: number, name?: string): void {
  const x0 = cx - half;
  const w = half * 2;
  const gy = base - GROUND_H;
  const shadeWall = '#8f897f';
  // the lobby, deep in the canopy's shade: darker at the top, a little light on the floor
  rect(c, x0 + 2, gy + 6, w - 4, GROUND_H - 6, shadeWall);
  rect(c, x0 + 2, gy + 6, w - 4, 8, shade(shadeWall, -0.35));
  rect(c, x0 + 2, gy + 14, w - 4, 3, shade(shadeWall, -0.18));
  rect(c, x0 + 2, base - 4, w - 4, 4, '#b4aea2');
  // strip lights under the slab, and dim shapes at the back: doors, the cashier's lit window
  for (let lx = x0 + 20; lx < x0 + w - 10; lx += 40) {
    rect(c, lx, gy + 7, 6, 1, '#f6f1e0');
    rect(g, lx - 1, gy + 7, 8, 2, '#fff0c8');
    // the light they throw down the back wall and onto the lobby floor, fading as it spreads
    rect(g, lx - 2, gy + 9, 10, 6, '#2a2014');
    rect(g, lx - 6, base - 4, 18, 4, '#3a2c18');
  }
  rect(c, x0 + 24, base - 24, 9, 20, '#4a3e3a');
  rect(c, cx - 50, base - 22, 18, 10, '#4c4c56');
  rect(g, cx - 50, base - 22, 18, 10, '#c89a5a');
  rect(c, cx + 34, base - 22, 6, 10, '#a9adb5');
  rect(g, cx + 35, base - 20, 4, 3, '#7fa8e0');
  // the main way in, lit from inside
  rect(c, cx - 14, base - 30, 28, 30, P.door);
  rect(c, cx - 12, base - 28, 11, 14, shade(GLASS, 0.2));
  rect(c, cx + 1, base - 28, 11, 14, shade(GLASS, 0.2));
  rect(c, cx, base - 30, 1, 30, '#2a2530');
  rect(g, cx - 14, base - 30, 28, 30, '#e0a85a');
  // the square pillars along the front, evenly spaced, leaving room for the doors in the middle
  const n = Math.max(2, Math.round(w / 48));
  const step = (w - 16) / n;
  for (let i = 0; i <= n; i++) {
    const p0 = Math.round(x0 + 2 + i * step);
    if (Math.abs(p0 + 7 - cx) < 20) continue;
    rect(c, p0, gy + 6, 14, GROUND_H - 6, STONE);
    rect(c, p0, gy + 6, 2, GROUND_H - 6, STONE_HI);
    rect(c, p0 + 12, gy + 6, 2, GROUND_H - 6, STONE_LO);
    rect(c, p0, gy + 6, 14, 4, shade(STONE, -0.3));
    // stacked stone: thin courses of offset blocks
    for (let sy = gy + 12, k = 0; sy < base - 1; sy += 3, k++) {
      rect(c, p0 + 1, sy, 12, 1, shade(STONE, -0.12));
      rect(c, p0 + (k % 2 ? 3 : 8), sy - 2, 1, 2, STONE_LO);
      if (k % 3 === 1) rect(c, p0 + 4, sy - 1, 5, 1, STONE_HI);
    }
  }
  // the slab: a thick white edge over a grey underside streaked by the rain
  rect(c, x0 - 8, gy - 8, w + 16, 9, WHITE);
  rect(c, x0 - 8, gy - 8, w + 16, 1, WHITE_HI);
  rect(c, x0 - 8, gy, w + 16, 1, WHITE_LO);
  rect(c, x0 - 8, gy + 1, w + 16, 4, '#b8bcc2');
  for (let sx = x0 - 8; sx < x0 + w + 8; sx++) {
    const d = Math.round(1.5 + Math.sin(sx * 0.21) + Math.sin(sx * 0.07));
    if (d > 0) rect(c, sx, gy + 1, 1, d, '#a3a7ae');
  }
  rect(c, x0 - 6, gy + 5, w + 12, 1, '#2f2b33');
  if (name) signCentered(c, name, cx, gy - 6, P.maroon);
}

/**
 * The patio's paving: red clay bricks laid in a herringbone, uneven in colour,
 * with moss growing green in the joints.
 */
export function herringbone(c: Ctx, x0: number, x1: number, y: number, h: number, seed: number): void {
  const rand = rng(seed);
  const tones = ['#a8573f', '#b2614a', '#9c4f39', '#ad5c43', '#a05440'];
  const mortar = '#7a4232';
  for (let yy = 0; yy < h; yy++) {
    for (let x = x0; x < x1; x++) {
      // bricks two by four, alternately along and across, stepping one row each time
      const u = x + yy * 2;
      const cell = Math.floor(u / 4);
      const along = (cell + Math.floor(yy / 2)) % 2 === 0;
      const joint = along ? u % 4 === 0 : yy % 2 === 0;
      if (joint) {
        px(c, x, y + yy, rand() > 0.86 ? '#5f7a3a' : mortar);
      } else {
        const t = tones[(cell * 7 + Math.floor(yy / 2) * 3) % tones.length];
        px(c, x, y + yy, yy === 0 ? shade(t, 0.18) : t);
      }
    }
  }
  rect(c, x0, y + h - 1, x1 - x0, 1, shade(mortar, -0.2));
}

/** A soft shadow on the ground, an ellipse a little darker than whatever it falls on. */
export function groundShadow(c: Ctx, cx: number, cy: number, rx: number, ry: number): void {
  ellipse(c, cx, cy, rx, ry, 'rgba(40, 24, 30, 0.22)');
  ellipse(c, cx, cy, rx * 0.65, ry * 0.6, 'rgba(40, 24, 30, 0.14)');
}

/** The bronze bust on its tall black pedestal, where the canopy meets the tall block. */
export function bust(c: Ctx, x: number, base: number): void {
  rect(c, x - 5, base - 26, 11, 26, '#26242a');
  rect(c, x - 5, base - 26, 2, 26, '#3a3740');
  rect(c, x - 6, base - 27, 13, 2, '#3a3740');
  rect(c, x - 3, base - 16, 7, 5, '#4a4650');
  // the bust: shoulders, then the head
  rect(c, x - 5, base - 33, 11, 6, P.bronze);
  rect(c, x - 5, base - 33, 11, 1, P.bronzeHi);
  rect(c, x - 2, base - 41, 5, 8, P.bronze);
  rect(c, x - 2, base - 41, 2, 6, P.bronzeHi);
  rect(c, x - 2, base - 42, 5, 1, P.bronzeDark);
}

/** A young ficus clipped round, in a big terracotta pot, with a little sign stuck in the soil. */
export function pottedTree(c: Ctx, x: number, base: number, seed: number): void {
  rect(c, x, base - 30, 1, 22, '#6a5038');
  foliage(c, x, base - 36, 11, 9, seed);
  rect(c, x - 9, base - 9, 19, 2, P.terracottaHi);
  rect(c, x - 8, base - 7, 17, 7, P.terracotta);
  rect(c, x - 8, base - 7, 3, 7, P.terracottaDark);
  rect(c, x + 6, base - 17, 5, 7, '#efe6c8');
  rect(c, x + 8, base - 10, 1, 2, '#6a5038');
}

/** The mesh cage the empty plastic bottles are collected in, more than half full. */
export function bottleCage(c: Ctx, x: number, base: number, w: number): void {
  const rand = rng(x);
  rect(c, x, base - 18, w, 18, '#5a5e66');
  for (let bx = x + 1; bx < x + w - 2; bx += 3) {
    const fill = 10 + Math.round(rand() * 5);
    for (let by = base - fill; by < base - 1; by += 3) {
      const col = ['#a8d8ee', '#7cc08a', '#d8eef6', '#5f9fd8', '#e8f4f8'][Math.floor(rand() * 5)];
      rect(c, bx, by, 3, 2, col);
      px(c, bx, by, '#ffffff');
    }
  }
  // the galvanised frame and a light mesh over the bottles
  const steel = '#c0c4cb';
  for (let mx = x; mx < x + w; mx += 4) rect(c, mx, base - 18, 1, 18, 'rgba(200, 205, 212, 0.55)');
  for (let my = base - 16; my < base; my += 4) rect(c, x, my, w, 1, 'rgba(200, 205, 212, 0.45)');
  rect(c, x, base - 19, w, 2, steel);
  rect(c, x, base - 19, w, 1, '#e4e7ec');
  rect(c, x, base - 19, 1, 19, steel);
  rect(c, x + w - 1, base - 19, 1, 19, '#8a8d95');
  rect(c, x, base - 1, w, 1, '#8a8d95');
}

/** A plain way in through the planter wall: a gap, a step and a lit doorway. */
function sideEntrance(c: Ctx, g: Ctx, cx: number, base: number): void {
  rect(c, cx - 12, base - 12, 24, 12, '#3f3a42');
  rect(c, cx - 9, base - 28, 18, 28, P.door);
  rect(c, cx - 8, base - 27, 7, 12, shade(GLASS, 0.2));
  rect(c, cx + 1, base - 27, 7, 12, shade(GLASS, 0.2));
  rect(c, cx, base - 28, 1, 28, '#2a2530');
  rect(g, cx - 9, base - 28, 18, 28, '#e0a85a');
  rect(c, cx - 14, base - 2, 28, 2, P.stepHi);
}

export interface ApsOptions {
  /** where the ways in go, as x offsets from the left edge */
  doors?: number[];
  /** which of `doors` is the main entrance under the canopy */
  main?: number;
  /** lettering on the canopy */
  name?: string;
  /** half the width of the canopy over the main entrance */
  canopyHalf?: number;
  /** how many bays at the left-hand (chapel lawn) end have louvres on the middle floors */
  louvreBays?: number;
  seed?: number;
}

/**
 * Draws APS with its left edge at `x`, `w` wide, standing on `base`. Lit
 * windows go on `g` for the night glow. Returns the y of its top.
 */
export function drawAPS(c: Ctx, g: Ctx, x: number, w: number, base: number, o: ApsOptions = {}): number {
  const rand = rng(o.seed ?? 613);
  const gy = base - GROUND_H;
  const top = gy - 3 * FLOOR_H - FASCIA_H;
  const bays = Math.ceil(w / BAY);
  const louvred = (k: number): boolean => k < (o.louvreBays ?? 0);

  // floors two to four
  for (let i = 0; i < 3; i++) {
    const y = gy - (i + 1) * FLOOR_H;
    for (let k = 0; k < bays; k++) {
      const bx = x + k * BAY;
      const bw = Math.min(BAY, x + w - bx);
      if (bw <= 4) continue;
      if (i < 2 && louvred(k)) {
        louvres(c, bx + 3, y + 3, bw - 3, FLOOR_H - 3);
      } else {
        const lit = corridorBack(c, g, bx + 3, y + 3, bw - 3, FLOOR_H - 3, rand);
        balcony(c, bx + 3, y + FLOOR_H - 9, bw - 3);
        // a lit room spills a little warm light onto the top of the balcony wall in front of it
        if (lit) rect(g, bx + 3, y + FLOOR_H - 9, bw - 3, 2, '#3c2c18');
      }
    }
    // the slab edge under each floor, catching a cool edge of moonlight at night
    rect(c, x, y + FLOOR_H - 1, w, 3, WHITE);
    rect(c, x, y + FLOOR_H + 1, w, 1, WHITE_LO);
    rect(g, x, y + FLOOR_H - 1, w, 1, '#1a2034');
  }

  // columns running up between the bays, with a downpipe on some of them
  for (let k = 0; k <= bays; k++) {
    const cx = Math.min(x + k * BAY, x + w - 3);
    rect(c, cx, top + FASCIA_H, 3, gy - top - FASCIA_H, WHITE);
    rect(c, cx + 2, top + FASCIA_H, 1, gy - top - FASCIA_H, WHITE_LO);
    // each column shades the strip of corridor just to its right
    rect(c, cx + 3, top + FASCIA_H, 2, gy - top - FASCIA_H, 'rgba(30, 26, 40, 0.18)');
    rect(g, cx, top + FASCIA_H, 1, gy - top - FASCIA_H, '#10162a');
    if (k % 5 === 2) rect(c, cx + 3, top + FASCIA_H, 1, gy - top - FASCIA_H + 2, '#a9a9ae');
  }

  // the fascia along the roof: pale metal panels in a grid
  rect(c, x - 2, top, w + 4, FASCIA_H, PANEL);
  rect(c, x - 2, top, w + 4, 1, WHITE_HI);
  rect(c, x - 2, top + 6, w + 4, 1, PANEL_LO);
  rect(c, x - 2, top + FASCIA_H - 1, w + 4, 1, shade(PANEL_LO, -0.2));
  for (let px0 = x + 10; px0 < x + w; px0 += 15) rect(c, px0, top + 1, 1, FASCIA_H - 2, PANEL_LO);
  // rain streaks down the panels, and the deep shadow the fascia throws on the floor below
  for (let i = 0; i < w / 6; i++) rect(c, x + Math.floor(rand() * w), top + 2, 1, 2 + Math.floor(rand() * 7), shade(PANEL, -0.07));
  rect(c, x, top + FASCIA_H, w, 2, 'rgba(30, 26, 40, 0.3)');
  rect(g, x - 2, top, w + 4, 1, '#2a3452');

  // ground floor: set back in shade behind the columns and a low planter wall
  rect(c, x, gy + 2, w, GROUND_H - 2, BACK);
  rect(c, x, gy + 2, w, 3, shade(BACK, -0.3));
  for (let wx = x + 6; wx < x + w - 20; wx += BAY) {
    rect(c, wx + 2, gy + 9, BAY - 10, 9, GLASS);
    rect(c, wx + 2, gy + 9, BAY - 10, 1, shade(GLASS, 0.3));
    if (rand() > 0.6) rect(g, wx + 2, gy + 9, BAY - 10, 9, LIT);
  }
  for (let k = 0; k <= bays; k++) {
    const cx = Math.min(x + k * BAY, x + w - 4);
    rect(c, cx, gy + 2, 4, GROUND_H - 2, WHITE);
    rect(c, cx + 3, gy + 2, 1, GROUND_H - 2, WHITE_LO);
  }
  // the ground-floor corridor is raised: a solid white parapet with a pipe rail on top
  rect(c, x, base - 12, w, 12, WHITE);
  rect(c, x, base - 12, w, 1, WHITE_HI);
  rect(c, x, base - 2, w, 2, WHITE_LO);
  rect(c, x, base - 17, w, 1, '#9a9aa0');
  rect(c, x, base - 15, w, 1, '#b4b4b9');
  for (let rx = x + 6; rx < x + w; rx += 15) rect(c, rx, base - 17, 1, 5, '#9a9aa0');

  // where the building meets the pavement, a soft contact shadow
  rect(c, x, base, w, 1, 'rgba(25, 22, 35, 0.35)');
  rect(c, x, base + 1, w, 2, 'rgba(25, 22, 35, 0.15)');
  // shaded return on the right so the block reads as solid
  rect(c, x + w - 4, top, 4, base - top, WHITE_LO);
  rect(c, x + w - 4, top, 1, base - top, shade(WHITE_LO, -0.12));

  const doors = o.doors ?? [];
  doors.forEach((dx, i) => {
    if (i === o.main) canopy(c, g, x + dx, o.canopyHalf ?? 74, base, o.name);
    else sideEntrance(c, g, x + dx, base);
  });
  return top;
}

/**
 * The back corner of PGN, as you pass it coming from the chapel lawn (photos
 * 01, 02 and 06 of the walk): the ground floor painted dark slate blue behind
 * a steel rail, with a row of small windows high up and a framed poster;
 * a white soffit with strip lights over it; then white floors, each a deep
 * slab over a band of tall white louvres, running off the top of the screen.
 */
export function pgnBack(c: Ctx, g: Ctx, x: number, w: number, base: number): void {
  const gh = 38;
  const gy = base - gh;
  const slate = '#4f5868';
  // upper floors, off the top of the screen
  for (let y = gy - 4; y > -24; y -= 22) {
    rect(c, x, y - 14, w, 14, '#5d6170');
    for (let lx = x + 3; lx < x + w - 2; lx += 7) {
      rect(c, lx, y - 13, 4, 12, LOUVRE);
      for (let ly = y - 12; ly < y - 1; ly += 2) rect(c, lx, ly, 4, 1, LOUVRE_LO);
    }
    rect(c, x, y - 22, w, 8, WHITE);
    rect(c, x, y - 22, w, 1, WHITE_HI);
    rect(c, x, y - 15, w, 1, WHITE_LO);
  }
  // the soffit over the ground floor, with its strip lights
  rect(c, x, gy - 4, w, 4, '#e6e6e2');
  for (let lx = x + 6; lx < x + w - 8; lx += 22) rect(c, lx, gy - 2, 8, 1, '#fdfbf0');
  // the slate ground floor: small windows high up, a framed poster, the rail in front
  rect(c, x, gy, w, gh, slate);
  rect(c, x, gy, w, 2, shade(slate, -0.3));
  for (let wx = x + 4; wx < x + w - 10; wx += 12) {
    rect(c, wx, gy + 5, 10, 5, '#1f2430');
    rect(c, wx, gy + 5, 10, 1, '#8a93a3');
    rect(g, wx, gy + 5, 10, 5, LIT);
  }
  rect(c, x + 6, gy + 14, 14, 11, '#2a2a30');
  rect(c, x + 7, gy + 15, 12, 9, '#c9b08a');
  rect(c, x + 8, gy + 17, 4, 5, '#4f9a9a');
  rect(c, x + 13, gy + 17, 4, 5, '#f4f2ec');
  rect(c, x, base - 14, w, 1, '#b4b4b9');
  rect(c, x, base - 9, w, 1, '#9a9aa0');
  for (let rx = x + 4; rx < x + w; rx += 14) rect(c, rx, base - 14, 1, 14, '#9a9aa0');
  rect(c, x, base - 3, w, 3, '#8f8a80');
  rect(c, x + w - 3, gy - 4, 3, gh + 4, shade(slate, -0.25));
}

/** The old bronze lamp post with two lanterns hanging from curled arms, its paint gone rusty brown. Returns where the lanterns hang. */
export function twinLantern(c: Ctx, g: Ctx, x: number, base: number): [number, number][] {
  const post = '#7a5236';
  const hi = '#a8754e';
  const dark = '#4f3424';
  rect(c, x - 3, base - 5, 7, 5, dark);
  rect(c, x - 2, base - 8, 5, 3, post);
  rect(c, x - 1, base - 70, 3, 62, post);
  rect(c, x - 1, base - 70, 1, 62, hi);
  rect(c, x - 2, base - 40, 5, 2, dark);
  rect(c, x - 2, base - 74, 5, 4, post);
  px(c, x, base - 76, hi);
  const heads: [number, number][] = [];
  for (const s of [-1, 1]) {
    // the arm curls up and over, and the lantern hangs from its end
    const lx = x + s * 11;
    rect(c, s < 0 ? lx : x + 2, base - 66, 9, 1, post);
    rect(c, x + s * 4, base - 69, 1, 3, post);
    rect(c, s < 0 ? x - 7 : x + 3, base - 70, 5, 1, post);
    px(c, x + s * 8, base - 69, post);
    rect(c, lx, base - 65, 1, 2, dark);
    rect(c, lx - 3, base - 63, 7, 2, dark);
    rect(c, lx - 2, base - 61, 5, 7, '#f2d79a');
    rect(c, lx - 2, base - 61, 1, 7, post);
    rect(c, lx + 2, base - 61, 1, 7, post);
    rect(c, lx - 1, base - 54, 3, 2, dark);
    rect(g, lx - 2, base - 61, 5, 7, P.lamp);
    heads.push([lx, base - 58]);
  }
  return heads;
}

/**
 * One of the square cafe umbrellas on the canteen patio, faded terracotta with
 * white piping round its flaps (a few are crimson), over a round wooden table
 * on black legs and wooden chairs with black frames. Casts its own shadow.
 */
export function cafeUmbrella(c: Ctx, x: number, base: number, red = '#a5503f'): void {
  groundShadow(c, x + 2, base + 1, 22, 3);
  // the pole and its little finial
  rect(c, x, base - 38, 1, 38, '#3a2f2a');
  rect(c, x - 1, base - 43, 3, 2, shade(red, -0.2));
  // the canopy, a shallow pyramid: the sunlit side to the left, the far side in shade
  const top = base - 41;
  const eave = base - 31;
  for (let yy = top; yy < eave; yy++) {
    const half = Math.round(3 + ((yy - top) / (eave - top)) * 17);
    rect(c, x - half, yy, half, 1, shade(red, 0.12));
    rect(c, x, yy, half + 1, 1, shade(red, -0.08));
  }
  for (let yy = top + 2; yy < eave; yy += 3) px(c, x - Math.round(3 + ((yy - top) / (eave - top)) * 17), yy, shade(red, 0.25));
  rect(c, x - 1, top, 3, eave - top, shade(red, -0.18));
  // the flaps round the edge, scalloped, with the white piping along them
  rect(c, x - 20, eave, 41, 3, shade(red, -0.12));
  for (let sx = x - 20; sx < x + 21; sx += 5) rect(c, sx + 1, eave + 3, 3, 1, shade(red, -0.12));
  rect(c, x - 20, eave, 41, 1, '#efe8dc');
  for (let sx = x - 20; sx < x + 21; sx += 5) px(c, sx + 2, eave + 4, '#efe8dc');
  rect(c, x - 20, eave + 1, 41, 1, shade(red, -0.32));
  // the round table, a thick wooden top seen nearly edge on
  rect(c, x - 9, base - 12, 19, 3, '#8a5a3a');
  rect(c, x - 9, base - 12, 19, 1, '#b8845a');
  rect(c, x - 8, base - 9, 17, 1, '#5e3c28');
  rect(c, x - 4, base - 9, 1, 9, '#26242a');
  rect(c, x + 4, base - 9, 1, 9, '#26242a');
  rect(c, x - 6, base - 1, 13, 1, '#26242a');
  // two chairs either side: slatted orange-brown wood on black frames, backs to the outside
  for (const s of [-1, 1]) {
    const cx = x + s * 15;
    const back = cx + s * 3;
    rect(c, back, base - 14, 1, 14, '#26242a');
    for (let sy = base - 13; sy < base - 7; sy += 2) rect(c, Math.min(back, back - s * 1), sy, 2, 1, '#c8783f');
    rect(c, cx - 3, base - 7, 7, 2, '#c8783f');
    rect(c, cx - 3, base - 7, 7, 1, '#e09858');
    rect(c, cx - s * 3, base - 5, 1, 5, '#26242a');
  }
}

/** Bamboo leaves: a light, yellowish green, much brighter than the trees around them. */
const BAMBOO = { deep: '#3f5a24', dark: '#587a2c', mid: '#76983a', lit: '#97b848', hi: '#bad660' };

/**
 * A clump of bamboo as it grows along the APS road: a dense fan of thin
 * green-gold canes with dark nodes, bare near the ground, under a tall cloud
 * of narrow drooping leaves that spills out wider than the canes. The leaves
 * are drawn as hundreds of short slanted strokes, darkest at the back and on
 * the shaded right, so the clump reads as feathery rather than as blobs.
 */
export function bamboo(c: Ctx, x: number, base: number, w: number, h: number, seed: number): void {
  const rand = rng(seed);
  const mid = x + w / 2;
  // the canes, fanning out from a tight base
  const canes: [number, number, number][] = [];
  for (let i = 0; i < w * 0.8; i++) {
    const bx = Math.round(mid + (rand() - 0.5) * w * 0.55);
    const ch = Math.round(h * (0.7 + rand() * 0.3));
    const lean = Math.round((bx - mid) * 0.9 + (rand() - 0.5) * 6);
    canes.push([bx, ch, lean]);
    const col = rand() > 0.45 ? '#a8a44c' : '#7a8434';
    line(c, bx, base, bx + lean, base - ch, col, 1);
    for (let ny = 5 + Math.round(rand() * 4); ny < ch * 0.55; ny += 8) px(c, bx + Math.round((lean * ny) / ch), base - ny, '#4f5a26');
  }
  // the leaves, back to front: each spray is a few short strokes hanging off a point
  const sprays = Math.round(w * h * 0.05);
  for (let pass = 0; pass < 3; pass++) {
    const tones = [BAMBOO.deep, BAMBOO.dark, BAMBOO.mid][pass];
    for (let i = 0; i < sprays / 3; i++) {
      const t = 0.32 + Math.pow(rand(), 0.8) * 0.68;
      const halfW = w * (0.35 + t * 0.55);
      const sx = mid + (rand() - 0.5) * 2 * halfW * Math.sqrt(1 - Math.pow((t - 0.7) / 0.45, 2) * 0.6);
      const sy = base - h * t + (rand() - 0.5) * 6;
      const leaves = 3 + Math.floor(rand() * 3);
      for (let k = 0; k < leaves; k++) {
        const dir = rand() > 0.5 ? 1 : -1;
        const len = 3 + Math.floor(rand() * 3);
        const right = sx > mid + halfW * 0.3;
        const col = pass === 2 && !right && rand() > 0.55 ? BAMBOO.lit : tones;
        line(c, sx, sy + k, sx + dir * len, sy + k + Math.ceil(len * 0.6), col, 1);
      }
    }
  }
  // sun catching the tips on the lit side
  for (let i = 0; i < w * 1.2; i++) {
    const t = 0.45 + rand() * 0.5;
    const hx = mid - rand() * w * (0.3 + t * 0.4);
    px(c, hx, base - h * t, rand() > 0.5 ? BAMBOO.hi : BAMBOO.lit);
  }
}

/**
 * The tall modern street light on the corner by the chapel lawn: a plain grey
 * pole, a long arm leaning out over the road, a flat LED head. Returns where
 * its light comes from.
 */
export function streetLight(c: Ctx, g: Ctx, x: number, base: number, h = 96, dir: 1 | -1 = 1): [number, number] {
  rect(c, x - 2, base - 4, 5, 4, '#8a8d95');
  rect(c, x - 1, base - h, 3, h - 4, '#b9bcc2');
  rect(c, x - 1, base - h, 1, h - 4, '#dfe2e6');
  rect(c, x + 1, base - h, 1, h - 4, '#8a8d95');
  // the arm, rising a little as it reaches out
  for (let k = 0; k < 16; k++) px(c, x + dir * k, base - h - Math.floor(k / 3), '#b9bcc2');
  const hx = x + dir * 16;
  const hy = base - h - 6;
  rect(c, Math.min(hx, hx + dir * 9), hy - 1, 10, 3, '#5a5e66');
  rect(c, Math.min(hx, hx + dir * 9), hy + 2, 10, 1, '#e8f0ff');
  rect(g, Math.min(hx, hx + dir * 9), hy + 2, 10, 2, '#f0f6ff');
  return [hx + dir * 4, hy + 3];
}

/** A low fence of pipe rails gone rusty, on posts, along the parking and round the corner island. */
export function rustyFence(c: Ctx, x0: number, x1: number, base: number, h = 12): void {
  const rust = '#7a4a32';
  const hi = '#a06a48';
  for (let px0 = x0; px0 <= x1; px0 += 12) {
    rect(c, px0, base - h, 1, h, rust);
    px(c, px0, base - h, hi);
  }
  for (const ry of [base - h, base - Math.round(h * 0.55), base - 3]) {
    rect(c, x0, ry, x1 - x0 + 1, 1, rust);
    for (let rx = x0; rx < x1; rx += 7) if ((rx * 7 + ry) % 3 === 0) px(c, rx, ry, hi);
  }
}

/** The cream NO PARKING board on its A-frame stand at the mouth of the chapel parking. */
export function noParkingStand(c: Ctx, x: number, base: number): void {
  const frame = '#c9b98a';
  line(c, x - 6, base, x - 3, base - 12, frame, 1);
  line(c, x + 6, base, x + 3, base - 12, frame, 1);
  rect(c, x - 6, base, 4, 1, frame);
  rect(c, x + 3, base, 4, 1, frame);
  rect(c, x - 6, base - 30, 13, 19, '#f2ead0');
  rect(c, x - 6, base - 30, 13, 1, '#fffbe8');
  rect(c, x - 6, base - 12, 13, 1, frame);
  // the sign: a P in a red ring with the slash through it, two lines of lettering under it
  ellipse(c, x, base - 25, 3.5, 3.5, '#c8342f');
  ellipse(c, x, base - 25, 2.2, 2.2, '#f2ead0');
  rect(c, x - 1, base - 27, 1, 4, '#26242a');
  rect(c, x, base - 27, 1, 1, '#26242a');
  rect(c, x, base - 26, 1, 1, '#26242a');
  line(c, x - 2, base - 27, x + 2, base - 23, '#c8342f', 1);
  rect(c, x - 3, base - 19, 7, 1, '#26242a');
  rect(c, x - 4, base - 16, 9, 1, '#26242a');
}

/** A building site wrapped in green net, behind a mesh fence on yellow posts. */
export function siteFence(c: Ctx, x: number, base: number, w: number, h: number): void {
  const net = '#2f8f5c';
  rect(c, x, base - h * 2, w, h, shade(net, -0.12));
  for (let nx = x + 2; nx < x + w; nx += 3) rect(c, nx, base - h * 2, 1, h, shade(net, -0.22));
  rect(c, x, base - h, w, h, net);
  for (let ny = base - h + 2; ny < base; ny += 3) rect(c, x, ny, w, 1, shade(net, -0.18));
  for (let nx = x + 1; nx < x + w; nx += 3) rect(c, nx, base - h, 1, h, shade(net, 0.12));
  const yellow = '#e0b52a';
  rect(c, x, base - h, w, 2, yellow);
  rect(c, x, base - 2, w, 2, shade(yellow, -0.2));
  for (let px0 = x; px0 < x + w; px0 += 24) rect(c, px0, base - h, 2, h, yellow);
  rect(c, x + w - 2, base - h, 2, h, yellow);
}

/** One of the green picnic sheds under the trees across from APS: a tin roof on steel posts over a table and benches. */
export function picnicShed(c: Ctx, x: number, base: number, w = 56): void {
  const steel = '#2f6e45';
  const roof = '#3c8a58';
  // table and benches, all painted the same green
  rect(c, x + 8, base - 12, w - 16, 2, shade(steel, 0.15));
  rect(c, x + 12, base - 10, 1, 10, steel);
  rect(c, x + w - 13, base - 10, 1, 10, steel);
  rect(c, x + 3, base - 6, w - 6, 2, steel);
  rect(c, x + 6, base - 4, 1, 4, steel);
  rect(c, x + w - 7, base - 4, 1, 4, steel);
  for (const px0 of [x, x + Math.round(w / 2) - 1, x + w - 2]) rect(c, px0, base - 30, 2, 30, steel);
  // the roof, corrugated, sloping back from the eave
  poly(c, [[x - 6, base - 30], [x + w + 6, base - 30], [x + w - 2, base - 41], [x + 2, base - 41]], roof);
  for (let rx = x - 3; rx < x + w + 4; rx += 4) line(c, rx, base - 31, rx + (rx < x + w / 2 ? 3 : -3), base - 40, shade(roof, -0.2), 1);
  rect(c, x + 2, base - 41, w - 4, 1, shade(roof, 0.25));
  rect(c, x - 6, base - 31, w + 12, 2, shade(roof, -0.35));
}

/**
 * The grass under the trees across from APS: green, darker in the shade of
 * the canopy, worn down to bare earth only where people sit at the sheds.
 * The worn patches fade into the grass pixel by pixel rather than stopping
 * at a hard edge, and the whole strip feathers out into the open lawn.
 */
export function shadyGround(c: Ctx, x0: number, x1: number, top: number, bottom: number, worn: number[], seed: number): void {
  const rand = rng(seed);
  const h = bottom - top;
  const grass = P.grass;
  const shadeG = shade(P.grass, -0.18);
  const dirt = '#a99a6c';
  rect(c, x0, top, x1 - x0, h, grass);
  rect(c, x0, top, x1 - x0, 2, P.grassHi);
  // dappled shade under the crowns
  for (let i = 0; i < (x1 - x0) / 9; i++) {
    const sx = x0 + rand() * (x1 - x0);
    const sy = top + 3 + rand() * (h - 4);
    for (let k = 0; k < 14; k++) px(c, sx + (rand() - 0.5) * 16, sy + (rand() - 0.5) * 5, shadeG);
  }
  // the worn earth under each shed, dithered out into the grass
  for (const wx of worn) {
    const rx = 34;
    for (let y = top + 3; y < bottom; y++) {
      for (let x = wx - rx - 8; x < wx + rx + 8; x++) {
        const d = Math.abs(x - wx) / rx + Math.abs(y - (top + h * 0.6)) / (h * 0.9);
        if (d < 0.75 || (d < 1.15 && rand() > (d - 0.75) / 0.4)) px(c, x, y, rand() > 0.85 ? shade(dirt, 0.12) : dirt);
      }
    }
  }
  // tufts and blades over everything, lighter where the sun gets through
  for (let i = 0; i < (x1 - x0) * h * 0.06; i++) {
    const x = x0 + rand() * (x1 - x0);
    const y = top + 2 + rand() * (h - 2);
    rect(c, x, y, 1, 2, rand() > 0.6 ? P.grassHi : P.grassDark);
  }
  // feather the far end into the open lawn instead of a straight seam
  for (let y = top; y < bottom; y++) {
    for (let x = x1; x < x1 + 14; x++) if (rand() > (x - x1) / 14) px(c, x, y, rand() > 0.5 ? grass : shadeG);
  }
}
