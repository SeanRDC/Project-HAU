// The road in front of St. Joseph Hall, looking south-east. SJH fills the
// scene, a hundred metres of it, with the corner of the gym on the left and
// the Mamerto G. Nepomuceno Building on the right. The chapel and its lawn
// are behind the camera.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { facade, gymHall, nameWall } from '../art/buildings';
import { P } from '../art/palette';
import { bush, hedge, palm, signBoard, tree } from '../art/props';
import { car } from '../art/street';
import { BUILDINGS, PLACES } from '../campus/plan';
import { STREETS, frontage, streetWidth, xOf } from '../campus/streets';
import { sjhHotspots } from '../story/streets';
import { AreaDef, AreaLight } from '../types';
import { GROUND, WALK, ambience, doorLight, farCity, frontPlants, lamp, midCampus, parkingBays, road } from './kit';

const S = STREETS.sjh;
const WIDTH = streetWidth(S);
const GYM_X = xOf(S, PLACES.gymCorner);
const LAWN_X = xOf(S, PLACES.southJunction);
const [SJH_L, SJH_R] = frontage(S, BUILDINGS.sjh.blocks[0]);

const SJH_X = SJH_L + 6;
const SJH_W = SJH_R - SJH_L - 14;
/** three ways in: education, arts and sciences, computing */
const SJH_DOORS = [Math.round(SJH_W * 0.18), Math.round(SJH_W * 0.5), Math.round(SJH_W * 0.82)];
const MGN_X = SJH_R + 22;
const MGN_DOOR = MGN_X + 70;

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  tree(c, GYM_X + 40, GROUND + 2, 104, 34, 3101);
  tree(c, SJH_R + 8, GROUND + 2, 96, 28, 3102);

  // the corner of the gym, cut off by the edge of the scene
  gymHall(c, g, -260, 260 + GYM_X - 34, GROUND, '');

  facade(c, g, SJH_X, SJH_W, GROUND, {
    floors: 6, style: 'ribbon', wall: '#eeede8', glass: '#3f4654', accent: P.maroon, doors: SJH_DOORS, name: 'SJH', seed: 81,
  });
  for (const dx of SJH_DOORS) doorLight(lights, SJH_X + dx);

  facade(c, g, MGN_X, WIDTH - MGN_X + 20, GROUND, {
    floors: 5, style: 'grid', wall: '#f0efea', glass: '#4c5a72', accent: '#2f6b5a', doors: [MGN_DOOR - MGN_X], name: 'MGN', seed: 82,
  });
  doorLight(lights, MGN_DOOR);

  road(c, 0, WIDTH, 'concrete', 3110);

  // parking along the front of the hall
  parkingBays(c, SJH_X + 20, SJH_X + SJH_W - 20, 46);
  for (const [i, x] of [SJH_X + 64, SJH_X + 248, SJH_X + 340, SJH_X + 570, SJH_X + 708].entries()) {
    car(c, x, GROUND + 31, ['#c9cdd3', '#3b4a66', '#8a2f34', '#e2dccb', '#4f6b52'][i], i % 2 ? -1 : 1);
  }
  hedge(c, SJH_X, GROUND + 3, SJH_DOORS[0] - 26, 9, 3120);
  hedge(c, SJH_X + SJH_DOORS[0] + 26, GROUND + 3, SJH_DOORS[1] - SJH_DOORS[0] - 52, 9, 3121);
  hedge(c, SJH_X + SJH_DOORS[1] + 26, GROUND + 3, SJH_DOORS[2] - SJH_DOORS[1] - 52, 9, 3122);
  hedge(c, SJH_X + SJH_DOORS[2] + 26, GROUND + 3, SJH_W - SJH_DOORS[2] - 30, 9, 3123);
  for (let x = SJH_X + 110; x < SJH_X + SJH_W - 40; x += 150) bush(c, x, GROUND + 2, 24, 14, 3130 + x);
  palm(c, MGN_X - 12, GROUND + 3, 60, 3131);

  nameWall(c, SJH_X + SJH_DOORS[1] + 96, GROUND + 14, ['ST. JOSEPH HALL']);
  // the School of Computing has its dean's office here
  nameWall(c, SJH_X + SJH_DOORS[2] - 76, GROUND + 14, ['SCHOOL OF', 'COMPUTING']);

  signBoard(c, GYM_X, GROUND + 5, ['GYM', 'COVERED COURT']);
  signBoard(c, LAWN_X + 8, GROUND + 5, ['CHAPEL', 'WALKWAY'], P.maroon, P.goldHi);

  for (let x = SJH_X + 30; x < SJH_X + SJH_W; x += 190) lamp(c, g, lights, x);
  lamp(c, g, lights, MGN_X + 20);
  return { canvas, glow };
}

export function buildSjh(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);

  return {
    id: 'sjh',
    title: 'St. Joseph Hall',
    subtitle: 'Education, Arts and Sciences, at Computing',
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
      education: SJH_X + SJH_DOORS[0],
      sjh: SJH_X + SJH_DOORS[1],
      computing: SJH_X + SJH_DOORS[2],
      lawn: LAWN_X + 8,
      mgn: MGN_DOOR,
    }),
    npcs: [],
    spawns: {
      gym: { x: GYM_X + 10, facing: 1 },
      lawn: { x: LAWN_X, facing: -1 },
    },
    update: ambience(314, [GYM_X + 40, SJH_R + 8]),
  };
}
