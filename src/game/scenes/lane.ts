// The parking lane between the San Francisco de Javier Building and St.
// Therese of Lisieux. It is the same road as the front of the Main Building,
// carrying on past the rotunda, so the camera keeps looking north-east: STL is
// in front of you, the PGN tower stands over it, and SFJ is behind the camera.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { facade, nameWall } from '../art/buildings';
import { P } from '../art/palette';
import { bush, hedge, palm, signBoard, tree } from '../art/props';
import { car } from '../art/street';
import { BUILDINGS, PLACES } from '../campus/plan';
import { STREETS, frontage, streetWidth, xOf } from '../campus/streets';
import { laneHotspots } from '../story/streets';
import { AreaDef, AreaLight } from '../types';
import { GROUND, WALK, ambience, doorLight, farCity, frontPlants, lamp, lawnStrip, midCampus, parkingBays, road } from './kit';

const S = STREETS.lane;
const WIDTH = streetWidth(S);
const JUNCTION_X = xOf(S, PLACES.westJunction);
const ROTUNDA_X = xOf(S, PLACES.rotunda);
const [WING_L, WING_R] = frontage(S, BUILDINGS.stl.blocks[1]);
const [STL_L] = frontage(S, BUILDINGS.stl.blocks[0]);
const [PAV_L, PAV_R] = frontage(S, BUILDINGS.stl.blocks[2]);
const [SFJ_L, SFJ_R] = frontage(S, BUILDINGS.sfj.blocks[0]);
const [TOWER_L, TOWER_R] = frontage(S, BUILDINGS.pgn.blocks[0]);

const STL_DOOR = Math.round((PAV_L + PAV_R) / 2);
/** SFJ is across the lane from STL; its sign stands a little up the lane from the STL door */
const SFJ_X = Math.round((SFJ_L + SFJ_R) / 2) - 70;
/** the middle steps up to the flag plaza and the side gate, on the camera's side by the rotunda */
const FLAG_X = ROTUNDA_X - 34;

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  tree(c, 24, GROUND + 2, 110, 38, 2301);
  tree(c, PAV_R + 46, GROUND + 2, 100, 36, 2302);
  tree(c, ROTUNDA_X - 8, GROUND + 2, 92, 30, 2303);

  // STL: the end of the wing that runs along the back road, the long wing on the lane,
  // and the low entrance pavilion with the hipped roof at the rotunda end
  facade(c, g, WING_L + 6, WING_R - WING_L - 12, GROUND, {
    floors: 4, style: 'ribbon', wall: '#e6e3dc', glass: '#4f5d76', seed: 41,
  });
  facade(c, g, STL_L + 6, PAV_L - STL_L - 2, GROUND, {
    floors: 4, style: 'ribbon', wall: '#e6e3dc', glass: '#4f5d76', accent: '#2f6b5a', seed: 42,
  });
  facade(c, g, PAV_L + 8, PAV_R - PAV_L - 10, GROUND, {
    floors: 2, style: 'grid', wall: '#ece3c4', roof: '#d9cf9f', accent: '#2f6b5a', doors: [STL_DOOR - PAV_L - 8], name: 'STL', seed: 43,
  });
  doorLight(lights, STL_DOOR);

  road(c, 0, WIDTH, 'concrete', 2310);
  parkingBays(c, WING_L + 10, PAV_L - 10);
  car(c, WING_L + 38, GROUND + 31, '#c9cdd3');
  car(c, STL_L + 34, GROUND + 31, '#8a2f34', -1);
  car(c, STL_L + 134, GROUND + 31, '#3b4a66');
  car(c, STL_L + 184, GROUND + 31, '#e2dccb', -1);

  hedge(c, WING_L, GROUND + 3, PAV_L - WING_L - 6, 9, 2320);
  for (let x = WING_L + 30; x < PAV_L - 20; x += 70) bush(c, x, GROUND + 2, 24, 14, 2330 + x);
  palm(c, PAV_L - 4, GROUND + 3, 58, 2331);
  palm(c, PAV_R + 8, GROUND + 3, 64, 2332);
  nameWall(c, STL_L + 50, GROUND + 14, ['ST. THERESE OF LISIEUX', 'BUILDING']);

  lawnStrip(c, 0, WING_L - 2, 2340);
  lawnStrip(c, PAV_R + 6, WIDTH, 2341);
  signBoard(c, JUNCTION_X - 14, GROUND + 5, ['SGH SRH SMH', 'FOOD COURT']);
  signBoard(c, ROTUNDA_X + 26, GROUND + 5, ['ROTUNDA', 'MAIN BLDG'], P.maroon, P.goldHi);
  // SFJ is on the camera's side: a sign at the kerb points back at it
  signBoard(c, SFJ_X, GROUND + 5, ['SFJ BLDG', 'LIBRARY']);
  signBoard(c, FLAG_X, GROUND + 5, ['FLAGPOLE', 'SIDE GATE'], P.maroon, P.goldHi);

  for (const x of [JUNCTION_X + 40, STL_L + 84, PAV_L - 30, ROTUNDA_X - 60]) lamp(c, g, lights, x);
  return { canvas, glow };
}

export function buildLane(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  const towerX = Math.round((TOWER_L + TOWER_R) / 2);

  return {
    id: 'lane',
    title: 'Parking Lane',
    subtitle: 'Sa pagitan ng SFJ at St. Therese of Lisieux',
    width: WIDTH,
    walkY: WALK,
    bounds: [24, WIDTH - 24],
    outdoor: true,
    layers: [
      farCity(WIDTH, 231),
      midCampus(WIDTH, 232, [
        // the PGN tower, a block further in
        { x: towerX, w: 150, h: 196, wall: '#eceae4', glass: '#2f3f63' },
        { x: towerX + 150, w: 130, h: 70, wall: '#d9d6cf', glass: '#44506a' },
      ]),
      { canvas: main.canvas, parallax: 1 },
      frontPlants(WIDTH, 233),
    ],
    glow: main.glow,
    lights,
    hotspots: laneHotspots({ halls: JUNCTION_X - 20, stl: STL_DOOR, sfj: SFJ_X, entry: FLAG_X, plaza: ROTUNDA_X + 30 }),
    npcs: [],
    spawns: {
      halls: { x: JUNCTION_X - 8, facing: 1 },
      plaza: { x: ROTUNDA_X + 20, facing: -1 },
      // down the middle steps from the flag plaza
      entry: { x: FLAG_X, facing: -1 },
    },
    update: ambience(234, [24, PAV_R + 46, ROTUNDA_X - 8]),
  };
}
