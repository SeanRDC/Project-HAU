// The side gate entryway: the round flag plaza at the end of the walk in from
// the side gate, looking south, back down the walkway to the gate, as in
// `assets/images/sidegate entryway/closer view.jpg`. The art is in art/entry.ts.
//
// You come out of the gate at the far end of the walkway and up it towards
// the camera. The plaza is a step up from everything round it, and three
// flights of steps go down from it: on the left to the drive in front of the
// Main Building, in the middle (towards the camera) to the parking lane and
// St. Therese, on the right to the SFJ fountain and the Epiphany of Angels.
// Holy Rosary Parish rises over the avenue beyond the gate.

import { Ctx, VIEW_H, VIEW_W, makeCanvas } from '../../engine/display';
import { hex, rng } from '../../engine/math';
import { disc, line, poly, px, rect } from '../../engine/pix';
import {
  FLAT, RingPart, STAR_R, Walkway, coveredWalk, diamondWalk, evacuationSign, lausDeoGate, pathLight,
  philippineFlag, ringParts, rowOf, scaleAt, sideX, starPlaza, tiedPalm, walkBench,
} from '../art/entry';
import { P, shade } from '../art/palette';
import { RED_TIP } from '../art/park';
import { SILHOUETTE, Tones, bush, foliage, hedge, lampPost, tree } from '../art/props';
import { car } from '../art/street';
import { PLACES } from '../campus/plan';
import { STREETS, streetWidth, xOf } from '../campus/streets';
import { arrive, entryHotspots, entryNpcs, Walk } from '../story/entry';
import { AreaDef, AreaLight, Layer } from '../types';
import { ambience, frontPlants, layerWidth } from './kit';

const S = STREETS.entry;
const WIDTH = streetWidth(S);
/** the middle of the plaza, the flagpole and the walkway, which all line up */
const CX = xOf(S, PLACES.flagCircle);
const WALK = 242;
/** the middle of the plaza, a little behind where you walk */
const CY = 231;
/** the far edge of the plaza, where the walkway starts */
const EDGE = CY - Math.round(STAR_R * FLAT);
/** the row the gate and the fence along the avenue stand on */
const FENCE = 176;
/** the walkway, from the gate at the far end to the edge of the plaza */
/**
 * The walkway and the gate line up with the flagpole, but the camera stands a
 * little to the left of that line, as in the photo, so the pole falls between
 * DEO and SEMPER on the gate instead of across a letter.
 */
const AXIS = CX + 6;
const WAY: Walkway = { cx: AXIS, far: FENCE, near: EDGE + 1, farHalf: 22, nearHalf: 34, halfM: 2, lengthM: 25 };
/** the plaza's paving reaches this far either side of the middle; the side steps go down from there */
const PLAT = 118;
const STEP_W = 10;
const STEP_H = 4;
const STEPS = 3;
const LEFT_TOP = CX - PLAT;
const RIGHT_TOP = CX + PLAT;
const LEFT_FOOT = LEFT_TOP - STEP_W * STEPS;
const RIGHT_FOOT = RIGHT_TOP + STEP_W * STEPS;
/** the band of depth the side steps take up, either side of where you walk */
const FLIGHT: [number, number] = [226, 254];
/** where you stand to go down the walkway, and the far end you walk to: the right-hand side of it, round the chained posts */
const STAND = CX + 56;
const FAR_X = AXIS + 10;
const RISE = WALK - FENCE;

const FAR = 0.16;
const MID = 0.45;

/** How big something standing on row `y` is drawn, against someone on the walk line. */
const sc = (y: number) => scaleAt(WAY, y, WALK);

/** Holy Rosary Parish across the avenue: a stone front with a round window, a dome, two bell towers with white spires. */
function farLayer(): Layer {
  const [canvas, c] = makeCanvas(layerWidth(WIDTH, FAR), VIEW_H);
  const rand = rng(1877);
  const stone = '#a29d98';
  const lit = '#bbb6ae';
  const dark = '#827d7a';
  const deep = '#4a4652';
  const base = FENCE + 4;
  // placed by where it shows with the camera on the flagpole: `dx` from the middle of the screen
  const at = (dx: number) => Math.round(VIEW_W / 2 + dx + FAR * (CX - VIEW_W / 2));

  // the city behind it
  for (let x = -10; x < canvas.width; x += 22 + rand() * 30) {
    const h = 18 + rand() * 30;
    const w = 22 + rand() * 24;
    rect(c, x, base - h, w, h, rand() > 0.5 ? '#c2b6a4' : '#aeaab0');
    poly(c, [[x - 2, base - h], [x + w + 2, base - h], [x + w / 2, base - h - 7]], rand() > 0.5 ? '#a86a58' : '#8a8e98');
  }

  // the dome, behind and to the left
  const dx = at(-118);
  rect(c, dx - 13, base - 92, 26, 92, stone);
  rect(c, dx - 13, base - 92, 5, 92, lit);
  for (let x = dx - 10; x < dx + 10; x += 6) rect(c, x, base - 86, 2, 8, deep);
  disc(c, dx, base - 94, 15, '#b9c4cf');
  disc(c, dx - 4, base - 98, 9, '#d5dde4');
  rect(c, dx - 15, base - 94, 31, 3, stone);
  rect(c, dx - 2, base - 116, 5, 8, lit);
  rect(c, dx, base - 122, 1, 6, dark);
  rect(c, dx - 2, base - 120, 5, 1, dark);

  // the front: a pediment with a round window over the door
  const fx = at(-34);
  rect(c, fx - 26, base - 88, 52, 88, stone);
  rect(c, fx - 26, base - 88, 6, 88, lit);
  rect(c, fx + 20, base - 88, 6, 88, dark);
  for (const y of [base - 88, base - 58]) rect(c, fx - 28, y, 56, 3, lit);
  poly(c, [[fx - 28, base - 88], [fx + 28, base - 88], [fx, base - 106]], stone);
  poly(c, [[fx - 28, base - 88], [fx, base - 88], [fx, base - 106]], lit);
  disc(c, fx, base - 74, 6, deep);
  disc(c, fx, base - 74, 4, '#6b5f7a');
  px(c, fx, base - 74, '#c9a14a');
  rect(c, fx - 6, base - 40, 12, 40, deep);
  disc(c, fx, base - 40, 6, deep);
  rect(c, fx, base - 113, 1, 7, dark);
  rect(c, fx - 2, base - 111, 5, 1, dark);

  // the two bell towers: four stages, arched belfries, a white spire each
  const tower = (x: number, top: number) => {
    rect(c, x - 11, top, 22, base - top, stone);
    rect(c, x - 11, top, 5, base - top, lit);
    rect(c, x + 7, top, 4, base - top, dark);
    for (let y = top + 20; y < base; y += 22) rect(c, x - 12, y, 24, 2, lit);
    for (const y of [top + 6, top + 30]) {
      rect(c, x - 4, y, 8, 11, deep);
      disc(c, x, y, 4, deep);
    }
    rect(c, x - 8, top - 8, 16, 8, stone);
    rect(c, x - 8, top - 8, 4, 8, lit);
    rect(c, x - 2, top - 6, 4, 5, deep);
    poly(c, [[x - 9, top - 8], [x + 9, top - 8], [x, top - 30]], '#e3e5ea');
    poly(c, [[x - 9, top - 8], [x, top - 8], [x, top - 30]], '#f6f7f9');
    rect(c, x, top - 36, 1, 6, dark);
    rect(c, x - 2, top - 34, 5, 1, dark);
  };
  tower(at(96), base - 128);
  tower(at(150), base - 120);
  rect(c, at(96) + 11, base - 64, at(150) - at(96) - 22, 64, stone);
  rect(c, at(96) + 11, base - 64, at(150) - at(96) - 22, 3, lit);

  for (let x = -20; x < canvas.width; x += 16 + rand() * 18) {
    foliage(c, x, base - 6 - rand() * 12, 13 + rand() * 9, 9 + rand() * 7, 1900 + x, {
      deep: '#31543f', dark: '#3b6347', mid: '#48754f', lit: '#5a8a5a', hi: '#6b9a62',
    });
  }
  rect(c, 0, base, canvas.width, VIEW_H - base, '#3b6347');
  return { canvas, parallax: FAR, haze: 0.32 };
}

/** The low buildings along the avenue and the trees over the fence. */
function midLayer(): Layer {
  const [canvas, c] = makeCanvas(layerWidth(WIDTH, MID), VIEW_H);
  const rand = rng(612);
  const base = FENCE;
  for (let x = -10; x < canvas.width; x += 44 + rand() * 30) {
    const h = 26 + rand() * 26;
    const w = 40 + rand() * 20;
    rect(c, x, base - h, w, h, rand() > 0.5 ? '#ece6d8' : '#d9cdb6');
    rect(c, x, base - h, w, 2, '#f6f2e8');
    for (let wy = base - h + 6; wy < base - 8; wy += 9) rect(c, x + 4, wy, w - 8, 4, '#6d7280');
    poly(c, [[x - 3, base - h], [x + w + 3, base - h], [x + w / 2, base - h - 9]], '#b2483c');
  }
  for (let x = -10; x < canvas.width; x += 40 + rand() * 46) {
    tree(c, x, base + 2, 60 + rand() * 36, 20 + rand() * 10, 640 + Math.round(x));
  }
  rect(c, 0, base, canvas.width, VIEW_H - base, P.grassDark);
  return { canvas, parallax: MID, haze: 0.3 };
}

/** The lawns either side of the walkway, darker under the trees at the far end. */
function lawns(c: Ctx): void {
  const rand = rng(31);
  for (let y = FENCE; y < WAY.near + 1; y++) {
    const s = sc(y);
    const t = (y - FENCE) / (WAY.near - FENCE);
    rect(c, 0, y, WIDTH, 1, t < 0.3 ? '#47793f' : t < 0.6 ? '#4f8843' : P.grass);
    for (let i = 0; i < WIDTH * 0.25; i++) px(c, rand() * WIDTH, y, rand() > 0.5 ? P.grassHi : P.grassDark);
    // the shade of the big trees falls across the far end
    if (s < 0.62) for (let i = 0; i < WIDTH * 0.2; i++) px(c, rand() * WIDTH, y, '#3c6a39');
  }
  // the drive in front of the Main Building, beyond the hedge on the left, going back under the trees
  for (let y = FENCE + 10; y < EDGE; y++) {
    const edge = sideX(WAY, -7.5, y);
    rect(c, 0, y, edge, 1, shade(P.road, (y - EDGE) / 140));
  }
  // the paved yard on the right, towards the SFJ fountain
  for (let y = FENCE + 14; y < EDGE; y++) {
    const edge = sideX(WAY, 8, y);
    rect(c, edge, y, WIDTH - edge, 1, shade('#b4ad9f', (y - EDGE) / 160));
  }
}

/** The south end of the Main Building, on the far left, over the parked cars. */
function djnEnd(c: Ctx, g: Ctx, x1: number, base: number): void {
  const top = base - 92;
  rect(c, -4, top, x1 + 4, base - top, P.wall);
  rect(c, x1 - 8, top, 8, base - top, P.wallShade);
  // white pilasters, the cornice and the band between the floors
  for (let x = 2; x < x1 - 10; x += 24) {
    rect(c, x, top + 6, 5, base - top - 6, P.trim);
    rect(c, x + 4, top + 6, 1, base - top - 6, P.trimShade);
  }
  rect(c, -4, top, x1 + 4, 6, P.trim);
  rect(c, -4, top + 6, x1 + 4, 1, P.trimDeep);
  rect(c, -4, top + 44, x1 + 4, 3, P.trim);
  rect(c, -4, base - 4, x1 + 4, 4, P.wallDeep);
  for (let x = 10; x < x1 - 18; x += 24) {
    for (const y of [top + 14, top + 54]) {
      rect(c, x, y, 10, 22, P.trim);
      rect(c, x + 1, y + 1, 8, 20, P.glass);
      rect(c, x + 1, y + 1, 3, 20, P.glassHi);
      rect(c, x + 1, y + 10, 8, 1, P.trim);
      rect(g, x + 2, y + 2, 6, 18, '#ffd98a');
    }
  }
  poly(c, [[-4, top], [x1 + 4, top], [x1 - 6, top - 7], [-4, top - 7]], '#b9a879');
}

/** The tiled pavilion on the right, on the way to the fountain. */
function pavilion(c: Ctx, x0: number, x1: number, base: number): void {
  const eave = base - 30;
  for (let x = x0 + 6; x < x1 - 2; x += 20) {
    rect(c, x, eave, 4, base - eave, '#e7e0c8');
    rect(c, x, eave, 1, base - eave, '#f5f0e0');
  }
  rect(c, x0, base - 3, x1 - x0, 3, '#b9b2a2');
  poly(c, [[x0 - 6, eave], [x1 + 6, eave], [x1 - 10, eave - 22], [x0 + 10, eave - 22]], '#8a4a3a');
  for (let y = eave - 20; y < eave; y += 3) {
    const t = (y - (eave - 22)) / 22;
    rect(c, x0 + 10 - 16 * t, y, x1 - x0 - 20 + 32 * t, 1, '#6e392d');
  }
  poly(c, [[x0 - 6, eave], [x0 + 18, eave], [x0 + 26, eave - 22], [x0 + 10, eave - 22]], '#a35a46');
  rect(c, x0 - 6, eave, x1 - x0 + 12, 2, '#5a2e25');
}

interface Thing {
  y: number;
  draw(): void;
}

/** Everything standing on the lawns, the drive and the yard, drawn far to near. */
function lawnThings(c: Ctx, g: Ctx, lights: AreaLight[]): void {
  const things: Thing[] = [];
  const add = (y: number, draw: () => void) => things.push({ y, draw });
  const glowColour = hex('#ffe2a0');

  // the palms that line the walkway, tied round with white rope, and the big trees behind them
  for (const [m, y, h, seed] of [
    [-3.4, 206, 230, 41], [-3.6, 191, 220, 42], [-3.8, 181, 210, 43],
    [3.5, 207, 236, 44], [3.7, 195, 224, 45], [3.9, 182, 212, 46], [-6.2, 199, 222, 47],
  ] as const) {
    add(y, () => tiedPalm(c, sideX(WAY, m, y), y, h * sc(y), seed));
  }
  add(186, () => tree(c, sideX(WAY, -9, 186), 186, 170 * sc(186), 46, 48));
  add(198, () => tree(c, sideX(WAY, -12.5, 198), 198, 150 * sc(198), 40, 49));
  // a thin, airy tree on the right, as in the photos
  add(192, () => tree(c, sideX(WAY, 9.4, 192), 192, 130 * sc(192), 30, 50, { deep: '#3d6a3a', dark: '#4f8545', mid: '#6aa252', lit: '#8cc066', hi: '#b2d885' }));

  // stone benches along both edges, the low black lights between them, and the low railing on the left
  for (const z of [2.5, 9, 16]) {
    for (const m of [-2.8, 2.8]) add(rowOf(WAY, z), () => walkBench(c, WAY, m, z, WALK));
  }
  for (const y of [181, 190, 199, 207]) {
    for (const m of [-2.35, 2.35]) {
      add(y + 0.5, () => {
        const l = pathLight(c, Math.round(sideX(WAY, m, y)), y, sc(y));
        px(g, l.x, l.y, '#ffe9a8');
        lights.push({ x: l.x, y: l.y, r: 26 * sc(y), color: glowColour, strength: 0.75 });
      });
    }
  }
  add(176.5, () => {
    for (let y = 178; y < EDGE - 1; y += 3) {
      const x = Math.round(sideX(WAY, -3.15, y));
      const h = Math.max(3, Math.round(9 * sc(y)));
      rect(c, x, y - h, 1, h, '#b9bcc4');
    }
    for (const k of [0.95, 0.55]) {
      line(c, sideX(WAY, -3.15, 178), 178 - 9 * sc(178) * k, sideX(WAY, -3.15, EDGE - 2), EDGE - 2 - 9 * sc(EDGE - 2) * k, '#d6d9de', 1);
    }
  });

  // on the left, beyond a hedge, cars parked along the drive, and the Main Building
  add(195, () => djnEnd(c, g, Math.round(sideX(WAY, -12, 195)), 195));
  add(200, () => car(c, sideX(WAY, -9.6, 200), 200, '#e9e7e2', -1));
  add(206, () => car(c, sideX(WAY, -12.4, 206), 206, '#c3c7cf', 1));
  add(EDGE - 1, () => hedge(c, 0, EDGE + 1, Math.round(sideX(WAY, -7.2, EDGE - 1)), 8, 51));
  // on the right, the tiled pavilion and the red-tipped shrubs round the yard
  add(188, () => pavilion(c, Math.round(sideX(WAY, 10.5, 188)), Math.round(sideX(WAY, 10.5, 188)) + 96, 188));
  add(EDGE - 1, () => {
    for (let x = Math.round(sideX(WAY, 8.2, EDGE)); x < WIDTH + 20; x += 24) bush(c, x, EDGE + 1, 30, 14, 300 + x, RED_TIP);
  });

  things.sort((a, b) => a.y - b.y);
  for (const t of things) t.draw();
}

/** The plaza's paving round the star, the hedges along its far edge, the steps down off it. */
function platform(c: Ctx): void {
  const rand = rng(77);
  const apron = '#b3afa7';
  // the concrete round the star, from the far edge to the near one
  rect(c, LEFT_TOP, EDGE, RIGHT_TOP - LEFT_TOP, VIEW_H - EDGE, apron);
  for (let i = 0; i < (RIGHT_TOP - LEFT_TOP) * 6; i++) {
    px(c, LEFT_TOP + rand() * (RIGHT_TOP - LEFT_TOP), EDGE + rand() * (VIEW_H - EDGE), rand() > 0.5 ? '#c2beb5' : '#a19d96');
  }
  // the kerb along the far edge
  rect(c, LEFT_TOP, EDGE, RIGHT_TOP - LEFT_TOP, 1, '#d6d2c8');
  starPlaza(c, CX, CY);
}

/** Low hedges along the far edge of the plaza, either side of the walkway. Drawn after the lawn things, so they sit in front of them. */
function farHedges(c: Ctx): void {
  hedge(c, LEFT_TOP, EDGE + 2, AXIS - 40 - LEFT_TOP, 7, 61);
  hedge(c, AXIS + 40, EDGE + 2, RIGHT_TOP - AXIS - 40, 7, 62);
  for (let x = LEFT_TOP + 10; x < AXIS - 54; x += 30) bush(c, x, EDGE, 22, 10, 400 + x);
  for (let x = AXIS + 58; x < RIGHT_TOP - 4; x += 28) bush(c, x, EDGE, 22, 10, 420 + x, RED_TIP);
}

/** Steps going down sideways off the end of the plaza: `dir` -1 on the left, 1 on the right. */
function sideSteps(c: Ctx, top: number, dir: -1 | 1): void {
  const tread = '#bdb8ae';
  const cheek = '#8f8a82';
  for (let i = 0; i < STEPS; i++) {
    const x0 = dir < 0 ? top - (i + 1) * STEP_W : top + i * STEP_W;
    const drop = (i + 1) * STEP_H;
    // the tread, a step lower than the last, and the side of the flight under its near edge
    rect(c, x0, FLIGHT[0] + drop, STEP_W, FLIGHT[1] - FLIGHT[0], tread);
    rect(c, x0, FLIGHT[0] + drop, STEP_W, 1, shade(tread, 0.25));
    rect(c, x0, FLIGHT[1] + drop, STEP_W, STEP_H * (STEPS - i), cheek);
    rect(c, x0, FLIGHT[1] + drop, STEP_W, 1, shade(cheek, 0.2));
    // the nosing on the bottom step is painted yellow, as at all the plaza's steps
    if (i === STEPS - 1) rect(c, dir < 0 ? x0 : x0 + STEP_W - 2, FLIGHT[0] + drop, 2, FLIGHT[1] - FLIGHT[0], '#e2c13a');
  }
  // the plaza's own edge beside the flight: a kerb wall with hedges on top, behind and in front of it
  const edge = dir < 0 ? top - 4 : top;
  rect(c, edge, EDGE, 4, FLIGHT[0] - EDGE, '#a29d94');
  hedge(c, dir < 0 ? top - 34 : top + 4, FLIGHT[0], 30, 9, top);
  hedge(c, dir < 0 ? top - 36 : top + 4, VIEW_H, 32, VIEW_H - FLIGHT[1] - STEP_H * STEPS + 2, top + 1);
}

/** The ground off the ends of the plaza, a step lower: the drive on the left, the paving towards SFJ on the right. */
function lowGround(c: Ctx, g: Ctx, lights: AreaLight[]): void {
  const rand = rng(91);
  const y0 = FLIGHT[0] + STEP_H * STEPS;
  // the drive
  rect(c, 0, y0, LEFT_FOOT, VIEW_H - y0, P.road);
  rect(c, 0, y0, LEFT_FOOT, 3, '#c9c4b6');
  rect(c, 0, y0 + 3, LEFT_FOOT, 1, '#8e8a80');
  for (let i = 0; i < LEFT_FOOT * 4; i++) px(c, rand() * LEFT_FOOT, y0 + 4 + rand() * (VIEW_H - y0 - 4), rand() > 0.5 ? P.roadLine : P.roadDark);
  // a yellow arrow on the drive, as in the photo from SFJ
  poly(c, [[LEFT_FOOT - 70, y0 + 20], [LEFT_FOOT - 48, y0 + 18], [LEFT_FOOT - 49, y0 + 15], [LEFT_FOOT - 36, y0 + 21], [LEFT_FOOT - 49, y0 + 27], [LEFT_FOOT - 48, y0 + 24], [LEFT_FOOT - 70, y0 + 23]], '#d9b236');
  car(c, 34, VIEW_H - 4, '#f0efea', 1);
  const l = lampPost(c, LEFT_FOOT - 18, y0 + 12, 70);
  disc(g, l.x, l.y, 4, P.lamp);
  lights.push({ x: l.x, y: l.y, r: 92, color: hex(P.lamp), strength: 0.95 });
  lights.push({ x: l.x, y: y0 + 22, r: 60, color: hex(P.lamp), strength: 0.5 });

  // the paving on the right, with the joints the photo shows curving round towards the fountain
  rect(c, RIGHT_FOOT, y0, WIDTH - RIGHT_FOOT, VIEW_H - y0, '#bdb6a8');
  rect(c, RIGHT_FOOT, y0, WIDTH - RIGHT_FOOT, 2, '#d9d3c5');
  for (let y = y0 + 6; y < VIEW_H; y += 7) rect(c, RIGHT_FOOT, y, WIDTH - RIGHT_FOOT, 1, '#a9a294');
  for (let i = 0; i < 3; i++) {
    const r = 70 + i * 26;
    for (let a = 0; a < Math.PI / 2; a += 0.02) px(c, WIDTH + 30 - Math.cos(a) * r, VIEW_H + 10 - Math.sin(a) * r * 0.25, '#6f6b66');
  }
  // the black lamp whose post curls over at the top, a bell shade hanging from the end
  const lx = RIGHT_FOOT + 22;
  const base = y0 + 10;
  const top = base - 76;
  rect(c, lx - 2, base - 4, 5, 4, P.iron);
  rect(c, lx - 1, base - 9, 3, 5, P.iron);
  rect(c, lx, top + 6, 2, base - top - 10, P.iron);
  rect(c, lx, top + 6, 1, base - top - 10, P.ironHi);
  for (let a = 0; a <= 14; a++) {
    const t = Math.PI - (a / 14) * Math.PI;
    px(c, lx + 6 + Math.cos(t) * 6, top + 6 - Math.sin(t) * 6, P.iron);
    px(c, lx + 6 + Math.cos(t) * 6, top + 7 - Math.sin(t) * 6, P.iron);
  }
  const hx = lx + 12;
  rect(c, hx, top + 6, 1, 3, P.iron);
  poly(c, [[hx - 2, top + 9], [hx + 3, top + 9], [hx + 5, top + 14], [hx - 4, top + 14]], P.iron);
  rect(c, hx - 4, top + 14, 9, 1, '#2a2a30');
  rect(c, hx - 2, top + 15, 5, 1, '#efe6c8');
  disc(g, hx + 0.5, top + 15, 3, P.lamp);
  lights.push({ x: hx, y: top + 16, r: 92, color: hex(P.lamp), strength: 0.95 });
  lights.push({ x: hx, y: base + 10, r: 60, color: hex(P.lamp), strength: 0.5 });
  bush(c, WIDTH - 40, VIEW_H + 6, 70, 30, 77, RED_TIP);
}

/** The steps down towards the camera in the middle, to the parking, between two low hedges. */
function middleSteps(c: Ctx): void {
  const top = CY + Math.round(STAR_R * FLAT) + 3;
  const tread = '#bdb8ae';
  // the yellow nosing along the plaza's edge, then three treads, each a little wider and lower
  rect(c, CX - 26, top - 1, 52, 1, '#e2c13a');
  for (let i = 0; i < 3; i++) {
    const half = 26 + i * 3;
    const y = top + i * 6;
    rect(c, CX - half, y, half * 2, 4, i % 2 ? shade(tread, 0.05) : tread);
    rect(c, CX - half, y, half * 2, 1, shade(tread, 0.3));
    rect(c, CX - half, y + 4, half * 2, 2, '#7d7972');
  }
  // the hedges either side, with their yellow-painted kerb ends
  hedge(c, LEFT_TOP + 2, VIEW_H, CX - 30 - LEFT_TOP - 2, VIEW_H - top + 1, 71);
  hedge(c, CX + 30, VIEW_H, RIGHT_TOP - CX - 32, VIEW_H - top + 1, 72);
  for (const x of [CX - 31, CX + 28]) {
    rect(c, x, top - 2, 3, VIEW_H - top + 2, '#9a958c');
    rect(c, x, top - 2, 3, 4, '#e2c13a');
  }
}

function mainLayer(lights: AreaLight[], parts: RingPart[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  lawns(c);
  diamondWalk(c, WAY);
  // the fence along the avenue with the covered walks, and the gate in the middle
  coveredWalk(c, -10, AXIS - 44, FENCE, 81);
  coveredWalk(c, AXIS + 44, WIDTH + 10, FENCE, 82);
  for (const l of lausDeoGate(c, AXIS, FENCE)) {
    rect(g, l.x - 3, l.y - 1, 7, 1, '#fff4d6');
    lights.push({ x: l.x, y: l.y + 8, r: 40, color: [255, 236, 190], strength: 0.75 });
  }
  lawnThings(c, g, lights);
  platform(c);
  farHedges(c);
  for (const p of parts) p.draw(c, 0);
  middleSteps(c);
  sideSteps(c, LEFT_TOP, -1);
  sideSteps(c, RIGHT_TOP, 1);
  lowGround(c, g, lights);

  // the flag is lit from below at night
  lights.push({ x: CX, y: CY - 26, r: 46, color: [255, 230, 180], strength: 0.6 });
  return { canvas, glow };
}

/** Palm fronds hanging in at the top, as in the photo, and bushes out of focus along the bottom. */
function frontLayer(): Layer {
  const layer = frontPlants(WIDTH, 913);
  const c = layer.canvas.getContext('2d')!;
  const fronds: Tones = SILHOUETTE;
  for (const [x, w] of [[30, 90], [layer.canvas.width - 60, 80]] as const) foliage(c, x, -16, w, 22, 1000 + x, fronds);
  return layer;
}

export function buildEntry(): AreaDef {
  const lights: AreaLight[] = [];
  const parts = ringParts(CX, CY);
  // the yellow sign stands just behind the pole, on its left
  parts.push({ depth: CY - 6, draw: (c, ox) => evacuationSign(c, CX - 30 - ox, CY - 6) });
  parts.sort((a, b) => a.depth - b.depth);
  const main = mainLayer(lights, parts);
  const drift = ambience(733, [CX - 120, CX - 60, CX + 70, CX + 130]);

  /** someone walking down the walkway or coming up it: how far along, so the posts can be drawn in front of them */
  let trip: { t: number; time: number; out: boolean } | null = null;
  const walk: Walk = {
    stand: STAND,
    far: FAR_X,
    rise: RISE,
    trip: (out, time) => (trip = { t: 0, time, out }),
  };

  return {
    id: 'entry',
    title: 'Side Gate Entryway',
    subtitle: 'Laus Deo Semper 1933',
    width: WIDTH,
    walkY: WALK,
    bounds: [LEFT_TOP + 4, RIGHT_TOP - 4],
    outdoor: true,
    layers: [farLayer(), midLayer(), { canvas: main.canvas, parallax: 1 }, frontLayer()],
    glow: main.glow,
    lights,
    hotspots: entryHotspots({ djn: LEFT_TOP + 10, flag: CX - 36, stl: CX, sfj: RIGHT_TOP - 10 }, walk),
    npcs: entryNpcs({ weng: CX - 72, ella: CX + 92, wander: [CX + 80, RIGHT_TOP - 16] }),
    spawns: {
      // out of the gate and up the walkway
      gate: { x: STAND, facing: -1 },
      djn: { x: LEFT_TOP + 12, facing: 1 },
      stl: { x: CX - 16, facing: -1 },
      sfj: { x: RIGHT_TOP - 12, facing: -1 },
    },

    intro(_game, x) {
      trip = null;
      return x === STAND ? arrive(walk) : null;
    },

    update(dt, area, view) {
      if (trip && (trip.t += dt) > trip.time + 0.2) trip = null;
      drift(dt, area, view);
    },

    drawBack(ctx, view) {
      philippineFlag(ctx, CX + 2 - Math.round(view.camX), 25, view.time);
    },

    drawFront(ctx, view) {
      if (!trip) return;
      // how far down the walkway you are, and so which of the posts and the pedestal are between you and the camera
      const k = Math.min(1, trip.t / trip.time);
      const deep = trip.out ? 1 - k : k;
      const y = WALK - RISE * deep;
      const cam = Math.round(view.camX);
      for (const p of parts) if (p.depth > y) p.draw(ctx, cam);
    },
  };
}
