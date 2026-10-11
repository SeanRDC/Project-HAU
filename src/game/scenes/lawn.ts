// The road along the chapel lawn, looking north-east. This is the view the
// whole campus plan is anchored on: the open lawn, and across it the white
// rings of the Chapel of the Holy Guardian Angel with the Sister Josefina
// Nepomuceno Formation Center behind. The end of APS is on the left. PGN, the
// walkway back to the rotunda and the Main Building are behind the camera.

import { Ctx, VIEW_H, makeCanvas } from '../../engine/display';
import { ellipse, rect } from '../../engine/pix';
import { chapel, facade } from '../art/buildings';
import { P } from '../art/palette';
import { bush, palm, signBoard, stoneBench, tree } from '../art/props';
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
const APS_ROAD_X = APS_R + 18;

function lawn(c: Ctx): void {
  lawnStrip(c, LAWN_L, WIDTH, 2901, 22);
  // the worn oval in the middle of the grass and the path across it
  ellipse(c, (LAWN_L + CHAPEL_X) / 2 - 30, GROUND - 9, 150, 7, '#a9b06a');
  ellipse(c, (LAWN_L + CHAPEL_X) / 2 - 30, GROUND - 10, 120, 5, '#b9b47a');
  rect(c, CHAPEL_X - 16, GROUND - 22, 32, 22, '#c9c4b6');
  rect(c, CHAPEL_X - 16, GROUND - 22, 1, 22, '#e4dfd2');
  rect(c, CHAPEL_X + 15, GROUND - 22, 1, 22, '#a9a498');
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  // trees along the far edge of the lawn
  for (const [i, x] of [LAWN_L + 40, LAWN_L + 150, LAWN_L + 270, CHAPEL_X - 230].entries()) {
    tree(c, x, GROUND - 14, 84 + (i % 2) * 16, 30 + (i % 3) * 4, 2910 + i);
  }

  // the formation center, behind the chapel's right shoulder
  facade(c, g, FORMATION_R - 20, WIDTH - FORMATION_R + 30, GROUND - 16, {
    floors: 4, style: 'grid', wall: '#ece9df', glass: '#4c5a72', seed: 71,
  });
  tree(c, WIDTH - 20, GROUND - 14, 96, 30, 2915);

  // the end of APS
  facade(c, g, -30, APS_R + 24, GROUND, {
    floors: 4, style: 'corridor', wall: '#e9e4d4', accent: P.maroon, seed: 72,
  });

  lawn(c);
  chapel(c, g, CHAPEL_X, GROUND - 20, CHAPEL_W);
  lights.push({ x: CHAPEL_X, y: GROUND - 60, r: 150, color: [255, 232, 196], strength: 0.8 });
  lights.push({ x: CHAPEL_X, y: GROUND - 20, r: 80, color: [255, 208, 140], strength: 0.7 });

  road(c, 0, WIDTH, 'concrete', 2920);

  for (let x = LAWN_L + 30; x < CHAPEL_X - 60; x += 110) {
    stoneBench(c, x, GROUND + 13, 30);
    bush(c, x + 52, GROUND + 3, 24, 13, 2930 + x);
  }
  palm(c, CHAPEL_X - CHAPEL_W / 2 - 16, GROUND - 6, 60, 2931);
  palm(c, CHAPEL_X + CHAPEL_W / 2 + 12, GROUND - 6, 54, 2932);

  signBoard(c, CORNER_X - 20, GROUND + 5, ['BACK ROAD', 'GGN']);
  signBoard(c, APS_ROAD_X, GROUND + 5, ['APS', 'SACRED HEART']);
  signBoard(c, WALKWAY_X, GROUND + 5, ['WALKWAY', 'ROTUNDA'], P.maroon, P.goldHi);
  signBoard(c, SOUTH_X + 22, GROUND + 5, ['SJH', 'GYM']);

  for (const x of [LAWN_L + 4, WALKWAY_X - 90, WALKWAY_X + 90, SOUTH_X - 40]) lamp(c, g, lights, x);
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
    update: ambience(294, [LAWN_L + 40, LAWN_L + 270]),
  };
}
