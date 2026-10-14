// The road along the chapel lawn, looking north-east. This is the view the
// whole campus plan is anchored on: the shady corner by APS, where the green
// picnic sheds stand under tall trees and bamboo behind a little corner island
// with a street light, then the paved parking (no lawn, from the photos), and across it the white
// rings of the Chapel of the Holy Guardian Angel with the Sister Josefina
// Nepomuceno Formation Center behind. The end of APS is on the left. PGN, the
// walkway back to the rotunda and the Main Building are behind the camera.

import { Ctx, VIEW_H, makeCanvas } from '../../engine/display';
import { line, rect } from '../../engine/pix';
import { bamboo, drawAPS, noParkingStand, picnicShed, rustyFence, shadyGround, streetLight } from '../art/aps';
import { chapel, facade, trafficCone } from '../art/buildings';
import { P } from '../art/palette';
import { bush, palm, signBoard, tree } from '../art/props';
import { carEnd } from '../art/street';
import { BUILDINGS, PLACES } from '../campus/plan';
import { STREETS, frontage, streetWidth, xOf } from '../campus/streets';
import { lawnHotspots } from '../story/streets';
import { AreaDef, AreaLight } from '../types';
import { GROUND, WALK, ambience, farCity, frontPlants, lamp, lawnStrip, midCampus, road } from './kit';

const S = STREETS.lawn;
const WIDTH = streetWidth(S);
const CORNER_X = xOf(S, PLACES.northJunction);
const WALKWAY_X = xOf(S, PLACES.walkwayEnd);
const SOUTH_X = xOf(S, PLACES.southJunction);
const CHAPEL_X = xOf(S, PLACES.chapel);
const [, APS_R] = frontage(S, BUILDINGS.aps.blocks[0]);
const [, FORMATION_R] = frontage(S, BUILDINGS.formation.blocks[0]);

/** the chapel is across the lawn, so it is drawn a little smaller than its true width */
const CHAPEL_W = 380;
const LAWN_L = APS_R + 40;
/** the shady corner across from APS: grass under tall trees, worn to earth round the green picnic sheds */
const SHADE_R = LAWN_L + 250;
const APS_ROAD_X = APS_R + 18;

/** the mouth of the chapel parking, past the shady corner, with the NO PARKING stand in it */
const LOT_MOUTH = SHADE_R + 34;
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
for (let x = SHADE_R + 70; x <= CHAPEL_X - 46; x += BAY) BAYS.push(x);
for (let x = CHAPEL_X + 46; x <= WIDTH - 14; x += BAY) BAYS.push(x);
const CARS = BAYS.map((x, i) => ({
  x,
  body: CAR_COLOURS[(i * 3) % CAR_COLOURS.length],
  front: i % 4 === 2,
  tall: i % 3 === 1,
}));

/**
 * What lies between the road and the chapel (photos 03, 29 and 30 of the
 * walk): not a lawn but a paved parking lot, full of cars nosed in towards
 * the chapel, a lighter strip of pavers leading to its door.
 */
function parkingLot(c: Ctx): void {
  const top = GROUND - 22;
  rect(c, SHADE_R - 10, top, WIDTH - SHADE_R + 10, 22, '#a9a59c');
  rect(c, SHADE_R - 10, top, WIDTH - SHADE_R + 10, 1, '#bdb9b0');
  for (const y of [top + 7, top + 15]) rect(c, SHADE_R - 10, y, WIDTH - SHADE_R + 10, 1, '#9d998f');
  // the bay lines between the cars, running back towards the chapel, leaning in as they go
  for (const x of BAYS) {
    for (const bx of [x - BAY / 2, x + BAY / 2]) line(c, bx + (CHAPEL_X - bx) * 0.04, top + 2, bx, GROUND, '#e4e0d6', 1);
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

/** The parked cars, the cones and the NO PARKING sign. Drawn after the chapel, which they stand in front of. */
function parkedCars(c: Ctx): void {
  const top = GROUND - 22;
  for (const k of CARS) carEnd(c, k.x, GROUND - 4, k.body, k.front, k.tall);
  // the cones keeping the way to the steps clear, and the small NO PARKING sign on the steps
  for (const dx of [-26, 26]) trafficCone(c, CHAPEL_X + dx, top + 6);
  rect(c, CHAPEL_X - 4, top - 10, 9, 8, '#f6f4ee');
  rect(c, CHAPEL_X - 3, top - 8, 7, 1, '#26242a');
  rect(c, CHAPEL_X - 3, top - 5, 7, 1, '#c8342f');
  rect(c, CHAPEL_X - 3, top - 2, 1, 2, '#26242a');
  rect(c, CHAPEL_X + 3, top - 2, 1, 2, '#26242a');
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  // trees beyond the parking and the grove
  for (const [i, x] of [LAWN_L + 40, LAWN_L + 150, LAWN_L + 270, CHAPEL_X - 230].entries()) {
    tree(c, x, GROUND - 14, 84 + (i % 2) * 16, 30 + (i % 3) * 4, 2910 + i);
  }

  // the formation center, behind the chapel's right shoulder
  facade(c, g, FORMATION_R - 20, WIDTH - FORMATION_R + 30, GROUND - 16, {
    floors: 4, style: 'grid', wall: '#ece9df', glass: '#4c5a72', seed: 71,
  });
  tree(c, WIDTH - 20, GROUND - 14, 96, 30, 2915);

  // the end of APS
  drawAPS(c, g, -30, APS_R + 24, GROUND, { seed: 72 });

  parkingLot(c);
  // the grove at the corner: big shade trees and tall bamboo, the picnic sheds in under them
  shadyGround(c, LAWN_L, SHADE_R, GROUND - 22, GROUND, [LAWN_L + 61, LAWN_L + 159], 2905);
  bamboo(c, LAWN_L + 70, GROUND - 6, 44, 132, 2944);
  bamboo(c, LAWN_L + 196, GROUND - 6, 36, 118, 2945);
  for (const [i, x] of [LAWN_L + 14, LAWN_L + 124, LAWN_L + 236].entries()) {
    tree(c, x, GROUND - 2, 128 + (i % 2) * 14, 26, 2940 + i);
  }
  for (const x of [LAWN_L + 30, LAWN_L + 128]) picnicShed(c, x, GROUND - 4, 62);
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
  for (const [f0, f1] of [[LAWN_L + 104, LOT_MOUTH - 26], [LOT_MOUTH + 26, CHAPEL_X - 40], [CHAPEL_X + 40, SOUTH_X - 60]]) {
    for (let bx = f0 + 14; bx < f1 - 10; bx += 58) bush(c, bx, GROUND + 3, 22, 11, 2934 + bx);
    rustyFence(c, f0, f1, GROUND + 4, 11);
  }
  noParkingStand(c, LOT_MOUTH, GROUND + 8);
  palm(c, CHAPEL_X - CHAPEL_W / 2 - 16, GROUND - 6, 60, 2931);
  palm(c, CHAPEL_X + CHAPEL_W / 2 + 12, GROUND - 6, 54, 2932);

  signBoard(c, CORNER_X - 20, GROUND + 5, ['BACK ROAD', 'GGN']);
  signBoard(c, APS_ROAD_X, GROUND + 5, ['APS', 'SACRED HEART']);
  signBoard(c, WALKWAY_X, GROUND + 5, ['WALKWAY', 'ROTUNDA'], P.maroon, P.goldHi);
  signBoard(c, SOUTH_X + 22, GROUND + 5, ['SJH', 'GYM']);

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
      halls: CORNER_X - 20,
      aps: APS_ROAD_X,
      walkway: WALKWAY_X,
      chapel: CHAPEL_X,
      sjh: SOUTH_X + 22,
    }),
    npcs: [],
    spawns: {
      walkway: { x: WALKWAY_X, facing: 1 },
      halls: { x: CORNER_X - 10, facing: 1 },
      aps: { x: APS_ROAD_X + 4, facing: 1 },
      sjh: { x: SOUTH_X + 12, facing: -1 },
    },
    update: ambience(294, [LAWN_L + 14, LAWN_L + 104, LAWN_L + 214]),
  };
}
