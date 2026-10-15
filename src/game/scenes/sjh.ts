// The road in front of St. Joseph Hall, looking south-east. SJH fills the
// scene, a hundred metres of it (see art/sjh.ts, drawn from the photos of
// it), with the corner of the gym on the left. At its right-hand end the road
// bends round the grass island with the statue of Mary, on to the Mamerto G.
// Nepomuceno Building (its own scene, `mgn.ts`): going round from the chapel
// it is the chapel, MGN, then SJH. The chapel lawn is behind the camera.

import { Ctx, VIEW_H, makeCanvas } from '../../engine/display';
import { gymHall, nameWall } from '../art/buildings';
import { RED_TIP } from '../art/park';
import { bush, hedge, palm, signBoard, stoneBench, tree } from '../art/props';
import { line, poly, px, rect } from '../../engine/pix';
import { rng } from '../../engine/math';
import { P, shade } from '../art/palette';
import { drawSJH, maryStatue, mgnEnd } from '../art/sjh';
import { bamboo } from '../art/aps';
import { carEnd } from '../art/street';
import { BUILDINGS, PLACES } from '../campus/plan';
import { STREETS, frontage, streetWidth, xOf } from '../campus/streets';
import { sjhHotspots } from '../story/streets';
import { AreaDef, AreaLight } from '../types';
import { GROUND, WALK, ambience, doorLight, farCity, frontPlants, lamp, midCampus, parkingBays, road } from './kit';

const S = STREETS.sjh;
const WIDTH = streetWidth(S);
const GYM_X = xOf(S, PLACES.gymCorner);
const [SJH_L, SJH_R] = frontage(S, BUILDINGS.sjh.blocks[0]);

const SJH_X = SJH_L + 6;
const SJH_W = SJH_R - SJH_L - 14;
/** the statue of Mary on its grass island, in front of the right-hand end of the hall */
const MARY_X = SJH_X + SJH_W - 40;
/** where the road bends away round the island, past the end of SJH */
const BEND_X = SJH_R - 2;
/** the way on round the bend to MGN, at the far end */
const MGN_EXIT = WIDTH - 40;
/** the narrow end of MGN, close by at the right-hand edge of the scene and cut off by it */
const MGN_END_X = WIDTH - 34;
const MGN_END_W = 48;
/** the bend runs back to here, a little way off the road */
const BEND_BASE = GROUND - 10;
/** the high wall across the far end of the side road, between SJH and MGN */
const WALL_TOP = GROUND - 53;
const WALL_BASE = GROUND - 11;

type Doors = [number, number, number];

/**
 * The grass island round the statue of Mary (photos 03 and 04, and the
 * outline the user traced on 04): a lawn along the end of the hall whose
 * yellow-painted kerb runs along the parking, then curves round and away up
 * the side of the bend towards MGN.
 */
function islandAndKerb(c: Ctx): void {
  const x0 = MARY_X - 44;
  const front = GROUND + 24;
  // the kerb's path: along the front, then round the corner and back up into the bend
  const path: [number, number][] = [[x0, front - 2], [x0 + 10, front]];
  for (let t = 0; t <= 1.001; t += 0.1) {
    const a = t * Math.PI / 2;
    path.push([Math.round(BEND_X - 16 + Math.sin(a) * 22), Math.round(front - (1 - Math.cos(a)) * 22)]);
  }
  path.push([BEND_X + 8, BEND_BASE + 2], [BEND_X + 10, BEND_BASE]);
  poly(c, [[x0, GROUND + 2], ...path, [BEND_X + 10, GROUND + 2]], '#5d9a3e');
  rect(c, x0 + 2, GROUND + 2, BEND_X - x0, 3, '#4c8a34');
  for (let i = 0; i < 40; i++) rect(c, x0 + 4 + ((i * 37) % (BEND_X - x0)), GROUND + 6 + ((i * 13) % 15), 1, 1, '#7cb854');
  for (let i = 1; i < path.length; i++) {
    const [ax, ay] = path[i - 1];
    const [bx, by] = path[i];
    line(c, ax, ay + 1, bx, by + 1, '#8a7030', 1);
    line(c, ax, ay, bx, by, '#d9b64a', 1);
  }
}

/**
 * The side road between SJH and MGN: it leaves the main road past the island,
 * curves round its kerb and runs back to the high wall. Its seams crowd
 * together as they go back, and it is shaded along the foot of MGN.
 */
function sideRoad(c: Ctx): void {
  // it meets the main road at the top of its surface, cutting the pavement like a driveway
  const front = GROUND + 18;
  // wide where it leaves the main road, narrowing as it goes back to the wall
  const l0 = BEND_X - 4;
  const r0 = MGN_END_X + 2;
  const l1 = BEND_X + 16;
  const r1 = MGN_END_X - 8;
  const at = (a: number, b: number, t: number): number => Math.round(a + (b - a) * t);
  // the garden behind the island, up to the foot of the wall
  const backX = SJH_R - 30;
  rect(c, backX, WALL_BASE, l1 + 4 - backX, GROUND + 4 - WALL_BASE, '#4f8a38');
  for (let i = 0; i < 18; i++) rect(c, backX + 2 + ((i * 17) % (l1 - backX)), WALL_BASE + 1 + ((i * 5) % 10), 2, 1, '#67a548');
  // the surface, in the main road's own colours, a little paler as it goes back into the light
  for (let y = WALL_BASE; y < front; y++) {
    const t = (y - WALL_BASE) / (front - WALL_BASE);
    rect(c, at(l1, l0, t), y, at(r1, r0, t) - at(l1, l0, t), 1, shade(P.road, 0.26 - t * 0.12));
  }
  // the same grit as the main road
  const rand = rng(3170);
  for (let i = 0; i < 120; i++) {
    const t = rand();
    const y = at(WALL_BASE, front, t);
    const x = at(l1, l0, t) + rand() * (at(r1, r0, t) - at(l1, l0, t));
    px(c, x, y, rand() > 0.5 ? P.roadLine : P.roadDark);
  }
  // the seams across it crowd together towards the back
  for (const t of [0.12, 0.3, 0.56, 0.86]) {
    const y = at(WALL_BASE, front, t);
    rect(c, at(l1, l0, t), y, at(r1, r0, t) - at(l1, l0, t), 1, shade(P.road, -0.06));
  }
  // the centre line, in dashes that grow as they come forward
  for (let t = 0.08; t < 0.95; t += 0.18) {
    const y = at(WALL_BASE, front, t);
    const x = at((l1 + r1) / 2, (l0 + r0) / 2, t);
    rect(c, x, y, 1, 1 + Math.round(t * 3), P.roadLine);
  }
  // the dropped kerb either side where it crosses the pavement
  for (const [x, d] of [[l0, 1], [r0, -1]] as const) {
    for (let k = 0; k < 4; k++) rect(c, x + d * k - (d < 0 ? 1 : 0), GROUND + 14 + Math.floor(k / 2), 1, 4 - Math.floor(k / 2), shade(P.pave, 0.2 - k * 0.08));
  }
  // its edge along the foot of MGN, in shade
  line(c, r1, WALL_BASE, r0, front, P.roadDark, 1);
  poly(c, [[r1 - 4, WALL_BASE], [r1, WALL_BASE], [r0, front], [r0 - 9, front]], 'rgba(30,30,40,0.14)');
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement; doors: Doors } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  tree(c, GYM_X + 40, GROUND + 2, 104, 34, 3101);

  // the corner of the gym, cut off by the edge of the scene
  gymHall(c, g, -260, 260 + GYM_X - 34, GROUND, '');

  // between SJH and MGN a side road runs back to a high wall across its far end (the sketch of
  // 2026-10-15): weathered grey concrete with a coping, panels between square piers
  const backX = SJH_R - 30;
  rect(c, backX, WALL_TOP, WIDTH - backX, WALL_BASE - WALL_TOP, '#b9b4a8');
  rect(c, backX, WALL_TOP, WIDTH - backX, 3, '#d9d4c8');
  rect(c, backX, WALL_TOP + 3, WIDTH - backX, 1, '#8f8a7f');
  for (let px0 = backX + 6; px0 < WIDTH; px0 += 18) {
    rect(c, px0, WALL_TOP - 1, 5, WALL_BASE - WALL_TOP + 1, '#c9c4b8');
    rect(c, px0, WALL_TOP - 1, 5, 1, '#e4dfd3');
    rect(c, px0 + 4, WALL_TOP, 1, WALL_BASE - WALL_TOP, '#a19c90');
  }
  for (let i = 0; i < 24; i++) {
    const sx = backX + 3 + ((i * 29) % (WIDTH - backX - 6));
    rect(c, sx, WALL_TOP + 4, 1, 4 + ((i * 7) % 14), '#aaa598');
  }
  rect(c, backX, WALL_BASE - 3, WIDTH - backX, 3, '#9f9a8e');

  // three ways in: education, arts and sciences under the tower, computing
  const { doors } = drawSJH(c, g, SJH_X, SJH_W, GROUND);
  for (const x of doors) doorLight(lights, x);

  road(c, 0, WIDTH, 'concrete', 3110);
  sideRoad(c);
  islandAndKerb(c);

  // MGN's narrow end, close by on the right (`assets/MGN BUILDING/05_left-side`): MGN runs off at
  // right angles to SJH, so from here only this end of it shows, the white service block with the
  // grey tank on its roof, standing right on the pavement at the mouth of the side road
  mgnEnd(c, g, MGN_END_X, MGN_END_W, GROUND + 8, 28, 32);
  rect(c, MGN_END_X - 1, GROUND + 6, MGN_END_W + 1, 2, 'rgba(30,30,40,0.3)');


  // the garden along the front: clipped hedges, red-tipped shrubs, young trees and benches
  const clear = (i: number) => (i === 1 ? 74 : 24);
  const gaps = [SJH_X, ...doors.flatMap((x, i) => [x - clear(i), x + clear(i)]), SJH_X + SJH_W - 34];
  for (let i = 0; i < gaps.length; i += 2) hedge(c, gaps[i], GROUND + 3, gaps[i + 1] - gaps[i], 8, 3120 + i);
  for (let x = SJH_X + 40, k = 0; x < SJH_X + SJH_W - 50; x += 62, k++) {
    if (doors.some((d, i) => Math.abs(x - d) < clear(i) + 10)) continue;
    if (k % 3 === 0) tree(c, x, GROUND + 3, 46, 13, 3140 + k);
    else bush(c, x, GROUND + 3, 20, 11, 3130 + k, k % 3 === 1 ? RED_TIP : undefined);
  }
  for (const x of [doors[0] + 96, doors[1] - 150, doors[1] + 112, doors[2] - 110]) stoneBench(c, x, GROUND + 14, 28);
  // shrubs along the foot of MGN's end, so it stands in the garden rather than on the road
  bush(c, MGN_END_X + 14, GROUND + 10, 22, 12, 3165, RED_TIP);
  // tall clumps of bamboo either side of the main entrance, a palm in front of the left one
  bamboo(c, doors[1] - 98, GROUND + 4, 34, 104, 3150);
  bamboo(c, doors[1] + 66, GROUND + 4, 30, 96, 3151);
  palm(c, doors[1] - 70, GROUND + 4, 72, 3152);
  // the statue of Mary on her island (photos 03 and 04): bamboo behind her, a red-tipped shrub
  // to the left, a round clipped bush to the right
  bamboo(c, MARY_X - 4, GROUND + 6, 24, 84, 3160);
  bush(c, MARY_X - 22, GROUND + 12, 16, 11, 3161, RED_TIP);
  bush(c, MARY_X + 24, GROUND + 12, 18, 14, 3162);
  maryStatue(c, MARY_X, GROUND + 14);

  // the School of Computing has its dean's office here
  nameWall(c, doors[2] - 76, GROUND + 14, ['SCHOOL OF', 'COMPUTING']);

  // the parking in front of the hall (the front photo): cars nosed in towards it, end on,
  // leaving the ways in clear
  parkingBays(c, SJH_X + 2, MARY_X - 54, 36);
  const colours = ['#24242a', '#9a9da4', '#e8e8e4', '#5c5f66', '#c9c2b0', '#3b4a66', '#b9bcc4'];
  for (let x = SJH_X + 20, i = 0; x < SJH_X + SJH_W - 10; x += 36) {
    if (doors.some((d) => Math.abs(x - d) < 26) || Math.abs(x - MARY_X) < 52) continue;
    carEnd(c, x, GROUND + 31, colours[(i * 3) % colours.length], i % 4 === 1, i % 3 === 0);
    i++;
  }

  signBoard(c, GYM_X, GROUND + 5, ['GYM', 'COVERED COURT']);
  signBoard(c, MGN_END_X - 14, GROUND + 5, ['MGN', 'CHAPEL']);

  // lamps along the kerb, kept clear of the name over the main entrance
  for (let x = SJH_X + 30; x < SJH_X + SJH_W; x += 190) lamp(c, g, lights, Math.abs(x - doors[1]) < 60 ? doors[1] + 92 : x);
  return { canvas, glow, doors };
}

export function buildSjh(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);

  return {
    id: 'sjh',
    title: 'St. Joseph Hall',
    subtitle: 'Education, Arts and Sciences, at Computing',
    subtitleEn: 'Education, Arts and Sciences, and Computing',
    width: WIDTH,
    walkY: WALK,
    bounds: [GYM_X - 30, WIDTH - 24],
    outdoor: true,
    layers: [
      farCity(WIDTH, 311),
      midCampus(WIDTH, 312, []),
      { canvas: main.canvas, parallax: 1 },
      frontPlants(WIDTH, 313),
    ],
    glow: main.glow,
    lights,
    hotspots: sjhHotspots({
      gym: GYM_X,
      education: main.doors[0],
      sjh: main.doors[1],
      computing: main.doors[2],
      mgn: MGN_EXIT,
    }),
    npcs: [],
    spawns: {
      gym: { x: GYM_X + 10, facing: 1 },
      mgn: { x: MGN_EXIT - 8, facing: -1 },
      lawn: { x: MGN_EXIT - 8, facing: -1 },
    },
    update: ambience(314, [GYM_X + 40, SJH_R + 8]),
  };
}
