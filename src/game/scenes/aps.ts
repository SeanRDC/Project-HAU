// The back road carrying on past the corner of GGN, still looking north-west.
// Almost the whole scene is one building, the hundred-metre Archbishop Pedro
// Santos Building, with the Sacred Heart Building at the far end. The chapel
// and its lawn are behind the camera.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { facade, nameWall } from '../art/buildings';
import { ggnCorner } from '../art/ggn';
import { P } from '../art/palette';
import { bush, hedge, palm, signBoard, stoneBench, tree } from '../art/props';
import { BUILDINGS, PLACES } from '../campus/plan';
import { STREETS, frontage, streetWidth, xOf } from '../campus/streets';
import { apsHotspots } from '../story/streets';
import { AreaDef, AreaLight } from '../types';
import { GROUND, WALK, ambience, doorLight, endWall, farCity, frontPlants, lamp, midCampus, road } from './kit';

const S = STREETS.aps;
const WIDTH = streetWidth(S);
const CORNER_X = xOf(S, PLACES.northJunction);
const GYM_LANE_X = xOf(S, PLACES.northEastJunction);
const [APS_L, APS_R] = frontage(S, BUILDINGS.aps.blocks[0]);
const [SH_L] = frontage(S, BUILDINGS.sh.blocks[0]);

const APS_X = APS_L + 22;
const APS_W = APS_R - APS_L - 30;
/** a building this long has more than one way in */
const APS_DOORS = [Math.round(APS_W * 0.2), Math.round(APS_W * 0.5), Math.round(APS_W * 0.8)];
const SH_X = SH_L + 10;
const SH_W = WIDTH - 22 - SH_X;
const SH_DOOR = SH_X + 110;

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  tree(c, APS_R + 4, GROUND + 2, 100, 30, 2701);

  // the corner of GGN, cut off by the edge of the scene: the louvred tower at its far end
  ggnCorner(c, -40, 40 + APS_X - 36, GROUND);

  facade(c, g, APS_X, APS_W, GROUND, {
    floors: 4, style: 'corridor', wall: '#e9e4d4', accent: P.maroon, doors: APS_DOORS, name: 'APS', seed: 61,
  });
  for (const dx of APS_DOORS) doorLight(lights, APS_X + dx);

  // Sacred Heart: engineering and architecture
  facade(c, g, SH_X, SH_W, GROUND, {
    floors: 5, style: 'ribbon', wall: '#eef0ee', glass: '#3f8f9c', accent: '#2f6b8a', doors: [SH_DOOR - SH_X], name: 'SH', seed: 62,
  });
  doorLight(lights, SH_DOOR);
  endWall(c, WIDTH - 22, WIDTH);

  road(c, 0, WIDTH, 'concrete', 2710);

  hedge(c, APS_X, GROUND + 3, APS_DOORS[0] - 26, 9, 2720);
  hedge(c, APS_X + APS_DOORS[0] + 26, GROUND + 3, APS_DOORS[1] - APS_DOORS[0] - 52, 9, 2721);
  hedge(c, APS_X + APS_DOORS[1] + 26, GROUND + 3, APS_DOORS[2] - APS_DOORS[1] - 52, 9, 2722);
  hedge(c, APS_X + APS_DOORS[2] + 26, GROUND + 3, APS_W - APS_DOORS[2] - 30, 9, 2723);
  for (let x = APS_X + 60; x < APS_X + APS_W - 30; x += 130) {
    bush(c, x, GROUND + 2, 24, 14, 2730 + x);
    stoneBench(c, x + 30, GROUND + 13, 28);
  }
  palm(c, SH_X - 8, GROUND + 3, 62, 2731);
  palm(c, SH_DOOR + 60, GROUND + 3, 56, 2732);
  nameWall(c, APS_X + APS_DOORS[1] - 130, GROUND + 14, ['ARCHBISHOP PEDRO SANTOS', 'BUILDING']);
  nameWall(c, SH_DOOR + 110, GROUND + 14, ['SACRED HEART', 'BUILDING']);

  signBoard(c, CORNER_X + 4, GROUND + 5, ['CHAPEL', 'PGN'], P.maroon, P.goldHi);
  signBoard(c, GYM_LANE_X - 6, GROUND + 5, ['COVERED COURT', 'GYM']);

  for (let x = APS_X + 40; x < APS_X + APS_W; x += 180) lamp(c, g, lights, x);
  lamp(c, g, lights, SH_X + 40);
  return { canvas, glow };
}

export function buildAps(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);

  return {
    id: 'aps',
    title: 'Archbishop Pedro Santos Building',
    subtitle: 'Hanggang Sacred Heart Building',
    width: WIDTH,
    walkY: WALK,
    bounds: [24, WIDTH - 40],
    outdoor: true,
    layers: [
      farCity(WIDTH, 271),
      midCampus(WIDTH, 272, []),
      { canvas: main.canvas, parallax: 1 },
      frontPlants(WIDTH, 273),
    ],
    glow: main.glow,
    lights,
    hotspots: apsHotspots({
      halls: 30,
      lawn: CORNER_X + 34,
      aps: APS_X + APS_DOORS[1],
      gym: GYM_LANE_X,
      sh: SH_DOOR,
    }),
    npcs: [],
    spawns: {
      halls: { x: 44, facing: 1 },
      lawn: { x: CORNER_X + 40, facing: 1 },
      gym: { x: GYM_LANE_X + 6, facing: -1 },
    },
    update: ambience(274, [APS_R + 4]),
  };
}
