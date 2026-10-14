// Inside the APS canteen, from the photos of it: the open side on the left
// where you came in up the steps, under the scalloped awning; white floor
// tiles; a black ceiling with white dropped panels, downlights and grey dome
// lamps; square pillars faced in stacked stone to head height; and the stalls
// in a row. Tables with benches fixed to them fill the floor. The canteen has
// no walls: the stalls stand back to back in the open, so behind them you see
// straight through the back hallway to Sacred Heart. This is the front
// hallway. Between Granny Jing's and Byfrost the open floor leads through to
// the back hallway (scenes/canteenback.ts), where Rina's and the HAU Coop's
// own stall are, and out to Sacred Heart.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { rng } from '../../engine/math';
import { rect, signCentered } from '../../engine/pix';
import { byfrost, canteenTable, ceiling, domeLamp, grannyJings, hangingSign, scallops, stock, stonePillar, throughView, tiledFloor, yumYums } from '../art/canteen';
import { SILHOUETTE, bush, foliage, palm } from '../art/props';
import { canteenHotspots } from '../story/canteen';
import { AreaDef, AreaLight } from '../types';

const WIDTH = 760;
const FLOOR = 206;
const WALK = 238;
/** where the ceiling panels end and the wall begins */
const CEIL = 46;

const EXIT_X = 32;
const PILLARS = [68, 226, 366, 594, 730];
const STALLS = {
  yum: [86, 120],
  granny: [244, 108],
  byfrost: [612, 110],
} as const;
const STOCK_X = 384;
/** the passage through to the back hallway, where Rina's stall used to be drawn */
const BACK_X = 530;

const centre = ([x, w]: readonly [number, number]): number => x + w / 2;

function build(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  // no back wall: behind the stalls you see straight through to the back hallway and out to Sacred Heart;
  // the open side to the left, where you came in, with daylight coming in
  throughView(c, PILLARS[0], WIDTH, CEIL, FLOOR, 'back', 841);
  rect(c, 0, CEIL, PILLARS[0], FLOOR - CEIL, '#f3efe2');
  foliage(c, 22, FLOOR - 40, 22, 26, 811);
  palm(c, 40, FLOOR - 6, 52, 812);
  rect(c, 0, FLOOR - 10, PILLARS[0], 1, '#26242a');
  for (let rx = 2; rx < PILLARS[0]; rx += 6) rect(c, rx, FLOOR - 10, 1, 10, '#26242a');
  scallops(c, 0, CEIL, PILLARS[0] + 4);
  lights.push({ x: EXIT_X, y: FLOOR - 40, r: 130, color: [255, 244, 220], strength: 0.8, daylight: true });
  lights.push({ x: EXIT_X + 40, y: FLOOR + 20, r: 100, color: [255, 244, 220], strength: 0.6, daylight: true });

  tiledFloor(c, 0, WIDTH, FLOOR, VIEW_H);

  // the stalls
  yumYums(c, g, STALLS.yum[0], STALLS.yum[1], FLOOR);
  grannyJings(c, g, STALLS.granny[0], STALLS.granny[1], FLOOR);
  // the way through to the back hallway is just the open floor between the stalls, with a sign over it
  lights.push({ x: BACK_X, y: FLOOR - 50, r: 70, color: [255, 246, 226], strength: 0.5, daylight: true });
  byfrost(c, g, STALLS.byfrost[0], STALLS.byfrost[1], FLOOR);
  for (const s of Object.values(STALLS)) lights.push({ x: centre(s), y: FLOOR - 34, r: 60, color: [255, 226, 170], strength: 0.35 });

  // the co-op's own sign by the way in, and stock waiting by a pillar
  rect(c, 92, CEIL + 6, 104, 13, '#f2d66b');
  rect(c, 92, CEIL + 6, 104, 1, '#fff2a8');
  signCentered(c, 'HAU COOP CANTEEN', 144, CEIL + 10, '#c8342f');
  stock(c, STOCK_X, FLOOR);

  // pillars: stone to head height, white above
  for (const px0 of PILLARS) {
    rect(c, px0 - 8, CEIL, 16, FLOOR - CEIL - 60, '#ecebe6');
    rect(c, px0 + 5, CEIL, 3, FLOOR - CEIL - 60, '#cfceca');
    rect(c, px0 - 9, FLOOR - 62, 18, 2, '#f4f3ee');
    stonePillar(c, px0 - 8, FLOOR, 16, 60);
  }

  // ceiling, downlights and dome lamps
  for (const lx of ceiling(c, g, 0, WIDTH, CEIL)) {
    lights.push({ x: lx, y: CEIL + 10, r: 60, color: [255, 236, 200], strength: 0.4 });
  }
  hangingSign(c, BACK_X, CEIL, 18, 'RINAS / COOP', '#f2d66b', '#c8342f');
  for (const lx of [300, 430, 680]) {
    const [x, y] = domeLamp(c, g, lx, CEIL, 12);
    lights.push({ x, y: y + 10, r: 100, color: [230, 240, 255], strength: 0.5 });
  }

  // tables and their benches across the floor
  const rand = rng(83);
  const tops = ['#2f5fb0', '#5fae3a', '#8a4a32', '#2f5fb0', '#4a5058'];
  for (let i = 0, tx = 96; tx < WIDTH - 60; tx += 86 + Math.round(rand() * 20), i++) {
    canteenTable(c, tx, FLOOR + 22, tops[i % tops.length], 34, 16);
  }
  return { canvas, glow };
}

function frontLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(Math.ceil(WIDTH * 1.3), VIEW_H);
  // the edges of the nearest tables, out of focus, and a potted palm by the steps
  for (let x = 120; x < canvas.width; x += 260) {
    rect(c, x, VIEW_H - 16, 70, 5, SILHOUETTE.mid);
    rect(c, x + 6, VIEW_H - 11, 3, 11, SILHOUETTE.dark);
    rect(c, x + 60, VIEW_H - 11, 3, 11, SILHOUETTE.dark);
  }
  bush(c, 30, VIEW_H + 30, 90, 46, 821, SILHOUETTE);
  return canvas;
}

export function buildCanteen(): AreaDef {
  const lights: AreaLight[] = [];
  const main = build(lights);

  return {
    id: 'canteen',
    title: 'APS Canteen',
    subtitle: 'Kain muna bago klase',
    width: WIDTH,
    walkY: WALK,
    bounds: [24, WIDTH - 24],
    outdoor: false,
    visitFlag: 'visited_canteen',
    layers: [
      { canvas: main.canvas, parallax: 1 },
      { canvas: frontLayer(), parallax: 1.3, front: true },
    ],
    glow: main.glow,
    lights,
    hotspots: canteenHotspots({
      exit: EXIT_X,
      yum: centre(STALLS.yum),
      granny: centre(STALLS.granny),
      tables: STOCK_X + 70,
      back: BACK_X,
      byfrost: centre(STALLS.byfrost),
    }),
    npcs: [],
    spawns: {
      front: { x: EXIT_X + 14, facing: 1 },
      back: { x: BACK_X, facing: -1 },
    },
  };
}
