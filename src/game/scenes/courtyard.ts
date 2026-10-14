// The inner courtyard of the Main Building, pieced together from
// `INSIDE DJN BUILDING.jpg` and `CLOSER VIEW INSIDE DJN.jpg` in `assets/images/other references/`:
// the old theatre front with LAUS DEO SEMPER between 1933 and 1953 under its
// garlands, three dark glass bays between mosaic columns, the stage in front
// of it with its curved terrazzo steps, a staircase up to the second-floor
// corridor on each side, the steel and glass roof overhead and the vines
// that hang from it.

import { Ctx, VIEW_H, VIEW_W, makeCanvas } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, ellipse, line, poly, px, rect, sign, signCentered } from '../../engine/pix';
import { P, shade } from '../art/palette';
import { SILHOUETTE, bush, foliage, pot, stoneBench, tree } from '../art/props';
import { courtyardHotspots, courtyardNpcs } from '../story/courtyard';
import { AreaDef, AreaLight } from '../types';

const WIDTH = 880;
const GROUND = 204;
const WALK = 240;
const ARCH_X = 450;
const DOOR_X = 44;
const CHAIR_X = 318;
const GATE_X = 846;
const TREES = [118, 774];

/** the theatre front is this wide, and the stage floor this far above the tiles */
const FRONT_W = 304;
const STAGE_RISE = 10;
const STAGE = GROUND - STAGE_RISE;
/** the second-floor corridor the two staircases climb to */
const UPPER = GROUND - 62;
/** steel columns wrapped in vines, either side of the stage */
const COLUMNS = [ARCH_X - FRONT_W / 2 - 14, ARCH_X + FRONT_W / 2 + 14];
const SPOTS = [200, 330, 450, 570, 700];

const WALL = '#f1e6c4';
const WALL_LIT = '#faf2d8';
const WALL_SHADE = '#d6c89c';
const TERRAZZO = '#b3aea6';
const TERRAZZO_HI = '#d2cec6';
const TERRAZZO_LO = '#8b867f';
const GARLAND = '#55683c';
const GARLAND_LO = '#3b4a2a';
const INK = '#3a2f2a';

function layerWidth(parallax: number): number {
  return Math.ceil(VIEW_W + (WIDTH - VIEW_W) * parallax) + 4;
}

/** The two-storey wings wrapped round the courtyard: an open corridor upstairs under a grey metal roof. */
function backLayer(): HTMLCanvasElement {
  const w = layerWidth(0.6);
  const [canvas, c] = makeCanvas(w, VIEW_H);
  const rand = rng(17);
  const top = GROUND - 116;
  rect(c, 0, top, w, GROUND - top, WALL);
  // roof edge
  rect(c, 0, top - 12, w, 12, '#9aa0a6');
  for (let x = 0; x < w; x += 3) rect(c, x, top - 12, 1, 12, '#858b92');
  rect(c, 0, top - 13, w, 1, '#c3c8cd');
  rect(c, 0, top, w, 2, '#6f757c');
  // upstairs corridor: doors and louvred windows at the back, in shade
  rect(c, 0, top + 6, w, 36, '#8f8672');
  for (let x = 10; x < w; x += 46) {
    rect(c, x, top + 12, 13, 30, '#3c4a5e');
    rect(c, x + 1, top + 14, 11, 9, rand() > 0.5 ? '#55657c' : '#4a5a70');
    rect(c, x + 20, top + 10, 20, 9, '#4a4438');
    for (let ly = top + 11; ly < top + 19; ly += 2) rect(c, x + 20, ly, 20, 1, '#6b6454');
  }
  for (let x = 0; x < w; x += 92) {
    rect(c, x, top + 2, 5, 52, WALL_LIT);
    rect(c, x + 4, top + 2, 1, 52, WALL_SHADE);
  }
  // its rail and the slab under it
  rect(c, 0, top + 34, w, 1, '#e9edf0');
  for (let x = 2; x < w; x += 4) rect(c, x, top + 35, 1, 11, '#c9ced3');
  rect(c, 0, top + 46, w, 8, WALL_LIT);
  rect(c, 0, top + 54, w, 2, WALL_SHADE);
  // downstairs: a plain wall with doors
  rect(c, 0, top + 56, w, GROUND - top - 56, '#e6d9b2');
  for (let x = 30; x < w; x += 92) {
    rect(c, x, GROUND - 40, 18, 40, '#5a4a3c');
    rect(c, x + 2, GROUND - 38, 14, 16, '#7a6a58');
    rect(c, x + 28, GROUND - 44, 30, 14, '#4a4438');
    for (let ly = GROUND - 43; ly < GROUND - 31; ly += 2) rect(c, x + 28, ly, 30, 1, '#6b6454');
  }
  rect(c, 0, GROUND - 6, w, 6, '#b88a70');
  return canvas;
}

/** A dark glass bay with a flattened arch for a head. */
function bay(c: Ctx, g: Ctx, x: number, w: number, top: number, bottom: number, fill: string): void {
  const r = 13;
  rect(c, x, top + r, w, bottom - top - r, fill);
  ellipse(c, x + w / 2, top + r, w / 2 - 0.5, r, fill);
  // the glazing bars, faint
  for (let gx = x + 12; gx < x + w - 6; gx += 14) rect(c, gx, top + 4, 1, bottom - top - 4, shade(fill, 0.12));
  for (let gy = top + 22; gy < bottom - 4; gy += 16) rect(c, x + 2, gy, w - 4, 1, shade(fill, 0.12));
  // things glinting inside
  rect(g, x + 8, bottom - 30, w - 16, 26, '#4a3418');
}

/** A column with a pale mosaic shaft and a scrolled capital. */
function column(c: Ctx, cx: number, top: number, bottom: number): void {
  const rand = rng(cx);
  rect(c, cx - 4, top + 6, 8, bottom - top - 9, '#c9c6c0');
  for (let i = 0; i < 70; i++) px(c, cx - 4 + rand() * 8, top + 6 + rand() * (bottom - top - 9), rand() > 0.5 ? '#e4e2de' : '#a9a6a0');
  rect(c, cx + 2, top + 6, 2, bottom - top - 9, '#a9a6a0');
  rect(c, cx - 6, top, 12, 2, '#3a3038');
  rect(c, cx - 7, top + 2, 14, 4, WALL_LIT);
  disc(c, cx - 6, top + 5, 2, WALL_SHADE);
  disc(c, cx + 6, top + 5, 2, WALL_SHADE);
  rect(c, cx - 5, bottom - 3, 10, 3, '#a9a6a0');
}

/** The old theatre front. `x` is its middle; it stands on the stage. */
function theatreFront(c: Ctx, g: Ctx, x: number): void {
  const w = FRONT_W;
  const left = x - w / 2;
  const bayTop = STAGE - 68;
  const top = bayTop - 60;

  rect(c, left, top, w, STAGE - top, WALL);
  rect(c, left, top, w, 16, WALL_LIT);
  rect(c, left + w - 10, top, 10, STAGE - top, WALL_SHADE);
  // parapet line along the top
  rect(c, left - 3, top - 4, w + 6, 4, WALL_LIT);
  rect(c, left - 3, top, w + 6, 1, WALL_SHADE);

  // the garlands: three swags hung from four rosettes, a tassel under each
  const hang = [left + 22, x - 62, x + 62, left + w - 22];
  const gy = top + 12;
  for (let i = 0; i + 1 < hang.length; i++) {
    const a = hang[i];
    const b = hang[i + 1];
    const sag = i === 1 ? 9 : 13;
    for (let sx = a; sx <= b; sx++) {
      const k = (sx - a) / (b - a);
      const y = gy + Math.sin(k * Math.PI) * sag;
      rect(c, sx, y, 1, 3, sx % 3 ? GARLAND : GARLAND_LO);
      px(c, sx, y + 3, GARLAND_LO);
    }
  }
  for (const hx of hang) {
    rect(c, hx - 1, gy, 3, 14, GARLAND);
    rect(c, hx - 1, gy + 12, 3, 3, GARLAND_LO);
    px(c, hx, gy + 15, GARLAND_LO);
    disc(c, hx, gy, 2.5, GARLAND_LO);
    px(c, hx, gy, '#8a9a5c');
  }
  // the motto between the two years
  signCentered(c, 'LAUS DEO SEMPER', x, top + 30, INK, 2);
  sign(c, '1933', left + 30, top + 42, INK);
  sign(c, '1953', left + w - 45, top + 42, INK);

  // cornice with its row of dentils
  rect(c, left - 4, bayTop - 11, w + 8, 3, WALL_LIT);
  rect(c, left - 2, bayTop - 8, w + 4, 2, WALL_SHADE);
  for (let i = left; i < left + w; i += 3) rect(c, i, bayTop - 6, 2, 2, WALL_LIT);
  rect(c, left, bayTop - 4, w, 4, WALL);
  rect(c, left, bayTop - 1, w, 1, WALL_SHADE);

  // three bays of dark glass between the columns
  const pier = 12;
  const bayW = (w - pier * 4) / 3;
  for (let i = 0; i < 3; i++) {
    const bx = Math.round(left + pier + i * (bayW + pier));
    bay(c, g, bx, Math.round(bayW), bayTop + 4, STAGE, i === 2 ? '#2a2026' : '#22252b');
    if (i === 2) {
      // the red curtain drawn across the last bay
      rect(c, bx + 6, bayTop + 22, Math.round(bayW) - 12, STAGE - bayTop - 22, '#8a2a30');
      for (let fx = bx + 9; fx < bx + bayW - 8; fx += 5) rect(c, fx, bayTop + 22, 1, STAGE - bayTop - 22, '#6c1f26');
      rect(c, bx + 6, bayTop + 22, Math.round(bayW) - 12, 2, '#a8404a');
    }
  }
  // the doorway in the middle bay: a dark carved surround and lit glass doors
  rect(c, x - 17, STAGE - 44, 34, 44, '#3a3038');
  disc(c, x, STAGE - 44, 17, '#3a3038');
  rect(c, x - 21, STAGE - 34, 5, 34, '#6b6470');
  rect(c, x + 16, STAGE - 34, 5, 34, '#6b6470');
  rect(c, x - 12, STAGE - 34, 24, 34, '#5a7a8a');
  rect(c, x - 12, STAGE - 34, 24, 2, '#8fb0c0');
  rect(c, x, STAGE - 34, 1, 34, '#2a2a32');
  rect(c, x - 11, STAGE - 50, 22, 5, '#55505c');
  rect(g, x - 12, STAGE - 34, 24, 34, '#ffd98a');
  for (let i = 0; i < 4; i++) column(c, Math.round(left + pier / 2 + i * (bayW + pier)), bayTop + 4, STAGE);
  // potted palms on the stage, either side of the door
  pot(c, x - 34, STAGE + 1, 61);
  pot(c, x + 36, STAGE + 1, 62);
}

/** The stage and its steps: wide arcs of terrazzo, a small light let into each riser. */
function stage(c: Ctx, g: Ctx, x: number): void {
  const half = FRONT_W / 2 + 6;
  const steps = 4;
  for (let i = steps; i >= 0; i--) {
    const cy = STAGE + 2 + i * 4;
    const rx = half + 26 + i * 13;
    const ry = 9 + i * 2;
    ellipse(c, x, cy + 3, rx, ry, TERRAZZO_LO);
    ellipse(c, x, cy, rx, ry, i % 2 ? TERRAZZO : shade(TERRAZZO, 0.08));
    ellipse(c, x - 10, cy - 1, rx - 6, ry - 2, TERRAZZO_HI);
    ellipse(c, x, cy, rx - 3, ry - 1.5, i % 2 ? TERRAZZO : shade(TERRAZZO, 0.08));
    for (let a = 0.35; a < Math.PI - 0.3; a += 0.3) {
      const lx = x + Math.cos(a) * rx;
      const ly = cy + Math.sin(a) * ry + 1;
      rect(c, lx, ly, 2, 2, '#e9e6de');
      rect(g, lx, ly, 2, 2, '#fff1c8');
    }
  }
  // the stage floor itself, with the dark ring set into it
  rect(c, x - half, STAGE, half * 2, 3, TERRAZZO_HI);
  ellipse(c, x, STAGE + 7, 86, 5, '#8f8a84');
  ellipse(c, x, STAGE + 7, 80, 4, shade(TERRAZZO, 0.08));
}

/** A straight flight from the tiles up to the second floor. `dir` 1 climbs to the right. */
function stair(c: Ctx, foot: number, head: number): void {
  const dir = head > foot ? 1 : -1;
  const run = Math.abs(head - foot);
  // the wall under the flight, with an arch through it
  poly(c, [[foot, GROUND], [head, UPPER], [head, GROUND]], WALL);
  const ax = head - dir * 26;
  rect(c, ax - 12, GROUND - 26, 24, 26, '#6b5f52');
  disc(c, ax, GROUND - 26, 12, '#6b5f52');
  rect(c, ax - 9, GROUND - 22, 18, 22, '#8a7c68');
  // the string along the flight and the treads on top of it
  for (let i = 0; i < run; i += 6) {
    const sx = foot + dir * i;
    const sy = GROUND - ((i + 6) / run) * (GROUND - UPPER);
    rect(c, Math.min(sx, sx + dir * 6), sy, 6, 2, TERRAZZO_HI);
    rect(c, Math.min(sx, sx + dir * 6), sy + 2, 6, 5, WALL_LIT);
  }
  line(c, foot, GROUND - 1, head, UPPER - 1, WALL_SHADE, 1);
  // iron rail
  line(c, foot, GROUND - 16, head, UPPER - 16, P.iron, 1);
  for (let i = 0; i <= run; i += 5) {
    const sx = foot + dir * i;
    const sy = GROUND - (i / run) * (GROUND - UPPER);
    rect(c, sx, sy - 16, 1, 15, i % 15 ? P.ironHi : P.iron);
  }
}

/** The landing a staircase arrives at, running in to the theatre wall. */
function landing(c: Ctx, from: number, to: number): void {
  const x = Math.min(from, to);
  const w = Math.abs(to - from);
  rect(c, x, UPPER, w, 6, WALL_LIT);
  rect(c, x, UPPER + 6, w, 2, WALL_SHADE);
  rect(c, x, UPPER + 8, w, GROUND - UPPER - 8, '#cbbd92');
  rect(c, x, UPPER - 16, w, 1, P.iron);
  for (let rx = x; rx < x + w; rx += 4) rect(c, rx, UPPER - 16, 1, 16, P.ironHi);
  // a doorway in shade under it
  rect(c, x + 6, GROUND - 40, w - 12, 40, '#5f5548');
}

/** A steel lattice column. The vines are hung on it afterwards. */
function latticeColumn(c: Ctx, x: number, top: number): void {
  rect(c, x - 4, top, 1, GROUND - top, '#dfe2e4');
  rect(c, x + 4, top, 1, GROUND - top, '#b9bdc2');
  for (let y = top; y < GROUND - 6; y += 8) {
    line(c, x - 4, y, x + 4, y + 8, '#c9cdd1', 1);
    line(c, x + 4, y, x - 4, y + 8, '#c9cdd1', 1);
  }
  rect(c, x - 6, GROUND - 4, 13, 4, '#9a9ea4');
}

/** A curtain of creeper hanging from the roof, thick at the top and ragged at the bottom. */
function vines(c: Ctx, x: number, top: number, w: number, drop: number, seed: number): void {
  const rand = rng(seed);
  for (let sx = x - w / 2; sx < x + w / 2; sx += 2) {
    const edge = 1 - Math.abs(sx - x) / (w / 2);
    const len = drop * (0.45 + rand() * 0.55) * (0.6 + edge * 0.4);
    for (let y = top; y < top + len; y += 2) {
      const r = rand();
      if (r < 0.14) continue;
      const tone = r > 0.82 ? P.leafHi : r > 0.55 ? P.leafLit : r > 0.3 ? P.leaf : P.leafDark;
      rect(c, sx + (rand() - 0.5) * 2, y, 2, 2, tone);
    }
  }
}

/** The steel space frame and glass overhead. Mostly empty so the sky shows through. */
function glassRoof(c: Ctx, g: Ctx): void {
  const steel = 'rgba(244,246,248,0.9)';
  const thin = 'rgba(244,246,248,0.5)';
  const pane = 'rgba(190,215,235,0.16)';
  rect(c, 0, 0, WIDTH, 30, pane);
  // purlins and the glazing bars between them
  for (const y of [3, 12, 21, 30]) rect(c, 0, y, WIDTH, 1, thin);
  for (let x = 0; x < WIDTH; x += 11) rect(c, x, 0, 1, 30, 'rgba(244,246,248,0.22)');
  // the trusses: two chords with zigzag webbing, one every bay
  for (let x = 36; x < WIDTH; x += 104) {
    rect(c, x - 1, 0, 2, 40, steel);
    for (let y = 0; y < 36; y += 9) line(c, x - 9, y, x + 9, y + 9, thin, 1);
  }
  rect(c, 0, 30, WIDTH, 2, steel);
  rect(c, 0, 40, WIDTH, 1, steel);
  for (let x = 0; x < WIDTH; x += 20) {
    line(c, x, 40, x + 10, 31, thin, 1);
    line(c, x + 10, 31, x + 20, 40, thin, 1);
  }
  // spotlights clamped to the bottom chord
  for (const x of SPOTS) {
    rect(c, x - 2, 41, 5, 4, '#3a3d44');
    rect(c, x - 1, 45, 3, 1, '#f4f2ec');
    rect(g, x - 2, 44, 5, 3, P.lamp);
  }
}

function floor(c: Ctx): void {
  const rand = rng(202);
  const pink = '#d99a86';
  const pinkLo = '#c4826e';
  rect(c, 0, GROUND, WIDTH, VIEW_H - GROUND, pink);
  rect(c, 0, GROUND, WIDTH, 6, shade(pink, 0.18));
  rect(c, 0, GROUND + 46, WIDTH, 20, shade(pink, -0.1));
  // square tiles, closer together towards the back
  for (const y of [GROUND + 5, GROUND + 12, GROUND + 22, GROUND + 35, GROUND + 52]) rect(c, 0, y, WIDTH, 1, pinkLo);
  for (let x = -260; x < WIDTH + 260; x += 18) line(c, x, GROUND, x + (x - WIDTH / 2) * 0.3, VIEW_H, pinkLo, 1);
  for (let i = 0; i < 1200; i++) px(c, rand() * WIDTH, GROUND + rand() * (VIEW_H - GROUND), rand() > 0.5 ? shade(pink, 0.16) : pinkLo);
  // the grey bands that frame the tiles, and the big ring in front of the stage
  const grey = '#9d9892';
  rect(c, 0, GROUND + 28, WIDTH, 5, grey);
  rect(c, 0, GROUND + 28, WIDTH, 1, shade(grey, 0.25));
  for (const x of [ARCH_X - 250, ARCH_X + 250]) poly(c, [[x - 4, GROUND], [x + 4, GROUND], [x + 4 + (x - WIDTH / 2) * 0.3, VIEW_H], [x - 6 + (x - WIDTH / 2) * 0.3, VIEW_H]], grey);
  ellipse(c, ARCH_X, GROUND + 58, 150, 15, grey);
  ellipse(c, ARCH_X, GROUND + 58, 144, 13, pink);
  ellipse(c, ARCH_X, GROUND + 58, 96, 8, shade(pink, 0.12));
}

function planter(c: Ctx, x: number, w: number): void {
  const y = GROUND + 12;
  rect(c, x - w / 2, y - 12, w, 12, P.terracotta);
  rect(c, x - w / 2, y - 14, w, 3, P.terracottaHi);
  rect(c, x - w / 2, y - 2, w, 2, P.terracottaDark);
  for (let bx = x - w / 2; bx < x + w / 2; bx += 8) {
    rect(c, bx, y - 11, 1, 4, P.terracottaDark);
    rect(c, bx + 4, y - 6, 1, 4, P.terracottaDark);
  }
  rect(c, x - w / 2, y - 7, w, 1, P.terracottaDark);
  rect(c, x - w / 2 + 2, y - 16, w - 4, 2, '#4b3a2c');
}

function monobloc(c: Ctx, x: number, base: number): void {
  const white = '#f4f2ec';
  const grey = '#cfccc4';
  rect(c, x - 5, base - 8, 11, 2, white);
  rect(c, x - 5, base - 6, 1, 6, grey);
  rect(c, x + 5, base - 6, 1, 6, grey);
  rect(c, x - 3, base - 6, 1, 5, grey);
  rect(c, x + 3, base - 6, 1, 5, grey);
  rect(c, x - 5, base - 19, 2, 11, white);
  rect(c, x - 5, base - 19, 9, 2, white);
  rect(c, x - 3, base - 16, 6, 1, grey);
  rect(c, x - 3, base - 13, 6, 1, grey);
  rect(c, x + 4, base - 12, 2, 1, white);
}

/** A loudspeaker on the landing, the kind left out for programmes on the stage. */
function speaker(c: Ctx, x: number, base: number): void {
  rect(c, x - 5, base - 14, 10, 14, '#1f1f25');
  rect(c, x - 5, base - 14, 10, 1, '#45454f');
  disc(c, x, base - 5, 3, '#34343c');
  disc(c, x, base - 11, 1.5, '#34343c');
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const half = FRONT_W / 2;

  glassRoof(c, g);
  floor(c);

  // wall and doorway back into the lobby
  rect(c, 0, 44, 86, GROUND - 44, P.wall);
  rect(c, 78, 44, 8, GROUND - 44, P.wallShade);
  rect(c, 0, 41, 90, 4, P.trim);
  rect(c, DOOR_X - 24, GROUND - 82, 48, 82, P.trim);
  disc(c, DOOR_X, GROUND - 82, 24, P.trim);
  rect(c, DOOR_X - 20, GROUND - 82, 40, 82, '#4a3a36');
  disc(c, DOOR_X, GROUND - 82, 20, '#4a3a36');
  rect(c, DOOR_X - 20, GROUND - 60, 40, 60, '#6a5244');
  rect(c, DOOR_X - 20, GROUND - 6, 40, 6, P.marble);
  rect(g, DOOR_X - 20, GROUND - 82, 40, 82, '#d99a4a');
  lights.push({ x: DOOR_X, y: GROUND - 30, r: 90, color: [255, 208, 140], strength: 0.9 });

  // iron gate at the far end
  rect(c, GATE_X - 30, 60, 4, GROUND - 60, P.wallShade);
  for (let x = GATE_X - 24; x < WIDTH; x += 5) rect(c, x, GROUND - 96, 1, 96, P.iron);
  rect(c, GATE_X - 26, GROUND - 96, WIDTH - GATE_X + 26, 2, P.iron);
  rect(c, GATE_X - 26, GROUND - 50, WIDTH - GATE_X + 26, 2, P.iron);
  rect(c, GATE_X - 4, GROUND - 56, 8, 10, P.ironHi);

  // the two old trees left at the ends of the courtyard
  for (const [i, x] of TREES.entries()) {
    planter(c, x, 58);
    tree(c, x, GROUND - 2, 126 + i * 12, 40, 800 + i * 7);
    bush(c, x - 18, GROUND, 18, 11, 810 + i);
    bush(c, x + 20, GROUND, 16, 10, 820 + i);
  }

  // a staircase and its landing on each side of the theatre front
  landing(c, ARCH_X - half - 44, ARCH_X - half);
  landing(c, ARCH_X + half, ARCH_X + half + 44);
  stair(c, ARCH_X - half - 148, ARCH_X - half - 44);
  stair(c, ARCH_X + half + 148, ARCH_X + half + 44);
  speaker(c, ARCH_X + half + 30, UPPER);
  speaker(c, ARCH_X + half + 40, GROUND);

  theatreFront(c, g, ARCH_X);
  stage(c, g, ARCH_X);

  // the vine-clad columns and the creepers hanging between the trusses
  for (const [i, x] of COLUMNS.entries()) {
    latticeColumn(c, x, 40);
    vines(c, x, 40, 22, 120, 830 + i);
  }
  for (const [i, [x, w, drop]] of ([[196, 46, 62], [262, 30, 84], [644, 34, 96], [716, 50, 58], [560, 26, 34], [352, 24, 30]] as const).entries()) {
    vines(c, x, 40, w, drop, 840 + i);
  }

  stoneBench(c, 196, GROUND + 14, 34);
  stoneBench(c, 664, GROUND + 14, 34);
  monobloc(c, CHAIR_X, GROUND + 34);
  pot(c, 94, GROUND + 8, 71);
  pot(c, ARCH_X - half - 52, GROUND + 8, 72);
  pot(c, ARCH_X + half + 58, GROUND + 8, 73);
  pot(c, ARCH_X + half + 152, GROUND + 6, 74);

  // the spotlights on the roof truss light the stage and the tiles after dark
  for (const x of SPOTS) {
    lights.push({ x, y: 60, r: 100, color: [255, 236, 200], strength: 0.55 });
    lights.push({ x, y: GROUND + 10, r: 96, color: [255, 226, 176], strength: 0.75 });
  }
  lights.push({ x: ARCH_X, y: STAGE - 20, r: 70, color: [255, 214, 150], strength: 0.8 });
  return { canvas, glow };
}

function frontLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(layerWidth(1.35), VIEW_H);
  const rand = rng(303);
  for (let x = 120; x < canvas.width; x += 300 + rand() * 180) {
    if (rand() > 0.5) {
      foliage(c, x, -14, 70, 18, 600 + x, SILHOUETTE);
    } else {
      bush(c, x, VIEW_H + 36, 130, 52, 602 + x, SILHOUETTE);
    }
  }
  return canvas;
}

export function buildCourtyard(): AreaDef {
  const lights: AreaLight[] = [];
  const back = backLayer();
  const main = mainLayer(lights);
  const rand = rng(909);
  /** where leaves come from: the two trees and the vines round the stage */
  const sources = [...TREES, ...COLUMNS, 196, 716];
  let leaf = 0;
  let fly = 0;

  return {
    id: 'courtyard',
    title: 'DJN Courtyard',
    subtitle: 'Laus Deo Semper',
    width: WIDTH,
    walkY: WALK,
    bounds: [30, WIDTH - 50],
    outdoor: true,
    layers: [
      { canvas: back, parallax: 0.6, haze: 0.22 },
      { canvas: main.canvas, parallax: 1 },
      { canvas: frontLayer(), parallax: 1.35, front: true },
    ],
    glow: main.glow,
    lights,
    hotspots: courtyardHotspots({ door: DOOR_X, arch: ARCH_X, chair: CHAIR_X, gate: GATE_X }),
    npcs: courtyardNpcs(),
    spawns: {
      lobby: { x: DOOR_X + 6, facing: 1 },
      gate: { x: GATE_X - 24, facing: -1 },
    },

    update(dt, area, view) {
      leaf -= dt;
      if (leaf <= 0) {
        leaf = 0.5 + rand() * 0.8;
        const from = sources[Math.floor(rand() * sources.length)];
        area.spawnParticle({
          x: from + (rand() - 0.5) * 50,
          y: 80 + rand() * 40,
          vx: 4 + rand() * 7,
          vy: 8 + rand() * 6,
          sway: 15,
          max: 11,
          floor: GROUND + 10 + rand() * 46,
          color: rand() > 0.6 ? '#d9b048' : rand() > 0.5 ? '#9cc65e' : '#c98a3c',
        });
      }
      if (view.mood.night > 0.55) {
        fly -= dt;
        if (fly <= 0) {
          fly = 0.25;
          area.spawnParticle({
            x: view.camX + rand() * VIEW_W,
            y: 130 + rand() * 80,
            vx: (rand() - 0.5) * 8,
            vy: -2 - rand() * 4,
            sway: 14,
            max: 4 + rand() * 3,
            color: '#e9ff9a',
            glow: true,
          });
        }
      }
    },
  };
}
