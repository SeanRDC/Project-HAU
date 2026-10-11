// The lane behind the chapel, looking north-east. From Sacred Heart on the
// left: the open-sided Covered Court, the long wall of the Immaculate Heart
// Gymnasium, and its annex by the campus wall. The chapel and the formation
// center are behind the camera.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { coveredCourt, facade, gymHall } from '../art/buildings';
import { P } from '../art/palette';
import { bush, hedge, signBoard, stoneBench, tree } from '../art/props';
import { BUILDINGS, PLACES } from '../campus/plan';
import { STREETS, frontage, streetWidth, xOf } from '../campus/streets';
import { gymHotspots } from '../story/streets';
import { AreaDef, AreaLight } from '../types';
import { GROUND, WALK, ambience, doorLight, endWall, farCity, frontPlants, lamp, midCampus, road } from './kit';

const S = STREETS.gym;
const WIDTH = streetWidth(S);
const APS_X = xOf(S, PLACES.northEastJunction);
const SJH_X = xOf(S, PLACES.gymCorner);
const [, SH_R] = frontage(S, BUILDINGS.sh.blocks[0]);
const [, COURT_R] = frontage(S, BUILDINGS.court.blocks[0]);
const [GYM_L, GYM_R] = frontage(S, BUILDINGS.gym.blocks[0]);
const [FORMATION_L, FORMATION_R] = frontage(S, BUILDINGS.formation.blocks[0]);

const COURT_X = SH_R + 18;
const COURT_W = COURT_R - 6 - COURT_X;
const HALL_X = GYM_L + 4;
const HALL_W = GYM_R - GYM_L - 8;
const ANNEX_X = GYM_R + 4;
const ANNEX_W = WIDTH - 16 - ANNEX_X;
const FORMATION_X = Math.round((FORMATION_L + FORMATION_R) / 2) + 50;

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  tree(c, COURT_R + 22, GROUND + 2, 104, 34, 3301);

  // the end of Sacred Heart
  facade(c, g, -220, 220 + SH_R - 12, GROUND, {
    floors: 5, style: 'ribbon', wall: '#eef0ee', glass: '#3f8f9c', accent: '#2f6b8a', seed: 62,
  });

  coveredCourt(c, g, COURT_X, COURT_W, GROUND);
  for (let x = COURT_X + 40; x < COURT_X + COURT_W; x += 110) {
    lights.push({ x, y: GROUND - 60, r: 110, color: [255, 240, 210], strength: 0.8 });
  }

  gymHall(c, g, HALL_X, HALL_W, GROUND, 'IMMACULATE HEART GYMNASIUM');
  doorLight(lights, HALL_X + HALL_W * 0.25);
  doorLight(lights, HALL_X + HALL_W * 0.75);

  facade(c, g, ANNEX_X, ANNEX_W, GROUND, {
    floors: 2, style: 'grid', wall: '#d9d4c4', glass: '#4c5a72', accent: P.maroon, doors: [Math.round(ANNEX_W / 2)], name: 'ANNEX', seed: 91,
  });
  endWall(c, WIDTH - 16, WIDTH);

  road(c, 0, WIDTH, 'concrete', 3310);

  hedge(c, HALL_X + 20, GROUND + 3, HALL_W * 0.25 - 44, 9, 3320);
  hedge(c, HALL_X + HALL_W * 0.25 + 24, GROUND + 3, HALL_W * 0.5 - 48, 9, 3321);
  hedge(c, HALL_X + HALL_W * 0.75 + 24, GROUND + 3, HALL_W * 0.25 - 44, 9, 3322);
  for (let x = COURT_X + 60; x < COURT_X + COURT_W - 30; x += 120) stoneBench(c, x, GROUND + 13, 28);
  bush(c, COURT_R + 4, GROUND + 3, 26, 14, 3330);

  signBoard(c, APS_X - 30, GROUND + 5, ['APS', 'SACRED HEART']);
  signBoard(c, SJH_X, GROUND + 5, ['SJH', 'CHAPEL'], P.maroon, P.goldHi);
  // the formation center is on the camera's side
  signBoard(c, FORMATION_X, GROUND + 5, ['FORMATION', 'CENTER']);

  for (const x of [COURT_X - 8, COURT_R + 44, HALL_X + HALL_W * 0.5, HALL_X + HALL_W - 30]) lamp(c, g, lights, x);
  return { canvas, glow };
}

export function buildGym(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);

  return {
    id: 'gym',
    title: 'Immaculate Heart Gymnasium',
    subtitle: 'Covered Court at Gym Annex',
    width: WIDTH,
    walkY: WALK,
    bounds: [24, WIDTH - 34],
    outdoor: true,
    layers: [
      farCity(WIDTH, 331),
      midCampus(WIDTH, 332, []),
      { canvas: main.canvas, parallax: 1 },
      frontPlants(WIDTH, 333),
    ],
    glow: main.glow,
    lights,
    hotspots: gymHotspots({
      aps: APS_X - 30,
      court: COURT_X + Math.round(COURT_W / 2),
      formation: FORMATION_X,
      gym: Math.round(HALL_X + HALL_W * 0.25),
      sjh: SJH_X,
      annex: ANNEX_X + Math.round(ANNEX_W / 2),
    }),
    npcs: [],
    spawns: {
      aps: { x: APS_X - 20, facing: 1 },
      sjh: { x: SJH_X + 8, facing: -1 },
    },
    update: ambience(334, [COURT_R + 22]),
  };
}
