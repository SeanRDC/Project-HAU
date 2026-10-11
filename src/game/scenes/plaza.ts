// The driveway in front of the Don Juan D. Nepomuceno Building: fountain
// rotonda on the left, the building in the middle, the guardian angel and
// the gate on the right. Holy Rosary Parish peeks over the rooftops.

import { VIEW_H, VIEW_W, makeCanvas, Ctx } from '../../engine/display';
import { hex, rng } from '../../engine/math';
import { disc, ellipse, line, poly, px, rect, sign } from '../../engine/pix';
import { DJN_DOOR_X, DJN_WIDTH, drawDJN } from '../art/djn';
import { P, shade } from '../art/palette';
import {
  SILHOUETTE, angelStatue, boomBarrier, bush, foliage, fountainBasin, guardHouse, hedge, lampPost, palm, pot,
  signBoard, stoneBench, tree, tricycle,
} from '../art/props';
import { AreaDef, AreaLight } from '../types';

const WIDTH = 1340;
const GROUND = 204;
const WALK = 240;
const DJN_X = 410;
const FOUNTAIN_X = 190;
const FOUNTAIN_Y = 222;
const STATUE_X = 1100;
const GATE_X = 1250;

export const PLAZA_DOOR_X = DJN_X + DJN_DOOR_X;

function layerWidth(parallax: number): number {
  return Math.ceil(VIEW_W + (WIDTH - VIEW_W) * parallax) + 4;
}

/** Holy Rosary Parish and the far tree line. */
function farLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(layerWidth(0.16), VIEW_H);
  const rand = rng(41);
  const stone = '#8d8a92';
  const stoneDark = '#6c6a76';
  const stoneLit = '#a9a6aa';

  const tower = (x: number, top: number) => {
    rect(c, x, top + 40, 26, GROUND - top - 40, stone);
    rect(c, x, top + 40, 6, GROUND - top - 40, stoneLit);
    rect(c, x + 20, top + 40, 6, GROUND - top - 40, stoneDark);
    rect(c, x - 2, top + 38, 30, 3, stoneLit);
    rect(c, x + 3, top + 20, 20, 18, stone);
    rect(c, x + 3, top + 20, 5, 18, stoneLit);
    rect(c, x + 18, top + 20, 5, 18, stoneDark);
    rect(c, x + 1, top + 18, 24, 3, stoneLit);
    rect(c, x + 10, top + 25, 6, 10, '#3a3846'); // belfry arch
    rect(c, x + 9, top + 50, 8, 14, '#3a3846');
    rect(c, x + 9, top + 76, 8, 14, '#3a3846');
    poly(c, [[x + 3, top + 18], [x + 23, top + 18], [x + 13, top - 6]], '#c9ccd4');
    poly(c, [[x + 3, top + 18], [x + 13, top + 18], [x + 13, top - 6]], '#e6e8ee');
    rect(c, x + 13, top - 12, 1, 7, stoneDark);
    rect(c, x + 11, top - 10, 5, 1, stoneDark);
  };

  // church: dome behind, nave, twin bell towers
  const cx = 360;
  disc(c, cx - 86, 132, 26, '#c5c9d2');
  disc(c, cx - 92, 126, 18, '#e1e4ea');
  rect(c, cx - 112, 134, 54, 70, stone);
  rect(c, cx - 112, 132, 54, 3, stoneLit);
  rect(c, cx - 89, 96, 6, 12, '#aab0bc');
  rect(c, cx - 87, 86, 2, 10, stoneDark);
  rect(c, cx - 60, 128, 130, 76, stone);
  poly(c, [[cx - 64, 128], [cx + 74, 128], [cx + 5, 104]], stoneDark);
  rect(c, cx - 8, 150, 26, 54, stoneLit);
  poly(c, [[cx - 12, 150], [cx + 22, 150], [cx + 5, 132]], stoneLit);
  rect(c, cx, 170, 10, 34, '#3a3846');
  disc(c, cx + 5, 160, 4, '#3a3846');
  tower(cx - 40, 92);
  tower(cx + 26, 88);

  // rooftops and trees along the horizon
  for (let x = -10; x < canvas.width; x += 28 + rand() * 30) {
    const h = 14 + rand() * 22;
    if (Math.abs(x - cx) < 130) continue;
    rect(c, x, GROUND - h, 34, h, rand() > 0.5 ? '#b9a48f' : '#a7a2a8');
    poly(c, [[x - 3, GROUND - h], [x + 37, GROUND - h], [x + 17, GROUND - h - 9]], '#a0584a');
  }
  for (let x = -20; x < canvas.width; x += 16 + rand() * 20) {
    foliage(c, x, GROUND - 8 - rand() * 14, 14 + rand() * 10, 10 + rand() * 8, 500 + x, {
      deep: '#31543f', dark: '#3b6347', mid: '#48754f', lit: '#5a8a5a', hi: '#6b9a62',
    });
  }
  rect(c, 0, GROUND, canvas.width, VIEW_H - GROUND, '#3b6347');
  return canvas;
}

/** The newer high-rise buildings of the campus behind the old one. */
function midLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(layerWidth(0.42), VIEW_H);
  const rand = rng(77);

  // banded high-rise: white slabs, grey spandrels, blue glass
  const tower = (x: number, top: number, w: number, floors: number) => {
    const fh = Math.floor((GROUND - top) / floors);
    rect(c, x, top, w, GROUND - top, '#70747e');
    for (let f = 0; f < floors; f++) {
      const y = top + f * fh;
      rect(c, x - 3, y, w + 6, 5, '#ecebe6');
      rect(c, x - 3, y + 5, w + 6, 1, '#b9b8b6');
      rect(c, x, y + 6, w, fh - 6, '#565c6c');
      for (let wx = x + 3; wx < x + w - 6; wx += 9) {
        rect(c, wx, y + 8, 6, fh - 10, rand() > 0.25 ? '#6b8fc4' : '#8fb1dc');
      }
    }
    rect(c, x + w - 10, top, 13, GROUND - top, '#5a5e68');
    rect(c, x + 4, top - 8, w * 0.4, 8, '#8a8d95');
    rect(c, x + w * 0.6, top - 16, 1, 16, '#55585f');
  };
  tower(70, 34, 150, 9);
  rect(c, 30, 60, 44, GROUND - 60, '#3a56a8'); // blue glass stair core
  for (let y = 62; y < GROUND; y += 6) rect(c, 30, y, 44, 1, '#5574c4');
  tower(610, 70, 120, 7);

  // low covered walk and classroom blocks in between
  for (const [x, w, h] of [[240, 150, 40], [400, 190, 54], [740, 140, 46]] as const) {
    rect(c, x, GROUND - h, w, h, '#d8c9a2');
    rect(c, x, GROUND - h, w, 4, '#f0e8d2');
    for (let wx = x + 6; wx < x + w - 8; wx += 12) rect(c, wx, GROUND - h + 10, 7, 10, '#4c5568');
    for (let wx = x + 6; wx < x + w - 8; wx += 12) rect(c, wx, GROUND - h + 28, 7, 10, '#4c5568');
    poly(c, [[x - 4, GROUND - h], [x + w + 4, GROUND - h], [x + w - 8, GROUND - h - 8], [x + 8, GROUND - h - 8]], '#a8503e');
  }

  for (let x = -10; x < canvas.width; x += 44 + rand() * 50) {
    tree(c, x, GROUND + 2, 52 + rand() * 34, 18 + rand() * 10, 900 + Math.round(x));
  }
  rect(c, 0, GROUND, canvas.width, VIEW_H - GROUND, P.grassDark);
  return canvas;
}

function ground(c: Ctx): void {
  const rand = rng(5);
  // sidewalk along the building
  rect(c, 0, GROUND, WIDTH, 14, P.pave);
  rect(c, 0, GROUND, WIDTH, 1, shade(P.pave, 0.35));
  for (let x = 0; x < WIDTH; x += 14) rect(c, x, GROUND + 1, 1, 12, P.paveLine);
  rect(c, 0, GROUND + 7, WIDTH, 1, P.paveLine);
  // curb
  rect(c, 0, GROUND + 14, WIDTH, 2, shade(P.pave, 0.3));
  rect(c, 0, GROUND + 16, WIDTH, 2, P.paveDark);
  // driveway: pebble-wash concrete, a touch darker towards the camera
  rect(c, 0, GROUND + 18, WIDTH, VIEW_H - GROUND - 18, P.road);
  rect(c, 0, GROUND + 18, WIDTH, 10, shade(P.road, 0.14));
  rect(c, 0, GROUND + 28, WIDTH, 10, shade(P.road, 0.06));
  rect(c, 0, GROUND + 52, WIDTH, 20, shade(P.road, -0.12));
  for (let i = 0; i < 2600; i++) {
    px(c, rand() * WIDTH, GROUND + 18 + rand() * (VIEW_H - GROUND - 18), rand() > 0.5 ? P.roadLine : P.roadDark);
  }
  // expansion joints
  for (let x = 40; x < WIDTH; x += 120) line(c, x, GROUND + 18, x - 26, VIEW_H, P.roadDark, 1);
  rect(c, 0, GROUND + 44, WIDTH, 1, P.roadDark);
}

/** The university seal set into the pavement, seen at a low angle. */
function pavementSeal(c: Ctx, x: number, y: number): void {
  ellipse(c, x, y, 44, 7, P.maroon);
  ellipse(c, x, y, 41, 6, P.trim);
  ellipse(c, x, y, 39, 5.5, P.gold);
  ellipse(c, x, y, 25, 3.5, P.maroon);
  ellipse(c, x, y, 23, 3, P.goldHi);
  rect(c, x - 8, y - 2, 17, 4, P.trim);
  rect(c, x - 3, y - 1, 7, 2, P.maroon);
  for (let i = -30; i <= 30; i += 5) px(c, x + i, y + (Math.abs(i) > 18 ? 0 : i % 2 ? 4 : -4), P.maroon);
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const lampColor = hex(P.lamp);

  // trees standing behind the building line
  tree(c, 60, GROUND + 4, 120, 44, 301);
  tree(c, 330, GROUND + 2, 104, 36, 302);
  tree(c, 1070, GROUND + 2, 110, 38, 303);
  tree(c, 1210, GROUND + 2, 96, 34, 304);
  palm(c, 372, GROUND + 2, 84, 310);

  ground(c);
  drawDJN(c, g, DJN_X, GROUND);

  // planting along the wings
  for (const [x, w] of [[DJN_X + 6, 176], [DJN_X + DJN_WIDTH - 184, 178]] as const) {
    hedge(c, x, GROUND + 3, w, 11, x);
    for (let i = 0; i < 4; i++) bush(c, x + 18 + i * 46, GROUND + 1, 26, 16, x + i * 5);
  }
  palm(c, DJN_X + 34, GROUND + 3, 60, 311);
  palm(c, DJN_X + 122, GROUND + 3, 72, 312);
  palm(c, DJN_X + DJN_WIDTH - 118, GROUND + 3, 68, 313);
  palm(c, DJN_X + DJN_WIDTH - 40, GROUND + 3, 58, 314);
  pot(c, DJN_X + 196, GROUND + 6, 21);
  pot(c, DJN_X + DJN_WIDTH - 196, GROUND + 6, 22);

  // the two lamps flanking the steps, and more along the drive
  for (const x of [112, 300, DJN_X + 178, DJN_X + DJN_WIDTH - 178, 1050, 1180]) {
    const l = lampPost(c, x, GROUND + 15);
    lights.push({ x: l.x, y: l.y, r: 92, color: lampColor, strength: 0.95 });
    disc(g, l.x, l.y, 4, P.lamp);
    lights.push({ x: l.x, y: GROUND + 24, r: 60, color: lampColor, strength: 0.5 });
  }
  // light spilling out of the open door and across the steps
  lights.push({ x: PLAZA_DOOR_X, y: GROUND - 30, r: 110, color: [255, 208, 140], strength: 0.9 });

  pavementSeal(c, PLAZA_DOOR_X, GROUND + 30);

  // fountain rotonda
  fountainBasin(c, FOUNTAIN_X, FOUNTAIN_Y);
  stoneBench(c, 40, GROUND + 13);
  hedge(c, 0, GROUND + 4, 104, 10, 9);
  signBoard(c, 70, GROUND + 3, ['SCHOOL OF', 'COMPUTING'], P.maroon, P.goldHi);
  bush(c, 320, GROUND + 4, 30, 18, 61);

  // guardian angel on its little lawn
  ellipse(c, STATUE_X, GROUND + 22, 58, 7, P.pave);
  ellipse(c, STATUE_X, GROUND + 21, 54, 6, P.grass);
  ellipse(c, STATUE_X - 6, GROUND + 19, 40, 3, P.grassHi);
  angelStatue(c, STATUE_X, GROUND + 22);
  palm(c, STATUE_X + 42, GROUND + 20, 54, 315);
  lights.push({ x: STATUE_X, y: GROUND - 40, r: 70, color: [255, 214, 150], strength: 0.75 });

  tricycle(c, 1168, GROUND + 28);
  guardHouse(c, GATE_X, GROUND + 14);
  boomBarrier(c, GATE_X - 12, GROUND + 22, 84, 2.05);
  // gate wall closing off the right edge
  rect(c, GATE_X + 52, GROUND - 40, WIDTH - GATE_X - 52, 58, P.wall);
  rect(c, GATE_X + 52, GROUND - 44, WIDTH - GATE_X - 52, 4, P.trim);
  for (let x = GATE_X + 58; x < WIDTH; x += 5) rect(c, x, GROUND - 62, 1, 18, P.iron);
  rect(c, GATE_X + 52, GROUND - 62, WIDTH - GATE_X - 52, 1, P.iron);
  sign(c, 'STO. ROSARIO ST.', GATE_X + 56, GROUND - 26, P.maroon);
  rect(g, GATE_X + 8, GROUND - 22, 20, 15, '#ffd98a');
  lights.push({ x: GATE_X + 18, y: GROUND - 10, r: 54, color: [255, 220, 160], strength: 0.7 });

  return { canvas, glow };
}

/** Out-of-focus plants close to the camera. */
function frontLayer(): HTMLCanvasElement {
  const parallax = 1.35;
  const [canvas, c] = makeCanvas(layerWidth(parallax), VIEW_H);
  const rand = rng(88);
  for (let x = 60; x < canvas.width; x += 260 + rand() * 220) {
    if (rand() < 0.6) {
      // just the tops of some bushes along the bottom edge
      bush(c, x, VIEW_H + 34, 120 + rand() * 60, 50 + rand() * 12, 700 + x, SILHOUETTE);
    } else {
      // a branch hanging in from the top
      foliage(c, x, -8, 84, 22, 740 + x, SILHOUETTE);
      foliage(c, x + 56, -2, 44, 14, 741 + x, SILHOUETTE);
    }
  }
  return canvas;
}

export function buildPlaza(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  const rand = rng(1234);

  // seven jets: one tall in the middle, a ring of short ones
  const jets = [
    { x: 0, y: -8, power: 128, rate: 60 },
    ...[-46, -30, -14, 14, 30, 46].map((dx) => ({ x: dx, y: -1 + (Math.abs(dx) === 30 ? 2 : 0), power: 66, rate: 20 })),
  ];
  let leafTimer = 0;
  let fireflyTimer = 0;

  return {
    id: 'plaza',
    title: 'Don Juan D. Nepomuceno Building',
    subtitle: 'Holy Angel University, Angeles City',
    width: WIDTH,
    walkY: WALK,
    bounds: [26, WIDTH - 64],
    outdoor: true,
    layers: [
      { canvas: farLayer(), parallax: 0.16, haze: 0.62 },
      { canvas: midLayer(), parallax: 0.42, haze: 0.34 },
      { canvas: main.canvas, parallax: 1 },
      { canvas: frontLayer(), parallax: 1.35, front: true },
    ],
    glow: main.glow,
    lights,
    hotspots: [],
    npcs: [],
    spawns: {
      start: { x: 1130, facing: -1 },
      door: { x: PLAZA_DOOR_X, facing: -1 },
    },

    update(dt, area, view) {
      for (const j of jets) {
        let n = j.rate * dt;
        while (n > rand()) {
          n -= 1;
          area.spawnParticle({
            x: FOUNTAIN_X + j.x + (rand() - 0.5) * 2,
            y: FOUNTAIN_Y + j.y - 2,
            vx: (rand() - 0.5) * (j.power * 0.22),
            vy: -j.power * (0.8 + rand() * 0.3),
            gravity: 170,
            max: 2.2,
            floor: FOUNTAIN_Y + j.y - 1 + rand() * 3,
            color: rand() > 0.35 ? '#f2fbff' : '#b9dcf0',
            size: rand() > 0.8 ? 2 : 1,
          });
        }
      }
      // leaves drifting down from the big trees
      leafTimer -= dt;
      if (leafTimer <= 0) {
        leafTimer = 0.7 + rand() * 1.4;
        const from = [60, 330, 1070, 1210][Math.floor(rand() * 4)];
        area.spawnParticle({
          x: from + (rand() - 0.5) * 70,
          y: GROUND - 90 + rand() * 30,
          vx: 6 + rand() * 8,
          vy: 9 + rand() * 6,
          sway: 16,
          max: 9,
          floor: GROUND + 16 + rand() * 40,
          color: rand() > 0.5 ? '#c9a23e' : '#8fbf58',
        });
      }
      if (view.mood.night > 0.6) {
        fireflyTimer -= dt;
        if (fireflyTimer <= 0) {
          fireflyTimer = 0.35;
          area.spawnParticle({
            x: view.camX + rand() * VIEW_W,
            y: GROUND - 20 + rand() * 40,
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

    drawBack(ctx, view) {
      // ripples on the fountain pool
      const x = FOUNTAIN_X - Math.round(view.camX);
      for (let i = 0; i < 5; i++) {
        const k = (view.time * 0.5 + i / 5) % 1;
        ctx.globalAlpha = (1 - k) * 0.5;
        rect(ctx, x - 8 - k * 46, FOUNTAIN_Y - 2 + (i % 3), 6 + k * 8, 1, P.waterHi);
        rect(ctx, x + 6 + k * 44, FOUNTAIN_Y - 3 + ((i + 1) % 3), 6 + k * 8, 1, P.waterHi);
      }
      ctx.globalAlpha = 1;
    },
  };
}
