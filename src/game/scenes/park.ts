// Epiphany of Angels park. Coming from the courtyard gate you pass the covered
// walk and the Pinatubo memorial, then the row of stone angels along the road
// with the university seal set into the pavers.

import { Ctx, VIEW_H, VIEW_W, makeCanvas } from '../../engine/display';
import { hex, rng } from '../../engine/math';
import { disc, ellipse, line, poly, px, rect } from '../../engine/pix';
import { P, shade } from '../art/palette';
import { RED_TIP, bamboo, crookLamp, memorare, pedestal, pergola, scrollBench, stoneAngel } from '../art/park';
import { SILHOUETTE, bush, foliage, hedge, pot, signBoard, stoneBench, tree } from '../art/props';
import { parkHotspots, parkNpcs } from '../story/park';
import { AreaDef, AreaLight } from '../types';

const WIDTH = 1760;
const GROUND = 206;
const WALK = 242;
const GATE_X = 44;
const PERGOLA_X = 120;
const PERGOLA_BAYS = 7;
const MEMORARE_X = 668;
const ANGELS_X = 800;
const ANGEL_GAP = 104;
const ANGELS = 8;
const SEAL_X = 1180;
const SOC_X = 1560;
const EXIT_X = 1716;

function layerWidth(parallax: number): number {
  return Math.ceil(VIEW_W + (WIDTH - VIEW_W) * parallax) + 4;
}

function farLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(layerWidth(0.16), VIEW_H);
  const rand = rng(51);
  for (let x = -10; x < canvas.width; x += 30 + rand() * 40) {
    const h = 30 + rand() * 70;
    const w = 26 + rand() * 30;
    rect(c, x, GROUND - h, w, h, rand() > 0.5 ? '#a9a6ae' : '#b9ad9c');
    for (let wy = GROUND - h + 5; wy < GROUND - 6; wy += 8) {
      for (let wx = x + 3; wx < x + w - 4; wx += 6) rect(c, wx, wy, 3, 4, '#7d8698');
    }
  }
  for (let x = -20; x < canvas.width; x += 16 + rand() * 20) {
    foliage(c, x, GROUND - 8 - rand() * 12, 14 + rand() * 10, 10 + rand() * 8, 520 + x, {
      deep: '#31543f', dark: '#3b6347', mid: '#48754f', lit: '#5a8a5a', hi: '#6b9a62',
    });
  }
  rect(c, 0, GROUND, canvas.width, VIEW_H - GROUND, '#3b6347');
  return canvas;
}

/** Newer campus buildings behind the park: concrete blocks and a glass skylight. */
function midLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(layerWidth(0.45), VIEW_H);
  const rand = rng(53);

  const block = (x: number, w: number, h: number, wall: string, glass: string) => {
    rect(c, x, GROUND - h, w, h, wall);
    rect(c, x, GROUND - h, w, 3, shade(wall, 0.35));
    rect(c, x + w - 8, GROUND - h, 8, h, shade(wall, -0.2));
    for (let wy = GROUND - h + 10; wy < GROUND - 14; wy += 16) {
      rect(c, x + 4, wy, w - 16, 8, glass);
      for (let wx = x + 4; wx < x + w - 12; wx += 9) rect(c, wx, wy, 1, 8, shade(wall, -0.1));
    }
  };
  block(20, 130, 96, '#d9c88f', '#56627a');
  block(190, 90, 60, '#8a8d93', '#5d6c88');
  // glass pyramid skylight
  poly(c, [[300, GROUND - 40], [420, GROUND - 40], [360, GROUND - 84]], '#8fb7c9');
  poly(c, [[300, GROUND - 40], [360, GROUND - 40], [360, GROUND - 84]], '#b4d6e2');
  for (let i = 0; i <= 6; i++) line(c, 300 + i * 20, GROUND - 40, 360, GROUND - 84, '#e8f2f4', 1);
  rect(c, 290, GROUND - 40, 140, 40, '#d9c88f');
  block(450, 150, 120, '#74777f', '#6b8fc4');
  block(620, 110, 70, '#e0d3a8', '#56627a');
  block(760, 180, 104, '#9a9da3', '#7da0cc');
  block(960, 100, 54, '#d9c88f', '#56627a');
  for (let x = -10; x < canvas.width; x += 50 + rand() * 60) {
    tree(c, x, GROUND + 2, 50 + rand() * 30, 18 + rand() * 9, 950 + Math.round(x));
  }
  rect(c, 0, GROUND, canvas.width, VIEW_H - GROUND, P.grassDark);
  return canvas;
}

function ground(c: Ctx): void {
  const rand = rng(57);
  // lawn the statues stand on
  rect(c, 0, GROUND - 6, WIDTH, 16, P.grass);
  rect(c, 0, GROUND - 6, WIDTH, 2, P.grassHi);
  for (let i = 0; i < 900; i++) px(c, rand() * WIDTH, GROUND - 5 + rand() * 14, rand() > 0.5 ? P.grassHi : P.grassDark);
  // kerb and concrete sidewalk with inset tiles
  rect(c, 0, GROUND + 10, WIDTH, 2, '#e4dfd2');
  rect(c, 0, GROUND + 12, WIDTH, 10, '#c9c4b6');
  rect(c, 0, GROUND + 22, WIDTH, 2, '#9d988c');
  for (let x = 0; x < WIDTH; x += 44) {
    rect(c, x, GROUND + 12, 1, 10, '#aaa598');
    rect(c, x + 14, GROUND + 14, 16, 6, '#b7a36a');
    rect(c, x + 15, GROUND + 15, 14, 4, '#cdbb82');
  }
  // road: dark octagonal pavers
  rect(c, 0, GROUND + 24, WIDTH, VIEW_H - GROUND - 24, '#5d5b64');
  rect(c, 0, GROUND + 24, WIDTH, 8, '#696770');
  rect(c, 0, GROUND + 52, WIDTH, 12, '#52505a');
  for (let row = 0; row < 7; row++) {
    const y = GROUND + 25 + row * 6;
    for (let x = (row % 2) * 4; x < WIDTH; x += 8) {
      rect(c, x, y, 1, 5, '#48464f');
      if (rand() > 0.82) rect(c, x + 2, y + 1, 4, 3, rand() > 0.5 ? '#6f6d76' : '#55535c');
    }
    rect(c, 0, y + 5, WIDTH, 1, '#48464f');
  }
  // painted parking ticks
  for (let x = 720; x < 1640; x += 46) rect(c, x, GROUND + 27, 16, 2, '#dcdad2');
}

/** The seal in the road, flattened by the low camera angle. */
function roadSeal(c: Ctx, x: number, y: number): void {
  ellipse(c, x, y, 62, 9, P.maroon);
  ellipse(c, x, y, 59, 8, P.trim);
  ellipse(c, x, y, 57, 7.5, '#e8cf3e');
  ellipse(c, x, y, 36, 5, P.maroon);
  ellipse(c, x, y, 34, 4.5, '#f2df62');
  // wings and shield
  poly(c, [[x - 6, y - 1], [x - 26, y - 3], [x - 22, y + 1], [x - 8, y + 2]], P.trim);
  poly(c, [[x + 6, y - 1], [x + 26, y - 3], [x + 22, y + 1], [x + 8, y + 2]], P.trim);
  rect(c, x - 5, y - 3, 11, 5, P.maroon);
  rect(c, x - 3, y - 2, 7, 3, P.trim);
  for (let i = -48; i <= 48; i += 6) px(c, x + i, y + Math.round((1 - (i * i) / 2500) * (i % 12 ? 6 : -6)), P.maroon);
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const lamp = hex(P.lamp);
  const pergolaEnd = PERGOLA_X + PERGOLA_BAYS * 62;

  // trees at the back
  for (const [i, x] of [640, 742, 962, 1170, 1378, 1590, 1700].entries()) {
    tree(c, x, GROUND - 2, 96 + (i % 3) * 14, 34 + (i % 2) * 6, 1200 + i * 3);
  }

  // grey wall and bamboo behind the covered walk
  rect(c, 60, GROUND - 60, pergolaEnd - 40, 60, '#7f8790');
  rect(c, 60, GROUND - 60, pergolaEnd - 40, 2, '#a3aab2');
  for (let x = 96; x < pergolaEnd; x += 6) rect(c, x, GROUND - 58, 1, 56, '#737b84');
  for (let i = 0; i < PERGOLA_BAYS; i++) bamboo(c, PERGOLA_X + 31 + i * 62, GROUND - 2, 58, 1300 + i);

  ground(c);

  // courtyard gate at the left edge
  rect(c, 0, GROUND - 110, 76, 110, P.wall);
  rect(c, 68, GROUND - 110, 8, 110, P.wallShade);
  rect(c, 0, GROUND - 114, 80, 5, P.trim);
  rect(c, GATE_X - 22, GROUND - 84, 44, 84, P.trim);
  disc(c, GATE_X, GROUND - 84, 22, P.trim);
  rect(c, GATE_X - 18, GROUND - 84, 36, 84, '#463a3c');
  disc(c, GATE_X, GROUND - 84, 18, '#463a3c');
  rect(c, GATE_X - 18, GROUND - 14, 36, 14, P.terracotta);
  foliage(c, GATE_X + 4, GROUND - 46, 12, 12, 1401);
  for (let x = GATE_X - 18; x < GATE_X - 4; x += 4) rect(c, x, GROUND - 96, 1, 96, P.iron); // gate swung open
  rect(g, GATE_X - 18, GROUND - 84, 36, 70, '#a9763a');
  lights.push({ x: GATE_X, y: GROUND - 30, r: 80, color: [255, 208, 140], strength: 0.7 });

  // covered walk floor, benches, pillars
  rect(c, PERGOLA_X - 14, GROUND - 2, pergolaEnd - PERGOLA_X + 28, 12, '#d6d2c6');
  rect(c, PERGOLA_X - 14, GROUND - 2, pergolaEnd - PERGOLA_X + 28, 1, '#ebe8de');
  for (let i = 0; i < PERGOLA_BAYS; i++) stoneBench(c, PERGOLA_X + 14 + i * 62, GROUND + 4, 34);
  pergola(c, PERGOLA_X, GROUND + 8, PERGOLA_BAYS);
  for (let i = 0; i < PERGOLA_BAYS; i += 2) {
    const lx = PERGOLA_X + 31 + i * 62;
    rect(c, lx - 2, GROUND - 52, 5, 3, '#f4f2ec');
    rect(g, lx - 2, GROUND - 50, 5, 2, P.lamp);
    lights.push({ x: lx, y: GROUND - 34, r: 76, color: lamp, strength: 0.85 });
  }
  // planting along the front of the walk
  for (let i = 0; i < PERGOLA_BAYS; i++) {
    const bx = PERGOLA_X + 30 + i * 62;
    if (i % 2) bush(c, bx, GROUND + 22, 34, 20, 1500 + i, RED_TIP);
    else hedge(c, bx - 16, GROUND + 22, 32, 9, 1510 + i);
  }

  // memorial
  memorare(c, MEMORARE_X, GROUND + 8);
  pot(c, MEMORARE_X - 22, GROUND + 12, 1430);
  pot(c, MEMORARE_X + 26, GROUND + 12, 1431);
  bush(c, MEMORARE_X + 46, GROUND + 10, 24, 14, 1432, RED_TIP);
  lights.push({ x: MEMORARE_X, y: GROUND - 20, r: 60, color: [255, 226, 180], strength: 0.6 });

  // the angels
  for (let i = 0; i < ANGELS; i++) {
    const x = ANGELS_X + i * ANGEL_GAP;
    rect(c, x - 24, GROUND + 6, 48, 4, '#6f6d76');
    pedestal(c, x, GROUND + 7);
    stoneAngel(c, x, GROUND - 39, i);
    if (i < ANGELS - 1) scrollBench(c, x + 34, GROUND + 9, 36);
    lights.push({ x, y: GROUND - 50, r: 54, color: [255, 232, 196], strength: 0.55 });
  }
  for (let i = 0; i < ANGELS; i += 2) {
    const l = crookLamp(c, ANGELS_X + i * ANGEL_GAP + 52, GROUND + 6);
    lights.push({ x: l.x, y: l.y, r: 88, color: lamp, strength: 0.95 });
    lights.push({ x: l.x, y: GROUND + 26, r: 60, color: lamp, strength: 0.5 });
    disc(g, l.x, l.y, 3, P.lamp);
  }
  for (let i = 0; i < ANGELS - 1; i++) {
    bush(c, ANGELS_X + i * ANGEL_GAP + 78, GROUND + 2, 22, 13, 1600 + i, i % 3 ? undefined : RED_TIP);
  }

  roadSeal(c, SEAL_X, GROUND + 50);

  // way to the School of Computing, closed for now
  signBoard(c, SOC_X, GROUND + 10, ['SCHOOL OF', 'COMPUTING'], P.maroon, P.goldHi);
  for (const dx of [-28, 28]) {
    rect(c, SOC_X + dx - 4, GROUND + 28, 9, 2, P.iron);
    poly(c, [[SOC_X + dx - 3, GROUND + 28], [SOC_X + dx + 4, GROUND + 28], [SOC_X + dx + 1, GROUND + 14], [SOC_X + dx, GROUND + 14]], '#e8742c');
    rect(c, SOC_X + dx - 1, GROUND + 20, 4, 2, '#f4f2ec');
  }
  line(c, SOC_X - 27, GROUND + 17, SOC_X + 29, GROUND + 17, '#f0cf3a', 1);

  // right edge: the road bends round to the front of the DJN building
  hedge(c, EXIT_X - 60, GROUND + 10, 104, 11, 1700);
  signBoard(c, EXIT_X - 30, GROUND + 4, ['DJN', 'BUILDING']);
  return { canvas, glow };
}

function frontLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(layerWidth(1.35), VIEW_H);
  const rand = rng(59);
  for (let x = 90; x < canvas.width; x += 280 + rand() * 220) {
    if (rand() < 0.65) bush(c, x, VIEW_H + 34, 120 + rand() * 50, 50 + rand() * 10, 1800 + x, SILHOUETTE);
    else foliage(c, x, -12, 76, 18, 1810 + x, SILHOUETTE);
  }
  return canvas;
}

export function buildPark(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  const rand = rng(6060);
  let leaf = 0;
  let fly = 0;

  return {
    id: 'park',
    title: 'Epiphany of Angels',
    subtitle: 'Ang Banal na Anghel de la Guardia at ang pitong arkanghel',
    width: WIDTH,
    walkY: WALK,
    bounds: [30, WIDTH - 24],
    outdoor: true,
    visitFlag: 'visited_park',
    layers: [
      { canvas: farLayer(), parallax: 0.16, haze: 0.6 },
      { canvas: midLayer(), parallax: 0.45, haze: 0.32 },
      { canvas: main.canvas, parallax: 1 },
      { canvas: frontLayer(), parallax: 1.35, front: true },
    ],
    glow: main.glow,
    lights,
    hotspots: parkHotspots({
      gate: GATE_X,
      memorare: MEMORARE_X,
      guardian: ANGELS_X,
      archangels: ANGELS_X + ANGEL_GAP * 4,
      seal: SEAL_X,
      soc: SOC_X,
      exit: EXIT_X,
    }),
    npcs: parkNpcs(),
    spawns: {
      gate: { x: GATE_X + 8, facing: 1 },
      drive: { x: EXIT_X - 8, facing: -1 },
    },

    update(dt, area, view) {
      leaf -= dt;
      if (leaf <= 0) {
        leaf = 0.5 + rand() * 0.8;
        area.spawnParticle({
          x: view.camX + rand() * VIEW_W,
          y: 90 + rand() * 40,
          vx: 5 + rand() * 8,
          vy: 8 + rand() * 6,
          sway: 15,
          max: 10,
          floor: GROUND + 10 + rand() * 50,
          color: rand() > 0.5 ? '#d9b048' : '#9cc65e',
        });
      }
      if (view.mood.night > 0.55) {
        fly -= dt;
        if (fly <= 0) {
          fly = 0.2;
          area.spawnParticle({
            x: view.camX + rand() * VIEW_W,
            y: 150 + rand() * 60,
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
