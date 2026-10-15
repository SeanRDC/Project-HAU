// The back hallway of the APS canteen, from photos 24 to 28 of
// `assets/APS WALK FROM CHAPEL LAWN/`. You come through from the front
// hallway on the left, past the backs of Yum-Yum's and Granny Jing's; the
// canteen has no walls, so the front hallway shows through beside the stalls.
// Along this side: the HAU Coop Canteen's own stall, then the back of the
// canteen open to the air over a low wall, under an old scalloped awning,
// with a stone pillar wearing a CLEAN AS YOU GO sign; then Rina's Food
// Station in the corner. Out the back, across the parking lot, is Building
// 18, Sacred Heart, with the covered walkway to it on the right. The gap in
// the low wall is the way out to it.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { line, rect, sign, signCentered, signWidth } from '../../engine/pix';
import { backAwning, building18Back, canteenTable, ceiling, coopStall, coveredWalk, hangingSign, rinas, stonePillar, throughView, tiledFloor } from '../art/canteen';
import { SILHOUETTE } from '../art/props';
import { car } from '../art/street';
import { canteenBackHotspots } from '../story/canteen';
import { AreaDef, AreaLight } from '../types';

const WIDTH = 760;
const FLOOR = 206;
const WALK = 238;
const CEIL = 46;

/** the way back through to the front hallway */
const EXIT_X = 24;
const COOP: [number, number] = [56, 150];
/** the open back of the canteen, between two pillars */
const OPEN_L = 236;
const OPEN_R = 576;
/** the gap in the low wall, down to the parking lot and across to Sacred Heart */
const GAP_X = 486;
const RINA: [number, number] = [592, 150];

const centre = ([x, w]: [number, number]): number => x + w / 2;

function build(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  // no walls: beside the stalls you see through to the front hallway and the bright patio beyond
  throughView(c, 0, OPEN_L, CEIL, FLOOR, 'front', 851);
  throughView(c, OPEN_R, WIDTH, CEIL, FLOOR, 'front', 852);
  lights.push({ x: EXIT_X, y: FLOOR - 40, r: 90, color: [255, 246, 226], strength: 0.5, daylight: true });

  // the open back: sky, Sacred Heart across the lot, cars parked in front of it, the covered walkway
  const lot = FLOOR - 30;
  rect(c, OPEN_L, CEIL, OPEN_R - OPEN_L, lot - CEIL, '#cfe0ea');
  building18Back(c, OPEN_L, OPEN_R, CEIL + 12, lot, 1801);
  coveredWalk(c, OPEN_R - 92, 86, lot);
  rect(c, OPEN_L, lot, OPEN_R - OPEN_L, FLOOR - lot, '#8f8c88');
  rect(c, OPEN_L, lot, OPEN_R - OPEN_L, 1, '#a9a6a0');
  for (const [cx, col, f] of [[OPEN_L + 40, '#c8342f', 1], [OPEN_L + 96, '#b9bcc4', -1], [OPEN_L + 150, '#2a2a30', 1], [OPEN_L + 206, '#e8e8e4', -1]] as const) {
    car(c, cx, lot + 10, col, f);
  }
  backAwning(c, OPEN_L, OPEN_R - OPEN_L, CEIL + 2);
  // the low concrete wall along the back, its steel rail, the gap down to the lot
  for (const [w0, w1] of [[OPEN_L, GAP_X - 16], [GAP_X + 16, OPEN_R]]) {
    rect(c, w0, FLOOR - 22, w1 - w0, 22, '#c9c6be');
    rect(c, w0, FLOOR - 22, w1 - w0, 1, '#e4e2dc');
    rect(c, w0, FLOOR - 4, w1 - w0, 4, '#b5b2aa');
    rect(c, w0, FLOOR - 30, w1 - w0, 1, '#8a8d95');
    for (let rx = w0 + 4; rx < w1; rx += 20) rect(c, rx, FLOOR - 30, 1, 8, '#8a8d95');
  }
  // the steps down through the gap
  for (let k = 0; k < 3; k++) rect(c, GAP_X - 16, FLOOR - 6 - k * 6, 32, 2, k ? '#b5b2aa' : '#d0cdc5');
  lights.push({ x: (OPEN_L + OPEN_R) / 2, y: FLOOR - 70, r: 220, color: [255, 246, 226], strength: 0.85, daylight: true });
  lights.push({ x: GAP_X, y: FLOOR + 20, r: 120, color: [255, 246, 226], strength: 0.6, daylight: true });

  // the stalls
  coopStall(c, g, COOP[0], COOP[1], FLOOR);
  rinas(c, g, RINA[0], RINA[1], FLOOR);
  for (const s of [COOP, RINA]) lights.push({ x: centre(s), y: FLOOR - 40, r: 64, color: [255, 226, 170], strength: 0.35 });

  // the pillars: stone to head height, white above; CLEAN AS YOU GO on the one in the middle
  for (const px0 of [OPEN_L, 404, OPEN_R]) {
    rect(c, px0 - 9, CEIL, 18, FLOOR - CEIL - 70, '#ecebe6');
    rect(c, px0 + 6, CEIL, 3, FLOOR - CEIL - 70, '#cfceca');
    stonePillar(c, px0 - 9, FLOOR, 18, 70);
  }
  rect(c, 404 - 16, FLOOR - 78, 32, 7, '#e8f0e0');
  rect(c, 404 - 15, FLOOR - 77, 30, 5, '#2f8a4a');
  signCentered(c, 'CLEAN', 404, FLOOR - 76, '#e8f8a0');

  // the 5 PESO DISCOUNT stand, leaning by the pillar
  const sx = 432;
  line(c, sx - 8, FLOOR - 4, sx - 4, FLOOR - 50, '#6a4a32', 2);
  line(c, sx + 12, FLOOR - 4, sx + 8, FLOOR - 50, '#6a4a32', 2);
  rect(c, sx - 8, FLOOR - 58, 22, 32, '#e4f2e4');
  rect(c, sx - 7, FLOOR - 57, 20, 30, '#cfe8d2');
  sign(c, '5', sx - 2, FLOOR - 54, '#2f7a4a', 2);
  sign(c, 'PESO', sx + 3 - signWidth('PESO') / 2, FLOOR - 41, '#2f7a4a');
  rect(c, sx - 5, FLOOR - 34, 16, 4, '#2f8a4a');

  // ceiling, downlights and the floor
  for (const lx of ceiling(c, g, 0, WIDTH, CEIL)) {
    lights.push({ x: lx, y: CEIL + 10, r: 60, color: [255, 236, 200], strength: 0.4 });
  }
  rect(c, OPEN_L - 9, CEIL - 3, OPEN_R - OPEN_L + 18, 3, '#e9e7e2');
  hangingSign(c, EXIT_X + 8, CEIL, 18, 'YUM-YUMS', '#f6efe2', '#2f4f9a');
  tiledFloor(c, 0, WIDTH, FLOOR, VIEW_H);

  // tables with their benches, blue and pink, across the floor
  for (const [tx, top] of [[150, '#2f5fb0'], [286, '#d0407a'], [372, '#2f5fb0'], [520, '#2f5fb0'], [690, '#d0407a']] as const) {
    canteenTable(c, tx, FLOOR + 22, top, 34, 16);
  }
  return { canvas, glow };
}

function frontLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(Math.ceil(WIDTH * 1.3), VIEW_H);
  // the edges of the nearest tables, out of focus
  for (let x = 160; x < canvas.width; x += 300) {
    rect(c, x, VIEW_H - 16, 70, 5, SILHOUETTE.mid);
    rect(c, x + 6, VIEW_H - 11, 3, 11, SILHOUETTE.dark);
    rect(c, x + 60, VIEW_H - 11, 3, 11, SILHOUETTE.dark);
  }
  return canvas;
}

export function buildCanteenBack(): AreaDef {
  const lights: AreaLight[] = [];
  const main = build(lights);

  return {
    id: 'canteenback',
    title: 'APS Canteen',
    subtitle: 'Sa likod, tanaw ang Sacred Heart',
    subtitleEn: 'Out back, looking over to Sacred Heart',
    width: WIDTH,
    walkY: WALK,
    bounds: [20, WIDTH - 20],
    outdoor: false,
    layers: [
      { canvas: main.canvas, parallax: 1 },
      { canvas: frontLayer(), parallax: 1.3, front: true },
    ],
    glow: main.glow,
    lights,
    hotspots: canteenBackHotspots({ front: EXIT_X, coop: centre(COOP), tables: 330, sh: GAP_X, rina: centre(RINA) }),
    npcs: [],
    spawns: {
      front: { x: EXIT_X + 16, facing: 1 },
    },
  };
}
