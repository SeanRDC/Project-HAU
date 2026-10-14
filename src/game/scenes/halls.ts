// The back road, looking north-west. From the campus wall on the left: the
// warehouse and carpentry shop, the Yellow Food Court, then the ends of St.
// Gabriel and St. Raphael Halls with their courtyard between them, St. Michael
// Hall, and then the Geromin G. Nepomuceno Building, far bigger than any of
// them: its front runs on past the corner and its top is off the screen. STL
// and PGN are behind the camera.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { facade, foodCourt, shed } from '../art/buildings';
import { Ggn, drawGGN } from '../art/ggn';
import { P } from '../art/palette';
import { bush, hedge, signBoard, stoneBench, tree } from '../art/props';
import { BUILDINGS, PLACES } from '../campus/plan';
import { STREETS, frontage, streetWidth, xOf } from '../campus/streets';
import { hallsHotspots } from '../story/streets';
import { AreaDef, AreaLight } from '../types';
import { GROUND, WALK, ambience, doorLight, endWall, farCity, frontPlants, lamp, lawnStrip, midCampus, road } from './kit';

const S = STREETS.halls;
const WIDTH = streetWidth(S);
const LANE_X = xOf(S, PLACES.westJunction);
const CORNER_X = xOf(S, PLACES.hallsCorner);
const [SHED_L, SHED_R] = frontage(S, BUILDINGS.warehouse.blocks[0]);
const [FOOD_L] = frontage(S, BUILDINGS.foodcourt.blocks[0]);
const [SGH_L] = frontage(S, BUILDINGS.sgh.blocks[0]);
const [, SRH_R] = frontage(S, BUILDINGS.srh.blocks[0]);
const [SMH_L, SMH_R] = frontage(S, BUILDINGS.smh.blocks[0]);
const [GGN_L] = frontage(S, BUILDINGS.ggn.blocks[0]);

// St. Gabriel and St. Raphael are the two long sides of one ring. From the road
// you see the end of each, with the way into their courtyard in the middle.
const RING_L = SGH_L + 8;
const RING_R = SRH_R - 4;
const HALL_W = Math.round((RING_R - RING_L - 64) / 2);
const SRH_L = RING_R - HALL_W;
const SGH_DOOR = RING_L + Math.round(HALL_W / 2);
const SRH_DOOR = SRH_L + Math.round(HALL_W / 2);
const SMH_DOOR = Math.round((SMH_L + SMH_R) / 2);
const FOOD_R = LANE_X - 6;
// GGN takes the rest of the road: about 53 m of front, as on the aerial photo
const GGN_X = GGN_L + 4;
const GGN_W = WIDTH - 30 - GGN_X;

const HALL = { floors: 4, style: 'corridor', wall: '#ece3c4', roof: '#d9cf9f', accent: P.maroon } as const;

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement; ggn: Ggn; lawnX: number } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  tree(c, SHED_R + 22, GROUND + 2, 96, 32, 2501);
  tree(c, (RING_L + HALL_W + SRH_L) / 2, GROUND, 110, 30, 2502);
  tree(c, SMH_L - 6, GROUND + 2, 90, 26, 2503);
  tree(c, SMH_R + 30, GROUND + 2, 104, 34, 2504);

  endWall(c, 0, SHED_L + 14);
  shed(c, SHED_L + 14, SHED_R - SHED_L - 18, GROUND);
  foodCourt(c, g, FOOD_L - 16, FOOD_R - FOOD_L + 16, GROUND);
  lights.push({ x: (FOOD_L + FOOD_R) / 2 - 8, y: GROUND - 24, r: 90, color: [255, 214, 140], strength: 0.85 });

  facade(c, g, RING_L, HALL_W, GROUND, { ...HALL, doors: [Math.round(HALL_W / 2)], name: 'SGH', seed: 51 });
  facade(c, g, SRH_L, HALL_W, GROUND, { ...HALL, doors: [Math.round(HALL_W / 2)], name: 'SRH', seed: 52 });
  facade(c, g, SMH_L + 6, SMH_R - SMH_L - 12, GROUND, { ...HALL, doors: [SMH_DOOR - SMH_L - 6], name: 'SMH', seed: 53 });
  for (const x of [SGH_DOOR, SRH_DOOR, SMH_DOOR]) doorLight(lights, x);

  // the high school building, from the photos in assets/GGN BUILDING
  const ggn = drawGGN(c, g, GGN_X, GGN_W, GROUND);
  // the lobby is lit right across, and it is a big lobby
  const [lobbyL, lobbyR] = ggn.lobby;
  for (const x of [lobbyL + (lobbyR - lobbyL) * 0.27, lobbyL + (lobbyR - lobbyL) * 0.73]) {
    doorLight(lights, x);
    lights.push({ x, y: GROUND - 46, r: 96, color: [255, 214, 150], strength: 0.6 });
  }

  road(c, 0, WIDTH, 'concrete', 2510);

  // the courtyard between the two halls
  lawnStrip(c, RING_L + HALL_W + 2, SRH_L - 2, 2520);
  stoneBench(c, RING_L + HALL_W + 16, GROUND + 4, 30);
  hedge(c, SMH_R + 4, GROUND + 3, GGN_L - SMH_R - 6, 9, 2521);
  for (const x of [RING_L + 20, SRH_L + 24, SMH_L + 26]) bush(c, x, GROUND + 2, 22, 13, 2530 + x);
  // the planting along the foot of GGN, either side of the campus map board
  bush(c, ggn.board - 44, GROUND + 2, 26, 15, 2541);
  bush(c, ggn.board + 38, GROUND + 2, 22, 12, 2542);
  bush(c, lobbyR + 62, GROUND + 2, 24, 13, 2544);

  signBoard(c, LANE_X - 2, GROUND + 5, ['PARKING', 'ROTUNDA']);
  // the way to the chapel is at the corner, but its sign stands clear of GGN's steps
  const lawnX = Math.min(CORNER_X - 22, lobbyL - 26);
  signBoard(c, lawnX, GROUND + 5, ['CHAPEL', 'PGN'], P.maroon, P.goldHi);

  for (const x of [SHED_R + 50, RING_L + HALL_W + 32, SMH_L - 22, GGN_L - 30, lobbyR + 40]) lamp(c, g, lights, x);
  return { canvas, glow, ggn, lawnX };
}

export function buildHalls(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);

  return {
    id: 'halls',
    title: 'Back Road',
    subtitle: 'St. Gabriel, St. Raphael, St. Michael at GGN',
    width: WIDTH,
    walkY: WALK,
    bounds: [SHED_L + 30, WIDTH - 24],
    outdoor: true,
    layers: [
      farCity(WIDTH, 251),
      midCampus(WIDTH, 252, [
        // the long sides of the halls running away from the road
        { x: RING_L + HALL_W + 32, w: 60, h: 84, wall: '#e2d9b4', roof: '#d9cf9f' },
        { x: SMH_R + 40, w: 70, h: 84, wall: '#e2d9b4', roof: '#d9cf9f' },
      ]),
      { canvas: main.canvas, parallax: 1 },
      frontPlants(WIDTH, 253),
    ],
    glow: main.glow,
    lights,
    hotspots: hallsHotspots({
      warehouse: Math.round((SHED_L + SHED_R) / 2) + 6,
      food: Math.round((FOOD_L + FOOD_R) / 2) - 8,
      lane: LANE_X,
      sgh: SGH_DOOR,
      srh: SRH_DOOR,
      smh: SMH_DOOR,
      ggn: main.ggn.door,
      lawn: main.lawnX,
      aps: WIDTH - 28,
    }),
    npcs: [],
    spawns: {
      lane: { x: LANE_X + 10, facing: 1 },
      lawn: { x: main.lawnX - 8, facing: -1 },
      aps: { x: WIDTH - 40, facing: -1 },
    },
    update: ambience(254, [SHED_R + 22, SMH_L - 6, SMH_R + 30]),
  };
}
