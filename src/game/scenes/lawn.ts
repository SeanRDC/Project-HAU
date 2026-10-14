// The road along the chapel lawn, looking north-east. This is the view the
// whole campus plan is anchored on: the shady corner by APS, where the green
// picnic sheds stand under tall trees and bamboo behind a little corner island
// with a street light, then the paved parking (no lawn, from the photos), and across it the white
// rings of the Chapel of the Holy Guardian Angel with the Sister Josefina
// Nepomuceno Formation Center behind. The end of APS is on the left. PGN, the
// walkway back to the rotunda and the Main Building are behind the camera.

import { Ctx, VIEW_H, makeCanvas } from '../../engine/display';
import { rng } from '../../engine/math';
import { line, px, rect } from '../../engine/pix';
import { bamboo, drawAPS, noParkingStand, picnicShed, rustyFence, shadyGround, streetLight } from '../art/aps';
import { chapel, chapelRear, facade, trafficCone } from '../art/buildings';
import { P } from '../art/palette';
import { RED_TIP } from '../art/park';
import { bush, layeredTree, palm, signBoard, treeline } from '../art/props';
import { carEnd } from '../art/street';
import { BUILDINGS, PLACES } from '../campus/plan';
import { STREETS, frontage, streetWidth, xOf } from '../campus/streets';
import { lawnHotspots } from '../story/streets';
import { AreaDef, AreaLight } from '../types';
import { GROUND, WALK, ambience, farCity, frontPlants, lamp, lawnStrip, midCampus, road } from './kit';

const S = STREETS.lawn;
const WIDTH = streetWidth(S);
const WALKWAY_X = xOf(S, PLACES.walkwayEnd);
const SOUTH_X = xOf(S, PLACES.southJunction);
const CHAPEL_X = xOf(S, PLACES.chapel);
const [, APS_R] = frontage(S, BUILDINGS.aps.blocks[0]);
const [, FORMATION_R] = frontage(S, BUILDINGS.formation.blocks[0]);

/** the chapel is across the lawn, so it is drawn a little smaller than its true width */
const CHAPEL_W = 380;
const CHAPEL_L = CHAPEL_X - CHAPEL_W / 2;
const CHAPEL_R = CHAPEL_X + CHAPEL_W / 2;
/** the way on to MGN, at the far end */
const MGN_EXIT = WIDTH - 40;
const LAWN_L = APS_R + 40;
/** the shady corner across from APS: grass under tall trees, worn to earth round the green picnic sheds */
const SHADE_R = LAWN_L + 250;
/** the way along APS to Sacred Heart, the only way on at the left-hand end, right of the first tree */
const APS_ROAD_X = LAWN_L + 92;

/** the mouth of the chapel parking, past the shady corner, with the NO PARKING stand in it */
const LOT_MOUTH = SHADE_R + 34;
/**
 * The parking in front of the chapel is an oval island (the sketch of
 * 2026-10-15 and `assets/CHAPEL/03_right-side-view`), ringed by a white kerb,
 * with the stamped-concrete road looping round it to the chapel.
 */
const OVAL_L = SHADE_R + 46;
const OVAL_R = CHAPEL_R + 40;
/** one parking bay, nose-in towards the chapel */
const BAY = 36;
/** the colours in the photo: dark grey, maroon, silver, white, black, pale blue, red */
const CAR_COLOURS = ['#3a3c44', '#5a2328', '#b9bcc4', '#e8e8e4', '#24242a', '#8fa8c4', '#c8342f'];
/**
 * The cars in front of the chapel, side by side and nosed in, so you see
 * their backs (a few reversed in show their fronts), with the aisle to the
 * steps kept clear.
 */
const BAYS: number[] = [];
for (let x = OVAL_L + 26; x <= CHAPEL_X - 46; x += BAY) BAYS.push(x);
for (let x = CHAPEL_X + 46; x <= OVAL_R - 26; x += BAY) BAYS.push(x);
const CARS = BAYS.map((x, i) => ({
  x,
  body: CAR_COLOURS[(i * 3) % CAR_COLOURS.length],
  front: i % 4 === 2,
  tall: i % 3 === 1,
}));

/**
 * What lies between the road and the chapel (photos 03, 29 and 30 of the
 * walk, and `assets/CHAPEL/03`): the stamped-concrete road looping round an
 * oval parking island, full of cars nosed in towards the chapel, with a white
 * kerb round it.
 */
function parkingLot(c: Ctx): void {
  const top = GROUND - 22;
  const bottom = GROUND - 7;
  // the loop road, dark stamped concrete in squares
  rect(c, SHADE_R - 10, top, WIDTH - SHADE_R + 10, 22, '#8f897e');
  rect(c, SHADE_R - 10, top, WIDTH - SHADE_R + 10, 1, '#a39d92');
  for (let y = top + 3; y < GROUND; y += 4) rect(c, SHADE_R - 10, y, WIDTH - SHADE_R + 10, 1, '#837d72');
  for (let x = SHADE_R - 6; x < WIDTH; x += 7) rect(c, x, top + 1, 1, 21, '#868075');
  // the island, its ends rounded, a white kerb round its front and ends
  const cy = (top + bottom) / 2;
  const hy = (bottom - top) / 2;
  const endR = 14;
  for (let y = top; y <= bottom; y++) {
    const v = (y - cy) / hy;
    const inset = Math.round(endR * (1 - Math.sqrt(Math.max(0, 1 - v * v))));
    rect(c, OVAL_L + inset, y, OVAL_R - OVAL_L - inset * 2, 1, '#a9a59c');
    if (y > top) {
      rect(c, OVAL_L + inset - 1, y, 2, 1, '#e8e6e0');
      rect(c, OVAL_R - inset - 1, y, 2, 1, '#e8e6e0');
    }
  }
  rect(c, OVAL_L + endR - 4, bottom, OVAL_R - OVAL_L - endR * 2 + 8, 2, '#e8e6e0');
  rect(c, OVAL_L + endR - 4, bottom + 2, OVAL_R - OVAL_L - endR * 2 + 8, 1, '#6f6a60');
  treeLawns(c, top);
  // the bay lines between the cars, running back towards the chapel, leaning in as they go
  for (const x of BAYS) {
    for (const bx of [x - BAY / 2, x + BAY / 2]) line(c, bx + (CHAPEL_X - bx) * 0.04, top + 2, bx, bottom - 1, '#e4e0d6', 1);
  }
  // the winged HAU seal stamped into the paving in front of the steps, flattened by the low angle
  const seal = '#8f8a80';
  for (const s of [-1, 1]) {
    for (let k = 0; k < 4; k++) line(c, CHAPEL_X + s * 8, top + 9 + k, CHAPEL_X + s * (30 - k * 3), top + 5 + k * 2, seal, 1);
  }
  rect(c, CHAPEL_X - 7, top + 8, 15, 8, seal);
  rect(c, CHAPEL_X - 5, top + 9, 11, 6, '#a9a59c');
  rect(c, CHAPEL_X - 3, top + 11, 7, 1, seal);
}

/**
 * Grass under the trees either side of the chapel, so they stand in lawn, not on the road:
 * on the right a lawn whose kerb curves round with the loop road and runs on along its front;
 * on the left a raised bed along the back of the parking.
 */
function treeLawns(c: Ctx, top: number): void {
  const grass = P.grass;
  const kerb = '#e8e6e0';
  const front = GROUND - 11;
  // the right-hand lawn, its left edge curving back round the end of the oval
  for (let y = top; y <= front; y++) {
    const t = (y - top) / (front - top);
    const x0 = Math.round(OVAL_R + 8 + 14 * t * t);
    rect(c, x0, y, WIDTH - x0, 1, y === top ? P.grassHi : grass);
    rect(c, x0 - 1, y, 2, 1, kerb);
  }
  rect(c, OVAL_R + 21, front + 1, WIDTH - OVAL_R - 21, 2, kerb);
  rect(c, OVAL_R + 21, front + 3, WIDTH - OVAL_R - 21, 1, '#6f6a60');
  // raised beds along the back of the parking, under the trees and bamboo either side of the chapel;
  // the right-hand one runs on into the lawn
  const l0 = CHAPEL_L - 92;
  const l1 = CHAPEL_L + 8;
  for (const [b0, b1] of [[l0, l1], [CHAPEL_R - 8, OVAL_R + 12]]) {
    rect(c, b0, top - 4, b1 - b0, 7, grass);
    rect(c, b0, top - 4, b1 - b0, 1, P.grassHi);
    rect(c, b0, top + 3, b1 - b0, 1, kerb);
    rect(c, b0, top + 4, b1 - b0, 1, '#6f6a60');
    for (let i = 0; i < (b1 - b0) / 2; i++) px(c, b0 + ((i * 37) % (b1 - b0)), top - 3 + ((i * 3) % 6), i % 2 ? P.grassHi : P.grassDark);
  }
  // tufts and a little shade under the crowns
  const rand = rng(2975);
  for (let i = 0; i < 140; i++) {
    const right = i % 3 !== 0;
    const x = right ? OVAL_R + 24 + rand() * (WIDTH - OVAL_R - 24) : l0 + rand() * (l1 - l0);
    const y = right ? top + 1 + rand() * (front - top - 1) : top - 3 + rand() * 6;
    px(c, x, y, rand() > 0.5 ? P.grassHi : P.grassDark);
  }
}

/** The parked cars, the cones and the NO PARKING sign. Drawn after the chapel, which they stand in front of. */
function parkedCars(c: Ctx): void {
  const top = GROUND - 22;
  for (const k of CARS) carEnd(c, k.x, GROUND - 8, k.body, k.front, k.tall);
  // the cones keeping the way to the steps clear, and the small NO PARKING sign on the steps
  for (const dx of [-26, 26]) trafficCone(c, CHAPEL_X + dx, top + 6);
  rect(c, CHAPEL_X - 4, top - 10, 9, 8, '#f6f4ee');
  rect(c, CHAPEL_X - 3, top - 8, 7, 1, '#26242a');
  rect(c, CHAPEL_X - 3, top - 5, 7, 1, '#c8342f');
  rect(c, CHAPEL_X - 3, top - 2, 1, 2, '#26242a');
  rect(c, CHAPEL_X + 3, top - 2, 1, 2, '#26242a');
}

/** Trees close in on both sides of the chapel (the sketch of 2026-10-15), bamboo among them. */
function chapelTrees(c: Ctx): void {
  for (const [i, x] of [CHAPEL_L - 54, CHAPEL_L - 16, CHAPEL_R + 18, CHAPEL_R + 62, CHAPEL_R + 108].entries()) {
    layeredTree(c, x, GROUND - 22, 110 + (i % 2) * 22, 30 + (i % 3) * 5, 2970 + i);
  }
  bamboo(c, CHAPEL_L - 40, GROUND - 20, 30, 112, 2951);
  bamboo(c, CHAPEL_R + 34, GROUND - 20, 30, 104, 2952);
  // clipped shrubs along the front of the right-hand lawn
  for (const [i, x] of [CHAPEL_R + 64, CHAPEL_R + 120].entries()) bush(c, x, GROUND - 11, 20, 10, 2976 + i, i ? RED_TIP : undefined);
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  // far behind it all, a dark row of trees over the roofs of the chapel's rear and the Formation Center
  treeline(c, SHADE_R - 60, WIDTH + 20, GROUND - 22, 2980);

  // trees beyond the parking and the grove
  for (const [i, x] of [LAWN_L + 40, LAWN_L + 150, LAWN_L + 270, CHAPEL_X - 230].entries()) {
    layeredTree(c, x, GROUND - 14, 84 + (i % 2) * 16, 30 + (i % 3) * 4, 2910 + i);
  }

  // the formation center, behind the chapel's right shoulder
  // its lit windows go on their own glow canvas first and are added at half strength, so the few
  // that show round the chapel's shoulder glow softly instead of glaring
  const [formationGlow, fg] = makeCanvas(WIDTH, VIEW_H);
  facade(c, fg, FORMATION_R - 20, CHAPEL_R + 70 - FORMATION_R, GROUND - 16, {
    floors: 4, style: 'grid', wall: '#ece9df', glass: '#4c5a72', seed: 71,
  });
  // and none of it where the chapel and its rear stand in front of it
  const rearTop = GROUND - 28 - Math.round(CHAPEL_W * 0.16) - Math.round(CHAPEL_W * 0.07) - 12;
  fg.clearRect(0, 0, CHAPEL_R + 2, VIEW_H);
  fg.clearRect(CHAPEL_R, rearTop, CHAPEL_X + CHAPEL_W * 0.9 - CHAPEL_R + 2, VIEW_H);
  g.globalAlpha = 0.45;
  g.drawImage(formationGlow, 0, 0);
  g.globalAlpha = 1;
  layeredTree(c, CHAPEL_R + 150, GROUND - 26, 104, 34, 2915);

  // the end of APS
  drawAPS(c, g, -30, APS_R + 24, GROUND, { seed: 72 });

  parkingLot(c);
  // the grove at the corner: big shade trees and tall bamboo, the picnic sheds in under them
  shadyGround(c, LAWN_L, SHADE_R, GROUND - 22, GROUND, [LAWN_L + 61, LAWN_L + 159], 2905);
  bamboo(c, LAWN_L + 70, GROUND - 6, 44, 132, 2944);
  bamboo(c, LAWN_L + 196, GROUND - 6, 36, 118, 2945);
  for (const [i, x] of [LAWN_L + 14, LAWN_L + 124, LAWN_L + 236].entries()) {
    layeredTree(c, x, GROUND - 2, 128 + (i % 2) * 14, 26, 2940 + i);
  }
  for (const x of [LAWN_L + 30, LAWN_L + 128]) picnicShed(c, x, GROUND - 4, 62);
  chapelRear(c, g, CHAPEL_X, GROUND - 20, CHAPEL_W);
  chapelTrees(c);
  // the trees stand in front of the lit windows behind them, so cut their shapes out of the glow too
  g.globalCompositeOperation = 'destination-out';
  chapelTrees(g);
  g.globalCompositeOperation = 'source-over';
  chapel(c, g, CHAPEL_X, GROUND - 20, CHAPEL_W);
  parkedCars(c);
  // light spilling out of the glass onto the steps and paving; kept low so it doesn't wash the
  // white band and the rings above it out to daylight
  lights.push({ x: CHAPEL_X - 70, y: GROUND - 30, r: 90, color: [255, 214, 160], strength: 0.45 });
  lights.push({ x: CHAPEL_X + 70, y: GROUND - 30, r: 90, color: [255, 214, 160], strength: 0.45 });
  lights.push({ x: CHAPEL_X, y: GROUND - 14, r: 70, color: [255, 208, 140], strength: 0.5 });

  road(c, 0, WIDTH, 'concrete', 2920);

  // the corner island where the road bends towards APS: grass, a clipped hedge, the rusty rail round it, the street light
  lawnStrip(c, LAWN_L - 6, LAWN_L + 96, 2931, 12);
  bush(c, LAWN_L + 26, GROUND + 4, 46, 22, 2932);
  bush(c, LAWN_L + 70, GROUND + 4, 36, 18, 2933);
  rustyFence(c, LAWN_L + 44, LAWN_L + 92, GROUND + 6, 12);
  const [slx, sly] = streetLight(c, g, LAWN_L + 54, GROUND + 6, 100, 1);
  lights.push({ x: slx, y: sly, r: 110, color: [235, 244, 255], strength: 0.95 });
  lights.push({ x: slx, y: GROUND + 24, r: 70, color: [235, 244, 255], strength: 0.5 });
  // along the sidewalk: the rusty rail with round hedges behind it, open at the mouth of the parking
  for (const [f0, f1] of [[LAWN_L + 104, LOT_MOUTH - 26], [LOT_MOUTH + 26, CHAPEL_X - 40], [CHAPEL_X + 40, MGN_EXIT - 30]]) {
    for (let bx = f0 + 14; bx < f1 - 10; bx += 58) bush(c, bx, GROUND + 3, 22, 11, 2934 + bx);
    rustyFence(c, f0, f1, GROUND + 4, 11);
  }
  noParkingStand(c, LOT_MOUTH, GROUND + 8);
  palm(c, CHAPEL_X - CHAPEL_W / 2 - 16, GROUND - 6, 60, 2931);

  signBoard(c, APS_ROAD_X, GROUND + 5, ['APS', 'SACRED HEART']);
  signBoard(c, WALKWAY_X, GROUND + 5, ['WALKWAY', 'ROTUNDA'], P.maroon, P.goldHi);
  signBoard(c, MGN_EXIT + 8, GROUND + 5, ['MGN', 'SJH']);

  for (const x of [WALKWAY_X - 90, WALKWAY_X + 90, SOUTH_X - 40]) lamp(c, g, lights, x);
  return { canvas, glow };
}

export function buildLawn(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);

  return {
    id: 'lawn',
    title: 'Chapel of the Holy Guardian Angel',
    subtitle: 'Ang gitna ng campus',
    width: WIDTH,
    walkY: WALK,
    bounds: [24, WIDTH - 24],
    outdoor: true,
    visitFlag: 'visited_chapel',
    layers: [
      farCity(WIDTH, 291),
      midCampus(WIDTH, 292, [
        // Sacred Heart and the covered court, past the far end of APS
        { x: LAWN_L + 150, w: 120, h: 96, wall: '#eef0ee', glass: '#3f8f9c' },
        { x: LAWN_L + 330, w: 130, h: 62, wall: '#d8dade', glass: '#7f8a96' },
      ]),
      { canvas: main.canvas, parallax: 1 },
      frontPlants(WIDTH, 293),
    ],
    glow: main.glow,
    lights,
    hotspots: lawnHotspots({
      aps: APS_ROAD_X,
      walkway: WALKWAY_X,
      chapel: CHAPEL_X,
      sjh: MGN_EXIT,
    }),
    npcs: [],
    spawns: {
      walkway: { x: WALKWAY_X, facing: 1 },
      aps: { x: APS_ROAD_X + 4, facing: 1 },
      sjh: { x: MGN_EXIT - 10, facing: -1 },
      mgn: { x: MGN_EXIT - 10, facing: -1 },
    },
    update: ambience(294, [LAWN_L + 14, LAWN_L + 104, LAWN_L + 214]),
  };
}
