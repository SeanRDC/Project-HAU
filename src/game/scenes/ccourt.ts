// Inside the Covered Court beside the IH Gym, looking south-east across it
// at the steel bleachers along the gym side, the IH Gym's gable end showing
// beyond them through the open side. You walk its length: in from the gym lane
// at the right, across the basketball court, past the volleyball court with
// the badminton court beyond it, to the yellow gate of the AERO LABORATORY at
// the far end on the left. Drawn from the photos in
// `assets/images/buildings/covered court beside IH/` (art/ccourt.ts).

import { VIEW_H, VIEW_W, makeCanvas } from '../../engine/display';
import { rng } from '../../engine/math';
import { px, rect } from '../../engine/pix';
import {
  aeroGate, basketballFloor, ccBleachers, ccColumn, ccRoof, ladder, monobloc, paddedPost, redCourt, volleyNet,
} from '../art/ccourt';
import { gymGable } from '../art/ihgym';
import { P } from '../art/palette';
import { tree } from '../art/props';
import { ccourtHotspots, ccourtNpcs } from '../story/ccourt';
import { AreaDef, AreaLight, Layer } from '../types';

const WIDTH = 1120;
const WALK = 244;
/** the far eave, the top of the low wall along the open side, the far edge of the floor */
const EAVE = 92;
const WALL_TOP = 172;
const FLOOR = 190;
/** the portal frames, one every bay */
const BAY = 104;
/** the basketball court, end line to end line */
const BB_L = 560;
const BB_R = 1020;
/** the volleyball court nearest you, the badminton court beyond it */
const VB_L = 262;
const VB_R = 494;
/** the gate across the far end, and the way out at the front */
const GATE_R = 236;
const OUT_X = 1092;
const BLEACH_L = 600;
const BLEACH_R = 980;

const MID = 0.55;

/** Beyond the open side: the IH Gym's gable end, the trees along the lane, and the sky over them. */
function midLayer(): Layer {
  const w = Math.ceil(VIEW_W + (WIDTH - VIEW_W) * MID) + 4;
  const [canvas, c] = makeCanvas(w, VIEW_H);
  const rand = rng(5101);
  for (let x = -10; x < w; x += 30 + rand() * 30) tree(c, x, WALL_TOP + 4, 60 + rand() * 30, 20 + rand() * 8, 5110 + Math.round(x));
  // the gym's gable end, drawn whole on its own and set down smaller, behind the bleachers
  const [gym, gc] = makeCanvas(420, VIEW_H);
  const [, gg] = makeCanvas(420, VIEW_H);
  gymGable(gc, gg, 10, 410, VIEW_H - 4);
  const at = Math.round(VIEW_W / 2 + ((BLEACH_L + BLEACH_R) / 2 - VIEW_W / 2) * MID) - 130;
  c.imageSmoothingEnabled = false;
  c.drawImage(gym, 0, 0, 420, VIEW_H, at, WALL_TOP + 6 - VIEW_H * 0.62, 260, VIEW_H * 0.62);
  // a low cream building past the far end of the courts
  rect(c, 20, WALL_TOP - 40, 150, 46, '#e8e0c8');
  for (let x = 28; x < 162; x += 14) rect(c, x, WALL_TOP - 32, 8, 10, '#5e6a7c');
  rect(c, 0, WALL_TOP, w, VIEW_H - WALL_TOP, P.grassDark);
  return { canvas, parallax: MID, haze: 0.25 };
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement; door: number; vb: number } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const rand = rng(5102);

  ccRoof(c, 0, WIDTH, EAVE, BAY, 5103);
  for (let x = BAY / 2 + 40; x < WIDTH; x += BAY) lights.push({ x, y: EAVE * 0.5, r: 80, color: [255, 246, 226], strength: 0.45, always: true });
  // the open side: the far columns, the low concrete wall and its railing, the sky and the gym beyond left open
  for (let x = BAY / 2 + 22; x < WIDTH; x += BAY) ccColumn(c, x, EAVE + 15, FLOOR);
  rect(c, 0, WALL_TOP, WIDTH, FLOOR - WALL_TOP, '#c9c3b2');
  rect(c, 0, WALL_TOP, WIDTH, 2, '#e0dbcc');
  for (let i = 0; i < WIDTH; i++) if (rand() > 0.7) px(c, i, WALL_TOP + 3 + rand() * 14, '#b3ad9c');
  rect(c, 0, WALL_TOP - 14, WIDTH, 2, '#b7bcc2');
  for (let x = 4; x < WIDTH; x += 26) rect(c, x, WALL_TOP - 14, 2, 14, '#9aa0a6');

  // the far end on the left: the corner wall, then the yellow gate of the aero lab
  rect(c, 0, EAVE + 15, GATE_R + 10, FLOOR - EAVE - 15, '#d8d6cf');
  for (let x = 0; x < GATE_R + 10; x += 30) rect(c, x, EAVE + 15, 1, FLOOR - EAVE - 15, '#c3c1ba');
  const door = aeroGate(c, g, 20, GATE_R, FLOOR, 66);
  lights.push({ x: door, y: FLOOR - 20, r: 40, color: [255, 226, 170], strength: 0.4, always: true });

  // the bleachers along the gym side of the basketball court
  ccBleachers(c, BLEACH_L, BLEACH_R, FLOOR, 5);

  // the floor: smooth grey concrete everywhere else
  rect(c, 0, FLOOR, WIDTH, VIEW_H - FLOOR, '#a3a39e');
  for (let i = 0; i < WIDTH * 3; i++) px(c, rand() * WIDTH, FLOOR + rand() * (VIEW_H - FLOOR), rand() > 0.5 ? '#aeaea9' : '#979792');
  // stains and the painted lettering by the court, as in the photos
  for (let i = 0; i < 6; i++) {
    c.globalAlpha = 0.18;
    rect(c, rand() * WIDTH, FLOOR + 10 + rand() * 60, 12 + rand() * 20, 3, '#6d6b66');
    c.globalAlpha = 1;
  }

  // the badminton court beyond, then the volleyball court nearest you, its net and posts
  redCourt(c, VB_L + 16, VB_R - 16, FLOOR + 2, FLOOR + 14, 5104);
  const vb = redCourt(c, VB_L, VB_R, FLOOR + 22, VIEW_H, 5105);
  volleyNet(c, vb, FLOOR + 22, VIEW_H - 4);
  paddedPost(c, VB_L - 10, FLOOR + 18);
  paddedPost(c, VB_R + 14, FLOOR + 18, 40);
  ladder(c, vb + 22, FLOOR + 20);

  // the basketball court
  basketballFloor(c, BB_L, BB_R, FLOOR + 4, VIEW_H + 14, 5106);
  // its hoops, one at each end on a steel post
  for (const [hx, dir] of [[BB_L - 18, 1], [BB_R + 18, -1]] as const) {
    rect(c, hx - 2, FLOOR - 70, 4, 92, '#7d838a');
    rect(c, hx - 2, FLOOR - 70, 1, 92, '#b7bcc2');
    rect(c, hx + (dir > 0 ? 2 : -18), FLOOR - 74, 16, 12, '#f2f3f1');
    rect(c, hx + (dir > 0 ? 6 : -14), FLOOR - 68, 8, 5, '#2a2a30');
    rect(c, hx + (dir > 0 ? 6 : -14), FLOOR - 67, 8, 3, '#f2f3f1');
    rect(c, hx + (dir > 0 ? 18 : -26), FLOOR - 62, 8, 1, '#e0672c');
    for (let i = 0; i < 4; i++) px(c, hx + (dir > 0 ? 19 : -25) + i * 2, FLOOR - 61 + (i % 2), '#e9e9e4');
  }

  // monobloc chairs: a row by the volleyball court, stacks by the gate and the bleachers
  for (let x = VB_R + 30; x < BB_L - 30; x += 14) monobloc(c, x, FLOOR + 8);
  monobloc(c, GATE_R + 20, FLOOR + 4, 5);
  monobloc(c, GATE_R + 32, FLOOR + 4, 4);
  monobloc(c, BLEACH_R + 26, FLOOR + 4, 6);
  // a black speaker by the court
  rect(c, BB_L - 46, FLOOR + 2, 10, 14, '#1c1c20');
  rect(c, BB_L - 44, FLOOR + 5, 6, 6, '#2e2e34');
  // the front end on the right: the opening to the gym lane
  rect(c, OUT_X - 8, EAVE + 15, WIDTH - OUT_X + 8, 2, '#5e646c');
  return { canvas, glow, door, vb };
}

/** The near columns of the portal frames, between you and the courts, and the rafters coming down to them. */
function nearColumns(): Layer {
  const parallax = 1.18;
  const w = Math.ceil(VIEW_W + (WIDTH - VIEW_W) * parallax) + 4;
  const [canvas, c] = makeCanvas(w, VIEW_H);
  for (let x = 60; x < w; x += Math.round(BAY * parallax * 1.6)) {
    rect(c, x - 4, 0, 8, VIEW_H, '#6f757c');
    rect(c, x - 4, 0, 2, VIEW_H, '#9aa0a6');
    rect(c, x + 2, 0, 2, VIEW_H, '#4a5056');
  }
  return { canvas, parallax, front: true };
}

export function buildCCourt(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  return {
    id: 'ccourt',
    title: 'Covered Court',
    subtitle: 'Sa tabi ng IH Gym',
    width: WIDTH,
    walkY: WALK,
    bounds: [20, WIDTH - 16],
    outdoor: false,
    visitFlag: 'visited_ccourt',
    layers: [midLayer(), { canvas: main.canvas, parallax: 1 }, nearColumns()],
    glow: main.glow,
    lights,
    hotspots: ccourtHotspots({
      aero: main.door, volley: main.vb, seal: Math.round((BB_L + BB_R) / 2), bleachers: BLEACH_R - 70, side: BLEACH_R + 30, out: OUT_X,
    }),
    npcs: ccourtNpcs({ hoops: [BB_L + 40, BB_L + 170], volley: [VB_L + 20, VB_R - 20], bleachers: BLEACH_L + 200 }),
    spawns: {
      front: { x: OUT_X - 10, facing: -1 },
      aero: { x: main.door + 12, facing: 1 },
      side: { x: BLEACH_R + 30, facing: -1 },
    },
  };
}
