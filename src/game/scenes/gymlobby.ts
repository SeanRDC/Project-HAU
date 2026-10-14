// The lobby inside the Immaculate Heart Gymnasium's side entrance, under the
// second floor at the north-west end, looking south-east through the gates
// down the length of the court to the stage at the far end, as in `entering
// fron the left entrance, lobby of ih gym.jpg`. A low white ceiling on square
// columns, a worn concrete floor, the table tennis tables and the lift parked
// by the gates. The side entrance is behind you; the corridor from the front's
// left-hand door comes in on the right.

import { Ctx, VIEW_H, makeCanvas } from '../../engine/display';
import { rng } from '../../engine/math';
import { line, poly, px, rect, sign } from '../../engine/pix';
import { bins, foldingGrille, portableHoop, STRIPES } from '../art/ihgymin';
import { gymLobbyHotspots, gymLobbyNpcs } from '../story/ihgym';
import { AreaDef, AreaLight } from '../types';

const WIDTH = 540;
const WALK = 240;
const CEIL = 34;
/** the line of the columns and gates, where the floor meets the court beyond */
const GATES = 196;
/** the bays between the columns, left to right */
const COLUMNS = [52, 172, 292, 412];
const COL_W = 14;
const GATE_X = 352;
const SIDE_X = 236;
const CORRIDOR_X = 516;

/** The court beyond the gates, down its length to the stage: a picture in perspective. */
function vista(c: Ctx, g: Ctx, x0: number, x1: number, top: number, bottom: number): void {
  const vx = 300;
  const far = { l: 252, r: 348, t: 92, b: 150 };
  // the roof: panels in rows getting smaller towards the far end
  rect(c, x0, top, x1 - x0, bottom - top, '#a7aaad');
  const rand = rng(7401);
  for (let k = 0; k < 7; k++) {
    const t = k / 7;
    const y = top + (far.t - top) * t;
    const lx = x0 + (far.l - x0) * t;
    const rx = x1 + (far.r - x1) * t;
    const s = 1 - t * 0.8;
    for (let x = lx; x < rx; x += 22 * s + 4) {
      const cols = ['#c6303a', '#e2b53b', '#c9a873', '#8e8a85'];
      rect(c, x, y, 16 * s, Math.max(1, 5 * s), cols[Math.floor(rand() * 4)]);
    }
    rect(c, lx, y - 1, rx - lx, 1, '#5b616b');
  }
  // the far end: the stage wall with its windows and the banner
  rect(c, far.l, far.t, far.r - far.l, far.b - far.t, '#e6e2d8');
  for (const dx of [10, 38, 66]) {
    rect(c, far.l + dx, far.t + 6, 18, 12, '#f4f2e8');
    rect(g, far.l + dx, far.t + 6, 18, 12, '#ffe9b8');
  }
  rect(c, far.l + 34, far.t + 26, 28, 14, '#1a1a1e');
  rect(c, far.l + 4, far.b - 8, far.r - far.l - 8, 6, '#5a1a2a');
  sign(c, 'WELCOME ANGELITES', far.l + 15, far.b - 8, '#f2eeea');
  // the bleachers either side, rising to the roof, their rows running to the far end
  for (const side of [-1, 1]) {
    const nx = side < 0 ? x0 : x1;
    const fx = side < 0 ? far.l : far.r;
    poly(c, [[nx, top + 30], [fx, far.t + 4], [fx, far.b - 18], [nx, bottom - 30]], '#8a8274');
    for (let k = 1; k < 9; k++) {
      const t = k / 9;
      line(c, nx, top + 30 + (bottom - 60 - top) * t, fx, far.t + 4 + (far.b - 22 - far.t) * t, '#c8b896', 1);
    }
    // the striped wall under them
    poly(c, [[nx, bottom - 30], [fx, far.b - 18], [fx, far.b], [nx, bottom]], STRIPES[side < 0 ? 0 : 1]);
    line(c, nx, bottom - 18, fx, far.b - 10, STRIPES[side < 0 ? 1 : 2], 3);
  }
  // the floor: the court's red border and grey-blue middle, running to the far wall
  poly(c, [[x0, bottom], [x1, bottom], [far.r, far.b], [far.l, far.b]], '#b65a45');
  poly(c, [[x0 + 80, bottom], [x1 - 80, bottom], [vx + 30, far.b], [vx - 30, far.b]], '#a7b5bb');
  line(c, vx, far.b, vx, bottom, '#f2f2ee', 1);
  for (const k of [0.35, 0.7]) {
    const y = far.b + (bottom - far.b) * k;
    const half = 30 + (x1 - x0 - 160) * 0.5 * k;
    rect(c, vx - half, y, half * 2, 1, '#f2f2ee');
  }
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  vista(c, g, 30, 470, CEIL, GATES);
  // a portable hoop just through the gates, on its blue base
  portableHoop(c, 400, GATES + 2, -1, 0.75);

  // the low ceiling and its beams, the fluorescent tubes
  rect(c, 0, 0, WIDTH, CEIL, '#e9e8e3');
  rect(c, 0, CEIL - 6, WIDTH, 6, '#d9d8d2');
  rect(c, 0, CEIL, WIDTH, 1, '#a9a8a2');
  for (let x = 40; x < WIDTH; x += 120) {
    rect(c, x, 8, 26, 3, '#f8f8f4');
    rect(c, x, 11, 26, 1, '#9a9a96');
    rect(g, x, 8, 26, 4, '#fff6dc');
    lights.push({ x: x + 13, y: 16, r: 90, color: [240, 248, 255], strength: 0.6, always: true });
  }
  // the columns, and the wall at each end
  for (const cx of COLUMNS) {
    rect(c, cx, CEIL, COL_W, GATES - CEIL, '#ecebe6');
    rect(c, cx, CEIL, 3, GATES - CEIL, '#f8f8f4');
    rect(c, cx + COL_W - 3, CEIL, 3, GATES - CEIL, '#c9c8c2');
  }
  rect(c, 0, CEIL, 30, GATES - CEIL, '#dad8d0');
  rect(c, 470, CEIL, WIDTH - 470, GATES - CEIL, '#dad8d0');
  // the corridor from the front door comes in through the wall on the right
  rect(c, 492, 92, 40, GATES - 92, '#3a3a3e');
  rect(c, 496, 100, 32, GATES - 100, '#8c8a84');
  rect(c, 500, 108, 24, 30, '#e8e4d6');
  rect(g, 500, 108, 24, 30, '#fff1c8');
  // the gates across the bays, closed except the one by the hoop
  for (let i = 0; i + 1 < COLUMNS.length; i++) {
    const gx = COLUMNS[i] + COL_W;
    const gw = COLUMNS[i + 1] - gx;
    foldingGrille(c, gx, 140, gw, GATES - 140, gx < GATE_X && gx + gw > GATE_X ? 0.75 : 0);
  }
  foldingGrille(c, 30, 140, COLUMNS[0] - 30, GATES - 140, 0);
  foldingGrille(c, COLUMNS[3] + COL_W, 140, 470 - COLUMNS[3] - COL_W, GATES - 140, 0);

  // the floor: worn grey concrete, wet-looking, with chalk marks and an old painted hexagon
  const rand = rng(7402);
  rect(c, 0, GATES, WIDTH, VIEW_H - GATES, '#4f5258');
  for (let i = 0; i < WIDTH * 3; i++) px(c, rand() * WIDTH, GATES + rand() * (VIEW_H - GATES), rand() > 0.5 ? '#5d6067' : '#45484e');
  for (const cx of COLUMNS) {
    // the columns reflected in the wet shine of the floor, fading away
    for (let k = 0; k < 12; k++) {
      c.globalAlpha = 0.12 * (1 - k / 12);
      rect(c, cx + 2, GATES + 1 + k * 2, COL_W - 4, 2, '#ecebe6');
    }
    c.globalAlpha = 1;
  }
  line(c, 150, VIEW_H, 230, GATES + 10, '#c9cbcf', 1);
  line(c, 154, VIEW_H, 234, GATES + 10, '#9a9ca2', 1);
  for (const [hx, hy] of [[330, 236], [420, 256]] as const) {
    poly(c, [[hx - 14, hy], [hx - 7, hy - 6], [hx + 7, hy - 6], [hx + 14, hy], [hx + 7, hy + 6], [hx - 7, hy + 6]], '#5b5e65');
    line(c, hx - 14, hy, hx - 7, hy - 6, '#8a8d94', 1);
  }

  // parked by the gates: the red lift, the folded table tennis tables, the bins
  rect(c, 96, 136, 24, 52, '#c8343a');
  for (let y = 140; y < 186; y += 8) line(c, 98, y, 118, y + 8, '#8a1f25', 1);
  rect(c, 94, 186, 28, 10, '#a22a30');
  rect(c, 100, 128, 16, 8, '#d9d9d4');
  for (const [tx, tw] of [[126, 26], [150, 22]] as const) {
    poly(c, [[tx, GATES], [tx + 4, 170], [tx + tw, 168], [tx + tw - 2, GATES]], '#2a4a9a');
    sign(c, 'JOOLA', tx + 3, 180, '#f2f2ee');
  }
  bins(c, 300, GATES + 2);
  // stacked wooden benches in the corner on the left
  for (let i = 0; i < 4; i++) rect(c, 2, GATES - 8 - i * 6, 26, 4, i % 2 ? '#7a5838' : '#8f6a46');
  return { canvas, glow };
}

export function buildGymLobby(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  return {
    id: 'gymlobby',
    title: 'IH Gym Lobby',
    subtitle: 'Sa loob ng side entrance',
    width: WIDTH,
    walkY: WALK,
    bounds: [16, WIDTH - 16],
    outdoor: false,
    layers: [{ canvas: main.canvas, parallax: 1 }],
    glow: main.glow,
    lights,
    hotspots: gymLobbyHotspots({ side: SIDE_X, court: GATE_X, corridor: CORRIDOR_X, tables: 140 }),
    npcs: gymLobbyNpcs({ kid: 70 }),
    spawns: {
      side: { x: SIDE_X, facing: 1 },
      court: { x: GATE_X, facing: -1 },
      corridor: { x: CORRIDOR_X - 8, facing: -1 },
    },
  };
}
