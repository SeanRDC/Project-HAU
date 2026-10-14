// Epiphany of Angels: the paved road that runs from the Sto. Rosario Gate
// into the campus, with stone angels on pedestals down both sides and the
// university seal set into the pavers. You are looking north-west: the main
// gate is at the left end, the covered shed runs behind the far row of
// angels with St. Martha Hall beyond it. The road and its angels stop at a
// stand of trees; past them is the round patterned plaza with the fountain in
// the middle, in front of the steps of the San Francisco de Javier Building
// (art/sfj.ts, drawn from the photos of it).
// The near row of angels stands between you and the camera.

import { Ctx, VIEW_H, makeCanvas } from '../../engine/display';
import { hex, rng } from '../../engine/math';
import { disc, ellipse, line, poly, px, rect } from '../../engine/pix';
import { P } from '../art/palette';
import { RED_TIP, bamboo, crookLamp, memorare, pedestal, pergola, scrollBench, stoneAngel } from '../art/park';
import { Tones, bush, foliage, palm, pot, signBoard, tree } from '../art/props';
import { PLAZA_R, POOL_JETS, drawSFJ, fountainPlaza, jetPool } from '../art/sfj';
import { gatePillar } from '../art/street';
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
/** the middle of the pool: the plaza's far edge is at the foot of the building's steps, and you walk across its near half */
const FOUNTAIN_Y = GROUND + 22;
/** the trees between the end of the Epiphany and the plaza */
const GROVE_R = FOUNTAIN_X - PLAZA_R - 8;
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
const SFJ_X = SFJ_L - 6;
/**
 * Off the right end, straight on past the fountain, are the steps up to the
 * flag plaza and the side gate; the way to the rotunda and the Main Building
 * bears off up and away from the camera just before them.
 */
const FLAG_X = WIDTH - 26;
const ROTUNDA_X = WIDTH - 74;
/** wide enough to put its doors straight behind the fountain, as they are */
const SFJ_W = Math.round((FOUNTAIN_X - SFJ_X) / 0.46);

/** The Epiphany's own ground, as far as `x1`: the lawn the statues stand on, the tiled sidewalk and the paver road. */
function ground(c: Ctx, x1: number): void {
  const rand = rng(57);
  // lawn the statues stand on
  rect(c, 0, GROUND - 6, x1, 16, P.grass);
  rect(c, 0, GROUND - 6, x1, 2, P.grassHi);
  for (let i = 0; i < x1 * 0.5; i++) px(c, rand() * x1, GROUND - 5 + rand() * 14, rand() > 0.5 ? P.grassHi : P.grassDark);
  // kerb and concrete sidewalk with inset tiles
  rect(c, 0, GROUND + 10, x1, 2, '#e4dfd2');
  rect(c, 0, GROUND + 12, x1, 10, '#c9c4b6');
  rect(c, 0, GROUND + 22, x1, 2, '#9d988c');
  for (let x = 0; x < x1; x += 44) {
    rect(c, x, GROUND + 12, 1, 10, '#aaa598');
    rect(c, x + 14, GROUND + 14, 16, 6, '#b7a36a');
    rect(c, x + 15, GROUND + 15, 14, 4, '#cdbb82');
  }
  // road: dark octagonal pavers
  rect(c, 0, GROUND + 24, x1, VIEW_H - GROUND - 24, '#5d5b64');
  rect(c, 0, GROUND + 24, x1, 8, '#696770');
  rect(c, 0, GROUND + 52, x1, 12, '#52505a');
  for (let row = 0; row < 7; row++) {
    const y = GROUND + 25 + row * 6;
    for (let x = (row % 2) * 4; x < x1; x += 8) {
      rect(c, x, y, 1, 5, '#48464f');
      if (rand() > 0.82) rect(c, x + 2, y + 1, 4, 3, rand() > 0.5 ? '#6f6d76' : '#55535c');
    }
    rect(c, 0, y + 5, x1, 1, '#48464f');
  }
  // white diamonds down both edges of the road, and a row of them across its end
  const diamond = (x: number, y: number, big: boolean) => {
    const w = big ? 12 : 6;
    rect(c, x - w / 2, y, w, 1, '#dcdad2');
    rect(c, x - w / 4, y - 1, w / 2, 3, '#dcdad2');
  };
  for (let x = GATE_X + 12; x < x1 - 34; x += 23) {
    diamond(x, GROUND + 28, false);
    diamond(x - 8, VIEW_H - 4, true);
  }
  for (let y = GROUND + 36; y < VIEW_H - 8; y += 8) diamond(x1 - Math.round((y - GROUND + 6) * 0.5) - 12, y, y > GROUND + 48);
}

/** yellow-green for the clipped shrubs on the islands */
const LIME: Tones = { deep: '#5f7a2a', dark: '#86a336', mid: '#a9c244', lit: '#c6d95a', hi: '#dde87a' };

/**
 * Where the pavers stop: plain grey concrete from `x0` on, with the round
 * patterned plaza in it, the island of trees that closes off the end of the
 * Epiphany, and a planted island with a yellow kerb on the camera's side.
 */
function plazaGround(c: Ctx, g: Ctx, x0: number): void {
  const rand = rng(58);
  const top = GROUND - 6;
  // the concrete meets the pavers along a kerb that runs towards the camera
  const edge = (y: number) => x0 - Math.round((y - top) * 0.5);
  for (let y = top; y < VIEW_H; y++) {
    const tone = y < GROUND + 16 ? '#b1b0ad' : y < GROUND + 44 ? '#a5a4a1' : '#999895';
    rect(c, edge(y), y, WIDTH - edge(y), 1, tone);
    rect(c, edge(y), y, 2, 1, '#dedcd4');
  }
  for (let i = 0; i < 1500; i++) {
    const y = top + rand() * (VIEW_H - top);
    px(c, edge(y) + 3 + rand() * (WIDTH - edge(y)), y, rand() > 0.5 ? '#b9b8b4' : '#8f8e8b');
  }
  // joints in the slab
  for (let x = x0 + 70; x < WIDTH + 40; x += 110) line(c, x, GROUND + 2, x - 34, VIEW_H, '#8f8e8b', 1);

  fountainPlaza(c, g, FOUNTAIN_X, FOUNTAIN_Y);

  // the island the trees stand on, between the last angel and the plaza
  rect(c, x0 - 2, GROUND + 14, GROVE_R - x0 + 2, 2, '#77766f');
  rect(c, x0 - 2, GROUND - 6, GROVE_R - x0 + 2, 18, P.grass);
  rect(c, x0 - 2, GROUND - 6, GROVE_R - x0 + 2, 2, P.grassHi);
  rect(c, x0 - 2, GROUND + 12, GROVE_R - x0 + 2, 2, '#e4dfd2');
  rect(c, GROVE_R, GROUND - 6, 2, 20, '#cfcbc0');
  for (let i = 0; i < 90; i++) px(c, x0 + rand() * (GROVE_R - x0), GROUND - 4 + rand() * 15, rand() > 0.5 ? P.grassHi : P.grassDark);

  // the planted island on this side of the plaza, towards the rotunda
  const ix = FOUNTAIN_X + PLAZA_R + 50;
  ellipse(c, ix, VIEW_H + 2, 46, 13, '#e3c23c');
  ellipse(c, ix, VIEW_H + 3, 44, 12, P.grassDark);
  ellipse(c, ix - 3, VIEW_H + 3, 40, 10, P.grass);
  bush(c, ix - 22, VIEW_H + 3, 20, 15, 1741, LIME);
  bush(c, ix + 2, VIEW_H + 4, 22, 15, 1742);
  bush(c, ix + 26, VIEW_H + 5, 18, 13, 1743, LIME);
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

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement; sfjDoor: number } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const lamp = hex(P.lamp);
  const pergolaEnd = PERGOLA_X + PERGOLA_BAYS * PERGOLA_BAY;

  // trees behind the covered shed
  for (const [i, x] of [GATE_X + 20, PERGOLA_X + 150, pergolaEnd - 40, END_X + 6].entries()) {
    tree(c, x, GROUND - 2, 100 + (i % 3) * 14, 34 + (i % 2) * 6, 1200 + i * 3);
  }


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

  ground(c, END_X);

  // San Francisco de Javier, facing the fountain plaza
  const sfjDoor = drawSFJ(c, g, SFJ_X, SFJ_W, GROUND + 2).door;
  doorLight(lights, sfjDoor);
  plazaGround(c, g, END_X);
  // the first of the trees that close off the Epiphany, behind the memorial
  tree(c, END_X + 8, GROUND + 6, 118, 38, 1720);

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

  // the row of slender trees across the end of the road: it comes towards
  // the camera, each tree nearer, bigger and overlapping the one behind
  palm(c, GROVE_R - 2, GROUND + 11, 66, 1710);
  bush(c, END_X + 84, GROUND + 12, 20, 12, 1722, RED_TIP);
  for (const [i, [dx, dy, h]] of ([[70, 9, 92], [62, 20, 108], [53, 31, 126]] as const).entries()) {
    ellipse(c, END_X + dx, GROUND + dy, 9 + i * 2, 2, i ? '#6f6e6a' : P.grassDark);
    tree(c, END_X + dx, GROUND + dy, h, 24 + i * 5, 1721 + i * 7);
  }

  // the fountain in the middle of its plaza
  jetPool(c, FOUNTAIN_X, FOUNTAIN_Y);
  lights.push({ x: FOUNTAIN_X, y: FOUNTAIN_Y - 10, r: 90, color: [200, 240, 236], strength: 0.6 });
  // the planter with a palm at the far end of the steps
  const boxX = FOUNTAIN_X + Math.round(PLAZA_R * 0.9);
  rect(c, boxX - 13, GROUND + 3, 26, 8, '#7a5a40');
  rect(c, boxX - 13, GROUND + 3, 26, 2, '#9a7654');
  rect(c, boxX - 13, GROUND + 10, 26, 1, '#523a28');
  bush(c, boxX, GROUND + 5, 24, 9, 1712);
  palm(c, boxX, GROUND + 4, 66, 1711);
  signBoard(c, ROTUNDA_X, GROUND + 4, ['MAIN BLDG', 'ROTUNDA'], P.maroon, P.goldHi);
  signBoard(c, FLAG_X + 4, GROUND + 8, ['FLAGPOLE', 'SIDE GATE'], P.maroon, P.goldHi);
  return { canvas, glow, sfjDoor };
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

/**
 * The last tree of the row across the end of the road, on the camera's side
 * of you, and the big trees on that side leaning in overhead. Shaded, but
 * not as dark as the angels: it is the next tree in the row, not a frame.
 */
function nearTrees(): Layer {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const x = END_X + 40;
  line(c, x, VIEW_H + 4, x + 5, 30, P.trunkDark, 9);
  line(c, x - 1, VIEW_H + 4, x + 4, 30, P.trunk, 6);
  line(c, x - 3, VIEW_H + 4, x + 2, 30, P.trunkHi, 1);
  poly(c, [[x - 12, VIEW_H], [x - 4, VIEW_H - 14], [x + 5, VIEW_H - 14], [x + 13, VIEW_H]], P.trunkDark);
  line(c, x + 5, 60, x - 22, 30, P.trunkDark, 3);
  line(c, x + 5, 52, x + 34, 26, P.trunkDark, 3);
  foliage(c, x + 6, 14, 78, 30, 1730);
  foliage(c, x - 46, 30, 34, 16, 1731);
  foliage(c, x + 62, 26, 36, 15, 1732);
  // the big trees beside the hut on this side, only their lowest branches in view
  foliage(c, x + 120, -8, 56, 16, 1733);
  foliage(c, x - 120, -10, 60, 16, 1734);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = 'rgba(24,30,42,0.5)';
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
      nearTrees(),
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
      sfj: main.sfjDoor - 34,
      fountain: FOUNTAIN_X,
      exit: ROTUNDA_X,
      flag: FLAG_X,
    }),
    npcs: parkNpcs({
      kath: ANGELS_X + Math.round(ANGEL_GAP / 2),
      bong: [MEMORARE_X - 26, MEMORARE_X + 44],
      enzo: [SEAL_X + 20, ANGELS_X + ANGEL_GAP * 3 - 20],
    }),
    fountainX: FOUNTAIN_X,
    spawns: {
      gate: { x: GATE_X + 14, facing: 1 },
      plaza: { x: ROTUNDA_X - 6, facing: -1 },
      // down the west steps of the flag plaza
      entry: { x: FLAG_X - 4, facing: -1 },
    },

    update(dt, area, view) {
      drift(dt, area, view);
      // the ring of foaming jets in the pool, and the trickle over the bowl in the middle
      for (const [jx, jy] of POOL_JETS) {
        let n = 26 * dt;
        while (n > rand()) {
          n -= 1;
          area.spawnParticle({
            x: FOUNTAIN_X + jx + (rand() - 0.5) * 3,
            y: FOUNTAIN_Y + jy - 1,
            vx: (rand() - 0.5) * 9,
            vy: -52 * (0.75 + rand() * 0.3),
            gravity: 150,
            max: 1.2,
            floor: FOUNTAIN_Y + jy - 1 + rand() * 2,
            color: rand() > 0.3 ? '#f4fdff' : '#bfe6e2',
            size: rand() > 0.7 ? 2 : 1,
          });
        }
      }
      if (rand() < 14 * dt) {
        area.spawnParticle({
          x: FOUNTAIN_X + (rand() - 0.5) * 8, y: FOUNTAIN_Y - 5, vx: (rand() - 0.5) * 8, vy: -8, gravity: 90, max: 0.6,
          floor: FOUNTAIN_Y - 1, color: '#d6f2ef',
        });
      }
    },
  };
}
