// The lanes of the chapel walkway, drawn from the photos in
// `assets/images/buildings/beside the main building + the main walkways/`
// (art/walks.ts). The road runs between two sides that mirror each other:
//
//   DJN | student center | sidewalk 1 (covered) | sidewalk 2 (pavers) | road | sidewalk 2 | sidewalk 1 (covered) | PGN
//
// On the Main Building side you look south-east at the student center and
// the DJN, MGN on the left and the rotunda on the right; on the PGN side
// (walkway.ts and pgnsw1 here) you look north-west at STL and PGN, the
// rotunda on the left. Every lane is laid out from the plan, so a spot on the
// walkway is at the same x in every lane of the same side. You step from one
// lane to the next only where there is a real opening.
//
// Nearer lanes and the pillars of the covered walk you are under pass in
// front of you, on layers that move faster than the ground.

import { Ctx, VIEW_H, VIEW_W, makeCanvas } from '../../engine/display';
import { hex, rng } from '../../engine/math';
import { disc, line, rect, sign } from '../../engine/pix';
import { P } from '../art/palette';
import { foliage, hedge, tree } from '../art/props';
import {
  arecaPot, atm, bannerLamp, beigeTiles, binRack, cafeWindow, circleTiles, djnSide, graniteBench, hexPavers, mgnBlock,
  mosaicRug, pergolaSide, pgnPodium, pgnTower, pillar, planterRail, slatCeiling, stlPavilion, tableSet, tiledCeiling,
} from '../art/walks';
import { STREETS, Street, streetWidth, xOf } from '../campus/streets';
import { djnLaneHotspots, laneNpcs, pgnSw1Hotspots } from '../story/walks';
import { AreaDef, AreaLight, Layer } from '../types';
import { GROUND, ambience, farCity, layerWidth } from './kit';

export const WALK = 242;

/** Plan positions along the walkway (u, metres from the chapel) that every lane uses. */
export const U = {
  /** the rotunda end of every lane */
  rotunda: -162,
  /** the Main Building side stops at MGN */
  mgn: -90,
  /** the DJN's walkway face, and so the student center, from its MGN end to its rotunda end */
  djnL: -94,
  djnR: -161,
  /** the courtyard gate, in the student center's back wall */
  courtyard: -110.3,
  /** Cafe Juan's door, and the openings between the student center and sidewalk 1 */
  cafe: -122,
  stuOpenA: -122,
  stuOpenB: -150,
  /** the breaks in the hedge between sidewalk 1 and sidewalk 2, on both sides */
  hedgeA: -100,
  hedgeB: -140,
  /** the crossings over the road: the one by the courtyard gate, and the crossroads before the chapel */
  crossA: -110,
  crossB: -92,
  /** the PGN side ends at the PGN tower */
  pgnEnd: -68,
};

/** Where a spot on the walkway is in a lane, by its u. */
export function laneX(S: Street, u: number): number {
  const v = S.path[0].v;
  return xOf(S, { u, v });
}

/** Where to draw something in a layer moving at `p` so it is over scene x when the camera is centred there. */
export function at(x: number, p: number): number {
  return Math.round(VIEW_W / 2 + (x - VIEW_W / 2) * p);
}

/** A layer of the Main Building beyond the lanes: the DJN's side over the student center roof, MGN closing the left end. */
function djnBeyond(S: Street, width: number, p: number, roof: number, seed: number): Layer {
  const [canvas, c] = makeCanvas(layerWidth(width, p), VIEW_H);
  const [, g] = makeCanvas(layerWidth(width, p), VIEW_H);
  const rand = rng(seed);
  const l = at(laneX(S, U.djnL), p);
  const r = at(laneX(S, U.djnR), p);
  for (let x = -10; x < canvas.width; x += 40 + rand() * 40) tree(c, x, roof + 4, 70 + rand() * 30, 24 + rand() * 8, seed + Math.round(x));
  djnSide(c, g, l, r, roof + 2, roof - 92);
  // MGN at the left end, and SJH's tall red and cream tower beyond it
  const m = at(laneX(S, U.mgn), p);
  rect(c, m - 120, roof - 150, 60, 152, '#c9805f');
  rect(c, m - 100, roof - 150, 40, 152, '#e6d9b6');
  for (let y = roof - 142; y < roof - 4; y += 10) rect(c, m - 96, y, 32, 5, '#5e8fb8');
  mgnBlock(c, g, m - 70, m + 6, roof + 2, roof - 92);
  rect(c, 0, roof + 2, canvas.width, VIEW_H - roof - 2, P.grassDark);
  return { canvas, parallax: p, haze: 0.12 };
}

/** The student center seen from outside, from `base`: its flat roof, cream posts, the planter rail, the tables inside. */
function studentCenterFront(c: Ctx, g: Ctx, S: Street, base: number, s: number, seed: number): void {
  const l = laneX(S, U.djnL);
  const r = laneX(S, U.djnR);
  const roof = base - Math.round(64 * s);
  // the shade under the roof, the back wall with Cafe Juan's lit windows
  rect(c, l, roof, r - l, base - roof, '#7e6c58');
  rect(c, l, roof + 6, r - l, base - roof - 6, '#e6d8a8');
  for (let x = l + 20; x < r - 30; x += Math.round(60 * s)) cafeWindow(c, g, x, roof + 14, Math.round(36 * s), Math.round(26 * s), seed + x);
  rect(c, l, base - Math.round(10 * s), r - l, Math.round(10 * s), '#a8553c');
  for (let x = l + 30; x < r - 20; x += Math.round(46 * s)) tableSet(c, x, base - Math.round(4 * s));
  // the roof's fascia, and the double cream posts along the open side
  rect(c, l - 4, roof - 6, r - l + 8, 7, '#ece6d2');
  rect(c, l - 4, roof - 6, r - l + 8, 1, '#ffffff');
  rect(c, l - 4, roof + 1, r - l + 8, 1, '#a59c84');
  for (let x = l; x <= r; x += Math.round(52 * s)) {
    rect(c, x, roof, 3, base - roof, '#efe8d0');
    rect(c, x + 4, roof, 3, base - roof, '#e2d9be');
    rect(c, x + 3, roof, 1, base - roof, '#b9ae90');
  }
  planterRail(c, l, r, base + 2, seed, s * 0.85, 30);
}

/**
 * The covered sidewalk 1 seen from beside it: its two rows of pillars, the
 * white beam over them and the benches. `base` is where the far row stands.
 */
export function coveredWalkSide(c: Ctx, x0: number, x1: number, base: number, s: number, seed: number, benches: boolean): void {
  const h = Math.round(58 * s);
  const w = Math.max(4, Math.round(8 * s));
  const bay = Math.round(64 * s);
  const near = base + Math.round(6 * s);
  // the far row and its benches
  for (let x = x0; x < x1; x += bay) {
    pillar(c, x, base - h, base, w);
    if (benches && x + bay < x1) graniteBench(c, x + w + 8, base + 1, bay - w - 16, s);
  }
  // the roof between the rows, seen from below and the side, then the near row, each pillar
  // standing a little in front of its partner across the walk
  rect(c, x0 - 2, base - h - Math.round(8 * s), x1 - x0 + 4, Math.round(8 * s), '#d6d3ca');
  for (let x = x0; x < x1; x += 3) rect(c, x, base - h - Math.round(8 * s), 1, Math.round(8 * s), '#eeece4');
  pergolaSide(c, x0 - 4, x1 + 4, near - h - Math.round(6 * s), s);
  for (let x = x0 + Math.round(6 * s); x < x1; x += bay) pillar(c, x, near - h, near, w + 1);
  // the tiled floor between them
  rect(c, x0, base, x1 - x0, near - base, '#e3d9c6');
}

/** A hedge strip with the banner lamps standing in it. */
function lampHedge(c: Ctx, g: Ctx, lights: AreaLight[], x0: number, x1: number, base: number, h: number, seed: number, skip: number[]): void {
  for (let x = x0; x < x1; x += 120) {
    const end = Math.min(x1, x + 112);
    if (skip.some((k) => k > x - 12 && k < end + 12)) {
      // a break in the hedge for the way through
      const k = skip.find((v) => v > x - 12 && v < end + 12)!;
      if (k - 16 > x) hedge(c, x, base, k - 16 - x, h, seed + x);
      if (end > k + 16) hedge(c, k + 16, base, end - k - 16, h, seed + x + 1);
    } else hedge(c, x, base, end - x, h, seed + x);
  }
  for (let x = x0 + 60; x < x1; x += 150) {
    if (skip.some((k) => Math.abs(k - x) < 30)) continue;
    for (const l of bannerLamp(c, x, base, 96, seed + x)) {
      disc(g, l.x, l.y, 3, P.lamp);
      lights.push({ x: l.x, y: l.y, r: 80, color: hex(P.lamp), strength: 0.85 });
    }
    lights.push({ x, y: base + 20, r: 60, color: hex(P.lamp), strength: 0.45 });
  }
}

/** The near row of pillars of the covered walk you are under, and its slatted roof overhead. */
function underPergola(width: number, p: number, xs: number[]): Layer {
  const [canvas, c] = makeCanvas(layerWidth(width, p), VIEW_H);
  slatCeiling(c, 0, canvas.width, 0, 24);
  for (const x of xs) {
    const px0 = at(x, p);
    pillar(c, px0 - 8, 24, VIEW_H, 16);
    // the bracket where the beam sits on it
    rect(c, px0 - 5, 24, 10, 4, '#f4f2ea');
  }
  return { canvas, parallax: p, front: true };
}

/** The pillar x positions of a covered walk, one every bay, skipping the openings. */
function pillarRow(x0: number, x1: number, bay: number, skip: number[]): number[] {
  const out: number[] = [];
  for (let x = x0; x <= x1; x += bay) if (!skip.some((k) => Math.abs(k - x) < bay / 2)) out.push(x);
  return out;
}

/** The PGN tower rising over the podium, and trees, seen from the PGN side's covered walk. */
function pgnBeyond(S: Street, width: number, p: number, base: number): Layer {
  const [canvas, c] = makeCanvas(layerWidth(width, p), VIEW_H);
  const [, g] = makeCanvas(layerWidth(width, p), VIEW_H);
  const rand = rng(9520);
  for (let x = -10; x < canvas.width; x += 40 + rand() * 40) tree(c, x, base + 6, 80 + rand() * 30, 26, 9521 + Math.round(x));
  pgnTower(c, g, at(laneX(S, -92), p), at(laneX(S, -69), p), base, -10);
  return { canvas, parallax: p, haze: 0.1 };
}

/** The strip of lawn between MGN and the student center: grass, a hedge and a tree. */
function mgnLawn(c: Ctx, x0: number, x1: number, base: number, s: number): void {
  rect(c, x0, base - Math.round(90 * s), x1 - x0, Math.round(90 * s), '#d9e6ee');
  rect(c, x0, base - Math.round(10 * s), x1 - x0, Math.round(10 * s), P.grass);
  rect(c, x0, base - Math.round(10 * s), x1 - x0, 1, P.grassHi);
  tree(c, Math.round((x0 + x1) / 2), base - Math.round(4 * s), Math.round(120 * s), Math.round(30 * s), 9330 + x0);
  hedge(c, x0, base, x1 - x0, Math.round(9 * s), 9331 + x0);
}

// --- the student center ------------------------------------------------------------------------------------

export function buildStudentCenter(): AreaDef {
  const S = STREETS.stuc;
  const WIDTH = streetWidth(S);
  const lights: AreaLight[] = [];
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const L = laneX(S, U.djnL);
  const R = laneX(S, U.djnR);
  const COURT = laneX(S, U.courtyard);
  const CAFE = laneX(S, U.cafe) - 34;
  const OPEN = [laneX(S, U.stuOpenA), laneX(S, U.stuOpenB)];
  const ATM_X = R - 70;
  const CEIL = 42;
  const FLOOR = GROUND + 4;

  // past the left end: daylight, MGN across the drive, a tree; the brick plaza by the rotunda at the right end
  rect(c, 0, CEIL, L, FLOOR - CEIL, '#d9e6ee');
  mgnBlock(c, g, L - 150, L - 30, FLOOR - 6, CEIL + 10);
  rect(c, 0, FLOOR - 8, L, 8, '#77737a');
  tree(c, L - 14, FLOOR, 110, 32, 9100);
  // the back wall: cream, Cafe Juan's tall windows, a red skirting
  rect(c, L, CEIL, R - L, FLOOR - CEIL, '#ecdca6');
  rect(c, L, FLOOR - 10, R - L, 10, '#a8463a');
  for (let x = L + 16; x < R - 20; x += 64) {
    if (Math.abs(x + 20 - COURT) < 40 || Math.abs(x + 20 - CAFE) < 40 || Math.abs(x + 20 - ATM_X) < 40) continue;
    cafeWindow(c, g, x, CEIL + 34, 40, 70, 9000 + x);
  }
  // the courtyard gate: an opening through to the DJN courtyard, its iron gate folded back
  // through it: the courtyard's daylight under its glass roof, the vines, the theatre steps
  rect(c, COURT - 22, CEIL + 24, 44, FLOOR - CEIL - 24, '#f2efe6');
  rect(c, COURT - 18, CEIL + 30, 36, FLOOR - CEIL - 30, '#cfd8c4');
  rect(c, COURT - 18, CEIL + 30, 36, 10, '#e9f0ee');
  for (let k = COURT - 18; k < COURT + 18; k += 6) rect(c, k, CEIL + 30, 1, 10, '#9fb0b8');
  foliage(c, COURT - 10, CEIL + 46, 9, 6, 9150, { deep: '#2f5a2a', dark: '#3f7a35', mid: '#5a9a45', lit: '#7fb85a', hi: '#a2d266' });
  foliage(c, COURT + 10, CEIL + 50, 8, 7, 9151, { deep: '#2f5a2a', dark: '#3f7a35', mid: '#5a9a45', lit: '#7fb85a', hi: '#a2d266' });
  for (let i = 0; i < 3; i++) rect(c, COURT - 16 + i * 2, FLOOR - 14 + i * 4, 32 - i * 4, 3, i % 2 ? '#b9aa90' : '#cbbca0');
  rect(g, COURT - 18, CEIL + 30, 36, FLOOR - CEIL - 30, 'rgba(255,240,200,0.5)');
  lights.push({ x: COURT, y: FLOOR - 30, r: 60, color: [255, 240, 210], strength: 0.5, daylight: true });
  // the iron gate folded back against the left jamb
  for (let k = 0; k < 6; k += 2) rect(c, COURT - 18 + k, CEIL + 30, 1, FLOOR - CEIL - 30, P.iron);
  sign(c, 'COURTYARD', COURT - 17, CEIL + 16, '#6a4a3a');
  // Cafe Juan's way in: a dark gate under the carved wooden sign, steps up, plants in pots
  rect(c, CAFE - 34, CEIL + 2, 68, 18, '#9a6a4a');
  rect(c, CAFE - 34, CEIL + 2, 68, 1, '#b8885f');
  sign(c, 'CAFE JUAN', CAFE - 17, CEIL + 8, '#f2e2c8');
  // the way in: a dark wood frame, the lit room seen through it, the low slatted gates folded open
  rect(c, CAFE - 28, CEIL + 24, 56, FLOOR - CEIL - 28, '#4a3a2e');
  rect(c, CAFE - 24, CEIL + 28, 48, FLOOR - CEIL - 32, '#6e5644');
  for (let yy = CEIL + 28; yy < FLOOR - 30; yy += 6) rect(c, CAFE - 24, yy, 48, 1, '#5e4838');
  rect(c, CAFE - 24, FLOOR - 30, 48, 26, '#8a6a52');
  for (const lx of [CAFE - 12, CAFE + 2, CAFE + 14]) {
    rect(c, lx, CEIL + 28, 1, 14, '#2a221d');
    rect(c, lx - 1, CEIL + 42, 3, 2, '#ffd88a');
  }
  rect(c, CAFE - 20, FLOOR - 22, 14, 2, '#c9a27a');
  rect(c, CAFE + 6, FLOOR - 22, 14, 2, '#c9a27a');
  for (const sx of [CAFE - 28, CAFE + 20]) {
    rect(c, sx, FLOOR - 26, 8, 22, '#3a2e26');
    for (let k = 1; k < 8; k += 2) rect(c, sx + k, FLOOR - 26, 1, 22, '#5a4838');
  }
  rect(g, CAFE - 22, CEIL + 30, 44, FLOOR - CEIL - 36, 'rgba(255,214,150,0.65)');
  lights.push({ x: CAFE, y: FLOOR - 30, r: 50, color: [255, 214, 150], strength: 0.45, always: true });
  rect(c, CAFE - 34, FLOOR - 4, 68, 4, '#c9c3b6');
  for (const dx of [-46, 40, 52]) {
    rect(c, CAFE + dx - 5, FLOOR - 10, 10, 10, '#b0614a');
    foliage(c, CAFE + dx, FLOOR - 18, 8, 9, CAFE + dx, { deep: '#2f5a2a', dark: '#3f7a35', mid: '#5a9a45', lit: '#7fb85a', hi: '#a2d266' });
  }
  atm(c, g, ATM_X, FLOOR);
  // the rows of white tables along the wall, and the ceiling with its fans
  for (let x = L + 30; x < R - 20; x += 50) {
    if ([COURT, CAFE, ATM_X].some((k) => Math.abs(k - x) < 40)) continue;
    tableSet(c, x, FLOOR + 10);
  }
  tiledCeiling(c, 0, WIDTH, 0, CEIL);
  for (let x = L + 60; x < R; x += 140) lights.push({ x, y: CEIL + 6, r: 90, color: [240, 246, 255], strength: 0.55, always: true });
  // the floor: terracotta tiles in their circles
  circleTiles(c, 0, WIDTH, FLOOR, VIEW_H - FLOOR);
  // the right end opens on the brick plaza by the rotunda: daylight and a tree
  rect(c, R + 6, CEIL, WIDTH - R - 6, FLOOR - CEIL, '#d9e6ee');
  rect(c, R + 6, FLOOR - 30, WIDTH - R - 6, 30, '#9a7464');
  for (let x = R + 8; x < WIDTH; x += 6) rect(c, x, FLOOR - 30, 1, 30, '#7d5d50');
  tree(c, R + 40, FLOOR, 120, 40, 9101);

  // in front: the cream posts along the open side, the planter and rail, open at the ways out to sidewalk 1
  const p = 1.22;
  const [fc, f] = makeCanvas(layerWidth(WIDTH, p), VIEW_H);
  // the double posts stand every few bays; slim, so they never hide a doorway for long
  for (let x = L + 40; x < R; x += 150) {
    if (OPEN.some((k) => Math.abs(k - x) < 50)) continue;
    const px0 = at(x, p);
    rect(f, px0, 0, 5, VIEW_H, '#efe8d0');
    rect(f, px0, 0, 1, VIEW_H, '#fbf7ea');
    rect(f, px0 + 6, 0, 5, VIEW_H, '#e2d9be');
    rect(f, px0 + 10, 0, 1, VIEW_H, '#b9ae90');
  }
  const segs: [number, number][] = [];
  let from = L;
  for (const k of [...OPEN].sort((a, b) => a - b)) {
    segs.push([from, k - 24]);
    from = k + 24;
  }
  segs.push([from, R]);
  for (const [a, b] of segs) planterRail(f, at(a, p), at(b, p), VIEW_H + 12, 9200 + a, 1.25, 34);

  return {
    id: 'stuc',
    title: 'Student Center',
    subtitle: 'Sa tabi ng Main Building',
    width: WIDTH,
    walkY: WALK,
    bounds: [L + 8, WIDTH - 20],
    outdoor: false,
    visitFlag: 'visited_stuc',
    layers: [{ canvas, parallax: 1 }, { canvas: fc, parallax: p, front: true }],
    glow,
    lights,
    hotspots: djnLaneHotspots('stuc', { courtyard: COURT, cafe: CAFE, atm: ATM_X, openings: OPEN, end: WIDTH - 26, mgn: L + 14 }),
    npcs: laneNpcs('stuc', [L + 120, CAFE + 90]),
    spawns: {
      plaza: { x: WIDTH - 34, facing: -1 },
      courtyard: { x: COURT, facing: 1 },
      openA: { x: OPEN[0], facing: -1 },
      openB: { x: OPEN[1], facing: -1 },
    },
  };
}

// --- sidewalk 1 on the Main Building side ------------------------------------------------------------------

export function buildDjnSw1(): AreaDef {
  const S = STREETS.djnsw1;
  const WIDTH = streetWidth(S);
  const lights: AreaLight[] = [];
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const END = laneX(S, U.mgn);
  const ROT = laneX(S, U.rotunda);
  const STU = [laneX(S, U.stuOpenA), laneX(S, U.stuOpenB)];
  const HEDGE = [laneX(S, U.hedgeA), laneX(S, U.hedgeB)];
  const FLOOR = GROUND + 2;

  // the student center behind the far row, its tables and windows in the shade under its roof
  mgnLawn(c, END + 4, laneX(STREETS.stuc, U.djnL), FLOOR - 16, 1);
  studentCenterFront(c, g, STREETS.stuc, FLOOR - 16, 1, 9300);
  // the far row of pillars with the granite benches between them, open where the way into the student center is
  const bay = 54;
  for (const x of pillarRow(END + 10, ROT, bay, STU)) {
    pillar(c, x, FLOOR - 74, FLOOR, 10);
    if (x + bay < ROT && !STU.some((k) => k > x && k < x + bay)) graniteBench(c, x + 16, FLOOR + 2, bay - 22);
  }
  // the end of the walk at MGN, and the lawn between it and the student center
  mgnBlock(c, g, -40, END + 4, FLOOR, 30);
  // the floor: beige tiles, a mosaic rug now and then
  beigeTiles(c, 0, WIDTH, FLOOR, VIEW_H - FLOOR, 9301);
  for (let x = END + 80; x < ROT; x += 260) mosaicRug(c, x, FLOOR + 22, 34, 9);
  // the rotunda end opens out under a tree
  tree(c, ROT + 30, FLOOR, 110, 36, 9302);
  for (let x = END + 60; x < ROT; x += 150) lights.push({ x, y: 30, r: 70, color: [255, 236, 200], strength: 0.4, always: true });

  return {
    id: 'djnsw1',
    title: 'Sidewalk 1',
    subtitle: 'Covered walk, sa gilid ng Main Building',
    width: WIDTH,
    walkY: WALK,
    bounds: [END + 14, WIDTH - 20],
    outdoor: true,
    layers: [
      farCity(WIDTH, 9310),
      djnBeyond(S, WIDTH, 0.7, FLOOR - 82, 9311),
      { canvas, parallax: 1 },
      underPergola(WIDTH, 1.25, pillarRow(END + 37, ROT, bay * 2, HEDGE)),
    ],
    glow,
    lights,
    hotspots: djnLaneHotspots('djnsw1', { stu: STU, hedge: HEDGE, end: WIDTH - 26, mgn: END + 20 }),
    npcs: laneNpcs('djnsw1', [END + 200, ROT - 120]),
    spawns: {
      plaza: { x: WIDTH - 34, facing: -1 },
      stuA: { x: STU[0], facing: -1 },
      stuB: { x: STU[1], facing: -1 },
      hedgeA: { x: HEDGE[0], facing: 1 },
      hedgeB: { x: HEDGE[1], facing: 1 },
    },
    update: ambience(9312, [ROT + 30]),
  };
}

// --- sidewalk 2 on the Main Building side ------------------------------------------------------------------

export function buildDjnSw2(): AreaDef {
  const S = STREETS.djnsw2;
  const WIDTH = streetWidth(S);
  const lights: AreaLight[] = [];
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const END = laneX(S, U.mgn);
  const ROT = laneX(S, U.rotunda);
  const HEDGE = [laneX(S, U.hedgeA), laneX(S, U.hedgeB)];
  const CROSS = [laneX(S, U.crossA), laneX(S, U.crossB)];

  // the student center, small beyond the covered walk; the covered walk itself beyond the hedge
  mgnLawn(c, END + 4, laneX(STREETS.stuc, U.djnL), GROUND - 28, 0.72);
  studentCenterFront(c, g, STREETS.stuc, GROUND - 28, 0.72, 9400);
  coveredWalkSide(c, END + 10, ROT, GROUND - 14, 0.78, 9401, true);
  mgnBlock(c, g, -40, END + 4, GROUND + 4, 20);
  lampHedge(c, g, lights, END + 6, ROT + 30, GROUND + 4, 9, 9402, HEDGE);
  // the paver path you walk on, and the kerb of the road beyond it
  hexPavers(c, 0, WIDTH, GROUND + 4, VIEW_H - GROUND - 4, 9403);

  // in front: the areca palms in their pots, the bins, the road's edge
  const p = 1.3;
  const [fc, f] = makeCanvas(layerWidth(WIDTH, p), VIEW_H);
  rect(f, 0, VIEW_H - 6, fc.width, 2, '#d8d3c6');
  rect(f, 0, VIEW_H - 4, fc.width, 4, '#77737a');
  const rand = rng(9404);
  for (let x = END + 70; x < ROT; x += 170 + rand() * 40) {
    if (CROSS.some((k) => Math.abs(k - x) < 50)) continue;
    if (rand() > 0.35) arecaPot(f, at(x, p), VIEW_H - 4, 9405 + Math.round(x), 1.5);
    else binRack(f, at(x, p) - 14, VIEW_H - 4, 1.4);
  }
  // the yellow zebra stripes where the crossings start
  for (const k of CROSS) for (let i = 0; i < 4; i++) rect(f, at(k, p) - 30 + i * 16, VIEW_H - 4, 10, 4, '#e6c33a');

  return {
    id: 'djnsw2',
    title: 'Sidewalk 2',
    subtitle: 'Sa gilid ng Main Building',
    width: WIDTH,
    walkY: WALK,
    bounds: [END + 14, WIDTH - 20],
    outdoor: true,
    layers: [farCity(WIDTH, 9410), djnBeyond(S, WIDTH, 0.55, GROUND - 92, 9411), { canvas, parallax: 1 }, { canvas: fc, parallax: p, front: true }],
    glow,
    lights,
    hotspots: djnLaneHotspots('djnsw2', { hedge: HEDGE, cross: CROSS, end: WIDTH - 26, mgn: END + 20 }),
    npcs: [],
    spawns: {
      plaza: { x: WIDTH - 34, facing: -1 },
      hedgeA: { x: HEDGE[0], facing: -1 },
      hedgeB: { x: HEDGE[1], facing: -1 },
      crossA: { x: CROSS[0], facing: 1 },
      crossB: { x: CROSS[1], facing: 1 },
    },
    update: ambience(9412, [END + 100, ROT - 100]),
  };
}

// --- sidewalk 1 on the PGN side ----------------------------------------------------------------------------

export function buildPgnSw1(): AreaDef {
  const S = STREETS.pgnsw1;
  const WIDTH = streetWidth(S);
  const lights: AreaLight[] = [];
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const ROT = laneX(S, U.rotunda);
  const END = laneX(S, U.pgnEnd);
  const HEDGE = [laneX(S, U.hedgeB), laneX(S, U.hedgeA)];
  const PODIUM_L = laneX(S, -135);
  const TOWER_L = laneX(S, -92);
  const FLOOR = GROUND + 2;
  const PODIUM_DOOR = Math.round((PODIUM_L + TOWER_L) / 2) - 40;
  const TOWER_DOOR = TOWER_L + 80;
  const STL_DOOR = laneX(S, -158);

  // STL's pavilion at the rotunda end, then the PGN podium, right behind the far row
  stlPavilion(c, g, -20, PODIUM_L - 4, FLOOR, FLOOR - 92);
  pgnPodium(c, g, PODIUM_L, TOWER_L, FLOOR, FLOOR - 104);
  pgnPodium(c, g, TOWER_L, END + 10, FLOOR, FLOOR - 120);
  // the glass doors, steps up to each with a yellow-edged bottom step
  for (const d of [STL_DOOR, PODIUM_DOOR, TOWER_DOOR]) {
    rect(c, d - 17, FLOOR - 44, 34, 44, '#f6f5f1');
    rect(c, d - 14, FLOOR - 40, 28, 32, '#3f4c5c');
    rect(c, d - 14, FLOOR - 40, 13, 32, '#536274');
    rect(c, d, FLOOR - 40, 1, 32, '#f6f5f1');
    rect(c, d - 3, FLOOR - 26, 2, 4, '#c9ccd1');
    rect(c, d + 2, FLOOR - 26, 2, 4, '#c9ccd1');
    rect(g, d - 13, FLOOR - 39, 26, 30, '#ffd98a');
    for (let i = 0; i < 4; i++) rect(c, d - 18 - i * 3, FLOOR - 8 + i * 2, 36 + i * 6, 2, i === 3 ? '#e2c13a' : '#c9c3b6');
  }
  rect(c, PODIUM_DOOR + 30, FLOOR - 20, 70, 20, '#f2f0ea');
  line(c, PODIUM_DOOR + 30, FLOOR - 26, PODIUM_DOOR + 100, FLOOR - 26, '#c9ccd1', 1);
  for (let x = PODIUM_DOOR + 32; x < PODIUM_DOOR + 100; x += 17) rect(c, x, FLOOR - 26, 1, 6, '#c9ccd1');
  // the far row of pillars, the benches along the building side
  const bay = 54;
  for (const x of pillarRow(ROT, END, bay, [STL_DOOR, PODIUM_DOOR, TOWER_DOOR])) {
    pillar(c, x, FLOOR - 74, FLOOR, 10);
    if (x + bay < END && ![STL_DOOR, PODIUM_DOOR, TOWER_DOOR].some((k) => k > x && k < x + bay)) graniteBench(c, x + 16, FLOOR + 2, bay - 22);
  }
  beigeTiles(c, 0, WIDTH, FLOOR, VIEW_H - FLOOR, 9501);
  for (let x = ROT + 120; x < END; x += 260) mosaicRug(c, x, FLOOR + 22, 34, 9);
  for (let x = ROT + 60; x < END; x += 150) lights.push({ x, y: 30, r: 70, color: [255, 236, 200], strength: 0.4, always: true });

  return {
    id: 'pgnsw1',
    title: 'Sidewalk 1',
    subtitle: 'Covered walk, sa gilid ng PGN',
    width: WIDTH,
    walkY: WALK,
    bounds: [16, END - 6],
    outdoor: true,
    layers: [farCity(WIDTH, 9510), pgnBeyond(S, WIDTH, 0.6, FLOOR - 100), { canvas, parallax: 1 }, underPergola(WIDTH, 1.25, pillarRow(ROT + 27, END, bay * 2, HEDGE))],
    glow,
    lights,
    hotspots: pgnSw1Hotspots({ rotunda: 22, hedge: HEDGE, stl: STL_DOOR, podium: PODIUM_DOOR, tower: TOWER_DOOR, end: END - 12 }),
    npcs: laneNpcs('pgnsw1', [PODIUM_L + 60, TOWER_L - 60]),
    spawns: {
      plaza: { x: 30, facing: 1 },
      hedgeA: { x: HEDGE[1], facing: 1 },
      hedgeB: { x: HEDGE[0], facing: 1 },
    },
    update: ambience(9512, []),
  };
}

