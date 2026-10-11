// Epiphany of Angels: the paved road that runs from the Sto. Rosario Gate
// into the campus, with stone angels on pedestals down both sides and the
// university seal set into the pavers. You are looking north-west: the main
// gate is at the left end, the covered shed runs behind the far row of
// angels with St. Martha Hall beyond it, and at the right end the road opens
// into the fountain plaza in front of the San Francisco de Javier Building.
// The near row of angels stands between you and the camera.

import { Ctx, VIEW_H, makeCanvas } from '../../engine/display';
import { hex, rng } from '../../engine/math';
import { disc, ellipse, poly, px, rect } from '../../engine/pix';
import { facade } from '../art/buildings';
import { P } from '../art/palette';
import { RED_TIP, bamboo, crookLamp, memorare, pedestal, pergola, scrollBench, stoneAngel } from '../art/park';
import { bush, hedge, palm, pot, signBoard, tree } from '../art/props';
import { fountainPlaza, gatePillar } from '../art/street';
import { BUILDINGS, PLACES } from '../campus/plan';
import { STREETS, frontage, streetWidth, xOf } from '../campus/streets';
import { parkHotspots, parkNpcs } from '../story/park';
import { AreaDef, AreaLight, Layer } from '../types';
import { GROUND, WALK, ambience, doorLight, farCity, frontPlants, midCampus } from './kit';

const S = STREETS.park;
const WIDTH = streetWidth(S);
const GATE_X = xOf(S, PLACES.mainGate);
const SEAL_X = xOf(S, PLACES.seal);
/** where the angels stop and the road opens into the fountain plaza */
const END_X = xOf(S, PLACES.epiphanyEnd);
const FOUNTAIN_X = xOf(S, PLACES.fountainPlaza);
const FOUNTAIN_Y = GROUND + 30;
const [SFJ_L] = frontage(S, BUILDINGS.sfj.blocks[0]);
const [MARTHA_L, MARTHA_R] = frontage(S, BUILDINGS.martha.blocks[0]);
const [CORAZON_L, CORAZON_R] = frontage(S, BUILDINGS.corazon.blocks[0]);

/** four angels on each side of the road: the Holy Guardian Angel and seven archangels */
const ANGELS = 4;
const ANGEL_GAP = Math.round((END_X - GATE_X) / ANGELS);
const ANGELS_X = GATE_X + Math.round(ANGEL_GAP / 2);
const PERGOLA_BAY = 62;
const PERGOLA_BAYS = Math.floor((END_X - GATE_X - 50) / PERGOLA_BAY);
const PERGOLA_X = GATE_X + 36;
const MEMORARE_X = END_X + 30;
const SFJ_X = SFJ_L + 8;
const SFJ_DOOR = FOUNTAIN_X - 70;

function ground(c: Ctx): void {
  const rand = rng(57);
  // lawn the statues stand on
  rect(c, 0, GROUND - 6, WIDTH, 16, P.grass);
  rect(c, 0, GROUND - 6, WIDTH, 2, P.grassHi);
  for (let i = 0; i < 420; i++) px(c, rand() * WIDTH, GROUND - 5 + rand() * 14, rand() > 0.5 ? P.grassHi : P.grassDark);
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
  // white dashes down both edges of the road
  for (let x = GATE_X + 8; x < END_X; x += 46) {
    rect(c, x, GROUND + 27, 16, 2, '#dcdad2');
    rect(c, x - 6, VIEW_H - 5, 20, 3, '#dcdad2');
  }
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
  const pergolaEnd = PERGOLA_X + PERGOLA_BAYS * PERGOLA_BAY;

  // trees behind the covered shed
  for (const [i, x] of [GATE_X + 20, PERGOLA_X + 150, pergolaEnd - 40, END_X + 6].entries()) {
    tree(c, x, GROUND - 2, 100 + (i % 3) * 14, 34 + (i % 2) * 6, 1200 + i * 3);
  }

  // San Francisco de Javier: glass between cream bands, facing the fountain plaza
  facade(c, g, SFJ_X, WIDTH - SFJ_X + 12, GROUND - 4, {
    floors: 6, style: 'curtain', wall: '#e2dccb', glass: '#3f8f86', accent: P.maroon, doors: [SFJ_DOOR - SFJ_X], name: 'SFJ', seed: 21,
  });
  doorLight(lights, SFJ_DOOR);

  // the covered shed, with its grey wall and bamboo, runs behind the angels
  rect(c, PERGOLA_X - 30, GROUND - 60, pergolaEnd - PERGOLA_X + 50, 60, '#7f8790');
  rect(c, PERGOLA_X - 30, GROUND - 60, pergolaEnd - PERGOLA_X + 50, 2, '#a3aab2');
  for (let x = PERGOLA_X - 26; x < pergolaEnd + 18; x += 6) rect(c, x, GROUND - 58, 1, 56, '#737b84');
  for (let i = 0; i < PERGOLA_BAYS; i++) bamboo(c, PERGOLA_X + 31 + i * PERGOLA_BAY, GROUND - 2, 58, 1300 + i);
  pergola(c, PERGOLA_X, GROUND - 2, PERGOLA_BAYS, PERGOLA_BAY);
  for (let i = 0; i < PERGOLA_BAYS; i += 2) {
    const lx = PERGOLA_X + 31 + i * PERGOLA_BAY;
    rect(c, lx - 2, GROUND - 62, 5, 3, '#f4f2ec');
    rect(g, lx - 2, GROUND - 60, 5, 2, P.lamp);
    lights.push({ x: lx, y: GROUND - 40, r: 76, color: lamp, strength: 0.7 });
  }

  ground(c);

  // the Sto. Rosario Gate at the left end, seen from inside
  rect(c, 0, GROUND - 46, GATE_X - 20, 60, P.wall);
  rect(c, 0, GROUND - 50, GATE_X - 20, 4, P.trim);
  for (let x = 3; x < GATE_X - 20; x += 5) rect(c, x, GROUND - 64, 1, 14, P.iron);
  rect(c, 0, GROUND - 64, GATE_X - 20, 1, P.iron);
  const gl = gatePillar(c, GATE_X - 14, GROUND + 22);
  for (let x = GATE_X - 5; x < GATE_X + 6; x += 3) rect(c, x, GROUND - 26, 1, 48, P.iron); // gate leaf swung open
  rect(c, GATE_X - 5, GROUND - 26, 11, 1, P.iron);
  rect(g, gl.x - 8, gl.y - 8, 17, 8, P.lamp);
  lights.push({ x: gl.x, y: gl.y, r: 90, color: lamp, strength: 0.9 });

  // the far row of angels, benches between them
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
    bush(c, ANGELS_X + i * ANGEL_GAP + 82, GROUND + 2, 22, 13, 1600 + i, i % 2 ? undefined : RED_TIP);
  }

  roadSeal(c, SEAL_X, GROUND + 50);

  // the Pinatubo memorial, where the angels end
  memorare(c, MEMORARE_X, GROUND + 8);
  pot(c, MEMORARE_X - 22, GROUND + 12, 1430);
  pot(c, MEMORARE_X + 26, GROUND + 12, 1431);
  lights.push({ x: MEMORARE_X, y: GROUND - 20, r: 60, color: [255, 226, 180], strength: 0.6 });

  // the fountain plaza
  hedge(c, SFJ_X + 4, GROUND + 2, SFJ_DOOR - SFJ_X - 30, 9, 1700);
  hedge(c, SFJ_DOOR + 26, GROUND + 2, WIDTH - SFJ_DOOR - 26, 9, 1701);
  palm(c, SFJ_DOOR - 34, GROUND + 6, 64, 1710);
  palm(c, FOUNTAIN_X + 62, GROUND + 6, 70, 1711);
  fountainPlaza(c, FOUNTAIN_X, FOUNTAIN_Y);
  lights.push({ x: FOUNTAIN_X, y: FOUNTAIN_Y - 10, r: 80, color: [200, 226, 255], strength: 0.55 });
  signBoard(c, WIDTH - 36, GROUND + 6, ['MAIN BLDG', 'ROTUNDA'], P.maroon, P.goldHi);
  return { canvas, glow };
}

/** The row of angels on the camera's side of the road: you see them from behind, dark against the scene. */
function nearRow(): Layer {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  for (let i = 0; i < ANGELS; i++) {
    const x = ANGELS_X + i * ANGEL_GAP;
    pedestal(c, x, VIEW_H + 36);
    stoneAngel(c, x, VIEW_H - 10, i + 2);
  }
  // in shade and out of focus
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = 'rgba(24,30,42,0.82)';
  c.fillRect(0, 0, WIDTH, VIEW_H);
  c.globalCompositeOperation = 'source-over';
  return { canvas, parallax: 1, front: true };
}

export function buildPark(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  const rand = rng(6060);
  const drift = ambience(6061, [GATE_X + 20, PERGOLA_X + 150, END_X + 6]);

  return {
    id: 'park',
    title: 'Epiphany of Angels',
    subtitle: 'Ang Banal na Anghel de la Guardia at ang pitong arkanghel',
    width: WIDTH,
    walkY: WALK,
    bounds: [GATE_X - 4, WIDTH - 24],
    outdoor: true,
    visitFlag: 'visited_park',
    layers: [
      farCity(WIDTH, 51),
      midCampus(WIDTH, 53, [
        // Plaza de Corazon (the red building) and St. Martha Hall, beyond the shed and the bus terminal
        { x: (CORAZON_L + CORAZON_R) / 2, w: 112, h: 96, wall: '#a8423e', glass: '#4a3a44' },
        { x: (MARTHA_L + MARTHA_R) / 2, w: 150, h: 78, wall: '#e9e2cf', roof: '#a8503e' },
      ]),
      { canvas: main.canvas, parallax: 1 },
      nearRow(),
      frontPlants(WIDTH, 59),
    ],
    glow: main.glow,
    lights,
    hotspots: parkHotspots({
      gate: GATE_X + 2,
      guardian: ANGELS_X,
      seal: SEAL_X,
      archangels: ANGELS_X + ANGEL_GAP * 2,
      memorare: MEMORARE_X,
      sfj: SFJ_DOOR,
      fountain: FOUNTAIN_X,
      exit: WIDTH - 36,
    }),
    npcs: parkNpcs({
      kath: ANGELS_X + Math.round(ANGEL_GAP / 2),
      bong: [MEMORARE_X - 26, MEMORARE_X + 44],
      enzo: [SEAL_X + 20, ANGELS_X + ANGEL_GAP * 3 - 20],
    }),
    fountainX: FOUNTAIN_X,
    spawns: {
      gate: { x: GATE_X + 14, facing: 1 },
      plaza: { x: WIDTH - 44, facing: -1 },
    },

    update(dt, area, view) {
      drift(dt, area, view);
      // the low jet in the middle of the plaza fountain
      let n = 40 * dt;
      while (n > rand()) {
        n -= 1;
        area.spawnParticle({
          x: FOUNTAIN_X + (rand() - 0.5) * 3,
          y: FOUNTAIN_Y - 13,
          vx: (rand() - 0.5) * 16,
          vy: -34 * (0.8 + rand() * 0.3),
          gravity: 150,
          max: 1.4,
          floor: FOUNTAIN_Y - 4 + rand() * 3,
          color: rand() > 0.35 ? '#f2fbff' : '#b9dcf0',
        });
      }
    },
  };
}
